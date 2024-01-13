import { arrayifyMyFile } from "./utils_ns.js"
// This is the default thingy for scritps ingame
/** @param {NS} ns */
// Above every function insert the following line to get autocomplete and ns.* info:
/** @param {import("../..").NS } ns */
export async function main(ns) { // TODO: We need singularity for more functionality.
  ns.clearLog();
  ns.tail();
  const costOfRamIfPurchased = 55000; // this may be bitnode dependent
  const ALL_SERVERS = arrayifyMyFile(ns, 'dump/all_servers.txt');
  const PURCHASED_SERVERS = arrayifyMyFile(ns, 'dump/purchased_servers.txt');
  const securedServers = ALL_SERVERS.filter(server => !server.includes('home') && !PURCHASED_SERVERS.includes(server)); // we even get the freebies because why not
  class PwnableServer { // btw this entire class wasn't really necessary, i just wanted to learn classes/objects in javascript
    constructor(hostname) {
      this.hostname = hostname;
      this.portsRequired = ns.getServerNumPortsRequired(hostname);
      this.ram = ns.getServerMaxRam(hostname);
    }
  }
  const pwnableServers = [];
  securedServers.forEach(server => {
    let pwnableServer = new PwnableServer(server);
    pwnableServers.push(pwnableServer);
  });
  const ramFromTier = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < pwnableServers.length; i++) {
    ramFromTier[pwnableServers[i].portsRequired] += pwnableServers[i].ram;
  }
  ns.alert(String(ramFromTier));
}