// /classes/roles/CreepBase.js

class CreepBase {
    constructor(creep) {
        this.creep = creep;
    }

    isFull() {
        return this.creep.store.getFreeCapacity() === 0;
    }

    isEmpty() {
        return this.creep.store[RESOURCE_ENERGY] === 0;
    }

    moveTo(target, options = {}) {
        this.creep.moveTo(target, {
            visualizePathStyle: { stroke: '#ffffff' },
            reusePath: 20,
            ...options
        });
    }

    performAction(action, target) {
        const result = this.creep[action](target);
        if (result === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
            return 'RUNNING';
        } else if (result === OK) {
            return 'SUCCESS';
        } else {
            return 'FAILURE';
        }
    }

    sayAction(message) {
        this.creep.say(message);
    }

    initializeMemory() {
        if (!this.creep.memory.metrics) {
            this.creep.memory.metrics = {
                ticksLived: 0,
                distanceTraveled: 0,
                timeMoving: 0,
                timeWorking: 0,
                energySpent: 0,
                energyHarvested: 0,
                tasksCompleted: {
                    harvest: 0,
                    transfer: 0,
                    repair: 0,
                    build: 0,
                    upgrade: 0,
                }
            };
        }
        if (!this.creep.memory.prevPos) {
            this.creep.memory.prevPos = { x: this.creep.pos.x, y: this.creep.pos.y };
        }
    }

    updateMetrics() {
        this.creep.memory.metrics.ticksLived += 1;

        const dx = this.creep.pos.x - this.creep.memory.prevPos.x;
        const dy = this.creep.pos.y - this.creep.memory.prevPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.creep.memory.metrics.distanceTraveled += distance;
        this.creep.memory.prevPos = { x: this.creep.pos.x, y: this.creep.pos.y };
    }

    incrementMetric(metric, amount = 1) {
        if (this.creep.memory.metrics[metric] !== undefined) {
            this.creep.memory.metrics[metric] += amount;
        }
    }

    incrementTask(metric, amount = 1) {
        if (this.creep.memory.metrics.tasksCompleted[metric] !== undefined) {
            this.creep.memory.metrics.tasksCompleted[metric] += amount;
        }
    }
}

module.exports = CreepBase;
