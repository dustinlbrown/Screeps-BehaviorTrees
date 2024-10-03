// /utils/Helper.js

/**
 * Check if the room has an energy surplus.
 * @param {Room} room
 * @param {number} threshold - Percentage (0 to 1) of storage capacity to consider as surplus.
 * @returns {boolean}
 */
function isEnergySurplus(room, threshold = 0.75) {
    const storage = room.storage;
    if (!storage) return false;
    return storage.store[RESOURCE_ENERGY] >= storage.storeCapacity * threshold;
}

/**
 * Find and return the most damaged structure based on given criteria.
 * @param {Room} room
 * @param {object} options
 * @returns {Structure|undefined}
 */
function findMostDamagedStructure(room, options = {}) {
    const {
        excludeStructures = [],
        structureTypes = [],
        threshold = 0.5,
        sortByPercentage = true,
        fixedHitPoints = null
    } = options;

    let structures = room.find(FIND_STRUCTURES, {
        filter: structure =>
            structure.hits < structure.hitsMax &&
            !excludeStructures.includes(structure.structureType) &&
            (structureTypes.length === 0 || structureTypes.includes(structure.structureType))
    });

    if (fixedHitPoints !== null) {
        structures = structures.filter(structure => structure.hits < fixedHitPoints);
    } else {
        structures = structures.filter(structure => structure.hits < structure.hitsMax * threshold);
    }

    if (structures.length === 0) return undefined;

    // Sort structures based on percentage or absolute hits
    if (sortByPercentage) {
        structures.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
    } else {
        structures.sort((a, b) => a.hits - b.hits);
    }

    return structures[0];
}

/**
 * Find the closest hostile creep.
 * @param {Room} room
 * @returns {Creep|undefined}
 */
function findHostile(room) {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    return hostiles.length > 0 ? hostiles[0] : undefined;
}

/**
 * Find the closest injured friendly creep.
 * @param {Room} room
 * @returns {Creep|undefined}
 */
function findInjuredCreep(room) {
    const injuredCreeps = room.find(FIND_MY_CREEPS, {
        filter: creep => creep.hits < creep.hitsMax
    });
    return injuredCreeps.length > 0 ? injuredCreeps[0] : undefined;
}

module.exports = {
    isEnergySurplus,
    findMostDamagedStructure,
    findHostile,
    findInjuredCreep
};
