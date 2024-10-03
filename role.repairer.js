// role.repairer.js

/**
 * Role: Repairer
 * Primary Function:
 *   - Repair damaged structures.
 * Secondary Functions:
 *   - Build construction sites if no repairs are needed.
 *   - Upgrade controller if no other tasks are available.
 * Priorities:
 *   1. Repair damaged structures (excluding walls and ramparts).
 *   2. Repair walls and ramparts during energy surplus.
 *   3. Build construction sites.
 *   4. Upgrade the controller.
 */

const { initializeMetrics, updateMetrics, isEnergySurplus } = require('helper');

const REPAIR_POWER = 100;
const BUILD_POWER = 5;
const UPGRADE_CONTROLLER_POWER = 1;
const HARVEST_POWER = 2;

const WALL_RAMPART_MAX_HITS = 10000; // Adjust this value based on your needs
const ENERGY_SURPLUS_THRESHOLD = 0.75; // 75% of storage capacity

const repairThreshold = {
    [STRUCTURE_SPAWN]: 0.8,
    [STRUCTURE_EXTENSION]: 0.5,
    [STRUCTURE_ROAD]: 0.1,
    [STRUCTURE_STORAGE]: 0.5,
    [STRUCTURE_TOWER]: 0.8,
    [STRUCTURE_CONTAINER]: 0.5,
    // Walls and ramparts are handled separately
};

var roleRepairer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize metrics
        initializeMetrics(creep);

        // Update metrics
        updateMetrics(creep);

        // State management
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.repairing = false;
            creep.say('🔄 collect');
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity() === 0) {
            creep.memory.repairing = true;
            creep.say('🔧 repair');
        }

        if (creep.memory.repairing) {
            // **Priority 1: Repair critical structures (excluding walls and ramparts)**
            const criticalStructures = creep.room.find(FIND_STRUCTURES, {
                filter: object =>
                    object.hits < object.hitsMax &&
                    (object.structureType !== STRUCTURE_WALL && object.structureType !== STRUCTURE_RAMPART) &&
                    object.structureType in repairThreshold &&
                    object.hits < object.hitsMax * repairThreshold[object.structureType]
            });

            // Sort by the lowest percentage of hits
            criticalStructures.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));

            if (criticalStructures.length > 0) {
                const target = criticalStructures[0];

                if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {
                        visualizePathStyle: { stroke: '#ffffff' },
                        reusePath: 20
                    });
                    creep.memory.metrics.timeMoving += 1;
                } else if (creep.repair(target) === OK) {
                    creep.memory.metrics.timeWorking += 1;
                    creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * REPAIR_POWER;
                    creep.memory.metrics.tasksCompleted.repair += 1;
                }
            } else {
                // **Check if we have an energy surplus before repairing walls and ramparts**
                if (isEnergySurplus(creep.room, ENERGY_SURPLUS_THRESHOLD)) {
                    // **Priority 2: Repair walls and ramparts up to the defined hit point cap**
                    const wallRampartStructures = creep.room.find(FIND_STRUCTURES, {
                        filter: structure =>
                            (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
                            structure.hits < WALL_RAMPART_MAX_HITS
                    });

                    // Sort by lowest hits
                    wallRampartStructures.sort((a, b) => a.hits - b.hits);

                    if (wallRampartStructures.length > 0) {
                        const target = wallRampartStructures[0];

                        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {
                                visualizePathStyle: { stroke: '#ffffff' },
                                reusePath: 20
                            });
                            creep.memory.metrics.timeMoving += 1;
                        } else if (creep.repair(target) === OK) {
                            creep.memory.metrics.timeWorking += 1;
                            creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * REPAIR_POWER;
                            creep.memory.metrics.tasksCompleted.repair += 1;
                        }
                    } else {
                        // **Priority 3: Build construction sites**
                        const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                        if (constructionSites.length) {
                            if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(constructionSites[0], {
                                    visualizePathStyle: { stroke: '#66ff66' },
                                    reusePath: 20
                                });
                                creep.memory.metrics.timeMoving += 1;
                            } else if (creep.build(constructionSites[0]) === OK) {
                                creep.memory.metrics.timeWorking += 1;
                                creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * BUILD_POWER;
                                creep.memory.metrics.tasksCompleted.build += 1;
                            }
                        } else {
                            // **Priority 4: Upgrade the controller**
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
                    // **Energy is not surplus; skip repairing walls and ramparts**
                    // **Priority 3: Build construction sites**
                    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (constructionSites.length) {
                        if (creep.build(constructionSites[0]) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(constructionSites[0], {
                                visualizePathStyle: { stroke: '#66ff66' },
                                reusePath: 20
                            });
                            creep.memory.metrics.timeMoving += 1;
                        } else if (creep.build(constructionSites[0]) === OK) {
                            creep.memory.metrics.timeWorking += 1;
                            creep.memory.metrics.energySpent += creep.getActiveBodyparts(WORK) * BUILD_POWER;
                            creep.memory.metrics.tasksCompleted.build += 1;
                        }
                    } else {
                        // **Priority 4: Upgrade the controller**
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
            }
        }
    }
};
module.exports = roleRepairer;
