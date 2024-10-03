// behaviorTree/BehaviorNode.js

class BehaviorNode {
    constructor() {}
    execute(creep) {
        throw new Error('Execute method must be implemented by subclasses');
    }
}

module.exports = BehaviorNode;
