/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog();
  ns.tail();
  class dummyNode {
    constructor(a, b, c) {
      this.level = a;
      this.ramLevel = Math.log2(b);
      this.cores = c;
      this.output = ns.formulas.hacknetNodes.moneyGainRate(
        this.level, this.ramLevel, this.cores, ns.getPlayer().mults.hacknet_node_money);
      this.cost = (0
        + ns.formulas.hacknetNodes.hacknetNodeCost(
          ns.hacknet.numNodes() + 1, ns.getPlayer().mults.hacknet_node_purchase_cost)
        + ns.formulas.hacknetNodes.levelUpgradeCost(
          1, this.level - 1, ns.getPlayer().mults.hacknet_node_level_cost)
        + ns.formulas.hacknetNodes.ramUpgradeCost(
          1, this.ramLevel - 1, ns.getPlayer().mults.hacknet_node_ram_cost)
        + ns.formulas.hacknetNodes.coreUpgradeCost(
          1, this.cores, ns.getPlayer().mults.hacknet_node_core_cost)
      );
      this.ROI = this.cost / this.output;
    }
  }
  const everyPossibleHacketNode = [];
  for (let i = 1; i <= ns.formulas.hacknetNodes.constants().MaxLevel; i++) {
    for (let j = 1; j <= ns.formulas.hacknetNodes.constants().MaxRam; j *= 2) {
      for (let k = 1; k <= ns.formulas.hacknetNodes.constants().MaxCores; k++) {
        let myNode = new dummyNode(i, j, k);
        everyPossibleHacketNode.push(myNode);
      }
    }
  }
  ns.print('INFO: ' + everyPossibleHacketNode.length);
  everyPossibleHacketNode.sort((a, b) => a.ROI - b.ROI);
  ns.tprint('\n\n\n\n\n')
  ns.print('INFO: ' + everyPossibleHacketNode.length);
  let mybest = everyPossibleHacketNode[0];
  let myworst = everyPossibleHacketNode[22399];
  ns.tprint(mybest);
  ns.tprint(myworst);
}