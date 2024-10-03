// /classes/ActionNodes.js

class RepairCriticalStructures {
    constructor(roleInstance) {
        this.roleInstance = roleInstance;
    }

    execute() {
        const target = this.roleInstance.findMostDamagedStructure({
            excludeStructures: [STRUCTURE_WALL, STRUCTURE_RAMPART],
            threshold: 0.5,
            sortByPercentage: true
        });
        if (target) {
            return this.roleInstance.repair(target);
        }
        return 'FAILURE';
    }
}

class RepairWallsRamparts {
    constructor(roleInstance) {
        this.roleInstance = roleInstance;
    }

    execute() {
        const target = this.roleInstance.findMostDamagedStructure({
            structureTypes: [STRUCTURE_WALL, STRUCTURE_RAMPART],
            fixedHitPoints: 10000,
            sortByPercentage: false
        });
        if (target) {
            return this.roleInstance.repair(target);
        }
        return 'FAILURE';
    }
}

class BuildConstructionSites {
    constructor(roleInstance) {
        this.roleInstance = roleInstance;
    }

    execute() {
        const target = this.roleInstance.findConstructionSite();
        if (target) {
            return this.roleInstance.build(target);
        }
        return 'FAILURE';
    }
}

class UpgradeController {
    constructor(roleInstance) {
        this.roleInstance = roleInstance;
    }

    execute() {
        const target = this.roleInstance.getController();
        if (target) {
            return this.roleInstance.upgrade(target);
        }
        return 'FAILURE';
    }
}

class AttackHostiles {
    constructor(roleInstance) {
        this.roleInstance = roleInstance;
    }

    execute() {
        const target = this.roleInstance.findHostile();
        if (target) {
            return this.roleInstance.attack(target);
        }
        return 'FAILURE';
    }
}

class HealCreeps {
    constructor(roleInstance) {
        this.roleInstance = roleInstance;
    }

    execute() {
        const target = this.roleInstance.findInjuredCreep();
        if (target) {
            return this.roleInstance.heal(target);
        }
        return 'FAILURE';
    }
}

module.exports = {
    RepairCriticalStructures,
    RepairWallsRamparts,
    BuildConstructionSites,
    UpgradeController,
    AttackHostiles,
    HealCreeps
};
