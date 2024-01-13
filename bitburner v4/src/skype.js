/** @param {NS} ns */
import { GHW_PAYLOADS, GREED, PATIENCE, PORT_GHW, PORT_JIT_TARGET } from "./utils_constants.js";
import { bracketify, colorMyString } from "./utils_regular.js";
import { arrayifyMyFile, constructGHWrequest } from "./utils_ns.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  const percentToSteal = GREED;
  const REFRESH_RATE = 500; // miliseconds you retard
  const strategies = ['(loot)', '(embellish)', '(wreck)', '(fullbatch)'];
  ns.tail();
  ns.clearLog();
  ns.disableLog('getServerRequiredHackingLevel');
  ns.disableLog('getHackingLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('sleep');
  const protoTargets = arrayifyMyFile(ns, 'dump/money_servers.txt');
  const workingAssets = arrayifyMyFile(ns, 'dump/working_assets.txt');
  let SHOULD_LOOP = true;
  class Victim {
    constructor(hostname) {
      this.nameBoring = hostname;
      this.nameFancy = colorMyString(hostname, 'random');
      this.slow = ns.getWeakenTime(this.nameBoring);
    }
    doUpdate() {
      this.secNow = ns.getServerSecurityLevel(this.nameBoring);
      this.secMin = ns.getServerMinSecurityLevel(this.nameBoring);
      this.monCur = ns.getServerMoneyAvailable(this.nameBoring);
      this.monMax = ns.getServerMaxMoney(this.nameBoring);
    }

    sendEmbellish(cores = 1, priority = 4) {
      const strategyID = strategies[1];
      const signature = ns.getScriptName() + String(ns.pid) + strategyID;
      let moneyMult = this.monMax / this.monCur;
      if (moneyMult == Infinity) { moneyMult = 1.0001 }; // in case we reach 0 money
      const thrGrow = Math.ceil(ns.growthAnalyze(this.nameBoring, moneyMult, cores));
      const secIncGrow = ns.growthAnalyzeSecurity(thrGrow, this.nameBoring, cores);
      const thrHack = 0; // default
      const thrWeak = Math.ceil(secIncGrow / ns.weakenAnalyze(1, cores));
      const thrTotal = thrGrow + thrHack + thrWeak;
      if (secIncGrow > ns.weakenAnalyze(thrWeak)) { ns.print(`ERROR: Math wrong (sendEmbellish)`); }
      ns.print(colorMyString(`${strategyID} > ${this.nameFancy}`, 'grey') + colorMyString(` > ${ns.tFormat(this.slow)}` +
        ` // Security: ${ns.formatPercent(this.secNow / this.secMin)} // Money:${ns.formatPercent(this.monCur / this.monMax)} //${bracketify(thrTotal)}`, 'serverInfo'))
      return ns.tryWritePort(PORT_GHW, constructGHWrequest(ns, this.nameBoring, thrGrow, thrHack, thrWeak, priority, signature));
    }
    sendLoot(cores = 1, priority = 4) {
      const strategyID = strategies[0];
      const signature = ns.getScriptName() + String(ns.pid) + strategyID;
      const thrGrow = 0; // default
      let thrHack = Math.floor(percentToSteal / ns.hackAnalyze(this.nameBoring));
      if (thrHack == 0) thrHack = 1;
      const secIncHack = ns.hackAnalyzeSecurity(thrHack, this.nameBoring);
      const thrWeak = Math.ceil(secIncHack / ns.weakenAnalyze(1, cores))
      if (secIncHack > ns.weakenAnalyze(thrWeak)) { ns.print(`ERROR: Math wrong (Loot)`); }
      const thrTotal = thrGrow + thrHack + thrWeak;
      ns.print(colorMyString(`${strategyID} > ${this.nameFancy}`, 'silver') + colorMyString(` > ${ns.tFormat(this.slow)}` +
        ` // Security: ${ns.formatPercent(this.secNow / this.secMin)} // Money:${ns.formatPercent(this.monCur / this.monMax)} //${bracketify(thrTotal)}`, 'serverInfo'))
      return ns.tryWritePort(PORT_GHW, constructGHWrequest(ns, this.nameBoring, thrGrow, thrHack, thrWeak, priority, signature));
    }
    sendWreck(cores = 1, priority = 2) {
      const strategyID = strategies[2];
      const signature = ns.getScriptName() + String(ns.pid) + strategyID;
      const thrGrow = 0; // default
      const thrHack = 0; // default
      const thrWeak = Math.ceil(ns.getServerSecurityLevel(this.nameBoring) / ns.weakenAnalyze(1, cores));
      const thrTotal = thrGrow + thrHack + thrWeak;
      ns.print(colorMyString(`${strategyID} > ${this.nameFancy}`, 'expectedError') + colorMyString(` > ${ns.tFormat(this.slow)}` +
        ` // Security: ${ns.formatPercent(this.secNow / this.secMin)} // Money:${ns.formatPercent(this.monCur / this.monMax)} //${bracketify(thrTotal)}`, 'serverInfo'))
      return ns.tryWritePort(PORT_GHW, constructGHWrequest(ns, this.nameBoring, thrGrow, thrHack, thrWeak, priority, signature));
    }
    sendFullBatch(cores = 1, priority = 5) {
      const strategyID = strategies[3];
      const signature = ns.getScriptName() + String(ns.pid) + strategyID;

      let thrHack = Math.floor(percentToSteal / ns.hackAnalyze(this.nameBoring));
      if (thrHack == 0) { thrHack = 1; ns.tprint('thrHack was 0') };
      if (thrHack > 1000 * 1000) { ns.tprint(`thrHack was ${thrHack} @ ${this.nameBoring} hackanalyze:${ns.hackAnalyze(this.nameBoring)} monycurr: ${ns.getServerMoneyAvailable(this.nameBoring)} securit:${ns.getServerSecurityLevel(this.nameBoring)}`) }
      let secIncHack = ns.hackAnalyzeSecurity(thrHack, undefined);

      let moneyMult = 1 / (1 - percentToSteal);
      if (moneyMult > 1000 * 1000) { ns.tprint(`ERROR IN MONEYMULT ${moneyMult}`) }
      let thrGrow = Math.ceil(ns.growthAnalyze(this.nameBoring, moneyMult, cores));
      if (thrGrow > 1000 * 1000) { ns.tprint(`ERROR IN thrGrow ${thrGrow}`) }
      let secIncGrow = ns.growthAnalyzeSecurity(thrGrow, undefined, cores);

      let thrWeak = Math.ceil(secIncHack + secIncGrow / ns.weakenAnalyze(1, cores))
      if (thrWeak > 1000 * 1000) { ns.tprint(`ERROR IN thrWeak ${thrWeak}`) }
      let thrTotal = thrGrow + thrHack + thrWeak;
      if (thrTotal > 1000 * 1000) { ns.tprint(`ERROR IN thrTotal G:${thrGrow}H:${thrHack}W:${thrWeak}T:${thrTotal} DISCARDING ORDER`); return true }

      ns.print(colorMyString(`${strategyID} > ${this.nameFancy}`, 'suboptimal') + colorMyString(` > ${ns.tFormat(this.slow)}` +
        ` // Security: ${ns.formatPercent(this.secNow / this.secMin)} // Money:${ns.formatPercent(this.monCur / this.monMax)} //${bracketify(thrTotal)}`, 'serverInfo'))
      return ns.tryWritePort(PORT_GHW, constructGHWrequest(ns, this.nameBoring, thrGrow, thrHack, thrWeak, priority, signature));
    }
  }
  const victims = [];
  for (let i = 0; i < protoTargets.length; i++) {
    const hostname = protoTargets[i];
    const victim = new Victim(hostname);
    victims.push(victim);
  }

  function isBeingTargeted(currentTarget) {
    for (let i = 0; i < workingAssets.length; i++) {
      const currentAsset = workingAssets[i];
      for (let j = 0; j < GHW_PAYLOADS.length; j++) {
        const payload = GHW_PAYLOADS[j];
        for (let k = 0; k < strategies.length; k++) {
          const strategy = strategies[k];
          if (ns.isRunning(payload, currentAsset, currentTarget, ns.getScriptName() + ns.pid + strategy)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  let shortestCycle = Infinity;
  while (SHOULD_LOOP) {
    const availVictims = victims.slice();
    for (let i = 0; i < victims.length; i++) {
      let target = availVictims.pop();
      target.doUpdate()
      let didFix = false;
      let couldSend;
      if (ns.getWeakenTime(target.nameBoring) < ns.getHackTime(target.nameBoring) || ns.getWeakenTime(target.nameBoring) < ns.getGrowTime(target.nameBoring)) { ns.tprint(`ERROR: Speed of operations changed`) };

      if (isBeingTargeted(target.nameBoring)) continue;
      if (target.slow > PATIENCE && ns.args[0] != 'fixer') { continue; }
      if (ns.peek(PORT_JIT_TARGET) == target.nameBoring) { continue; } // don't bother with the batcher's target
      if (target.slow < shortestCycle) { shortestCycle = target.slow; }
      if (target.secNow > target.secMin * 1.01) {
        couldSend = target.sendWreck();
        while (!couldSend) { couldSend = target.sendWreck(); ns.tprint('ERROR: PORTWRITE'); await ns.sleep(1000); }
        didFix = true;
      }
      if (target.monCur * 1.01 < target.monMax) {
        couldSend = target.sendEmbellish();
        while (!couldSend) { couldSend = target.sendEmbellish(); ns.tprint('ERROR: PORTWRITE'); await ns.sleep(1000); }
        didFix = true;
      }
      if (ns.args[0] == 'fixer') { continue; }
      if (!didFix) { }
      couldSend = target.sendFullBatch();
      while (!couldSend) { couldSend = target.sendFullBatch(); ns.tprint('ERROR: PORTWRITE'); await ns.sleep(1000); }
      //while (!couldSend) { couldSend = target.sendFullBatch(); await ns.sleep(1000); }
    }
    await ns.sleep(Math.min(shortestCycle, REFRESH_RATE));
  }
}
