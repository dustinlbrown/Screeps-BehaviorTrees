// behaviorTree/Selector.js

const BehaviorNode = require('./BehaviorNode');

class SelectorNode extends BehaviorNode {
    constructor(children) {
        super();
        this.children = children;
    }

    execute(creep) {
        for (let child of this.children) {
            if (child.execute(creep)) {
                return true;
            }
        }
        return false;
    }
}

module.exports = SelectorNode;
