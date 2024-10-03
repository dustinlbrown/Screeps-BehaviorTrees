// /classes/ConditionNodes.js

class HasCriticalStructures {
    constructor(room) {
        this.room = room;
    }

    execute() {
        const criticalStructures = this.room.find(FIND_STRUCTURES, {
            filter: structure =>
                structure.hits < structure.hitsMax &&
                structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_RAMPART &&
                (structure.structureType === STRUCTURE_SPAWN ||
                 structure.structureType === STRUCTURE_EXTENSION ||
                 structure.structureType === STRUCTURE_ROAD ||
                 structure.structureType === STRUCTURE_STORAGE ||
                 structure.structureType === STRUCTURE_TOWER ||
                 structure.structureType === STRUCTURE_CONTAINER)
        });
        return criticalStructures.length > 0 ? 'SUCCESS' : 'FAILURE';
    }
}

class HasConstructionSites {
    constructor(room) {
        this.room = room;
    }

    execute() {
        const constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
        return constructionSites.length > 0 ? 'SUCCESS' : 'FAILURE';
    }
}

class HasController {
    constructor(room) {
        this.room = room;
    }

    execute() {
        return this.room.controller ? 'SUCCESS' : 'FAILURE';
    }
}

class IsEnergySurplus {
    constructor(room) {
        this.room = room;
    }

    execute() {
        const { isEnergySurplus } = require('../utils/Helper');
        return isEnergySurplus(this.room) ? 'SUCCESS' : 'FAILURE';
    }
}

class HostilesPresent {
    constructor(room) {
        this.room = room;
    }

    execute() {
        const hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        return hostiles.length > 0 ? 'SUCCESS' : 'FAILURE';
    }
}

class InjuredCreepsPresent {
    constructor(room) {
        this.room = room;
    }

    execute() {
        const injuredCreeps = this.room.find(FIND_MY_CREEPS, {
            filter: creep => creep.hits < creep.hitsMax
        });
        return injuredCreeps.length > 0 ? 'SUCCESS' : 'FAILURE';
    }
}

module.exports = {
    HasCriticalStructures,
    HasConstructionSites,
    HasController,
    IsEnergySurplus,
    HostilesPresent,
    InjuredCreepsPresent
};
