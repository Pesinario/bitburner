import { PORT_GHW, PORT_REBOOT, PORT_RAM_AVAIL, PORT_RAM_TOTAL, SEPARATOR, GHW_PAYLOADS } from "./utils_constants.js"; // Constants
import { bracketify, colorMyString } from "./utils_regular.js"; // Doesn't need NS
import { arrayifyMyFile, ensureRam } from "./utils_ns.js"; // Needs NS
/** @param {NS} ns */
/** @param {import("../..").NS } ns */
export async function main(ns) { // TODO: add ns.share(support when downtime)
  let SHOULD_LOOP = true;
  const REFRESH_RATE = 5;
  let reqId = 0;
  let myQueue = [];
  let NETWORK_RAM_AVAIL = 0;
  let NETWORK_RAM_TOTAL = 0;
  const growScriptPath = GHW_PAYLOADS[0];
  const hackScriptPath = GHW_PAYLOADS[1];
  const weakenScriptPath = GHW_PAYLOADS[2];
  const heaviestLite = ns.getScriptRam(growScriptPath);
  ns.clearLog();
  ns.tail();
  ns.disableLog('sleep');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('scp');
  ns.disableLog('exec');

  class Asset {
    constructor(hostname) {
      this.nameBoring = hostname;
      this.nameFancy = colorMyString(hostname, 'random');
      this.isPurch = ns.getServer(hostname).purchasedByPlayer;
      this.ramMax = ns.getServer(hostname).maxRam;
      this.ramAvail = this.ramMax - this.ramUsed;
      this.maxLiteThreads = Math.floor(this.ramAvail / heaviestLite);
    }
    updateRam() {
      this.ramAvail = this.ramMax - ns.getServerUsedRam(this.nameBoring);
      this.maxLiteThreads = Math.floor(this.ramAvail / heaviestLite);
    }
    allocateAsset(request, wanThr, operation, target, requestID, ...extras) {
      let chosenScriptPath;
      let weDid = 0;
      if (wanThr < 1) { ns.print(`ERROR: wantThr is 0 @ ${this.nameFancy} > ${target}`) } // just in case
      if (wanThr > 9999999) {
        ns.print(`ERROR, wantThr is ${wanThr}, made a dump`);
        ns.write('dump/error_dump.txt', '\n\n\n' + JSON.stringify(request), 'a');
      }
      if (this.maxLiteThreads == 0) { return weDid; } // Don't spam errors, just say no lmao
      switch (operation) {
        case 'grow':
          chosenScriptPath = growScriptPath;
          break;
        case 'hack':
          chosenScriptPath = hackScriptPath;
          break;
        case 'weaken':
          chosenScriptPath = weakenScriptPath;
          break;
      }
      ns.scp(chosenScriptPath, this.nameBoring, ns.getHostname()); // important step
      ns.scp('utils.js', this.nameBoring, ns.getHostname()); // just in case
      // this scp should be awaited for the exec to work, but it's kinda funny see the script puke errors but eventually figure it out 😂
      if (ensureRam(ns, chosenScriptPath, wanThr, this.nameBoring, "Full batch")) { // if this asset can do all of the requested operations
        ns.exec(chosenScriptPath, this.nameBoring, { threads: wanThr }, target, ...extras);
        ns.print(colorMyString(`We did all of the ${operation}s${bracketify(wanThr)}from the request #${requestID} @ ${this.nameFancy} > ${target}`, 'silver'));
        weDid += wanThr;
      } else {
        if (ensureRam(ns, chosenScriptPath, this.maxLiteThreads, this.nameBoring, "Trying maxLiteThreads")) { // try maxLiteThreads
          ns.exec(chosenScriptPath, this.nameBoring, { threads: this.maxLiteThreads }, target, ...extras);
          ns.print(colorMyString(`We did as many ${operation}s as we could (${this.maxLiteThreads}/${wanThr}) from the request#${requestID} @ ${this.nameFancy} > ${target}`, 'grey'));
          weDid += this.maxLiteThreads;
        } else {
          ns.print(`ERROR: How the fuck did we get here. @ ${this.nameFancy} maxLite: ${this.maxLiteThreads}`)
          this.updateRam();
          ns.print(`ERROR: How the fuck did we get here2. @ ${this.nameFancy} maxLite: ${this.maxLiteThreads}`)
        }
      }
      return weDid;
    }
  }

  function updateAssets() {
    let workingAssets = myAssets.slice();
    for (let i = 0; i < workingAssets.length; i++) {
      const currentAsset = workingAssets[i];
      currentAsset.updateRam();
    }
    workingAssets = workingAssets.sort((a, b) => a.ramAvail - b.ramAvail);
    return workingAssets;
  }

  function advertiseRam() {
    ns.clearPort(PORT_RAM_TOTAL);
    ns.clearPort(PORT_RAM_AVAIL);
    NETWORK_RAM_AVAIL = 0;
    for (let i = 0; i < myAssets.length; i++) {
      let currentAsset = myAssets[i];
      currentAsset.updateRam();
      NETWORK_RAM_AVAIL += currentAsset.ramAvail;
    }
    if (!ns.tryWritePort(PORT_RAM_TOTAL, NETWORK_RAM_TOTAL)) { ns.print(`ERROR: Writing to port ${bracketify(PORT_RAM_TOTAL)}`); }
    if (!ns.tryWritePort(PORT_RAM_AVAIL, NETWORK_RAM_AVAIL)) { ns.print(`ERROR: Writing to port ${bracketify(PORT_RAM_AVAIL)}`); }
    return NETWORK_RAM_AVAIL;
  }

  class GHWRequest {
    constructor(ghwString) {
      reqId++;
      this.id = reqId;
      this.attempts = 0;
      let unpacked = ghwString.split(SEPARATOR);
      this.target = String(unpacked[0]);
      this.grows = Number(unpacked[1]);
      this.hacks = Number(unpacked[2]);
      this.weakens = Number(unpacked[3]);
      this.priority = Number(unpacked[4]);
      this.signature = String(unpacked[5]);
      this.total = this.grows + this.hacks + this.weakens;
      this.growCycles = 0;
      this.hackCycles = 0;
      this.weakenCycles = 0;
      this.ghwString = ghwString;
      this.isBatch = false; // default, can be changed
    }
    addToQueue() { // TODO: Instead of sorting the array, we should just place orders correctly to begin with.
      myQueue.push(this);
      myQueue = myQueue.sort(function (a, b) {
        let myEval = a.priority - b.priority;
        if (myEval == 0) { myEval = a.id - b.id; }
        return myEval;
      })
    }
    updateTotal() {
      this.total = this.grows + this.hacks + this.weakens;
    }
  }

  function executeRequest(request) {
    if (request.attempts == 0) ns.print(`INFO: Attempting to execute request#${request.id}/${reqId} of G:${request.grows}|H:${request.hacks}|W:${request.weakens}|T:[${request.total}]`)
    let workingAssets = updateAssets();
    let currentWorkingAsset;
    let totalDone = 0;

    if (request.isBatch == true) { // for actual batching
      let ramRequired = 0;
      ramRequired += request.grows * heaviestLite;
      ramRequired += request.hacks * heaviestLite;
      ramRequired += request.weakens * heaviestLite;
      if (NETWORK_RAM_AVAIL < ramRequired) { ns.print('ERROR: NOT ENOUGH RAM TO DO FULL BATCH'); return totalDone; } // TODO: batching
    }

    while (request.weakens > 0) {
      request.weakenCycles++
      currentWorkingAsset = workingAssets.pop();
      if (currentWorkingAsset == undefined) { break; }
      let alreadyDid = currentWorkingAsset.allocateAsset(request, request.weakens, 'weaken', request.target, request.id, request.signature);
      request.weakens = request.weakens - alreadyDid;
      totalDone += alreadyDid;
    }
    while (request.hacks > 0) {
      request.hackCycles++
      currentWorkingAsset = workingAssets.pop();
      if (currentWorkingAsset == undefined) { break; }
      let alreadyDid = currentWorkingAsset.allocateAsset(request, request.hacks, 'hack', request.target, request.id, request.signature);
      request.hacks -= alreadyDid;
      totalDone += alreadyDid;
    }
    while (request.grows > 0) {
      request.growCycles++;
      currentWorkingAsset = workingAssets.shift();
      if (currentWorkingAsset == undefined) { break; }
      let alreadyDid = currentWorkingAsset.allocateAsset(request, request.grows, 'grow', request.target, request.id, request.signature);
      if (currentWorkingAsset.isPurch && alreadyDid != 0) ns.print(colorMyString(`We had to do a grow in ${currentWorkingAsset.nameFancy}${bracketify(ns.formatRam(currentWorkingAsset.ramAvail))}`, 'suboptimal'));
      request.grows -= alreadyDid;
      totalDone += alreadyDid;
    }
    request.updateTotal();

    if (totalDone != 0 && currentWorkingAsset == undefined) ns.print(`WARN: Attempted to execute request#${request.id}/${reqId}, Did ${totalDone}`);
    advertiseRam();
    if (currentWorkingAsset == undefined) {
      if (request.attempts == 0) ns.print(`ERROR: Ran out of assets, did${bracketify(totalDone)}operations`);
      request.attempts++;
      return totalDone;
    }

    if (request.attempts == 0) { ns.print(colorMyString(`Executed request#${request.id} in ${request.growCycles} Grow cycles, ${request.hackCycles} Hack cycles, and ${request.weakenCycles} weaken cycles.` + `Total:${bracketify(request.growCycles + request.hackCycles + request.weakenCycles)}`, 'perfect')); }
    else { ns.print(colorMyString(`Executed request#${request.id}/${reqId} in ${request.attempts} attempts`, 'suboptimal')); }
    return totalDone; // no problems here
  }

  // THIS IS THE CODE THAT RUNS ONLY ONCE AND WHY WE RESTART SOME TIMES
  const myAssets = [];
  const writeMe = [];
  const purchasedServers = arrayifyMyFile(ns, 'dump/purchased_servers.txt');
  for (let i = 0; i < purchasedServers.length; i++) {
    writeMe.push(purchasedServers[i]);
    let newAsset = new Asset(purchasedServers[i]);
    myAssets.push(newAsset);
    NETWORK_RAM_TOTAL += newAsset.ramMax;
  }
  const pwnedServers = arrayifyMyFile(ns, 'dump/pwned.txt');
  for (let i = 0; i < pwnedServers.length; i++) {
    if (ns.getServer(pwnedServers[i]).maxRam == 0) { continue; } // no useless servers
    writeMe.push(pwnedServers[i]);
    let newAsset = new Asset(pwnedServers[i]);
    myAssets.push(newAsset);
    NETWORK_RAM_TOTAL += newAsset.ramMax;
  }
  ns.write('dump/working_assets.txt', String(writeMe), 'w');
  myAssets.forEach(asset => { ns.print(asset.nameFancy) });
  ns.print(colorMyString("INITIALIZING", 'black', 'white'));
  // THIS IS THE CODE THAT RUNS ONLY ONCE AND WHY WE RESTART SOME TIMES
  
  // MAIN LOOP:
  while (SHOULD_LOOP) {
    if (ns.peek(PORT_REBOOT) == ns.getScriptName()) { SHOULD_LOOP = false } // Should we stop?
    NETWORK_RAM_AVAIL = advertiseRam();
    let newRequest = ns.readPort(PORT_GHW);
    let haveWorkToDo;
    let didWork = false;
    while (newRequest != 'NULL PORT DATA') { // While there are orders to pick up
      ns.print(colorMyString(newRequest, 'GHWRequest'));
      newRequest = new GHWRequest(newRequest);
      newRequest.addToQueue();
      newRequest = ns.readPort(PORT_GHW);
    }
    while (myQueue.length > 0) { // keep completing orders
      const currentOrder = myQueue.shift();
      const stuffDone = executeRequest(currentOrder);
      if (currentOrder.total > 0) { myQueue.unshift(currentOrder); }
      if (stuffDone > 0) {
        didWork = true;
      } else {
        break;
      }
    }
    myQueue.length > 0 ? haveWorkToDo = true : haveWorkToDo = false;
    if (didWork) {
      if (haveWorkToDo) { ns.print(colorMyString(`WORKING ON ORDER ${myQueue[0].id}`, 'black', 'red')); ns.tail(); }
      else { ns.print(colorMyString('AWAITING WORK', 'aqua')); }
    }
    await ns.sleep(REFRESH_RATE); // don't want to freeze the game
  }
  ns.tprint(`INFO: We stopped listening for new requests, someone should run us again...`)
}