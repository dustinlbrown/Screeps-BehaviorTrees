// creep/CreepRole.js

class CreepRole {
    /**
     * Constructs a new CreepRole.
     * @param {Creep} creep - The creep instance.
     */
    constructor(creep) {
        this.creep = creep;
    }

    /**
     * Runs the behavior tree.
     */
    run() {
        // To be implemented by subclasses
    }
}

module.exports = CreepRole;
