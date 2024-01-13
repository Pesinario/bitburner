/** @param {NS} ns */
import {arrayifyMyFile} from 'utils.js'
export async function main(ns) {
  ns.tail();
  const allTheCracks = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe"
  ];
  const myCracks = allTheCracks.filter(crack => ns.fileExists(crack));

  const ALL_NODES = arrayifyMyFile(ns, 'all_nodes.txt');
  const securedServers = ALL_NODES.filter(t =>!t.includes('home')); // we don't want freebies in this list
  class PwnableServer {
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
  ns.print(pwnableServers[0]);
  const ramFromTier = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < pwnableServers.length; i++) {
    ramFromTier[pwnableServers[i].portsRequired] += pwnableServers[i].ram;
  }
  ns.print(ramFromTier);

}