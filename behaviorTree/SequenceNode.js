// behaviorTree/Sequence.js

const BehaviorNode = require('./BehaviorNode');

class SequenceNode extends BehaviorNode {
    constructor(children) {
        super();
        this.children = children;
    }

    execute(creep) {
        for (let child of this.children) {
            if (!child.execute(creep)) {
                return false;
            }
        }
        return true;
    }
}

module.exports = SequenceNode;
