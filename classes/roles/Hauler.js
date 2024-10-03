// /classes/roles/Hauler.js

const CreepRole = require('./CreepRole');
const BehaviorTree = require('./BehaviorTree');
const { isEnergySurplus } = require('../../utils/Helper');

class Hauler extends CreepRole {
    constructor(creep) {
        super(creep);
        this.behaviorTree = new BehaviorTree(this.creep, this);
    }

    run() {
        this.initializeMemory();
        this.updateMetrics();
        this.behaviorTree.execute();
    }

    // Define specific actions and conditions here or within the BehaviorTree
}

module.exports = Hauler;
