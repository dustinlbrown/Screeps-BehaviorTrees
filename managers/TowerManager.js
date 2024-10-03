// /managers/TowerManager.js

const TowerController = require('../classes/TowerController');

class TowerManager {
    constructor() {
        this.towers = [];
    }

    update(room) {
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });

        for (const tower of towers) {
            if (!this.towers.includes(tower.id)) {
                this.towers.push(tower.id);
            }
        }

        for (const towerId of this.towers) {
            const tower = Game.getObjectById(towerId);
            if (tower && tower.room.name === room.name) {
                const towerController = new TowerController(tower);
                towerController.run();
            } else {
                // Remove invalid tower IDs
                this.towers = this.towers.filter(id => id !== towerId);
            }
        }
    }
}

module.exports = TowerManager;
