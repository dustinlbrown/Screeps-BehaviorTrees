// /classes/RepairerBehaviorTree.js

const BehaviorTree = require('./BehaviorTree');
const ActionNodes = require('./ActionNodes');
const ConditionNodes = require('./ConditionNodes');
const { SelectorNode, SequenceNode } = require('./BehaviorTreeNodes');
const { isEnergySurplus, findMostDamagedStructure } = require('../utils/Helper');

class RepairerBehaviorTree extends BehaviorTree {
    buildTree() {
        return new SelectorNode([
            // Priority 1: Repair critical structures (excluding walls and ramparts)
            new SequenceNode([
                new ConditionNodes.HasCriticalStructures(this.entity.room),
                new ActionNodes.RepairCriticalStructures(this.roleInstance)
            ]),
            // Priority 2: Repair walls and ramparts during energy surplus
            new SequenceNode([
                new ConditionNodes.IsEnergySurplus(this.entity.room),
                new ActionNodes.RepairWallsRamparts(this.roleInstance)
            ]),
            // Priority 3: Build construction sites
            new SequenceNode([
                new ConditionNodes.HasConstructionSites(this.entity.room),
                new ActionNodes.BuildConstructionSites(this.roleInstance)
            ]),
            // Priority 4: Upgrade the controller
            new SequenceNode([
                new ConditionNodes.HasController(this.entity.room),
                new ActionNodes.UpgradeController(this.roleInstance)
            ])
        ]);
    }
}

module.exports = RepairerBehaviorTree;
