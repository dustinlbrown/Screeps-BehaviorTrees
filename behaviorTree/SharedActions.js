// behaviorTree/SharedActions.js

const { FAILURE, RUNNING, SUCCESS } = require('./index');
const Logger = require('../utils/Logger');

/**
 * Moves the creep to the specified target.
 * @param {Creep} creep - The creep instance.
 * @param {RoomObject} target - The target to move towards.
 * @param {string} color - The color of the path visualization.
 * @returns {number} - The status of the action.
 */
function moveToTarget(creep, target, color = '#ffffff') {
    if (creep.moveTo(target, { visualizePathStyle: { stroke: color }, reusePath: 20 }) === ERR_NO_PATH) {
        Logger.warn(`${creep.name} could not find a path to target.`);
        return FAILURE;
    }
    return RUNNING;
}

/**
 * Harvests energy from a source.
 * @param {Creep} creep - The creep instance.
 * @param {Source} source - The energy source.
 * @returns {number} - The status of the action.
 */
function harvestEnergy(creep, source) {
    try {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            moveToTarget(creep, source, '#ffaa00');
            Logger.debug(`${creep.name} is moving to harvest from Source ID: ${source.id}`);
            return RUNNING;
        } else if (creep.harvest(source) === OK) {
            Logger.info(`${creep.name} harvested energy from Source ID: ${source.id}`);
            return SUCCESS;
        } else {
            Logger.warn(`${creep.name} failed to harvest energy from Source ID: ${source.id}`);
            return FAILURE;
        }
    } catch (error) {
        Logger.error(`${creep.name} encountered an error in harvestEnergy: ${error}`);
        return FAILURE;
    }
}

/**
 * Withdraws energy from a structure.
 * @param {Creep} creep - The creep instance.
 * @param {Structure} structure - The structure to withdraw energy from.
 * @param {string} resourceType - The resource type to withdraw.
 * @returns {number} - The status of the action.
 */
function withdrawEnergy(creep, structure, resourceType = RESOURCE_ENERGY) {
    try {
        if (creep.withdraw(structure, resourceType) === ERR_NOT_IN_RANGE) {
            moveToTarget(creep, structure, '#ffaa00');
            Logger.debug(`${creep.name} is moving to withdraw energy from Structure ID: ${structure.id}`);
            return RUNNING;
        } else if (creep.withdraw(structure, resourceType) === OK) {
            Logger.info(`${creep.name} withdrew energy from Structure ID: ${structure.id}`);
            return SUCCESS;
        } else {
            Logger.warn(`${creep.name} failed to withdraw energy from Structure ID: ${structure.id}`);
            return FAILURE;
        }
    } catch (error) {
        Logger.error(`${creep.name} encountered an error in withdrawEnergy: ${error}`);
        return FAILURE;
    }
}

/**
 * Builds a construction site.
 * @param {Creep} creep - The creep instance.
 * @param {ConstructionSite} site - The construction site to build.
 * @returns {number} - The status of the action.
 */
function buildConstructionSite(creep, site) {
    try {
        if (creep.build(site) === ERR_NOT_IN_RANGE) {
            moveToTarget(creep, site, '#ffffff');
            Logger.debug(`${creep.name} is moving to build Construction Site ID: ${site.id}`);
            return RUNNING;
        } else if (creep.build(site) === OK) {
            Logger.info(`${creep.name} built Construction Site ID: ${site.id}`);
            return SUCCESS;
        } else {
            Logger.warn(`${creep.name} failed to build Construction Site ID: ${site.id}`);
            return FAILURE;
        }
    } catch (error) {
        Logger.error(`${creep.name} encountered an error in buildConstructionSite: ${error}`);
        return FAILURE;
    }
}

/**
 * Repairs a structure.
 * @param {Creep} creep - The creep instance.
 * @param {Structure} structure - The structure to repair.
 * @returns {number} - The status of the action.
 */
function repairStructure(creep, structure) {
    try {
        if (creep.repair(structure) === ERR_NOT_IN_RANGE) {
            moveToTarget(creep, structure, '#ffffff');
            Logger.debug(`${creep.name} is moving to repair Structure ID: ${structure.id}`);
            return RUNNING;
        } else if (creep.repair(structure) === OK) {
            Logger.info(`${creep.name} repaired Structure ID: ${structure.id}`);
            return SUCCESS;
        } else {
            Logger.warn(`${creep.name} failed to repair Structure ID: ${structure.id}`);
            return FAILURE;
        }
    } catch (error) {
        Logger.error(`${creep.name} encountered an error in repairStructure: ${error}`);
        return FAILURE;
    }
}

/**
 * Upgrades the room controller.
 * @param {Creep} creep - The creep instance.
 * @param {StructureController} controller - The room controller.
 * @returns {number} - The status of the action.
 */
function upgradeController(creep, controller) {
    try {
        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
            moveToTarget(creep, controller, '#ffffff');
            Logger.debug(`${creep.name} is moving to upgrade Controller ID: ${controller.id}`);
            return RUNNING;
        } else if (creep.upgradeController(controller) === OK) {
            Logger.info(`${creep.name} upgraded Controller ID: ${controller.id}`);
            return SUCCESS;
        } else {
            Logger.warn(`${creep.name} failed to upgrade Controller ID: ${controller.id}`);
            return FAILURE;
        }
    } catch (error) {
        Logger.error(`${creep.name} encountered an error in upgradeController: ${error}`);
        return FAILURE;
    }
}

module.exports = {
    moveToTarget,
    harvestEnergy,
    withdrawEnergy,
    buildConstructionSite,
    repairStructure,
    upgradeController
};
