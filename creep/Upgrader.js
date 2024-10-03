// creep/Upgrader.js

const CreepRole = require('./CreepRole');
const {
    SUCCESS,
    FAILURE,
    RUNNING,
    buildCondition,
    buildAction,
    buildSequence,
    buildSelector
} = require('../behaviorTree');
const Logger = require('../utils/Logger');
const MemoryManager = require('../utils/MemoryManager');
const { moveToTarget, idle } = require('../behaviorTree/SharedActions');
const { isCreepIdle } = require('../behaviorTree/SharedConditions');

class Upgrader extends CreepRole {
    constructor(creep) {
        super(creep);
        this.behaviorTree = this.createUpgraderBehaviorTree();
    }

    // Action Functions

    /**
     * Withdraws energy from the controller container.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {number} - The status of the action.
     */
    withdrawFromControllerContainer(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to withdraw energy from the controller container.`);
            const containerId = MemoryManager.getCreepMemory(creep, 'controllerContainerId');
            let container = Game.getObjectById(containerId);

            if (!container) {
                // Attempt to find a controller container
                container = creep.room.controller.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s =>
                        s.structureType === STRUCTURE_CONTAINER &&
                        s.store[RESOURCE_ENERGY] > 0
                });

                if (container) {
                    MemoryManager.setCreepMemory(creep, 'controllerContainerId', container.id);
                    Logger.info(`${creep.name} assigned to Controller Container ID: ${container.id}`);
                } else {
                    Logger.warn(`${creep.name} could not find a Controller Container.`);
                    return FAILURE;
                }
            }

            if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                moveToTarget(creep, container, '#ffaa00');
                return RUNNING;
            } else if (creep.withdraw(container, RESOURCE_ENERGY) === OK) {
                Logger.info(`${creep.name} successfully withdrew energy from Controller Container ID: ${container.id}`);
                return SUCCESS;
            } else {
                Logger.warn(`${creep.name} failed to withdraw energy from Controller Container ID: ${container.id}`);
                return FAILURE;
            }
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in withdrawFromControllerContainer: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Withdraws energy from storage.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {number} - The status of the action.
     */
    withdrawFromStorage(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to withdraw energy from storage.`);
            const storage = creep.room.storage;

            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, storage, '#ffaa00');
                    return RUNNING;
                } else if (creep.withdraw(storage, RESOURCE_ENERGY) === OK) {
                    Logger.info(`${creep.name} successfully withdrew energy from storage.`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to withdraw energy from storage.`);
                    return FAILURE;
                }
            }

            Logger.warn(`${creep.name} found no energy in storage to withdraw.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in withdrawFromStorage: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Upgrades the room controller.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {number} - The status of the action.
     */
    upgradeController(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to upgrade the controller.`);
            const controller = creep.room.controller;

            if (controller) {
                if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, controller, '#ffffff');
                    return RUNNING;
                } else if (creep.upgradeController(controller) === OK) {
                    Logger.info(`${creep.name} successfully upgraded the controller.`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to upgrade the controller.`);
                    return FAILURE;
                }
            }

            Logger.error(`${creep.name} could not find the room controller.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in upgradeController: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Idles the upgrader by moving it near the spawn.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {number} - The status of the action.
     */
    idleAction(creep) {
        return idle(creep);
    }

    // Condition Functions

    /**
     * Checks if the upgrader is currently upgrading.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {boolean} - True if upgrading, false otherwise.
     */
    isUpgrading(creep) {
        return MemoryManager.getCreepMemory(creep, 'upgrading') === true;
    }

    /**
     * Checks if the upgrader has energy to upgrade.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {boolean} - True if has energy, false otherwise.
     */
    hasEnergyToUpgrade(creep) {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }

    /**
     * Checks if the upgrader needs to withdraw energy.
     * @param {Creep} creep - The upgrader creep instance.
     * @returns {boolean} - True if needs energy, false otherwise.
     */
    needsToWithdraw(creep) {
        return !this.isUpgrading(creep) && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }

    // Assemble the Upgrader Behavior Tree

    /**
     * Creates the behavior tree for the upgrader role.
     * @returns {BehaviorNode} - The root of the behavior tree.
     */
    createUpgraderBehaviorTree() {
        return buildSelector([
            // If upgrading and has energy, perform upgrade
            buildSequence([
                buildCondition(creep => this.isUpgrading(creep)),
                buildCondition(creep => this.hasEnergyToUpgrade(creep)),
                buildAction(creep => this.upgradeController(creep))
            ]),

            // If needs to withdraw energy, attempt withdrawal
            buildSequence([
                buildCondition(creep => this.needsToWithdraw(creep)),
                buildSelector([
                    // Priority 1: Withdraw from controller container
                    buildSequence([
                        buildCondition(creep => MemoryManager.hasTask(creep, 'withdrawFromControllerContainer')),
                        buildAction(creep => this.withdrawFromControllerContainer(creep))
                    ]),
                    // Priority 2: Withdraw from storage
                    buildSequence([
                        buildCondition(creep => MemoryManager.hasTask(creep, 'withdrawFromStorage')),
                        buildAction(creep => this.withdrawFromStorage(creep))
                    ]),
                    // If both fail, idle
                    buildAction(creep => this.idleAction(creep))
                ])
            ]),

            // Default action: idle
            buildAction(creep => this.idleAction(creep))
        ]);
    }

    /**
     * Executes the behavior tree.
     */
    run() {
        this.behaviorTree.execute(this.creep);
    }
}

module.exports = new Upgrader();
