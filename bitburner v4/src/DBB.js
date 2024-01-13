/** @param {NS} ns */
/** @param {import("../..").NS } ns */
export async function main(ns) { // first argument is depth
  ns.clearLog();
  ns.disableLog('scan');
  ns.tail();
  let startPoint = ns.getHostname();
  let pastVisits = [];

  let pendingVisits = [startPoint];
  while (pendingVisits.length > 0) {
    ns.print('INFO: Exploring ' + startPoint);
    pendingVisits.push(ns.scan(startPoint)); // scan and add new servers
    pendingVisits = pendingVisits.flat(); // this removes the nesting from ns.scan
    pastVisits.push(startPoint); // mark scanned server as explored
    pendingVisits = pendingVisits.filter(server => !pastVisits.includes(server)); // remove servers already explored from pending visits
    startPoint = pendingVisits.shift(); // define new server to start exploring from
  }
  pastVisits=pastVisits.sort();
  ns.write('dump/all_servers.txt', String(pastVisits), 'w');
  let purchasedServers = ns.getPurchasedServers();
  ns.write('dump/purchased_servers.txt', String(purchasedServers), 'w');
  let moneyServers = pastVisits.filter(server => ns.getServerMaxMoney(server) > 0);
  ns.write('dump/money_servers.txt', String(moneyServers), 'w');
  let pwnedServers = pastVisits.filter(server => ns.hasRootAccess(server) && !purchasedServers.includes(server) && !server.includes('home'));
  ns.write('dump/pwned.txt', String(pwnedServers), 'w');
  let notPwnedServers = pastVisits.filter(server => !ns.hasRootAccess(server));
  if (notPwnedServers.length > 0) {  // If we haven't pwned everything
    ns.write('dump/not_pwned.txt', String(notPwnedServers), 'w'); // We make the file
  } else { // If we have hacked the world, we check if the file exists, and delete it
    if (ns.fileExists('dump/not_pwned.txt')) {
      ns.rm('dump/not_pwned.txt')
    }
  }
  let loreServers = pastVisits.filter(server => ns.ls(server, '.lit').length > 0);
  for (let i = 0; i < loreServers.length; i++) {
    const stealFrom = loreServers[i];
    let dump = ns.ls(stealFrom, '.lit')
    for (let j = 0; j < dump.length; j++) {
      const element = dump[j];
      ns.scp(element, ns.getHostname(), stealFrom)
    }
  }
}