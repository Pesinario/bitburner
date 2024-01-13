/** @param {NS} ns */
//import {arrayifyMyFile} from 'utils.js';
export async function main(ns) {
  ns.tail();
  ns.clearLog();
  let target = 'omega-net'
  //var payloads = ['ultralite/grow.js', 'ultralite/hack.js', 'ultralite/weaken.js'];
 // var ALL_SERVERS = arrayifyMyFile(ns, 'all_nodes.txt');
 let crude = ns.formatPercent(ns.getServer(target).hackDifficulty / ns.getPlayer().skills.hacking)
 ns.print(crude)
 let formulaic = ns.formatPercent(ns.formulas.hacking.hackPercent(ns.getServer(target),ns.getPlayer()))
ns.print(formulaic)
}