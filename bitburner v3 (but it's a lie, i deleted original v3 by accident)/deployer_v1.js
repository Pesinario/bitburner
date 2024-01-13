/** @param {NS} ns */
import {
  arrayifyMyFile,
  ensureRam
} from 'utils.js'
export async function main(ns) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('scp')
  ns.disableLog('getServerMaxRam')
  ns.disableLog('getServerUsedRam')
  ns.disableLog('sleep')
  ns.disableLog('getHackingLevel')
  ns.disableLog('getServerRequiredHackingLevel')

  let payload = 'basic_miner.js';
  var ALL_SERVERS = arrayifyMyFile(ns, 'all_nodes.txt');
  var SLAVES = ALL_SERVERS.filter(server => ns.hasRootAccess(server) && !server.includes('home'));
  ns.print(SLAVES);
  var SLAVES = SLAVES.filter(server => ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server));

  for (let i = 0; i < SLAVES.length; i++) {
    let slave = SLAVES[i];
    ns.kill('test.js', slave, 'omega-net');
    ns.scp(payload, slave, 'home');
    let threadsWanted = Math.floor(ns.getServerMaxRam(slave) / ns.getScriptRam(payload));
    ns.print("threadwanted: [" + threadsWanted + "] @ :" + slave);
    await ns.sleep(250)
    if (ensureRam(ns, payload, threadsWanted, slave)) {
      ns.exec(payload, slave, threadsWanted);
    }
  }
  ns.closeTail();
}