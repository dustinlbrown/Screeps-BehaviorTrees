// behaviorTree/DecoratorNode.js

const BehaviorNode = require('./BehaviorNode');

class DecoratorNode extends BehaviorNode {
    constructor(child) {
        super();
        this.child = child;
    }
}

module.exports = DecoratorNode;
