// role.hauler.js

const { initializeMetrics } = require('helper');
const { createHaulerBehaviorTree } = require('haulerBehavior');

// Cache the behavior tree to avoid reconstructing it every tick
let haulerBehaviorTree = createHaulerBehaviorTree();

var roleHauler = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Initialize metrics
        initializeMetrics(creep);

        // Update metrics
        updateMetrics(creep);

        // Execute the behavior tree
        haulerBehaviorTree.execute(creep);
    }
};

// Helper function to update ticks lived and distance traveled
function updateMetrics(creep) {
    creep.memory.metrics.ticksLived += 1;

    if (!creep.memory.prevPos) {
        creep.memory.prevPos = { x: creep.pos.x, y: creep.pos.y };
    }

    const dx = creep.pos.x - creep.memory.prevPos.x;
    const dy = creep.pos.y - creep.memory.prevPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    creep.memory.metrics.distanceTraveled += distance;
    creep.memory.prevPos = { x: creep.pos.x, y: creep.pos.y };
}

module.exports = roleHauler;
