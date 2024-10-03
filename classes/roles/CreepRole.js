// /classes/roles/CreepRole.js

const CreepBase = require('./CreepBase');

class CreepRole extends CreepBase {
    constructor(creep) {
        super(creep);
    }

    run() {
        throw new Error('Run method must be implemented by subclass');
    }
}

module.exports = CreepRole;
