// behaviorTree/SharedConditions.js

/**
 * Checks if the creep is carrying any energy.
 * @param {Creep} creep - The creep instance.
 * @returns {boolean}
 */
function isCarryingEnergy(creep) {
    return creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
}

/**
 * Checks if the creep needs to collect energy.
 * @param {Creep} creep - The creep instance.
 * @returns {boolean}
 */
function needsEnergy(creep) {
    return creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
}

/**
 * Checks if storage needs energy.
 * @param {Creep} creep - The creep instance.
 * @returns {boolean}
 */
function storageNeedsEnergy(creep) {
    return creep.room.storage && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
}

/**
 * Checks if specified structures need energy.
 * @param {Creep} creep - The creep instance.
 * @param {Array<string>} structureTypes - Array of structure types to check.
 * @returns {boolean}
 */
function structuresNeedEnergy(creep, structureTypes) {
    return creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            structureTypes.includes(structure.structureType) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }).length > 0;
}

/**
 * Checks if the controller's container needs energy.
 * @param {Creep} creep - The creep instance.
 * @returns {boolean}
 */
function controllerContainerNeedsEnergy(creep) {
    const controllerContainer = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
        filter: s =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })[0];
    return !!controllerContainer;
}

/**
 * Checks if specified creeps need energy.
 * @param {Creep} creep - The creep instance.
 * @param {Array<string>} roles - Array of creep roles to check.
 * @returns {boolean}
 */
function creepsNeedEnergy(creep, roles) {
    return creep.room.find(FIND_MY_CREEPS, {
        filter: c =>
            roles.includes(c.memory.role) &&
            c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }).length > 0;
}

/**
 * Checks if the creep is idle (no tasks assigned).
 * @param {Creep} creep - The creep instance.
 * @returns {boolean} - True if idle, false otherwise.
 */
function isCreepIdle(creep) {
    return !creep.memory.task;
}

/**
 * Checks if the creep has a specific task assigned.
 * @param {Creep} creep - The creep instance.
 * @param {string} task - The task to check.
 * @returns {boolean} - True if the task is assigned, false otherwise.
 */
function hasTask(creep, task) {
    return creep.memory.task === task;
}

module.exports = {
    isCarryingEnergy,
    needsEnergy,
    storageNeedsEnergy,
    structuresNeedEnergy,
    controllerContainerNeedsEnergy,
    creepsNeedEnergy,
    isCreepIdle,
    hasTask
};
