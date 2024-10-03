// behaviorTree/InverterNode.js

const DecoratorNode = require('./DecoratorNode');
const { SUCCESS, FAILURE, RUNNING } = require('./index');

class InverterNode extends DecoratorNode {
    execute(creep) {
        const result = this.child.execute(creep);
        if (result === SUCCESS) return FAILURE;
        if (result === FAILURE) return SUCCESS;
        return result;
    }
}

module.exports = InverterNode;
