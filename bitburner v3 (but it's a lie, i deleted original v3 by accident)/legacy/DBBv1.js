/** @param {NS} ns */
/** @param {import(".").NS } ns */
import { arrayifyMyFile } from "./utils";
export async function main(ns) { // first argument is depth
  let startPoint = ns.getHostName();
  let grabAll;
  let pastVisits = [];
  ns.disableLog('scan');
  ns.clearLog();
  ns.tail();
  if (ns.args[0] == undefined) {
    grabAll = true;
  } else {
    grabAll = ns.args[0];
  }
  ns.print("grabAll: " + grabAll);
  if (grabAll) {
    let pendingVisits = [startPoint];
    pastVisits = [];
    while (pendingVisits.length > 0) {
      await ns.sleep(250);
      ns.print('INFO: Exploring ' + startPoint);
      pendingVisits.push(ns.scan(startPoint)); // scan and add new nodes TODO: this returns an array in the
      pendingVisits = pendingVisits.flat(); // this removes the nesting from ns.scan
      pastVisits.push(startPoint); // mark scanned node as explored
      pendingVisits = pendingVisits.filter(node => !pastVisits.includes(node)); // remove nodes already explored from pending visits
      startPoint = pendingVisits.shift();
    }
  } else {
    let previous = arrayifyMyFile(ns, 'all_nodes.txt');
    let myNew = ns.scan(startPoint);
    pastVisits = [...new Set(myNew.concat(previous))];
    ns.print("SUCCESS: " + pastVisits);
  }
  ns.write('all_nodes.txt', String(pastVisits), 'w');
}