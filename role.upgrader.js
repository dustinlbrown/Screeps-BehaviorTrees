// role.upgrader.js

/**
 * Role: Upgrader
 * Primary Function:
 *   - Upgrade the room controller.
 * Secondary Functions:
 *   - None.
 * Priorities:
 *   1. Withdraw energy from the controller container.
 *   2. If the controller container is empty, withdraw from Storage.
 *   3. Upgrade the controller.
 */

const { initializeMetrics } = require('helper');
const containerManager = require('containerManager');

const UPGRADE_CONTROLLER_POWER = 1;
const HARVEST_POWER = 2;

var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize metrics
        initializeMetrics(creep);

        // Update metrics
        updateMetrics(creep);

        // State management
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 collect');
            containerManager.removeCreepFromContainers(creep);
            delete creep.memory.containerId;
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
            containerManager.removeCreepFromContainers(creep);
            delete creep.memory.containerId;
        }

        if (creep.memory.upgrading) {
            // Upgrade the controller
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
        } else {
            // Energy collection phase
            creep.memory.metrics.timeRetrieving += 1;

            // Check if creep has a target container
            let container = null;
            if (creep.memory.containerId) {
                container = Game.getObjectById(creep.memory.containerId);
                if (!container || container.store[RESOURCE_ENERGY] === 0) {
                    containerManager.removeCreepFromContainers(creep);
                    delete creep.memory.containerId;
                    container = null;
                }
            }

            if (!container) {
                // Prioritize withdrawing from the controller container
                container = containerManager.getBestContainerForWithdrawal(creep, { includeRoles: ['controller'] });
                if (!container) {
                    // If no controller container is available, withdraw from Storage
                    const storage = creep.room.storage;
                    if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                        if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 20 });
                            creep.memory.metrics.timeMoving += 1;
                        } else if (creep.withdraw(storage, RESOURCE_ENERGY) === OK) {
                            creep.memory.metrics.tasksCompleted.transfer += 1;
                        }
                        return;
                    } else {
                        // Fallback to harvesting
                        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                        if (source) {
                            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 20 });
                                creep.memory.metrics.timeMoving += 1;
                            } else if (creep.harvest(source) === OK) {
                                creep.memory.metrics.timeRetrieving += 1;
                                creep.memory.metrics.energyHarvested += creep.getActiveBodyparts(WORK) * HARVEST_POWER;
                                creep.memory.metrics.tasksCompleted.harvest += 1;
                            }
                        }
                        return;
                    }
                } else {
                    creep.memory.containerId = container.id;
                }
            }

            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 20 });
                    creep.memory.metrics.timeMoving += 1;
                } else if (creep.withdraw(container, RESOURCE_ENERGY) === OK) {
                    creep.memory.metrics.tasksCompleted.transfer += 1;
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

module.exports = roleUpgrader;
