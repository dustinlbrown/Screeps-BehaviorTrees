// towerBehavior.js

const {
    SUCCESS,
    FAILURE,
    RUNNING,
    ActionNode,
    ConditionNode,
    SequenceNode,
    SelectorNode
} = require('behaviorTree');

const { isEnergySurplus } = require('helper');

const WALL_RAMPART_MAX_HITS = 10000; // Adjust this value based on your needs
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

// Action Functions

/**
 * Attack the closest hostile creep.
 * @param {StructureTower} tower
 * @returns {string} SUCCESS or FAILURE
 */
function attackHostileCreeps(tower) {
    const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target) {
        tower.attack(target);
        return SUCCESS;
    }
    return FAILURE;
}

/**
 * Heal the closest injured friendly creep.
 * @param {StructureTower} tower
 * @returns {string} SUCCESS or FAILURE
 */
function healFriendlyCreeps(tower) {
    const target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: creep => creep.hits < creep.hitsMax
    });
    if (target) {
        tower.heal(target);
        return SUCCESS;
    }
    return FAILURE;
}

/**
 * Repair critical structures excluding walls and ramparts.
 * @param {StructureTower} tower
 * @returns {string} SUCCESS or FAILURE
 */
function repairCriticalStructures(tower) {
    const criticalStructures = tower.room.find(FIND_STRUCTURES, {
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
        tower.repair(target);
        return SUCCESS;
    }
    return FAILURE;
}

/**
 * Repair walls and ramparts only during energy surplus.
 * @param {StructureTower} tower
 * @returns {string} SUCCESS or FAILURE
 */
function repairWallsAndRamparts(tower) {
    if (!isEnergySurplus(tower.room, ENERGY_SURPLUS_THRESHOLD)) {
        return FAILURE; // Do not repair walls if no surplus
    }

    const wallRampartStructures = tower.room.find(FIND_STRUCTURES, {
        filter: structure =>
            (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
            structure.hits < WALL_RAMPART_MAX_HITS
    });

    if (wallRampartStructures.length > 0) {
        // Sort by lowest absolute hits
        wallRampartStructures.sort((a, b) => a.hits - b.hits);
        const target = wallRampartStructures[0];
        tower.repair(target);
        return SUCCESS;
    }
    return FAILURE;
}

// Assemble the Tower Behavior Tree

/**
 * Create a behavior tree for towers.
 * @returns {SelectorNode} Behavior tree root node
 */
function createTowerBehaviorTree() {
    return new SelectorNode([
        // Priority 1: Attack Hostile Creeps
        new SequenceNode([
            new ConditionNode(tower => tower.room.find(FIND_HOSTILE_CREEPS).length > 0),
            new ActionNode(attackHostileCreeps)
        ]),
        // Priority 2: Heal Friendly Creeps
        new SequenceNode([
            new ConditionNode(tower => tower.room.find(FIND_MY_CREEPS, {
                filter: creep => creep.hits < creep.hitsMax
            }).length > 0),
            new ActionNode(healFriendlyCreeps)
        ]),
        // Priority 3: Repair Critical Structures
        new SequenceNode([
            new ConditionNode(tower => tower.room.find(FIND_STRUCTURES, {
                filter: structure =>
                    structure.hits < structure.hitsMax &&
                    structure.structureType !== STRUCTURE_WALL &&
                    structure.structureType !== STRUCTURE_RAMPART &&
                    repairThreshold[structure.structureType] &&
                    structure.hits < structure.hitsMax * repairThreshold[structure.structureType]
            }).length > 0),
            new ActionNode(repairCriticalStructures)
        ]),
        // Priority 4: Repair Walls and Ramparts (only during energy surplus)
        new SequenceNode([
            new ConditionNode(tower => isEnergySurplus(tower.room, ENERGY_SURPLUS_THRESHOLD)),
            new ActionNode(repairWallsAndRamparts)
        ])
    ]);
}

module.exports = {
    createTowerBehaviorTree
};
