// role.miner.js

/**
 * Role: Miner
 * Primary Function:
 *   - Harvest energy from assigned source and deposit it into the container they are positioned on.
 * Secondary Functions:
 *   - None.
 * Priorities:
 *   1. Assign to a unique source and container.
 *   2. Move to the container at the source.
 *   3. Harvest energy continuously.
 */

const { initializeMetrics } = require('helper');

const HARVEST_POWER = 2;

var roleMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize metrics
        initializeMetrics(creep);

        // Initialize previous position for distance calculation
        if (!creep.memory.prevPos) {
            creep.memory.prevPos = { x: creep.pos.x, y: creep.pos.y };
        }

        // Update metrics
        updateMetrics(creep);

        // Ensure creep is assigned to a source
        if (!creep.memory.sourceId) {
            assignSourceToMiner(creep);
        }

        // Get the source object
        const source = Game.getObjectById(creep.memory.sourceId);

        if (source) {
            // Check if the miner has a container assigned
            let container = Game.getObjectById(creep.memory.containerId);
            if (!container) {
                // Find container near the source
                const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                });
                if (containers.length > 0) {
                    container = containers[0];
                    creep.memory.containerId = container.id;
                }
            }

            if (container) {
                // Move to the container if not already there
                if (!creep.pos.isEqualTo(container.pos)) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 20 });
                    creep.memory.metrics.timeMoving += 1;
                } else {
                    // We are on the container
                    // Harvest energy
                    if (creep.harvest(source) === OK) {
                        creep.memory.metrics.energyHarvested += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
                        creep.memory.metrics.tasksCompleted.harvest += 1;
                    }
                    // Energy will automatically be dropped on the container if creep's storage is full
                }
            } else {
                // No container found; move near the source
                if (!creep.pos.isNearTo(source)) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 20 });
                    creep.memory.metrics.timeMoving += 1;
                } else {
                    // Harvest energy
                    if (creep.harvest(source) === OK) {
                        creep.memory.metrics.energyHarvested += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
                        creep.memory.metrics.tasksCompleted.harvest += 1;
                    }
                    // Energy will be dropped on the ground when creep's storage is full
                }
            }
        }
    }
};

// Helper function to update ticks lived and distance traveled
function updateMetrics(creep) {
    creep.memory.metrics.ticksLived += 1;

    const dx = creep.pos.x - creep.memory.prevPos.x;
    const dy = creep.pos.y - creep.memory.prevPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    creep.memory.metrics.distanceTraveled += distance;
    creep.memory.prevPos = { x: creep.pos.x, y: creep.pos.y };
}

function assignSourceToMiner(creep) {
    if (!Memory.assignedSources) {
        Memory.assignedSources = {};
    }

    // Clean up assigned sources for dead creeps
    for (const sourceId in Memory.assignedSources) {
        const minerName = Memory.assignedSources[sourceId];
        // If the miner assigned to this source is dead, clear the assignment
        if (!Game.creeps[minerName]) {
            delete Memory.assignedSources[sourceId];
        }
    }

    // Find an unassigned source
    const sources = creep.room.find(FIND_SOURCES);
    for (const source of sources) {
        if (!Memory.assignedSources[source.id]) {
            // Assign this source to the creep
            Memory.assignedSources[source.id] = creep.name;
            creep.memory.sourceId = source.id;
            return;
        }
    }

    // If all sources are assigned, use the creep's current assignment if any
    if (creep.memory.sourceId) {
        return;
    }

    // As a last resort, assign any source
    if (sources.length > 0) {
        creep.memory.sourceId = sources[0].id;
        Memory.assignedSources[sources[0].id] = creep.name;
    }
}




module.exports = roleMiner;
