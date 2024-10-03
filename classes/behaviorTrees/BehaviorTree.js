// /classes/behaviorTree/BehaviorTree.js

const ActionNodes = require('./ActionNodes');
const ConditionNodes = require('./ConditionNodes');
const { SelectorNode, SequenceNode } = require('./BehaviorTreeNodes');

class BehaviorTree {
    constructor(entity, roleInstance) {
        this.entity = entity; // Could be a Creep or Tower
        this.roleInstance = roleInstance; // Reference to the role class
        this.root = this.buildTree();
    }

    buildTree() {
        // To be implemented by specific roles
        return new SelectorNode([]);
    }

    execute() {
        this.root.execute(this.entity);
    }
}

module.exports = BehaviorTree;
