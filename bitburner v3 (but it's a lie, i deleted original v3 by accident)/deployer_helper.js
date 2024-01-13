/** @param {NS} ns */
import {
  arrayifyMyFile,
  ensureRam
} from 'utils.js'
export async function main(ns) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('scp');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('sleep');
  //ns.disableLog('getHackingLevel');
  //ns.disableLog('getServerRequiredHackingLevel');

  //let payload = 'ultralite/weaken_loop.js';
  let payload = 'test.js';
  var ALL_SERVERS = arrayifyMyFile(ns, 'all_nodes.txt');
  var SLAVES = ALL_SERVERS.filter(server => ns.hasRootAccess(server) && !server.includes('home'));
  var target = 'omega-net';
  for (let i = 0; i < SLAVES.length; i++) {
    let slave = SLAVES[i];
    ns.scp(payload, slave, 'home');
    ns.killall(slave);
    let threadsWanted = Math.floor(ns.getServerMaxRam(slave) / ns.getScriptRam(payload));
    ns.print("threadwanted: [" + threadsWanted + "] @ :" + slave);
    await ns.sleep(20)
    //if (ensureRam(ns, payload, threadsWanted, slave)) {
      if (!threadsWanted == 0){
      ns.exec(payload, slave, threadsWanted, target);
      }
    //}
  }
}