/** @param {NS} ns */
import * as nodeUtils from 'u_nodes.js'
import { ArrayifyMyFile } from 'u_txt.js'
export async function main(ns) {
  // first we get variables:
  var all_nodes = nodeUtils.GetAllNodes(ns)
  var rooted_nodes = nodeUtils.GetRootedNodes(ns, all_nodes)
  var not_rooted_nodes = all_nodes.filter((n => !rooted_nodes.includes(n)))
  // then, we write files:
  ns.write('all_nodes.txt', String(all_nodes), 'w')
  ns.write('rooted_nodes.txt', String(rooted_nodes), 'w')
  ns.write('not_rooted_nodes.txt', String(not_rooted_nodes), 'w')
}