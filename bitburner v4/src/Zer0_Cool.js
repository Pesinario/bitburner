/** @param {NS} ns */
import { bracketify } from "./utils_regular.js";
import { arrayifyMyFile } from "./utils_ns.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  ns.clearLog();
  if (!ns.fileExists('dump/not_pwned.txt')) {
    ns.alert("There are no more servers to hack.\n We hacked the world, man!");
    ns.exit();
  }
  ns.tail();
  ns.disableLog('getServerNumPortsRequired');
  var targets = arrayifyMyFile(ns, 'dump/not_pwned.txt');
  const allTheCracks = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe"
  ];
  const myCracks = allTheCracks.filter(crack => ns.fileExists(crack));
  let pwned_servers = 0;
  for (let iter = 0; iter < targets.length; iter++) {
    let target = targets[iter]
    if (ns.getServerNumPortsRequired(target) <= myCracks.length) {
      switch (ns.getServerNumPortsRequired(target)) {
        case 5:
          ns.sqlinject(target);
        case 4:
          ns.httpworm(target);
        case 3:
          ns.relaysmtp(target);
        case 2:
          ns.ftpcrack(target);
        case 1:
          ns.brutessh(target);
        case 0:
          ns.nuke(target);
          pwned_servers++
          break;
      }
    } else {
      ns.print("Cannot yet penetrate " + target + bracketify(ns.getServerNumPortsRequired(target)));
    }
  }
  if (pwned_servers > 0) {
    ns.tprint("INFO:" + bracketify(pwned_servers) + "servers have been pwned, Hack the World!");
    ns.run('DBB.js'); // update pwned servers and what not
  }else{
    ns.tprint("WARN: We couldn't hack anything man, you need to buy some 0days");
  }
}