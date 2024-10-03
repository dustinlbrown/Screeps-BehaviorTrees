// creep/Hauler.js

const CreepRole = require('./CreepRole');
const {
    SUCCESS,
    FAILURE,
    RUNNING,
    ActionNode,
    ConditionNode,
    SequenceNode,
    SelectorNode,
    buildCondition,
    buildAction,
    buildSequence,
    buildSelector,
    buildInverter
} = require('../behaviorTree');
const ContainerManager = require('../utils/ContainerManager');
const { moveToTarget } = require('../behaviorTree/SharedActions');
const { isCreepIdle, hasTask } = require('../behaviorTree/SharedConditions');
const Logger = require('../utils/Logger');
const MemoryManager = require('../utils/MemoryManager');

class Hauler extends CreepRole {
    constructor(creep) {
        super(creep);
        this.containerManager = ContainerManager;
        this.behaviorTree = this.createHaulerBehaviorTree();
    }

    // Action Functions

    collectEnergy(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to collect energy.`);
            const container = this.containerManager.getBestContainerForWithdrawal(creep, { includeRoles: ['source'] });

            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, container, '#ffaa00');
                    return RUNNING;
                } else {
                    Logger.info(`${creep.name} successfully withdrew energy from Container ID: ${container.id}`);
                    return SUCCESS;
                }
            }

            const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType === RESOURCE_ENERGY && resource.amount > 50
            });

            if (droppedEnergy) {
                if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, droppedEnergy, '#ffaa00');
                    return RUNNING;
                } else {
                    Logger.info(`${creep.name} successfully picked up dropped energy.`);
                    return SUCCESS;
                }
            }

            Logger.warn(`${creep.name} found no energy to collect.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in collectEnergy: ${error}`);
            return FAILURE;
        }
    }

    deliverToStorage(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to deliver energy to storage.`);
            const storage = creep.room.storage;
            if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, storage, '#ffffff');
                    return RUNNING;
                } else {
                    Logger.info(`${creep.name} successfully delivered energy to storage.`);
                    return SUCCESS;
                }
            }
            Logger.warn(`${creep.name} found no storage needing energy.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in deliverToStorage: ${error}`);
            return FAILURE;
        }
    }

    refillStructures(creep, structureTypes) {
        try {
            Logger.debug(`${creep.name} is attempting to refill structures: ${structureTypes.join(', ')}`);
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: structure =>
                    structureTypes.includes(structure.structureType) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, target, '#ffffff');
                    return RUNNING;
                } else {
                    Logger.info(`${creep.name} successfully refilled Structure ID: ${target.id}`);
                    return SUCCESS;
                }
            }
            Logger.warn(`${creep.name} found no structures needing energy.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in refillStructures: ${error}`);
            return FAILURE;
        }
    }

    deliverToControllerContainer(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to deliver energy to controller container.`);
            const container = this.containerManager.getBestContainerForDeposit(creep, { includeRoles: ['controller'] });

            if (container) {
                const result = creep.transfer(container, RESOURCE_ENERGY);
                if (result === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, container, '#ffffff');
                    return RUNNING;
                } else if (result === OK) {
                    MemoryManager.setCreepMemory(creep, 'task', null);
                    Logger.info(`${creep.name} successfully delivered energy to Controller Container ID: ${container.id}`);
                    return SUCCESS;
                } else {
                    Logger.error(`${creep.name} failed to deliver energy to Controller Container ID: ${container.id}`);
                    return FAILURE;
                }
            }
            Logger.warn(`${creep.name} found no Controller Container needing energy.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in deliverToControllerContainer: ${error}`);
            return FAILURE;
        }
    }

    supplyCreeps(creep, roles) {
        try {
            Logger.debug(`${creep.name} is attempting to supply creeps: ${roles.join(', ')}`);
            const targets = creep.room.find(FIND_MY_CREEPS, {
                filter: c =>
                    roles.includes(c.memory.role) &&
                    c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (targets.length > 0) {
                const target = creep.pos.findClosestByPath(targets);
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, target, '#ffffff');
                    return RUNNING;
                } else {
                    Logger.info(`${creep.name} successfully supplied energy to Creep: ${target.name}`);
                    return SUCCESS;
                }
            }

            Logger.warn(`${creep.name} found no creeps needing energy.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in supplyCreeps: ${error}`);
            return FAILURE;
        }
    }

    withdrawEnergyFromStorage(creep, targetTask = null) {
        try {
            Logger.debug(`${creep.name} is attempting to withdraw energy from storage.`);
            const storage = creep.room.storage;
            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                const result = creep.withdraw(storage, RESOURCE_ENERGY);
                if (result === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, storage, '#ffaa00');
                    return RUNNING;
                } else if (result === OK) {
                    if (targetTask) {
                        MemoryManager.setCreepMemory(creep, 'task', targetTask);
                        Logger.info(`${creep.name} set task to '${targetTask}' after withdrawing energy.`);
                    } else {
                        Logger.info(`${creep.name} successfully withdrew energy from storage.`);
                    }
                    return SUCCESS;
                } else {
                    Logger.error(`${creep.name} failed to withdraw energy from storage.`);
                    return FAILURE;
                }
            }
            Logger.warn(`${creep.name} found no energy in storage to withdraw.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in withdrawEnergyFromStorage: ${error}`);
            return FAILURE;
        }
    }

    idle(creep) {
        try {
            Logger.debug(`${creep.name} is idling.`);
            const idlePosition = creep.room.storage || creep.room.controller;
            if (idlePosition && !creep.pos.inRangeTo(idlePosition, 3)) {
                moveToTarget(creep, idlePosition, '#ff00ff');
            }
            return SUCCESS;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in idle: ${error}`);
            return FAILURE;
        }
    }

    // Condition Functions

    isCarryingEnergy(creep) {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }

    needsEnergy(creep) {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }

    storageNeedsEnergy(creep) {
        return creep.room.storage && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }

    structuresNeedEnergy(creep, structureTypes) {
        return creep.room.find(FIND_STRUCTURES, {
            filter: structure =>
                structureTypes.includes(structure.structureType) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }).length > 0;
    }

    controllerContainerNeedsEnergy(creep) {
        const controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: s =>
                s.structureType === STRUCTURE_CONTAINER &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        })[0];
        return !!controllerContainer;
    }

    creepsNeedEnergy(creep, roles) {
        return creep.room.find(FIND_MY_CREEPS, {
            filter: c =>
                roles.includes(c.memory.role) &&
                c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }).length > 0;
    }

    // Assemble the Hauler Behavior Tree

    createHaulerBehaviorTree() {
        return buildSelector([
            // If carrying energy
            buildSequence([
                buildCondition(creep => this.isCarryingEnergy(creep)),
                buildSelector([
                    // If task is set to deliver to controller container
                    buildSequence([
                        buildCondition(creep => MemoryManager.getCreepMemory(creep, 'task') === 'deliverToControllerContainer'),
                        buildAction(creep => this.deliverToControllerContainer(creep))
                    ]),
                    // Priorities when carrying energy
                    // 1. Refill Spawns and Extensions
                    buildSequence([
                        buildCondition(creep => this.structuresNeedEnergy(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION])),
                        buildAction(creep => this.refillStructures(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]))
                    ]),
                    // 2. Refill Towers
                    buildSequence([
                        buildCondition(creep => this.structuresNeedEnergy(creep, [STRUCTURE_TOWER])),
                        buildAction(creep => this.refillStructures(creep, [STRUCTURE_TOWER]))
                    ]),
                    // 3. Supply Controller Container
                    buildSequence([
                        buildCondition(creep => this.controllerContainerNeedsEnergy(creep)),
                        buildAction(creep => this.deliverToControllerContainer(creep))
                    ]),
                    // 4. Deliver to Storage
                    buildSequence([
                        buildCondition(creep => this.storageNeedsEnergy(creep)),
                        buildAction(creep => this.deliverToStorage(creep))
                    ]),
                    // 5. Directly Supply Builders and Upgraders
                    buildSequence([
                        buildCondition(creep => this.creepsNeedEnergy(creep, ['builder', 'upgrader'])),
                        buildAction(creep => this.supplyCreeps(creep, ['builder', 'upgrader']))
                    ]),
                    // Idle if nothing else to do
                    buildAction(creep => this.idle(creep))
                ])
            ]),

            // If not carrying energy
            buildSequence([
                buildCondition(creep => this.needsEnergy(creep)),
                buildSelector([
                    // 1. Try to collect energy from source containers or dropped energy
                    buildSequence([
                        buildAction(creep => this.collectEnergy(creep))
                    ]),
                    // 2. If 1 fails and spawns/extensions need energy, withdraw from storage
                    buildSequence([
                        buildCondition(creep => this.structuresNeedEnergy(creep, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION])),
                        buildAction(creep => this.withdrawEnergyFromStorage(creep))
                    ]),
                    // 3. If 2 fails and controller container needs energy, withdraw from storage and set task
                    buildSequence([
                        buildCondition(creep => this.controllerContainerNeedsEnergy(creep)),
                        buildAction(creep => this.withdrawEnergyFromStorage(creep, 'deliverToControllerContainer'))
                    ]),
                    // Idle if nothing else to do
                    buildAction(creep => this.idle(creep))
                ])
            ]),
            // Default action: idle
            buildAction(creep => this.idle(creep))
        ]);
    }

    run() {
        this.behaviorTree.execute(this.creep);
    }
}

module.exports = new Hauler();
