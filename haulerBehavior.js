// haulerBehavior.js

const {
    SUCCESS,
    FAILURE,
    RUNNING,
    ActionNode,
    ConditionNode,
    SequenceNode,
    SelectorNode
} = require('behaviorTree');

// Action Functions

function collectEnergy(creep) {
    // Use containerManager to get source containers
    const containerManager = require('containerManager');

    // Get the best source container for withdrawal
    const container = containerManager.getBestContainerForWithdrawal(creep, { includeRoles: ['source'] });

    if (container) {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
            return RUNNING;
        } else {
            return SUCCESS;
        }
    }

    // Fallback: Try to pick up dropped energy near sources
    const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: resource => resource.resourceType === RESOURCE_ENERGY && resource.amount > 50
    });

    if (droppedEnergy) {
        if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
            return RUNNING;
        } else {
            return SUCCESS;
        }
    }

    // No energy available
    return FAILURE;
}

function deliverToStorage(creep) {
    const storage = creep.room.storage;
    if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
            return RUNNING;
        } else {
            return SUCCESS;
        }
    }
    return FAILURE;
}

function refillStructures(creep, structureTypes) {
    const targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            structureTypes.includes(structure.structureType) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    if (targets.length > 0) {
        const target = creep.pos.findClosestByPath(targets);
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            return RUNNING;
        } else {
            return SUCCESS;
        }
    }
    return FAILURE;
}

function deliverToControllerContainer(creep) {
    const containerManager = require('containerManager');
    const container = containerManager.getBestContainerForDeposit(creep, { includeRoles: ['controller'] });

    if (container) {
        const result = creep.transfer(container, RESOURCE_ENERGY);
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
            return RUNNING;
        } else if (result === OK) {
            // Clear the task after delivery
            delete creep.memory.task;
            return SUCCESS;
        } else {
            return FAILURE;
        }
    }
    return FAILURE;
}

function supplyCreeps(creep, roles) {
    const targets = creep.room.find(FIND_MY_CREEPS, {
        filter: c =>
            roles.includes(c.memory.role) &&
            c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    if (targets.length > 0) {
        const target = creep.pos.findClosestByPath(targets);
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            return RUNNING;
        } else {
            return SUCCESS;
        }
    }
    return FAILURE;
}

function withdrawEnergyFromStorage(creep, targetTask = null) {
    const storage = creep.room.storage;
    if (storage && storage.store[RESOURCE_ENERGY] > 0) {
        const result = creep.withdraw(storage, RESOURCE_ENERGY);
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
            return RUNNING;
        } else if (result === OK) {
            // Set the task if provided
            if (targetTask) {
                creep.memory.task = targetTask;
            }
            return SUCCESS;
        } else {
            return FAILURE;
        }
    }
    return FAILURE;
}

function idle(creep) {
    // Move to a designated idle position or perform an idle action
    const idlePosition = creep.room.storage || creep.room.controller;
    if (idlePosition && !creep.pos.inRangeTo(idlePosition, 3)) {
        creep.moveTo(idlePosition);
    }
    return SUCCESS;
}

// Condition Functions

function isCarryingEnergy(creep) {
    return creep.store[RESOURCE_ENERGY] > 0;
}

function needsEnergy(creep) {
    return creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
}

function storageNeedsEnergy(creep) {
    const storage = creep.room.storage;
    return storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
}

function structuresNeedEnergy(creep, structureTypes) {
    return creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            structureTypes.includes(structure.structureType) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }).length > 0;
}

function controllerContainerNeedsEnergy(creep) {
    const controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
        filter: s =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })[0];
    return !!controllerContainer;
}

function creepsNeedEnergy(creep, roles) {
    return creep.room.find(FIND_MY_CREEPS, {
        filter: c =>
            roles.includes(c.memory.role) &&
            c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }).length > 0;
}

// Assemble the Hauler Behavior Tree

function createHaulerBehaviorTree() {
    return new SelectorNode([
        // If carrying energy
        new SequenceNode([
            new ConditionNode(isCarryingEnergy),
            new SelectorNode([
                // If task is set to deliver to controller container
                new SequenceNode([
                    new ConditionNode(creep => creep.memory.task === 'deliverToControllerContainer'),
                    new ActionNode(deliverToControllerContainer)
                ]),
                // Priorities when carrying energy
                // 1. Refill Spawns and Extensions
                new SequenceNode([
                    new ConditionNode(creep => structuresNeedEnergy(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION])),
                    new ActionNode(creep => refillStructures(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]))
                ]),
                // 2. Refill Towers
                new SequenceNode([
                    new ConditionNode(creep => structuresNeedEnergy(creep, [STRUCTURE_TOWER])),
                    new ActionNode(creep => refillStructures(creep, [STRUCTURE_TOWER]))
                ]),
                // 3. Supply Controller Container
                new SequenceNode([
                    new ConditionNode(controllerContainerNeedsEnergy),
                    new ActionNode(deliverToControllerContainer)
                ]),
                // 4. Deliver to Storage
                new SequenceNode([
                    new ConditionNode(storageNeedsEnergy),
                    new ActionNode(deliverToStorage)
                ]),
                // 5. Directly Supply Builders and Upgraders
                new SequenceNode([
                    new ConditionNode(creep => creepsNeedEnergy(creep, ['builder', 'upgrader'])),
                    new ActionNode(creep => supplyCreeps(creep, ['builder', 'upgrader']))
                ]),
                // Idle if nothing else to do
                new ActionNode(idle)
            ])
        ]),

        // If not carrying energy
        new SequenceNode([
            new ConditionNode(needsEnergy),
            new SelectorNode([
                // 1. Try to collect energy from source containers or dropped energy
                new SequenceNode([
                    new ActionNode(collectEnergy)
                ]),
                // 2. If 1 fails and spawns/extensions need energy, withdraw from storage
                new SequenceNode([
                    new ConditionNode(creep => structuresNeedEnergy(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION])),
                    new ActionNode(creep => withdrawEnergyFromStorage(creep))
                ]),
                // 3. If 2 fails and controller container needs energy, withdraw from storage and set task
                new SequenceNode([
                    new ConditionNode(controllerContainerNeedsEnergy),
                    new ActionNode(creep => withdrawEnergyFromStorage(creep, 'deliverToControllerContainer'))
                ]),
                // Idle if nothing else to do
                new ActionNode(idle)
            ])
        ]),
        // Default action: idle
        new ActionNode(idle)
    ]);
}

// Export the behavior tree
module.exports = {
    createHaulerBehaviorTree
};
