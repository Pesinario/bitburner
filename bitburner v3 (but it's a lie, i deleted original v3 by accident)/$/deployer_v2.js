/** @param {NS} ns */
import { arrayifyMyFile } from 'utils.js';
export async function main(ns) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('getServerRequiredHackingLevel');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerGrowth');
  var payloads = ['ultralite/grow_loop.js', 'ultralite/hack_loop.js', 'ultralite/weaken_loop.js'];
  var ALL_SERVERS = arrayifyMyFile(ns, 'all_nodes.txt');
  var SLAVES = ALL_SERVERS.filter(server => ns.hasRootAccess(server) && server.includes('home-'));
  var TARGETS = ALL_SERVERS.filter(server => ns.hasRootAccess(server) && ns.getServerRequiredHackingLevel(server) < ns.getPlayer().skills.hacking && !server.includes('home'));
  let bestTarget = ['home', 0];
  var BASIC_STRATEGY = [7, 1, 4]; // default strategy
  //var BASIC_STRATEGY = [1,1,1]; // TODO: THIS IS TEMP
  var singleLoad = ns.getScriptRam(payloads[0]) * BASIC_STRATEGY[0] + ns.getScriptRam(payloads[1]) * BASIC_STRATEGY[1] + ns.getScriptRam(payloads[2]) * BASIC_STRATEGY[2]
  var loadsThatFit = Math.floor((ns.getServerMaxRam(SLAVES[0]) - ns.getServerUsedRam(SLAVES[0])) / singleLoad);
  var STRATEGY = BASIC_STRATEGY.map(function (x) { return x * loadsThatFit; });
  // Basic money-based strategy:
  for (let i = 0; i < TARGETS.length; i++) {
    let target = TARGETS[i];
    let targetMaxMoney = ns.getServerMaxMoney(target) / 1000000;
    let targetGrowth = ns.getServerGrowth(target);
    let growthValue = targetMaxMoney / targetGrowth;
    let finalValue;
    try {
      let myHackChance = ns.formulas.hacking.hackChance(ns.getServer(target), ns.getPlayer());
      finalValue = growthValue * myHackChance;
    } catch {
      finalValue = growthValue;
    }
    if (finalValue > bestTarget[1]) {
      bestTarget = [target, finalValue];
    }
    ns.print(target + ": [" + growthValue + "] " + targetMaxMoney + ' ' + targetGrowth);
  }

  ns.print("INFO: " + bestTarget);

  for (let i = 0; i < SLAVES.length; i++) {
    let slave = SLAVES[i];
    if (ns.args[0] == 'killall') {
      ns.killall(slave)
      STRATEGY = BASIC_STRATEGY.map(function (x) { return x * loadsThatFit; });
    }
    await ns.sleep(750);
    // ns.killall(slave);
    for (let j = 0; j < payloads.length; j++) { // giving payloads
      ns.scp(payloads[j], slave, 'home');
    }
    ns.exec(payloads[0], slave, { threads: STRATEGY[0] }, bestTarget[0]);
    ns.exec(payloads[1], slave, { threads: STRATEGY[1] }, bestTarget[0]);
    ns.exec(payloads[2], slave, { threads: STRATEGY[2] }, bestTarget[0]);
  }
}