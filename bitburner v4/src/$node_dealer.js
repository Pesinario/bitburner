import { bracketify } from "./utils_regular.js"; // needs NS
/** @param {NS} ns */
/** @param {import("../..").NS } ns */
export async function main(ns) { // TODO: Revisit this
  ns.clearLog();
  ns.tail();
  let MONEY_SPENT = 0;
  let should_buy = ns.args[0]; // check if we are doing eval stuff or actually buying
  // TODO: Rethink and rewrite this whole class business
  class BaseNode {
    constructor(_levels, _ram, _cores) {
      this.level = _levels;
      this.ram = _ram;
      this.cores = _cores;
      this.ramLevel = Math.log2(this.ram);
      this.output = ns.formulas.hacknetNodes.moneyGainRate(this.level, this.ram, this.cores, ns.getPlayer().mults.hacknet_node_money);
    }
  }

  class NodeFromScratch extends BaseNode {
    constructor(_levels, _ram, _cores) {
      super(_levels, _ram, _cores);
      this.costFromNewNode = ns.formulas.hacknetNodes.hacknetNodeCost(ns.hacknet.numNodes() + 1, ns.getPlayer().mults.hacknet_node_purchase_cost);
      this.costFromLevel = ns.formulas.hacknetNodes.levelUpgradeCost(1, this.level - 1, ns.getPlayer().mults.hacknet_node_level_cost);
      this.costFromRam = ns.formulas.hacknetNodes.ramUpgradeCost(1, this.ramLevel - 1, ns.getPlayer().mults.hacknet_node_ram_cost); // DING DING DING, culprit was ram expecting levels in f.hN.ramUpgradeCost
      this.costFromCores = ns.formulas.hacknetNodes.coreUpgradeCost(1, this.cores - 1, ns.getPlayer().mults.hacknet_node_core_cost);
      this.costTotal = this.costFromNewNode + this.costFromLevel + this.costFromRam + this.costFromCores;
      this.ROI = this.costTotal / this.output;
    }
    buyMe() {
      let boughtIndex = ns.hacknet.purchaseNode();
      if (boughtIndex == -1) { ns.tprint(`ERROR: Did not have the ${this.costFromNewNode}$ to buy a new node`); ns.exit(); }
      MONEY_SPENT += this.costFromNewNode;
      let imBought = new ExistingNode(1, 1, 1, boughtIndex);
      while (imBought.level < this.level) { imBought.doUpgradeLevel() }
      while (imBought.ram < this.ram) { imBought.doUpgradeRam() }
      while (imBought.cores < this.cores) { imBought.doUpgradeCore() }
      return imBought;
    }
  }

  class ExistingNode extends BaseNode {
    constructor(_levels, _ram, _cores, _id) {
      super(_levels, _ram, _cores);
      this.id = _id;
      this.canUpgradeLevel = this.level < ns.formulas.hacknetNodes.constants().MaxLevel;
      this.canUpgradeRam = this.ram < ns.formulas.hacknetNodes.constants().MaxRam;
      this.canUpgradeCore = this.cores < ns.formulas.hacknetNodes.constants().MaxCores;
      this.canUpgrade = this.canUpgradeLevel || this.canUpgradeRam || this.canUpgradeCore;
      this.costOfLevel = ns.hacknet.getLevelUpgradeCost(this.id);
      this.costOfRam = ns.hacknet.getRamUpgradeCost(this.id);
      this.costOfCore = ns.hacknet.getCoreUpgradeCost(this.id);
      this.bestUpgrade = undefined;
      this.ROI = this.getBestROI();
    }
    doUpgradeLevel() {
      ns.hacknet.upgradeLevel(this.id);
      this.level += 1;
      this.ROI = this.getBestROI();
      MONEY_SPENT += this.costOfLevel;
    }
    doUpgradeRam() {
      ns.hacknet.upgradeRam(this.id);
      this.ram += 1;
      this.ROI = this.getBestROI();
      MONEY_SPENT += this.costOfRam;
    }
    doUpgradeCore() {
      ns.hacknet.upgradeCore(this.id);
      this.cores += 1;
      this.ROI = this.getBestROI();
      MONEY_SPENT += this.costOfCore;
    }
    upgradeMe() {
      switch (this.bestUpgrade) {
        case 'Level':
          this.doUpgradeLevel();
          break;
        case 'RAM':
          this.doUpgradeRam();
          break;
        case 'Core':
          this.doUpgradeCore();
          break;
      }
      ns.print(`SUCCESS: Upgraded: ${this.bestUpgrade} @ ${this.id} ${bracketify('$' + this.costOfBest + '$')}`)
    }
    getBestROI() {
      let levelROI, ramROI, coreROI;
      if (this.canUpgradeLevel) {
        let mePlusLevel = new BaseNode(this.level + 1, this.ram, this.cores);
        let deltaFromLevel = mePlusLevel.output - this.output;
        levelROI = this.costOfLevel / deltaFromLevel;
      } else { levelROI = Infinity }

      if (this.canUpgradeRam) {
        let mePlusRam = new BaseNode(this.level, this.ram + 1, this.cores);
        let deltaFromRam = mePlusRam.output - this.output;
        ramROI = this.costOfRam / deltaFromRam;

      } else { ramROI = Infinity; }

      if (this.canUpgradeCore) {
        let mePlusCore = new BaseNode(this.level, this.ram, this.cores + 1);
        let deltaFromCore = mePlusCore.output - this.output;
        coreROI = this.costOfCore / deltaFromCore;
      } else { coreROI = Infinity; }

      if (levelROI < ramROI && levelROI < coreROI) {
        this.bestUpgrade = 'Level';
        this.costOfBest = this.costOfLevel;
        return levelROI;
      }
      if (ramROI < coreROI) {
        this.bestUpgrade = 'RAM';
        this.costOfBest = this.costOfRam;
        return ramROI;
      } else {
        this.bestUpgrade = 'Core'; // don't even need  an if/else for this one
        this.costOfBest = this.costOfCore;
        return coreROI;
      }
    }
  }

  function getBestNewNode() { // This returns the best possible node to purchase
    let virtualNodes = [];
    for (let i = 1; i <= ns.formulas.hacknetNodes.constants().MaxLevel; i++) {
      for (let j = 1; j <= ns.formulas.hacknetNodes.constants().MaxRam; j *= 2) {
        for (let k = 1; k <= ns.formulas.hacknetNodes.constants().MaxCores; k++) {
          let myNode = new NodeFromScratch(i, j, k);
          virtualNodes.push(myNode);
        }
      }
    }
    let bestNode = virtualNodes.shift();
    while (virtualNodes.length > 0) {
      let currentNode = virtualNodes.pop();
      if (bestNode.ROI > currentNode.ROI) { bestNode = currentNode; }
    }
    return bestNode;
  }

  function getBestUpgrade() {
    let existingNodes = [];
    for (let iter = 0; iter < ns.hacknet.numNodes(); iter++) {
      let myNode = new ExistingNode(ns.hacknet.getNodeStats(iter).level, ns.hacknet.getNodeStats(iter).ram, ns.hacknet.getNodeStats(iter).cores, iter);
      existingNodes.push(myNode);
    }
    existingNodes = existingNodes.sort((a, b) => a.roi - b.roi);

    return existingNodes.shift();
  }

  // START OF MAIN LOGIC
  let loopsDone = 0;
  let newNodeBest = getBestNewNode();
  while (should_buy) {
    loopsDone++;
    ns.print(`ERROR: LOOP NUMBER:${bracketify(loopsDone)}, Money spent: ${bracketify(MONEY_SPENT)}`);
    if (ns.getPlayer().money < 1000 * 1000 * 1000) { ns.tprint('ERROR: WE ARE POOR!'); break; } // TODO: this later wife/cfo
    if (MONEY_SPENT > 1000 * 1000 * 1000) { ns.tprint('SUCCESS: Spent a billion dollars, exiting'); break; }
    let oldNodeBest = getBestUpgrade();
    ns.print(newNodeBest);
    ns.print(oldNodeBest);
    // When doing print stuff we get {object object} but only sometimes, its weird as fuck
    if (loopsDone % 10 == 0) { myNodes.forEach(element => { ns.print(element) }) }; // print all of the existing nodes every 10 upgrades/purchases
    // Actually it seems to be when we tprint(object) that it works, if we make it a string we break it

    ns.print(`INFO: Upgrading ROI:${bracketify(oldNodeBest.ROI)}|█| Buying & Upgrading ROI:${bracketify(newNodeBest.ROI)}`);
    if (oldNodeBest.ROI < newNodeBest.ROI) {
      ns.print("SUCCESS: We are doing an upgrade")
      oldNodeBest.upgradeMe();
      await ns.sleep(20);
    } else {
      await ns.sleep(1000);
      ns.print("ERROR: buyMe:");
      newNodeBest.buyMe();
      newNodeBest = getBestNewNode();
      ns.tprint('INFO: We bought a node');
      should_buy = false; // one purchased node per run, please
    }
  }
}