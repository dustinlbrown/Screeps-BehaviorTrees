// utils/SpawnManager.js

const Logger = require('./Logger');
const MemoryManager = require('./MemoryManager');
const bodyConfig = require('./BodyConfig');

const SpawnManager = {
    /**
     * Spawns creeps based on current needs and available energy.
     */
    run: function () {
        const spawn = Game.spawns['Spawn1'];
        if (!spawn) {
            Logger.error('Spawn1 not found!');
            return;
        }

        const energyAvailable = spawn.room.energyAvailable;
        const energyCapacityAvailable = spawn.room.energyCapacityAvailable;

        // Define desired number of creeps per role
        const desiredCreeps = {
            miner: 2,
            hauler: 2,
            upgrader: 2,
            builder: 2
            // Add more roles as needed
        };

        // Count existing creeps per role
        const existingCreeps = _.groupBy(Game.creeps, 'memory.role');

        for (const role in desiredCreeps) {
            const desired = desiredCreeps[role];
            const existing = existingCreeps[role] ? existingCreeps[role].length : 0;

            if (existing < desired) {
                // Generate a unique name for the creep
                const name = `${role}-${Game.time}`;

                // Get body configuration
                const body = bodyConfig.getBodyConfig(role, energyAvailable, energyCapacityAvailable);

                // Define memory for the creep
                const memory = { role: role };

                // Attempt to spawn the creep
                const result = spawn.spawnCreep(body, name, { memory: memory });

                if (result === OK) {
                    Logger.info(`Spawning new creep: ${name} with role: ${role}`);
                } else if (result === ERR_NOT_ENOUGH_ENERGY) {
                    Logger.warn(`Not enough energy to spawn creep: ${name}`);
                } else {
                    Logger.error(`Failed to spawn creep: ${name}, Error Code: ${result}`);
                }

                // Update energyAvailable after attempting to spawn
                // to prevent over-spawning in the same tick
                // Note: In Screeps, energyAvailable is updated per tick,
                // so this is optional
            }
        }
    }
};

module.exports = SpawnManager;
