// /classes/Repairer.js

const CreepRole = require('./CreepRole');
const RepairerBehaviorTree = require('./RepairerBehaviorTree');

class Repairer extends CreepRole {
    constructor(creep) {
        super(creep);
        this.behaviorTree = new RepairerBehaviorTree(this.creep, this);
    }

    run() {
        this.behaviorTree.execute();
    }

    // Additional helper methods specific to Repairer
    findMostDamagedStructure(options) {
        const { findMostDamagedStructure } = require('../utils/Helper');
        return findMostDamagedStructure(this.creep.room, options);
    }

    repair(target) {
        const result = this.creep.repair(target);
        if (result === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
            this.incrementMetric('timeMoving', 1);
            return 'RUNNING';
        } else if (result === OK) {
            this.incrementMetric('timeWorking', 1);
            this.incrementMetric('energySpent', this.creep.getActiveBodyparts(WORK) * 100);
            this.incrementTask('repair', 1);
            return 'SUCCESS';
        } else {
            return 'FAILURE';
        }
    }

    findConstructionSite() {
        const sites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
        return sites.length > 0 ? sites[0] : undefined;
    }

    build(target) {
        const result = this.creep.build(target);
        if (result === ERR_NOT_IN_RANGE) {
            this.moveTo(target, { visualizePathStyle: { stroke: '#66ff66' } });
            this.incrementMetric('timeMoving', 1);
            return 'RUNNING';
        } else if (result === OK) {
            this.incrementMetric('timeWorking', 1);
            this.incrementMetric('energySpent', this.creep.getActiveBodyparts(WORK) * 5);
            this.incrementTask('build', 1);
            return 'SUCCESS';
        } else {
            return 'FAILURE';
        }
    }

    getController() {
        return this.creep.room.controller;
    }

    upgrade(target) {
        const result = this.creep.upgradeController(target);
        if (result === ERR_NOT_IN_RANGE) {
            this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            this.incrementMetric('timeMoving', 1);
            return 'RUNNING';
        } else if (result === OK) {
            this.incrementMetric('timeWorking', 1);
            this.incrementMetric('energySpent', this.creep.getActiveBodyparts(WORK) * 1);
            this.incrementTask('upgrade', 1);
            return 'SUCCESS';
        } else {
            return 'FAILURE';
        }
    }
}

module.exports = Repairer;
