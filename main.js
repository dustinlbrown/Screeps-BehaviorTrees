// main.js

const roleMiner = require('role.miner');
const roleHauler = require('role.hauler');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');
const spawnManager = require('spawnManager');
const constructionManager = require('constructionManager');
const containerManager = require('containerManager');
const { initializeMetrics } = require('helper');
const { createTowerBehaviorTree } = require('towerBehavior');

// Cache the tower behavior tree
const towerBehaviorTree = createTowerBehaviorTree();

module.exports.loop = function () {
    // Initialize container data
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        containerManager.init(room);
    }

    // Clean up memory and report stats for dead creeps
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            // Remove assigned source for miners
            if (Memory.creeps[name].role === 'miner' && Memory.creeps[name].sourceId) {
                const sourceId = Memory.creeps[name].sourceId;
                if (Memory.assignedSources && Memory.assignedSources[sourceId] === name) {
                    delete Memory.assignedSources[sourceId];
                }
            }
            delete Memory.creeps[name];
        }
    }

    // Run construction manager
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        constructionManager.run(room);
    }

    // Spawn manager
    for (const spawnName in Game.spawns) {
        const spawn = Game.spawns[spawnName];
        spawnManager.run(spawn);
    }


    // Tower Logic
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];

        // Find all towers in the room
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });

        // Execute behavior tree for each tower
        for (const tower of towers) {
            towerBehaviorTree.execute(tower);
        }
    }

    // Run creep roles
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        // Initialize metrics
        initializeMetrics(creep);

        // Run roles
        if (creep.memory.role === 'miner') {
            roleMiner.run(creep);
        } else if (creep.memory.role === 'hauler') {
            roleHauler.run(creep);
        } else if (creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        } else if (creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        } else if (creep.memory.role === 'repairer') {
            roleRepairer.run(creep);
        }
        // Add other roles as needed
    }
};
