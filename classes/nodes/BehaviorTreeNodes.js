// /classes/BehaviorTreeNodes.js

class SelectorNode {
    constructor(children = []) {
        this.children = children;
    }

    execute(entity) {
        for (const child of this.children) {
            const status = child.execute(entity);
            if (status === 'SUCCESS' || status === 'RUNNING') {
                return status;
            }
        }
        return 'FAILURE';
    }
}

class SequenceNode {
    constructor(children = []) {
        this.children = children;
    }

    execute(entity) {
        for (const child of this.children) {
            const status = child.execute(entity);
            if (status !== 'SUCCESS') {
                return status;
            }
        }
        return 'SUCCESS';
    }
}

module.exports = {
    SelectorNode,
    SequenceNode
};
