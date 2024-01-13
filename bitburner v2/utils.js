/** @param {NS} ns */
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
      pendingVisits.push(ns.scan(currentAddress).flat(5)); // scan and add new nodes
      pastVisits.push(currentAddress); // mark scanned node as explored
      pendingVisits.filter(node => !pastVisits.includes(node)); // remove nodes already explored from pending visits
    }
    return pastVisits;
  }
  export function getAllNodes(ns, startPoint = ns.getHostname()) {
    ns.disableLog('scan');
    let currentAddress = startPoint.slice(0);
    let shoppingList = [currentAddress];
    let visitedNodes = [];
  
    function checkIfThere(thing, where) { // TODO: change
      for (let i = 0; i < where.length; i++) {
        if (where[i] === thing) {
          return true;
        }
      }
      // ns.print("SUCCESS: " + thing + " hasn't been explored yet, returing false.");
      return false;
    }
  
    function addNeighbors(hopFrom) {
      //ns.print("INFO: AddNeighbors Called with: " + hopFrom);
      visitedNodes.push(hopFrom);
      let neighbors = ns.scan(hopFrom);
      for (let i = 0; i < neighbors.length; i++) {
        shoppingList.push(neighbors[i]);
      }
    }
  
    while (shoppingList.length > 0) {
      // ns.print("Shopping list ("+shoppingList.length + ") : " + shoppingList);
      // ns.print("\n"+"Visited nodes (" + visitedNodes.length + ") : " + visitedNodes);
      if (checkIfThere(currentAddress, visitedNodes)) {
        // ns.print("WARN: " + "this address was visited: " + currentAddress);
        currentAddress = shoppingList.shift(); // pull new address
        //ns.print("WARN:" + "new address to check: " + currentAddress);
      } else {
        addNeighbors(currentAddress);
        currentAddress = shoppingList.shift(); // pull new address
      }
  
    }
    return visitedNodes;
  }
  
  export function getRootedNodes(ns, allNodes) {
    let rootedNodes = [];
    let pendingEval = allNodes.slice(0); // this protects the parameter from editing
    while (pendingEval.length > 0) {
      let currentNode = pendingEval.shift();
      if (ns.hasRootAccess(currentNode)) {
        rootedNodes.push(currentNode);
      }
    }
    return rootedNodes;
  }
  
  export function crackAttempt(ns, target, reqPortsToNuke) {
    const allTheCracks = [
      "BruteSSH.exe",
      "FTPCrack.exe",
      "relaySMTP.exe",
      "HTTPWorm.exe",
      "SQLInject.exe"
    ];
    const myCracks = [];
    for (let i = 0; i < allTheCracks.length; i++) { // checks if we have that many 0days
      if (ns.fileExists(allTheCracks[i])) {
        myCracks.push(allTheCracks[i]);
      }
    }
    if (myCracks.length >= reqPortsToNuke) { // if we do, applies them and returns true
      ns.print("WARN: cracker should crack " + reqPortsToNuke + " reqPortsToNuke");
      switch (reqPortsToNuke) {
        case 1:
          reqPortsToNuke = 1;
          ns.brutessh(target);
          break;
        case 2:
          reqPortsToNuke = 2;
          ns.brutessh(target);
          ns.ftpcrack(target);
          break;
        case 3:
          reqPortsToNuke = 3;
          ns.brutessh(target);
          ns.ftpcrack(target);
          ns.relaysmtp(target);
          break;
        case 4:
          reqPortsToNuke = 4;
          ns.brutessh(target);
          ns.ftpcrack(target);
          ns.relaysmtp(target);
          ns.httpworm(target);
          break;
        case 5:
          reqPortsToNuke = 5;
          ns.brutessh(target);
          ns.ftpcrack(target);
          ns.relaysmtp(target);
          ns.httpworm(target);
          ns.sqlinject(target);
          break;
      }
      return true;
    } else { // if we dont, returns false
      return false;
    }
  }