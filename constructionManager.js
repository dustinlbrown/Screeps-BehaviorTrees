// constructionManager.js

/**
 * Construction Manager
 * Primary Function:
 *   - Manage construction tasks such as building Containers, Extensions, and other structures.
 * Secondary Functions:
 *   - Ensure critical structures are built in a timely manner.
 * Priorities:
 *   1. Build Containers near Sources and Controller.
 *   2. Build Extensions as RCL increases.
 *   3. Build Roads and other infrastructure.
 */

var constructionManager = {
    /** @param {Room} room **/
    run: function(room) {
        // Build Containers at Sources
        const sources = room.find(FIND_SOURCES);
        sources.forEach(source => {
            const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            });
            const constructionSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
            });

            if (containers.length === 0 && constructionSites.length === 0) {
                const path = room.findPath(room.controller.pos, source.pos, {
                    ignoreCreeps: true,
                    ignoreRoads: true
                });

                const position = room.getPositionAt(path[1].x, path[1].y);

                room.createConstructionSite(position, STRUCTURE_CONTAINER);
            }
        });

        // Build Container near Controller
        const controllerContainer = room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        })[0];
        const controllerConstructionSite = room.controller.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
        })[0];

        if (!controllerContainer && !controllerConstructionSite) {
            const path = room.findPath(room.controller.pos, room.storage ? room.storage.pos : room.find(FIND_MY_SPAWNS)[0].pos, {
                ignoreCreeps: true,
                ignoreRoads: true
            });

            const position = room.getPositionAt(path[1].x, path[1].y);

            room.createConstructionSite(position, STRUCTURE_CONTAINER);
        }

        // Build Extensions when available
        const extensions = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_EXTENSION
        });

        const extensionConstructionSites = room.find(FIND_CONSTRUCTION_SITES, {
            filter: s => s.structureType === STRUCTURE_EXTENSION
        });

        const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];

        if ((extensions.length + extensionConstructionSites.length) < maxExtensions) {
            // Find a suitable location to build extensions
            // For simplicity, we'll build them near the Spawn
            const spawn = room.find(FIND_MY_SPAWNS)[0];
            const positions = room.lookForAtArea(
                LOOK_TERRAIN,
                spawn.pos.y - 5,
                spawn.pos.x - 5,
                spawn.pos.y + 5,
                spawn.pos.x + 5,
                true
            );

            positions.forEach(pos => {
                if (
                    (pos.terrain === 'plain' || pos.terrain === 'swamp') &&
                    room.createConstructionSite(pos.x, pos.y, STRUCTURE_EXTENSION) === OK
                ) {
                    // Break once we've added enough construction sites
                    if ((extensions.length + extensionConstructionSites.length) >= maxExtensions) {
                        return;
                    }
                }
            });
        }

        // Additional construction logic can be added here (e.g., Roads, Towers, etc.)
    }
};

module.exports = constructionManager;
