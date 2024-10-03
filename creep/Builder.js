// creep/Builder.js

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

class Builder extends CreepRole {
    constructor(creep) {
        super(creep);
        this.behaviorTree = this.createBuilderBehaviorTree();
    }

    // Action Functions

    /**
     * Builds a construction site.
     * @param {Creep} creep - The builder creep instance.
     * @returns {number} - The status of the action.
     */
    buildConstructionSite(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to build a construction site.`);
            const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            
            if (constructionSite) {
                if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, constructionSite, '#ffffff');
                    Logger.debug(`${creep.name} is moving to Construction Site ID: ${constructionSite.id}`);
                    return RUNNING;
                } else if (creep.build(constructionSite) === OK) {
                    Logger.info(`${creep.name} is building Construction Site ID: ${constructionSite.id}`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to build Construction Site ID: ${constructionSite.id}`);
                    return FAILURE;
                }
            }

            Logger.warn(`${creep.name} found no construction sites to build.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in buildConstructionSite: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Repairs a damaged structure.
     * @param {Creep} creep - The builder creep instance.
     * @returns {number} - The status of the action.
     */
    repairStructure(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to repair a structure.`);
            const damagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax && object.structureType !== STRUCTURE_WALL
            });

            if (damagedStructure) {
                if (creep.repair(damagedStructure) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, damagedStructure, '#ffffff');
                    Logger.debug(`${creep.name} is moving to damaged Structure ID: ${damagedStructure.id}`);
                    return RUNNING;
                } else if (creep.repair(damagedStructure) === OK) {
                    Logger.info(`${creep.name} is repairing Structure ID: ${damagedStructure.id}`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to repair Structure ID: ${damagedStructure.id}`);
                    return FAILURE;
                }
            }

            Logger.warn(`${creep.name} found no structures to repair.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in repairStructure: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Upgrades the room controller.
     * @param {Creep} creep - The builder creep instance.
     * @returns {number} - The status of the action.
     */
    upgradeController(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to upgrade the controller.`);
            const controller = creep.room.controller;

            if (controller) {
                if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, controller, '#ffffff');
                    Logger.debug(`${creep.name} is moving to Controller ID: ${controller.id}`);
                    return RUNNING;
                } else if (creep.upgradeController(controller) === OK) {
                    Logger.info(`${creep.name} successfully upgraded the controller.`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to upgrade Controller ID: ${controller.id}`);
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
     * Withdraws energy from storage.
     * @param {Creep} creep - The builder creep instance.
     * @returns {number} - The status of the action.
     */
    withdrawFromStorage(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to withdraw energy from storage.`);
            const storage = creep.room.storage;

            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, storage, '#ffaa00');
                    Logger.debug(`${creep.name} is moving to Storage ID: ${storage.id}`);
                    return RUNNING;
                } else if (creep.withdraw(storage, RESOURCE_ENERGY) === OK) {
                    Logger.info(`${creep.name} successfully withdrew energy from Storage ID: ${storage.id}`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to withdraw energy from Storage ID: ${storage.id}`);
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
     * Harvests energy from a source.
     * @param {Creep} creep - The builder creep instance.
     * @returns {number} - The status of the action.
     */
    harvestEnergy(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to harvest energy.`);
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    moveToTarget(creep, source, '#ffaa00');
                    Logger.debug(`${creep.name} is moving to Source ID: ${source.id}`);
                    return RUNNING;
                } else if (creep.harvest(source) === OK) {
                    Logger.info(`${creep.name} is harvesting energy from Source ID: ${source.id}`);
                    return SUCCESS;
                } else {
                    Logger.warn(`${creep.name} failed to harvest energy from Source ID: ${source.id}`);
                    return FAILURE;
                }
            }

            Logger.warn(`${creep.name} found no active sources to harvest.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in harvestEnergy: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Idles the builder by moving it near the spawn.
     * @param {Creep} creep - The builder creep instance.
     * @returns {number} - The status of the action.
     */
    idleAction(creep) {
        return idle(creep);
    }

    // Condition Functions

    /**
     * Checks if the builder is currently building.
     * @param {Creep} creep - The builder creep instance.
     * @returns {boolean} - True if building, false otherwise.
     */
    isBuilding(creep) {
        return MemoryManager.getCreepMemory(creep, 'building') === true;
    }

    /**
     * Checks if the builder has energy to perform tasks.
     * @param {Creep} creep - The builder creep instance.
     * @returns {boolean} - True if has energy, false otherwise.
     */
    hasEnergy(creep) {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }

    /**
     * Checks if the builder needs to collect energy.
     * @param {Creep} creep - The builder creep instance.
     * @returns {boolean} - True if needs energy, false otherwise.
     */
    needsEnergy(creep) {
        return !this.isBuilding(creep) && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }

    // Assemble the Builder Behavior Tree

    /**
     * Creates the behavior tree for the builder role.
     * @returns {BehaviorNode} - The root of the behavior tree.
     */
    createBuilderBehaviorTree() {
        return buildSelector([
            // If building and has energy, perform building actions
            buildSequence([
                buildCondition(creep => this.isBuilding(creep)),
                buildSelector([
                    // Priority 1: Build construction sites
                    buildSequence([
                        buildCondition(creep => this.hasEnergy(creep)),
                        buildAction(creep => this.buildConstructionSite(creep))
                    ]),
                    // Priority 2: Repair damaged structures
                    buildSequence([
                        buildCondition(creep => this.hasEnergy(creep)),
                        buildAction(creep => this.repairStructure(creep))
                    ]),
                    // Priority 3: Upgrade the controller
                    buildSequence([
                        buildCondition(creep => this.hasEnergy(creep)),
                        buildAction(creep => this.upgradeController(creep))
                    ]),
                    // If none of the above, idle
                    buildAction(creep => this.idleAction(creep))
                ])
            ]),

            // If not building and needs energy, perform energy collection
            buildSequence([
                buildCondition(creep => this.needsEnergy(creep)),
                buildSelector([
                    // Priority 1: Withdraw from storage
                    buildSequence([
                        buildCondition(creep => MemoryManager.hasTask(creep, 'withdrawFromStorage')),
                        buildAction(creep => this.withdrawFromStorage(creep))
                    ]),
                    // Priority 2: Harvest energy
                    buildAction(creep => this.harvestEnergy(creep))
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

module.exports = new Builder();
