/** @param {NS} ns */
export function ensureRam(ns, scriptName, desiredThreads = 1, hostname = ns.getHostname()) {
  if (desiredThreads == 0) { // for servers with 0 ram lmao
    ns.print("ERROR: This server has less ram than we need for the script!: " + hostname);
    return false;
  }
  if (ns.getScriptRam(scriptName, hostname) * desiredThreads < (ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))) {
    return true;
  } else {
    return false;
  }
}

export function arrayifyMyFile(ns, myFilePath) {
  let myFile = ns.read(myFilePath);
  let output = myFile.split(',');
  return output;
}

export function getAllNodesv2(ns, startPoint = ns.getHostname()) {
  ns.disableLog('scan');
  let currentAddress = startPoint.slice(0); // i don't thing it's needed but regardless
  let pendingVisits = [currentAddress];
  let pastVisits = [];
  while (pendingVisits.length > 0) {
    ns.print('INFO: Exploring ' + currentAddress);
    pendingVisits.push(ns.scan(currentAddress)); // scan and add new nodes TODO: this returns an array in the
    pendingVisits = pendingVisits.flat(); // this removes the nesting from ns.scan
    pastVisits.push(currentAddress); // mark scanned node as explored
    pendingVisits = pendingVisits.filter(node => !pastVisits.includes(node)); // remove nodes already explored from pending visits
    currentAddress = pendingVisits.shift();
  }
  return pastVisits;
}

export function getMyCracks(ns) {
  const allTheCracks = [
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe"
  ];
  const myCracks = allTheCracks.filter(crack => ns.fileExists(crack)); // NEVER DOUBT MYSELF AGAIN LMAO
  return myCracks;
}

export function attemptCrackv2(ns, target, portsToNuke) {
  const myCracks = getMyCracks(ns);
  if (myCracks.length >= portsToNuke) {
    switch (portsToNuke) {
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
        break;
    }
    return true;
  } else {
    return false;
  }
}
