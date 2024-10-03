// structures/Tower.js

const {
    SUCCESS,
    FAILURE,
    RUNNING,
    buildAction,
    buildCondition,
    buildSequence,
    buildSelector
} = require('../behaviorTree');
const Logger = require('../utils/Logger');
const { moveToTarget } = require('../behaviorTree/SharedActions');
const { isEnergySurplus } = require('../utils/helper'); // Assuming isEnergySurplus is in helper.js

// Constants
const WALL_RAMPART_MAX_HITS = 10000; // Adjust based on your needs
const ENERGY_SURPLUS_THRESHOLD = 0.75; // 75% of storage capacity

const repairThreshold = {
    [STRUCTURE_SPAWN]: 0.8,
    [STRUCTURE_EXTENSION]: 0.5,
    [STRUCTURE_ROAD]: 0.1,
    [STRUCTURE_STORAGE]: 0.5,
    [STRUCTURE_TOWER]: 0.8,
    [STRUCTURE_CONTAINER]: 0.5,
    // Walls and ramparts are handled separately
};

class Tower {
    /**
     * Constructs a Tower instance.
     * @param {StructureTower} tower - The tower structure to manage.
     */
    constructor(tower) {
        this.tower = tower;
        this.behaviorTree = this.createTowerBehaviorTree();
    }

    // Action Functions

    /**
     * Attack the closest hostile creep.
     * @returns {number} SUCCESS or FAILURE
     */
    attackHostileCreeps() {
        const target = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            this.tower.attack(target);
            Logger.info(`Tower ${this.tower.id} attacked hostile creep ${target.id}`);
            return SUCCESS;
        }
        return FAILURE;
    }

    /**
     * Heal the closest injured friendly creep.
     * @returns {number} SUCCESS or FAILURE
     */
    healFriendlyCreeps() {
        const target = this.tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: creep => creep.hits < creep.hitsMax
        });
        if (target) {
            this.tower.heal(target);
            Logger.info(`Tower ${this.tower.id} healed friendly creep ${target.id}`);
            return SUCCESS;
        }
        return FAILURE;
    }

    /**
     * Repair critical structures excluding walls and ramparts.
     * @returns {number} SUCCESS or FAILURE
     */
    repairCriticalStructures() {
        const criticalStructures = this.tower.room.find(FIND_STRUCTURES, {
            filter: structure =>
                structure.hits < structure.hitsMax &&
                structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_RAMPART &&
                repairThreshold[structure.structureType] &&
                structure.hits < structure.hitsMax * repairThreshold[structure.structureType]
        });

        if (criticalStructures.length > 0) {
            // Sort by lowest percentage of hits
            criticalStructures.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
            const target = criticalStructures[0];
            this.tower.repair(target);
            Logger.info(`Tower ${this.tower.id} repaired Structure ${target.id}`);
            return SUCCESS;
        }
        return FAILURE;
    }

    /**
     * Repair walls and ramparts only during energy surplus.
     * @returns {number} SUCCESS or FAILURE
     */
    repairWallsAndRamparts() {
        if (!isEnergySurplus(this.tower.room, ENERGY_SURPLUS_THRESHOLD)) {
            return FAILURE; // Do not repair walls if no surplus
        }

        const wallRampartStructures = this.tower.room.find(FIND_STRUCTURES, {
            filter: structure =>
                (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
                structure.hits < WALL_RAMPART_MAX_HITS
        });

        if (wallRampartStructures.length > 0) {
            // Sort by lowest absolute hits
            wallRampartStructures.sort((a, b) => a.hits - b.hits);
            const target = wallRampartStructures[0];
            this.tower.repair(target);
            Logger.info(`Tower ${this.tower.id} repaired Wall/Rampart ${target.id}`);
            return SUCCESS;
        }
        return FAILURE;
    }

    // Assemble the Tower Behavior Tree

    /**
     * Creates the behavior tree for the tower.
     * @returns {BehaviorNode} - The root of the behavior tree.
     */
    createTowerBehaviorTree() {
        return buildSelector([
            // Priority 1: Attack Hostile Creeps
            buildSequence([
                buildCondition(() => this.tower.room.find(FIND_HOSTILE_CREEPS).length > 0),
                buildAction(() => this.attackHostileCreeps())
            ]),
            // Priority 2: Heal Friendly Creeps
            buildSequence([
                buildCondition(() => this.tower.room.find(FIND_MY_CREEPS, {
                    filter: creep => creep.hits < creep.hitsMax
                }).length > 0),
                buildAction(() => this.healFriendlyCreeps())
            ]),
            // Priority 3: Repair Critical Structures
            buildSequence([
                buildCondition(() => this.tower.room.find(FIND_STRUCTURES, {
                    filter: structure =>
                        structure.hits < structure.hitsMax &&
                        structure.structureType !== STRUCTURE_WALL &&
                        structure.structureType !== STRUCTURE_RAMPART &&
                        repairThreshold[structure.structureType] &&
                        structure.hits < structure.hitsMax * repairThreshold[structure.structureType]
                }).length > 0),
                buildAction(() => this.repairCriticalStructures())
            ]),
            // Priority 4: Repair Walls and Ramparts (only during energy surplus)
            buildSequence([
                buildCondition(() => isEnergySurplus(this.tower.room, ENERGY_SURPLUS_THRESHOLD)),
                buildAction(() => this.repairWallsAndRamparts())
            ])
        ]);
    }

    /**
     * Executes the behavior tree.
     */
    run() {
        this.behaviorTree.execute(this.tower);
    }
}

module.exports = Tower;
