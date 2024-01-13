/** @param {NS} ns */
import { arrayifyMyFile } from "/utils.js";
export async function main(ns) { // first argument is depth
  const startPoint = 'home';
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
    let currentAddress = startPoint.slice(); // i don't thing it's needed but regardless
    let pendingVisits = [currentAddress];
    pastVisits = [];
    while (pendingVisits.length > 0) {
      await ns.sleep(250);
      ns.print('INFO: Exploring ' + currentAddress);
      pendingVisits.push(ns.scan(currentAddress)); // scan and add new nodes TODO: this returns an array in the
      pendingVisits = pendingVisits.flat(); // this removes the nesting from ns.scan
      pastVisits.push(currentAddress); // mark scanned node as explored
      pendingVisits = pendingVisits.filter(node => !pastVisits.includes(node)); // remove nodes already explored from pending visits
      currentAddress = pendingVisits.shift();
    }
  } else {
    let previous = arrayifyMyFile(ns, 'all_nodes.txt');
    let myNew = ns.scan(startPoint);
    pastVisits = [...new Set(myNew.concat(previous))];
    ns.print("SUCCESS: "+pastVisits);
  }
  ns.write('all_nodes.txt', String(pastVisits), 'w');
}