/** @param {NS} ns */
import {
  getAllNodesv2
} from 'utils.js'

export async function main(ns) { // first argument is the mode, second argument is the host
  let hostAdress = ns.args[1]
  if (typeof (hostAdress) == 'undefined') {
    hostAdress = ns.getHostname();
  };
  switch (ns.args[0]) {
    case 'mode: allnodes':
      let mynodes = getAllNodesv2(ns, ns.args[1]);
      ns.write('all_nodes.txt', String(mynodes), 'w');
      break;
    default:
      ns.alert('ERROR: MODE NOT PROVIDED.');
      ns.exit();
  }
}