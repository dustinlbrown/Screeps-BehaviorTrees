// config.js

module.exports = {
    spawnName: 'Spawn1',
    roles: {
        miner: {
            body: [WORK, CARRY, MOVE],
            max: function (room) {
                return room.find(FIND_SOURCES).length;
            }
        },
        hauler: {
            body: [CARRY, CARRY, MOVE, MOVE],
            max: function (room) {
                const energyOnGround = room.find(FIND_DROPPED_RESOURCES).length;
                const containers = room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
                }).length;
                return Math.ceil((energyOnGround + containers) / 2);
            }
        },
        upgrader: {
            body: [WORK, CARRY, MOVE],
            max: 1
        }
    }
};
