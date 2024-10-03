// behaviorTree/Action.js

const BehaviorNode = require('./BehaviorNode');

class ActionNode extends BehaviorNode {
    constructor(actionFunc) {
        super();
        this.actionFunc = actionFunc;
    }

    execute(creep) {
        return this.actionFunc(creep);
    }
}

module.exports = ActionNode;
