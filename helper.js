// helper.js

/**
 * Initialize metrics for a creep if not already initialized.
 * @param {Creep} creep
 */
function initializeMetrics(creep) {
    if (!creep.memory.metrics) {
        creep.memory.metrics = {
            ticksLived: 0,
            distanceTraveled: 0,
            timeMoving: 0,
            timeWorking: 0,
            timeRetrieving: 0,
            energySpent: 0,
            energyHarvested: 0,
            tasksCompleted: {
                harvest: 0,
                transfer: 0,
                repair: 0,
                build: 0,
                upgrade: 0,
            }
        };
    }
}

/**
 * Update metrics for a creep.
 * @param {Creep} creep
 */
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

/**
 * Find and return the most damaged structure based on given criteria.
 * @param {Room} room
 * @param {object} options
 * @returns {Structure|undefined}
 */
function findMostDamagedStructure(room, options = {}) {
    const {
        excludeStructures = [],
        threshold = 0.5,
        sortByPercentage = true,
        fixedHitPoints = null
    } = options;

    let structures = room.find(FIND_STRUCTURES, {
        filter: structure =>
            structure.hits < structure.hitsMax &&
            !excludeStructures.includes(structure.structureType)
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

    return structures[0]
}

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

module.exports = {
    initializeMetrics,
    updateMetrics,
    isEnergySurplus,
};
