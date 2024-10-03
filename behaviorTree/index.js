// behaviorTree/index.js

const BehaviorNode = require('./BehaviorNode');
const Selector = require('./SelectorNode');
const Sequence = require('./SequenceNode');
const Action = require('./ActionNode');
// Add other nodes as needed

module.exports = {
    SUCCESS: 1,
    FAILURE: 2,
    RUNNING: 3,
    BehaviorNode,
    SelectorNode: Selector,
    SequenceNode: Sequence,
    ActionNode: Action,
    // Export additional nodes here
};
