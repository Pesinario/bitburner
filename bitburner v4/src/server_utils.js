import { arrayifyMyFile } from "./utils_ns.js";
// This is the default thingy for scritps in game
/** @param {NS} ns */
// Above every function insert the following line to get autocomplete and ns.* info:
/** @param {import("../..").NS } ns */
export async function main(ns) {
  ns.clearLog();
  ns.tail();
  let mode = ns.args[0];
  ns.disableLog('getServerMaxRam')
  const purchased = arrayifyMyFile(ns, 'dump/purchased_servers.txt')
  ns.print('INFO:', ns.getPurchasedServerUpgradeCost(purchased[0], ns.getServerMaxRam(purchased[0]) * 2));
  switch (mode) {
    case 'buy':
      let myServers = purchased.length;
      while (ns.getPurchasedServerLimit() > myServers + 1) {
        ns.purchaseServer('ooo', 2);
        myServers++;
      }
      ns.run('DBB.js');
      break;
    case 'rename':
      const prefix = ns.args[1];
      for (let i = 0; i < purchased.length; i++) {
        const oldName = purchased[i];
        const newName = prefix + String(i + 1);
        ns.renamePurchasedServer(oldName, newName);
      }
      ns.run('DBB.js');
      break;
    case 'equalize':
      let highestRAM = 2;
      for (let i = 0; i < purchased.length; i++) {
        if (ns.getServerMaxRam(purchased[i]) > highestRAM) { highestRAM = ns.getServerMaxRam(purchased[i]); }
      }
      for (let i = 0; i < purchased.length; i++) {
        if (ns.getServerMaxRam(purchased[i]) < highestRAM) { ns.upgradePurchasedServer(purchased[i], highestRAM); }
      }
      break;
    case 'upgradeAll':
      for (let i = 0; i < purchased.length; i++) {
        ns.upgradePurchasedServer(purchased[i], 2 * ns.getServerMaxRam(purchased[i]))
      }
    case 'upgradeSmallest':
      let lowestRam = 2;
      for (let i = 0; i < purchased.length; i++) {
        if (ns.getServerMaxRam(purchased[i]) < lowestRam) { lowestRam = ns.getServerMaxRam(purchased[i]); }
      }
      for (let i = 0; i < purchased.length; i++) {
        if (ns.getServerMaxRam(purchased[i]) == lowestRam) { ns.upgradePurchasedServer(purchased[i], 2 * ns.getServerMaxRam(purchased[i])) }
      }
      break;
    case 'upgradeBiggest':
      let biggest = purchased[0];
      for (let i = 0; i < purchased.length; i++) {
        if (ns.getServerMaxRam(purchased[i]) > ns.getServerMaxRam(biggest)) { biggest = purchased[i]; }
      }
      ns.upgradePurchasedServer(biggest, 2 * ns.getServerMaxRam(biggest));
      break;
    default:
      ns.tprint("ERROR: MODE NOT PROVIDED")
  }
}
