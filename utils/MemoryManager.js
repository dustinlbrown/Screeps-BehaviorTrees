// utils/MemoryManager.js

const Logger = require('./Logger');

const MemoryManager = {
    /**
     * Sets a memory property for a specific creep.
     * @param {Creep} creep - The creep instance.
     * @param {string} key - The memory key.
     * @param {*} value - The value to set.
     */
    setCreepMemory: function (creep, key, value) {
        creep.memory[key] = value;
        Logger.info(`Set memory for ${creep.name}: ${key} = ${value}`);
    },

    /**
     * Gets a memory property for a specific creep.
     * @param {Creep} creep - The creep instance.
     * @param {string} key - The memory key.
     * @returns {*} - The value of the memory key.
     */
    getCreepMemory: function (creep, key) {
        return creep.memory[key];
    },

    /**
     * Checks if a creep has a specific task.
     * @param {Creep} creep - The creep instance.
     * @param {string} task - The task to check.
     * @returns {boolean} - True if the task is assigned, false otherwise.
     */
    hasTask: function (creep, task) {
        return creep.memory.task === task;
    },

    /**
     * Assigns sources to miners, ensuring each miner has a unique source.
     */
    assignSources: function () {
        const spawn = Game.spawns['Spawn1'];
        if (!spawn) {
            Logger.error('Spawn1 not found!');
            return;
        }

        const room = spawn.room;
        const sources = room.find(FIND_SOURCES);
        const containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
        });

        const miners = _.filter(Game.creeps, (creep) => creep.memory.role === 'miner');

        sources.forEach((source, index) => {
            const miner = miners[index];
            if (!miner) {
                Logger.warn(`No miner available for Source ID: ${source.id}`);
                return;
            }

            // Assign sourceId if not already assigned or if source has changed
            if (miner.memory.sourceId !== source.id) {
                this.setCreepMemory(miner, 'sourceId', source.id);
                Logger.info(`Assigned Source ID: ${source.id} to Miner: ${miner.name}`);
            }

            // Assign containerId if not already assigned or if container has changed
            const sourceContainers = containers.filter(container => container.pos.inRangeTo(source, 1));
            const container = sourceContainers.length > 0 ? sourceContainers[0] : null;
            const containerId = container ? container.id : null;

            if (miner.memory.containerId !== containerId) {
                this.setCreepMemory(miner, 'containerId', containerId);
                if (containerId) {
                    Logger.info(`Assigned Container ID: ${containerId} to Miner: ${miner.name}`);
                } else {
                    Logger.warn(`No container found near Source ID: ${source.id} for Miner: ${miner.name}`);
                }
            }
        });
    },

    /**
     * Assigns a source to a miner that doesn't have one.
     * @param {Creep} creep - The miner creep instance.
     * @returns {number} - The status of the assignment.
     */
    assignSourceToMiner: function (creep) {
        if (!Memory.assignedSources) {
            Memory.assignedSources = {};
        }

        // Clean up assigned sources for dead creeps
        for (const sourceId in Memory.assignedSources) {
            const minerName = Memory.assignedSources[sourceId];
            // If the miner assigned to this source is dead, clear the assignment
            if (!Game.creeps[minerName]) {
                delete Memory.assignedSources[sourceId];
                Logger.info(`Cleared assignment for Source ID: ${sourceId} as Miner: ${minerName} is dead.`);
            }
        }

        // Find an unassigned source
        const sources = creep.room.find(FIND_SOURCES);
        for (const source of sources) {
            if (!Memory.assignedSources[source.id]) {
                // Assign this source to the creep
                Memory.assignedSources[source.id] = creep.name;
                this.setCreepMemory(creep, 'sourceId', source.id);

                // Assign containerId if a container exists near the source
                const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                });
                const container = containers[0] || null;
                if (container) {
                    this.setCreepMemory(creep, 'containerId', container.id);
                    Logger.info(`Assigned Container ID: ${container.id} to Miner: ${creep.name}`);
                } else {
                    this.setCreepMemory(creep, 'containerId', null);
                    Logger.warn(`No container found near Source ID: ${source.id} for Miner: ${creep.name}`);
                }

                return SUCCESS;
            }
        }

        // If all sources are assigned, do not assign
        Logger.warn(`All sources are currently assigned. Miner: ${creep.name} has no source to assign.`);
        return FAILURE;
    },

    /**
     * Assigns tasks to haulers based on current colony needs.
     */
    assignTasksToHaulers: function () {
        const spawn = Game.spawns['Spawn1'];
        if (!spawn) {
            Logger.error('Spawn1 not found!');
            return;
        }

        const room = spawn.room;
        const storage = room.storage;
        const haulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler');

        haulers.forEach(hauler => {
            if (!hauler.memory.task) {
                if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    this.setCreepMemory(hauler, 'task', 'deliverToStorage');
                    Logger.info(`Assigned task 'deliverToStorage' to Hauler: ${hauler.name}`);
                } else {
                    this.setCreepMemory(hauler, 'task', 'idle');
                    Logger.info(`Assigned task 'idle' to Hauler: ${hauler.name}`);
                }
            }
        });
    },

    /**
     * Assigns tasks to upgraders based on current colony needs.
     */
    assignTasksToUpgraders: function () {
        const spawn = Game.spawns['Spawn1'];
        if (!spawn) {
            Logger.error('Spawn1 not found!');
            return;
        }

        const room = spawn.room;
        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');

        upgraders.forEach(upgrader => {
            if (!upgrader.memory.task) {
                // Define tasks for upgraders if any
                // Currently, upgraders have a fixed priority, so assign 'upgradeController'
                this.setCreepMemory(upgrader, 'task', 'upgradeController');
                Logger.info(`Assigned task 'upgradeController' to Upgrader: ${upgrader.name}`);
            }
        });
    },

    /**
     * Clears memory assignments for dead creeps.
     */
    clearDeadCreepMemory: function () {
        for (const sourceId in Memory.assignedSources) {
            const minerName = Memory.assignedSources[sourceId];
            if (!Game.creeps[minerName]) {
                delete Memory.assignedSources[sourceId];
                Logger.info(`Cleared assignment for Source ID: ${sourceId} as Miner: ${minerName} is dead.`);
            }
        }
    },

    /**
     * Assigns a specific task to a creep.
     * @param {Creep} creep - The creep instance.
     * @param {string} task - The task to assign.
     */
    assignTaskToCreep: function (creep, task) {
        this.setCreepMemory(creep, 'task', task);
        Logger.info(`Assigned task '${task}' to Creep: ${creep.name}`);
    }

    // Add more generalized memory functions as needed
};

module.exports = MemoryManager;
