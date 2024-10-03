// spawnManager.js

const { getBodyConfig } = require('bodyConfig');

const spawnManager = {
    /** @param {StructureSpawn} spawn **/
    run: function(spawn) {
        const room = spawn.room;
        const energyAvailable = room.energyAvailable;
        const energyCapacityAvailable = room.energyCapacityAvailable;

        // Get counts of creeps by role
        const creepsByRole = _.groupBy(Game.creeps, creep => creep.memory.role);

        const miners = creepsByRole['miner'] || [];
        const haulers = creepsByRole['hauler'] || [];
        const upgraders = creepsByRole['upgrader'] || [];
        const builders = creepsByRole['builder'] || [];
        const repairers = creepsByRole['repairer'] || [];

        // Define desired counts
        const desiredMiners = room.find(FIND_SOURCES).length; // One miner per source
        const desiredHaulers = 4; // Adjust based on room needs
        const desiredUpgraders = 3; // Adjust based on energy surplus
        //const desiredBuilders = 2; // Adjust based on construction needs
        const desiredRepairers = 1; // Adjust based on repair needs

        // **Check for construction sites**
        const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
        // **Determine desired builder count**
        let desiredBuilders = 0;
        if (constructionSites.length > 0 && constructionSites.length <= 5) {
            // You can adjust this number based on the amount of construction work
            desiredBuilders = 3; // For example, spawn up to 2 builders when needed
        } else if(constructionSites.length >= 6){
            desiredBuilders = 5;
        }

        // Spawn logic
        if (miners.length < desiredMiners) {
            // Spawn Miner
            const newName = 'Miner' + Game.time;
            const body = getBodyConfig('miner', energyAvailable, energyCapacityAvailable);
            if (spawn.spawnCreep(body, newName, { memory: { role: 'miner' } }) === OK) {
                console.log('Spawning new Miner: ' + newName);
            }
        } else if (haulers.length < desiredHaulers) {
            // Spawn Hauler
            const newName = 'Hauler' + Game.time;
            const body = getBodyConfig('hauler', energyAvailable, energyCapacityAvailable);
            if (spawn.spawnCreep(body, newName, { memory: { role: 'hauler' } }) === OK) {
                console.log('Spawning new Hauler: ' + newName);
            }
        } else if (upgraders.length < desiredUpgraders) {
            // Spawn Upgrader
            const newName = 'Upgrader' + Game.time;
            const body = getBodyConfig('upgrader', energyAvailable, energyCapacityAvailable);
            if (spawn.spawnCreep(body, newName, { memory: { role: 'upgrader' } }) === OK) {
                console.log('Spawning new Upgrader: ' + newName);
            }
        } else if (builders.length < desiredBuilders) {
            // Spawn Builder
            const newName = 'Builder' + Game.time;
            const body = getBodyConfig('builder', energyAvailable, energyCapacityAvailable);
            if (spawn.spawnCreep(body, newName, { memory: { role: 'builder' } }) === OK) {
                console.log('Spawning new Builder: ' + newName);
            }
        } else if (repairers.length < desiredRepairers) {
            // Spawn Repairer
            const newName = 'Repairer' + Game.time;
            const body = getBodyConfig('repairer', energyAvailable, energyCapacityAvailable);
            if (spawn.spawnCreep(body, newName, { memory: { role: 'repairer' } }) === OK) {
                console.log('Spawning new Repairer: ' + newName);
            }
        }
        // Add additional roles as needed

        // Display spawning status
        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️ ' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 });
        }
    }
};

module.exports = spawnManager;
