// /classes/TowerBehaviorTree.js

const BehaviorTree = require('./BehaviorTree');
const ActionNodes = require('./ActionNodes');
const ConditionNodes = require('./ConditionNodes');
const { SelectorNode, SequenceNode } = require('./BehaviorTreeNodes');
const { isEnergySurplus } = require('../utils/Helper');

class TowerBehaviorTree extends BehaviorTree {
    buildTree() {
        return new SelectorNode([
            // Priority 1: Attack hostile creeps
            new SequenceNode([
                new ConditionNodes.HostilesPresent(this.entity.room),
                new ActionNodes.AttackHostiles(this.roleInstance)
            ]),
            // Priority 2: Heal injured creeps
            new SequenceNode([
                new ConditionNodes.InjuredCreepsPresent(this.entity.room),
                new ActionNodes.HealCreeps(this.roleInstance)
            ]),
            // Priority 3: Repair critical structures
            new SequenceNode([
                new ConditionNodes.HasCriticalStructures(this.entity.room),
                new ActionNodes.RepairCriticalStructures(this.roleInstance)
            ]),
            // Priority 4: Repair walls and ramparts during energy surplus
            new SequenceNode([
                new ConditionNodes.IsEnergySurplus(this.entity.room),
                new ActionNodes.RepairWallsRamparts(this.roleInstance)
            ])
        ]);
    }
}

module.exports = TowerBehaviorTree;
