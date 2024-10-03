// main.js

const Miner = require('creep/Miner');
const Hauler = require('creep/Hauler');
const Upgrader = require('creep/Upgrader');
const Builder = require('creep/Builder');
const SpawnManager = require('utils/SpawnManager');
const MemoryManager = require('utils/MemoryManager');
const Logger = require('utils/Logger');

module.exports.loop = function () {
    //Logger.info('--- New Tick ---');

    // Clear memory assignments for dead creeps
    MemoryManager.clearDeadCreepMemory();

    // Assign sources to miners
    MemoryManager.assignSources();

    // Assign tasks to haulers
    MemoryManager.assignTasksToHaulers();

    // Assign tasks to upgraders
    MemoryManager.assignTasksToUpgraders();

    // Assign tasks to builders (if applicable)
    // If builders have specific tasks, add similar functions in MemoryManager.js
    // Currently, builders have predefined priorities, so no task assignment is needed

    // Initialize Spawn Manager
    SpawnManager.run();

    // Iterate through all creeps and assign roles
    for (const creepName in Game.creeps) {
        const creep = Game.creeps[creepName];
        const role = creep.memory.role;

        switch (role) {
            case 'miner':
                Miner.run(creep);
                break;
            case 'hauler':
                Hauler.run(creep);
                break;
            case 'upgrader':
                Upgrader.run(creep);
                break;
            case 'builder':
                Builder.run(creep);
                break;
            default:
                Logger.warn(`Unknown role: ${role} for Creep: ${creep.name}`);
        }
    }

    // Clean up memory for dead creeps
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            Logger.info(`Cleared memory for creep: ${name}`);
        }
    }
};
