// role.builder.js

/**
 * Role: Builder
 * Primary Function:
 *   - Build construction sites.
 * Secondary Functions:
 *   - Repair structures if no construction sites are available.
 *   - Upgrade controller if no construction or repair work is available.
 * Priorities:
 *   1. Build construction sites.
 *   2. Repair damaged structures.
 *   3. Upgrade the controller.
 */

const { initializeMetrics } = require('helper');

const BUILD_POWER = 5;
const REPAIR_POWER = 100;
const UPGRADE_CONTROLLER_POWER = 1;
const HARVEST_POWER = 2;

var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize metrics
        initializeMetrics(creep);

        // Update metrics
        updateMetrics(creep);

        // State management
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say('🔄 collect');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            // **Priority 1: Build construction sites**
            const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (constructionSites.length) {
                if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSites[0], {
                        visualizePathStyle: { stroke: '#ffffff' },
                        reusePath: 20
                    });
                    creep.memory.metrics.timeMoving += 1;
                } else if (creep.build(constructionSites[0]) === OK) {
                    creep.memory.metrics.timeWorking += 1;
                    creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * BUILD_POWER;
                    creep.memory.metrics.tasksCompleted.build += 1;
                }
            } else {
                // **Priority 2: Repair structures**
                const structures = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax && object.structureType !== STRUCTURE_WALL
                });
                structures.sort((a, b) => a.hits - b.hits);

                if (structures.length > 0) {
                    if (creep.repair(structures[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structures[0], {
                            visualizePathStyle: { stroke: '#ffffff' },
                            reusePath: 20
                        });
                        creep.memory.metrics.timeMoving += 1;
                    } else if (creep.repair(structures[0]) === OK) {
                        creep.memory.metrics.timeWorking += 1;
                        creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * REPAIR_POWER;
                        creep.memory.metrics.tasksCompleted.repair += 1;
                    }
                } else {
                    // **Priority 3: Upgrade the controller**
                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {
                            visualizePathStyle: { stroke: '#ffffff' },
                            reusePath: 20
                        });
                        creep.memory.metrics.timeMoving += 1;
                    } else if (creep.upgradeController(creep.room.controller) === OK) {
                        creep.memory.metrics.timeWorking += 1;
                        creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER;
                        creep.memory.metrics.tasksCompleted.upgrade += 1;
                    }
                }
            }
        } else {
            // **Collect energy from Storage**
            const storage = creep.room.storage;
            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 20 });
                    creep.memory.metrics.timeMoving += 1;
                } else if (creep.withdraw(storage, RESOURCE_ENERGY) === OK) {
                    creep.memory.metrics.tasksCompleted.transfer += 1;
                }
            } else {
                // **Fallback to harvesting**
                const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source) {
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {
                            visualizePathStyle: { stroke: '#ffaa00' },
                            reusePath: 20
                        });
                        creep.memory.metrics.timeMoving += 1;
                    } else if (creep.harvest(source) === OK) {
                        creep.memory.metrics.timeRetrieving += 1;
                        creep.memory.metrics.energyHarvested += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
                        creep.memory.metrics.tasksCompleted.harvest += 1;
                    }
                }
            }
        }
    }
};

// Helper function to update ticks lived and distance traveled
function updateMetrics(creep) {
    creep.memory.metrics.ticksLived += 1;

    if (!creep.memory.prevPos) {
        creep.memory.prevPos = { x: creep.pos.x, y: creep.pos.y };
    }

    const dx = creep.pos.x - creep.memory.prevPos.x;
    const dy = creep.pos.y - creep.memory.prevPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    creep.memory.metrics.distanceTraveled += distance;
    creep.memory.prevPos = { x: creep.pos.x, y: creep.pos.y };
}

module.exports = roleBuilder;
