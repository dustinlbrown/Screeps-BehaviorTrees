// creep/Miner.js

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

class Miner extends CreepRole {
    constructor(creep) {
        super(creep);
        this.behaviorTree = this.createMinerBehaviorTree();
    }

    // Action Functions

    /**
     * Harvests energy from the assigned source.
     * @param {Creep} creep - The miner creep instance.
     * @returns {number} - The status of the action.
     */
    harvestEnergy(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to harvest energy.`);
            const source = Game.getObjectById(MemoryManager.getCreepMemory(creep, 'sourceId'));

            if (!source) {
                Logger.error(`${creep.name} has no valid source assigned.`);
                return FAILURE;
            }

            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                moveToTarget(creep, source, '#ffaa00');
                return RUNNING;
            } else if (creep.harvest(source) === OK) {
                Logger.info(`${creep.name} is harvesting energy from Source ID: ${source.id}`);
                return SUCCESS;
            } else {
                Logger.warn(`${creep.name} failed to harvest energy from Source ID: ${source.id}`);
                return FAILURE;
            }
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in harvestEnergy: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Moves the miner to the assigned container or source.
     * @param {Creep} creep - The miner creep instance.
     * @returns {number} - The status of the action.
     */
    moveToContainer(creep) {
        try {
            Logger.debug(`${creep.name} is attempting to move to the assigned container.`);
            const containerId = MemoryManager.getCreepMemory(creep, 'containerId');
            let container = Game.getObjectById(containerId);

            if (!container) {
                // Attempt to find a container near the source
                const source = Game.getObjectById(MemoryManager.getCreepMemory(creep, 'sourceId'));
                if (source) {
                    const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER
                    });
                    container = containers[0] || null;
                    if (container) {
                        MemoryManager.setCreepMemory(creep, 'containerId', container.id);
                        Logger.info(`${creep.name} assigned to Container ID: ${container.id}`);
                    }
                }
            }

            if (container) {
                if (!creep.pos.isEqualTo(container.pos)) {
                    moveToTarget(creep, container, '#ffaa00');
                    Logger.debug(`${creep.name} is moving to Container ID: ${container.id}`);
                    return RUNNING;
                } else {
                    Logger.info(`${creep.name} has reached Container ID: ${container.id}`);
                    return SUCCESS;
                }
            }

            Logger.warn(`${creep.name} could not find a container near the assigned source.`);
            return FAILURE;
        } catch (error) {
            Logger.error(`${creep.name} encountered an error in moveToContainer: ${error}`);
            return FAILURE;
        }
    }

    /**
     * Idles the miner by moving it near the spawn.
     * @param {Creep} creep - The miner creep instance.
     * @returns {number} - The status of the action.
     */
    idleAction(creep) {
        return idle(creep);
    }

    // Condition Functions

    /**
     * Checks if the miner is assigned to a source.
     * @param {Creep} creep - The miner creep instance.
     * @returns {boolean} - True if assigned, false otherwise.
     */
    isAssignedToSource(creep) {
        return !!MemoryManager.getCreepMemory(creep, 'sourceId');
    }

    /**
     * Checks if the miner is near the container.
     * @param {Creep} creep - The miner creep instance.
     * @returns {boolean} - True if near, false otherwise.
     */
    isNearContainer(creep) {
        const containerId = MemoryManager.getCreepMemory(creep, 'containerId');
        const container = Game.getObjectById(containerId);
        return container ? creep.pos.isNearTo(container) : false;
    }

    /**
     * Checks if the miner needs to harvest energy.
     * @param {Creep} creep - The miner creep instance.
     * @returns {boolean} - True if needs energy, false otherwise.
     */
    needsToHarvest(creep) {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }

    // Assemble the Miner Behavior Tree

    /**
     * Creates the behavior tree for the miner role.
     * @returns {BehaviorNode} - The root of the behavior tree.
     */
    createMinerBehaviorTree() {
        return buildSelector([
            // Ensure miner is assigned to a source
            buildSequence([
                buildCondition(creep => this.isAssignedToSource(creep)),
                buildSelector([
                    // If assigned, move to container and harvest
                    buildSequence([
                        buildCondition(creep => this.isNearContainer(creep)),
                        buildCondition(creep => this.needsToHarvest(creep)),
                        buildAction(creep => this.harvestEnergy(creep))
                    ]),
                    // If not near container, move to container
                    buildAction(creep => this.moveToContainer(creep))
                ])
            ]),

            // Assign miner to a source if not assigned
            buildSequence([
                buildCondition(creep => !this.isAssignedToSource(creep)),
                buildAction(creep => MemoryManager.assignSourceToMiner(creep))
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

module.exports = new Miner();
