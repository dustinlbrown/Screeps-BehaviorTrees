// bodyConfig.js

/**
 * Body Configuration Module
 * Dynamically generates creep body arrays based on role and available energy.
 */

function getBodyConfig(role, energyAvailable, energyCapacityAvailable) {
    const body = [];
    const maxParts = 50;
    let remainingEnergy = energyAvailable;

    if (role === 'miner') {
        // Miners prioritize WORK parts for harvesting
        // Reserve energy for necessary MOVE parts
        const moveCost = BODYPART_COST[MOVE];
        const workCost = BODYPART_COST[WORK];

        // Ensure at least one MOVE part
        let numberOfMoveParts = 1;
        remainingEnergy -= moveCost;

        // Calculate maximum number of WORK parts
        let numberOfWorkParts = Math.floor(remainingEnergy / workCost);
        numberOfWorkParts = Math.min(numberOfWorkParts, (maxParts - numberOfMoveParts));

        // Build the body
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }
        body.push(MOVE);

        // If not enough energy for at least one WORK part, return minimum body
        if (numberOfWorkParts === 0) {
            return [WORK, MOVE];
        }

    } else if (role === 'hauler') {
        // Haulers prioritize CARRY and MOVE parts
        const carryCost = BODYPART_COST[CARRY];
        const moveCost = BODYPART_COST[MOVE];

        // Haulers should have equal MOVE and CARRY parts for maximum efficiency
        const partCost = carryCost + moveCost;
        let numberOfParts = Math.floor(remainingEnergy / partCost);

        numberOfParts = Math.min(numberOfParts, Math.floor(maxParts / 2));

        if (numberOfParts === 0) {
            // Not enough energy to spawn minimum hauler
            return [CARRY, MOVE];
        }

        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
            body.push(MOVE);
        }

    } else if (role === 'upgrader' || role === 'builder' || role === 'repairer') {
        // Balanced WORK, CARRY, MOVE parts
        const workCost = BODYPART_COST[WORK];
        const carryCost = BODYPART_COST[CARRY];
        const moveCost = BODYPART_COST[MOVE];

        const partCost = workCost + carryCost + moveCost;
        let numberOfParts = Math.floor(remainingEnergy / partCost);

        numberOfParts = Math.min(numberOfParts, Math.floor(maxParts / 3));

        if (numberOfParts === 0) {
            // Not enough energy to spawn minimum worker
            return [WORK, CARRY, MOVE];
        }

        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }

    } else {
        // Default to a minimum viable creep for any other role
        return [WORK, CARRY, MOVE];
    }

    return body;
}

module.exports = {
    getBodyConfig
};
