/** @param {NS} ns */
import { GHW_PAYLOADS, GREED, PATIENCE, PORT_JIT_SIZE, PORT_JIT_TARGET } from "./utils_constants.js";
import { bracketify, colorMyString } from "./utils_regular.js";
import { arrayifyMyFile, constructGHWrequest } from "./utils_ns.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  const myGreed = GREED;
  const BATCH_PRIORTY = 9
  const signature = ns.getScriptName() + String(ns.pid);
  const REFRESH_RATE = ns.args[0]; // TODO: CEO should set this
  const OPERATION_OFFSET = 5;
  // ns.tail();
  ns.clearLog();
  ns.disableLog('getServerRequiredHackingLevel');
  const protoTargets = arrayifyMyFile(ns, 'dump/money_servers.txt');
  const targetsCalculated = [];
  const CORES_ASSUME = 1;
  let playerDumb = ns.getPlayer();
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
      this.overlap = this.weakTime / REFRESH_RATE;
    }
    async sendBatch() {
      let wRequest = constructGHWrequest(ns, this.nameBoring, 0, 0, this.thrWeak, BATCH_PRIORTY, signature);
      ns.run('influencer.js', { threads: 1 }, wRequest, REFRESH_RATE, this.weakTime,);

      await ns.sleep((this.weakTime - this.growTime) - OPERATION_OFFSET);
      let gRequest = constructGHWrequest(ns, this.nameBoring, this.thrGrow, 0, 0, BATCH_PRIORTY, signature);
      ns.run('influencer.js', { threads: 1 }, gRequest, REFRESH_RATE, this.weakTime,);

      await ns.sleep((this.growTime - this.hackTime) - OPERATION_OFFSET);
      let hRequest = constructGHWrequest(ns, this.nameBoring, 0, this.thrHack, 0, BATCH_PRIORTY, signature);
      ns.run('influencer.js', { threads: 1 }, hRequest, REFRESH_RATE, this.weakTime,);

      await ns.sleep(OPERATION_OFFSET * 2);
      ns.write('dump/instagram_sent.txt', REFRESH_RATE + wRequest + ' | ' + gRequest + ' | ' + hRequest + '\n', 'a')
      return true; // TODO: maybe this should do something
    }
  }

  for (let i = 0; i < protoTargets.length; i++) {
    if (ns.getServerRequiredHackingLevel(protoTargets[i]) > playerDumb.skills.hacking) { continue; } // must be hackable
    if (ns.getWeakenTime(protoTargets[i]) > PATIENCE) { continue; } // must not take forever
    const target = new Victim(protoTargets[i]);
    target.calcBatch(playerDumb);
    targetsCalculated.push(target);
  }

  function researchBestTarget(compareBy) {
    targetsCalculated.sort((a, b) => a.profitPerSecondPerRam - b.profitPerSecondPerRam);
    let best = targetsCalculated.pop()
    targetsCalculated.push(best);
    return best;
  }

  function terminalPrint() {
    for (let i = 0; i < targetsCalculated.length; i++) {
      const target = targetsCalculated[i];
      let line1 = target.profitPerSecondDumb
      let line2 = ' @' + target.nameFancy + ' '
      let line3 = target.profitPerSecondPerRam
      ns.tprint(line1, line2, line3)
    }
  }
  ns.write('dump/report.txt', JSON.stringify(researchBestTarget()), 'w');
  terminalPrint();

  function advertiseJit(advertiseThis) {
    ns.clearPort(PORT_JIT_TARGET);
    ns.writePort(PORT_JIT_TARGET, advertiseThis.nameBoring);
    const ramPerBatch = advertiseThis.ramFromGrow + advertiseThis.ramFromHack + advertiseThis.ramFromWeak;
    ns.clearPort(PORT_JIT_SIZE);
    ns.writePort(PORT_JIT_SIZE, ramPerBatch);
    ns.tprint(colorMyString(`Batching ${advertiseThis.nameFancy} @ ${ns.formatRam(ramPerBatch)} a batch, Overlapping:${Math.floor(advertiseThis.overlap)} batches, ${bracketify(ns.formatRam(advertiseThis.overlap * ramPerBatch))}. Security Min ${advertiseThis.secMin}, Security cur ${ns.getServerSecurityLevel(advertiseThis.nameBoring)}`, 'batch'));
  }

  while (true) {
    ns.tprint('INFO: New batch is starting');
    const playerNew = ns.getPlayer();
    const best = researchBestTarget();
    advertiseJit(best);
    best.calcBatch(playerNew);
    const success = await best.sendBatch();
    if (success) { ns.exit(); }
  }
}
