// containerManager.js

/**
 * Container Manager
 * Primary Function:
 *   - Manages container data and provides utility functions for container operations.
 * Secondary Functions:
 *   - Assigns roles to containers for efficient energy management.
 * Priorities:
 *   1. Maintain up-to-date container data in Memory.
 *   2. Provide functions to get containers based on roles.
 */

const containerManager = {
    // Initialize container data in Memory
    init: function(room) {
        if (!Memory.containers) {
            Memory.containers = {};
        }

        const containers = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_CONTAINER }
        });

        containers.forEach(container => {
            // Determine the role of the container
            let role = 'general';

            // Check if the container is near a source
            const sources = container.pos.findInRange(FIND_SOURCES, 1);
            if (sources.length > 0) {
                role = 'source';
            } else {
                // Check if the container is near the controller
                if (container.pos.inRangeTo(room.controller.pos, 3)) {
                    role = 'controller';
                }
            }

            // Assign or update the container data in Memory
            Memory.containers[container.id] = {
                id: container.id,
                pos: container.pos,
                energy: container.store[RESOURCE_ENERGY],
                creepsTargeting: Memory.containers[container.id] ? Memory.containers[container.id].creepsTargeting.filter(name => Game.creeps[name]) : [],
                role: role
            };
        });

        // Remove containers that no longer exist
        for (let id in Memory.containers) {
            if (!Game.getObjectById(id)) {
                delete Memory.containers[id];
            }
        }
    },

    getBestContainerForDeposit: function(creep, options = {}) {
        let containers = Object.values(Memory.containers).filter(data => {
            const container = Game.getObjectById(data.id);
            return container && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        });
    
        // Filter containers based on roles if specified
        if (options.excludeRoles) {
            containers = containers.filter(data => !options.excludeRoles.includes(data.role));
        }
        if (options.includeRoles) {
            containers = containers.filter(data => options.includeRoles.includes(data.role));
        }
    
        if (containers.length === 0) {
            return null;
        }
    
        // Find the closest container
        containers.sort((a, b) => creep.pos.getRangeTo(a.pos.x, a.pos.y) - creep.pos.getRangeTo(b.pos.x, b.pos.y));
    
        // Choose the best container
        const bestContainerData = containers[0];
        const bestContainer = Game.getObjectById(bestContainerData.id);
    
        return bestContainer;
    },

    // Get the best container for withdrawal, with optional role filtering
    getBestContainerForWithdrawal: function(creep, options = {}) {
        let containers = Object.values(Memory.containers).filter(data => data.energy > 0);

        // Filter containers based on roles if specified
        if (options.excludeRoles) {
            containers = containers.filter(data => !options.excludeRoles.includes(data.role));
        }
        if (options.includeRoles) {
            containers = containers.filter(data => options.includeRoles.includes(data.role));
        }

        if (containers.length === 0) {
            return null;
        }

        containers.forEach(data => {
            const container = Game.getObjectById(data.id);
            if (container) {
                const path = creep.pos.findPathTo(container, { ignoreCreeps: true });
                data.distance = path.length;
            } else {
                data.distance = Infinity;
            }
        });

        // Sort containers based on a weighted score
        containers.sort((a, b) => {
            const scoreA = (a.energy / (a.distance + 1)) - (a.creepsTargeting.length * 100);
            const scoreB = (b.energy / (b.distance + 1)) - (b.creepsTargeting.length * 100);
            return scoreB - scoreA; // Descending order
        });

        // Choose the best container
        const bestContainerData = containers[0];
        const bestContainer = Game.getObjectById(bestContainerData.id);

        // Register this creep as targeting the container
        bestContainerData.creepsTargeting.push(creep.name);

        return bestContainer;
    },

    // Remove creep from container targeting lists when they die or change tasks
    removeCreepFromContainers: function(creep) {
        for (let id in Memory.containers) {
            const index = Memory.containers[id].creepsTargeting.indexOf(creep.name);
            if (index !== -1) {
                Memory.containers[id].creepsTargeting.splice(index, 1);
            }
        }
    }
};

module.exports = containerManager;
