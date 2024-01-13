/** @param {NS} ns */
import { GHW_PAYLOADS, PATIENCE } from "./utils_constants.js";
import { bracketify } from "./utils_regular.js";
import { arrayifyMyFile, ensureRam } from "./utils_ns.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  let bePatient = ns.args[0]
  if (bePatient == undefined) { bePatient = true };
  const waymakerModifier = Infinity; // TODO:
  ns.clearLog();
  ns.tail();
  ns.disableLog('getHackingLevel');
  ns.disableLog('getServerRequiredHackingLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  const growScriptPath = GHW_PAYLOADS[0];
  const weakenScriptPath = GHW_PAYLOADS[2];

  let hadToSkip = false;
  let operatingFrom = ns.getHostname();
  let targets = arrayifyMyFile(ns, 'dump/money_servers.txt');

  if (bePatient) {
    targets = targets.filter(target => ns.getServerRequiredHackingLevel(target) < ns.getHackingLevel() && ns.getWeakenTime(target) < PATIENCE); // Do the fast / being worked servers
    ns.tprint(`INFO: Running in Patient mode${bracketify(targets.length)}`);
  } else {
    targets = targets.filter(target => (ns.getWeakenTime(target) > PATIENCE) && PATIENCE * waymakerModifier > ns.getWeakenTime(target)); // Kinda more sensible
    ns.tprint(`INFO: Running in Waymaker mode${bracketify(targets.length)}`);
  }

  let myPIDs = [];
  let targetsForWeaken = targets.filter(target => ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target));
  let targetsForGrow = targets.filter(target => ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target));

  async function waitForMyStuffToDie() {
    while (myPIDs.length > 0) { // we wait for every script spawned by this script to die
      myPIDs = updateRunningScripts(myPIDs);
      ns.print("SUCCESS: Waiting for all my PIDs to die");
      await ns.sleep(1000 * 2);
    }
  }

  function updateRunningScripts(oldPIDArray) {
    let newPIDArray = [];
    for (let i = 0; i < oldPIDArray.length; i++) {
      // if (ns.isRunning(oldPIDArray[i])) newPIDArray.push(oldPIDArray[i]);
      ns.isRunning(oldPIDArray[i]) ? newPIDArray.push(oldPIDArray[i]) : null; // this looks fancier to me
    }
    return newPIDArray;
  }

  async function doTheWeaken() {
    while (targetsForWeaken.length > 0) {
      let target = targetsForWeaken.shift();
      if (target == undefined) break; // just a safety measure

      let securityToOvercome = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
      let oneThread = ns.weakenAnalyze(1, ns.getServer().cpuCores);
      let desiredThreads = Math.ceil(securityToOvercome / oneThread);
      if (ensureRam(ns, weakenScriptPath, desiredThreads, operatingFrom)) {
        let newPID = ns.run(weakenScriptPath, desiredThreads, target);
        myPIDs.push(newPID);
      } else {
        hadToSkip = true
        while (desiredThreads > 0) { // try with less threads
          if (ensureRam(ns, weakenScriptPath, desiredThreads, operatingFrom)) {
            let newPID = ns.run(weakenScriptPath, desiredThreads, target);
            myPIDs.push(newPID);
            break;
          } else {
            desiredThreads--;
          }
        }
        await ns.sleep(1000 * 10);
        continue; // token continue to show it didn't go as planned
      }
    }
  }

  async function doTheGrow() {
    while (targetsForGrow.length > 0) {
      let target = targetsForGrow.shift();
      if (target == undefined) break; // just a safety measure

      let moneyMultiplier = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
      let desiredThreads = Math.ceil(ns.growthAnalyze(target, moneyMultiplier, ns.getServer(operatingFrom).cpuCores));
      if (ensureRam(ns, growScriptPath, desiredThreads, operatingFrom)) {
        let newPID = ns.run(growScriptPath, desiredThreads, target);
        myPIDs.push(newPID);
      } else {
        hadToSkip = true
        while (desiredThreads > 0) { // try with less threads
          if (ensureRam(ns, growScriptPath, desiredThreads, operatingFrom)) {
            let newPID = ns.run(growScriptPath, desiredThreads, target);
            myPIDs.push(newPID);
            break;
          } else {
            desiredThreads--;
          }
        }
        await ns.sleep(1000 * 10);
        continue; // token continue to show it didn't go as planned
      }
    }
  }

  while (true) { // this is the main script logic
    if (targetsForWeaken.length > 0) {
      await doTheWeaken();
      continue;
    }
    if (targetsForGrow.length > 0) {
      await doTheGrow();
      continue;
    }
    break;
  }

  if (hadToSkip) {
    ns.tprint("WARN: We ran into some RAM issues, once our scripts die we'll respawn");
    await waitForMyStuffToDie();
    ns.closeTail();
    ns.spawn(ns.getScriptName(), { threads: 1, spawnDelay: 1000 }, bePatient);
  } else {
    await waitForMyStuffToDie();
    ns.tprint("SUCCESS: Everything went perfect, this script will NOT reactivate");
    ns.closeTail();
  }
}