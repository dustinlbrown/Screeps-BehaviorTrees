// behaviorTree.js

// Status Constants
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const RUNNING = 'RUNNING';

// Node Classes
class ActionNode {
    constructor(action) {
        this.action = action;
    }

    execute(creep) {
        return this.action(creep);
    }
}

class ConditionNode {
    constructor(condition) {
        this.condition = condition;
    }

    execute(creep) {
        return this.condition(creep) ? SUCCESS : FAILURE;
    }
}

class SequenceNode {
    constructor(children) {
        this.children = children;
    }

    execute(creep) {
        for (let child of this.children) {
            let status = child.execute(creep);
            if (status !== SUCCESS) {
                return status;
            }
        }
        return SUCCESS;
    }
}

class SelectorNode {
    constructor(children) {
        this.children = children;
    }

    execute(creep) {
        for (let child of this.children) {
            let status = child.execute(creep);
            if (status === SUCCESS || status === RUNNING) {
                return status;
            }
        }
        return FAILURE;
    }
}

module.exports = {
    SUCCESS,
    FAILURE,
    RUNNING,
    ActionNode,
    ConditionNode,
    SequenceNode,
    SelectorNode
};
