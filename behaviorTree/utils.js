// behaviorTree/utils.js

const SelectorNode = require('./SelectorNode');
const SequenceNode = require('./SequenceNode');
const ActionNode = require('./ActionNode');
const ConditionNode = require('./ConditionNode');
const InverterNode = require('./InverterNode');
// Add other nodes as needed

function buildCondition(conditionFunc) {
    return new ConditionNode(conditionFunc);
}

function buildAction(actionFunc) {
    return new ActionNode(actionFunc);
}

function buildSequence(children) {
    return new SequenceNode(children);
}

function buildSelector(children) {
    return new SelectorNode(children);
}

function buildInverter(child) {
    return new InverterNode(child);
}

// Additional utility functions can be added here

module.exports = {
    buildCondition,
    buildAction,
    buildSequence,
    buildSelector,
    buildInverter
};
