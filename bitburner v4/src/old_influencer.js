/** @param {NS} ns */
import { GHW_PAYLOADS, GREED, PORT_GHW, PORT_JIT_TARGET } from "./utils_constants.js";
import { colorMyString } from "./utils_regular.js";
import { constructGHWrequest } from "./utils_ns.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  if (typeof (ns.args[0]) == Number) { const contentCreatorHouse = ns.args[0] } else { const contentCreatorHouse = 1; }
  const myGreed = GREED;
  const BATCH_PRIORTY = 9
  const signature = ns.getScriptName() + String(ns.pid);
  ns.clearLog();
  ns.disableLog('getServerRequiredHackingLevel');
  const CORES_ASSUME = 1;
  class Victim {
    constructor(hostname) {
      this.nameBoring = hostname;
      this.nameFancy = colorMyString(hostname, 'random');
      this.secMin = ns.getServerMinSecurityLevel(hostname);
      this.monMax = ns.getServerMaxMoney(hostname);
      this.mock = ns.getServer(hostname)
      this.mock.hostname = hostname;
      this.mock.moneyAvailable = this.monMax;
      this.mock.hackDifficulty = this.secMin;
    }
    calcBatch(_player) {
      this.growTime = ns.formulas.hacking.growTime(this.mock, _player);
      this.hackTime = ns.formulas.hacking.hackTime(this.mock, _player);
      this.weakTime = ns.formulas.hacking.weakenTime(this.mock, _player);
      this.hackChance = ns.formulas.hacking.hackChance(this.mock, _player);

      this.thrHack = Math.max(Math.floor(myGreed / ns.formulas.hacking.hackPercent(this.mock, _player)), 1)
      this.mock.moneyAvailable = this.monMax * (1 - myGreed);
      this.mock.hackDifficulty += ns.hackAnalyzeSecurity(this.thrHack);

      this.thrGrow = Math.ceil(ns.formulas.hacking.growThreads(this.mock, _player, this.monMax, CORES_ASSUME));
      this.mock.hackDifficulty += ns.growthAnalyzeSecurity(this.thrGrow);

      this.thrWeak = Math.ceil((this.mock.hackDifficulty - this.secMin) / ns.weakenAnalyze(1, CORES_ASSUME));
      this.mock.hackDifficulty -= ns.weakenAnalyze(this.thrWeak, CORES_ASSUME);

      this.ramFromGrow = this.thrGrow * ns.getScriptRam(GHW_PAYLOADS[0]);
      this.ramFromHack = this.thrHack * ns.getScriptRam(GHW_PAYLOADS[3]);
      this.ramFromWeak = this.thrWeak * ns.getScriptRam(GHW_PAYLOADS[2]);
      this.ramSeconds = (this.ramFromGrow * this.growTime) + (this.ramFromHack * this.hackTime) + (this.ramFromWeak * this.weakTime);

      this.profitPerBatch = (this.mock.moneyAvailable * (1 - (myGreed * this.hackChance)));
      this.profitPerSecondPerRam = this.profitPerBatch / this.ramSeconds;
      this.profitPerSecondDumb = this.profitPerBatch / this.hackTime
    }
    async sendBatch() {
      let wRequest = constructGHWrequest(ns, this.nameBoring, 0, 0, this.thrWeak, BATCH_PRIORTY, signature);
      let gRequest = constructGHWrequest(ns, this.nameBoring, this.thrGrow, 0, 0, BATCH_PRIORTY, signature);
      let hRequest = constructGHWrequest(ns, this.nameBoring, 0, this.thrHack, 0, BATCH_PRIORTY, signature);
      let sentWeak = ns.tryWritePort(PORT_GHW, wRequest);
      await ns.sleep(this.weakTime - this.growTime);
      let sentGrow = ns.tryWritePort(PORT_GHW, gRequest);
      await ns.sleep(this.growTime - this.hackTime);
      let sentHack = ns.tryWritePort(PORT_GHW, hRequest);
      const wasSuccess = (sentGrow && sentHack && sentWeak);
      ns.write('dump/instagram_sent.txt', signature + ' | ' + wRequest + ' | ' + gRequest + ' | ' + hRequest + '\n', 'a')
      return wasSuccess;
    }
  }

  function askInstagram() {
    let recommendation = ns.peek(PORT_JIT_TARGET);
    const target = new Victim(recommendation);
    return target;
  }

  while (true) {
    const playerNew = ns.getPlayer();
    const best = askInstagram();
    best.calcBatch(playerNew);
    const success = await best.sendBatch();
    if (!success) { ns.tprint('ERROR: INFLUENCER HAD AN ISSUE'); ns.exit(); }
  }
}
