/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog()
  ns.tail()
  let myhack = 1;
  let target = 'the-hub'
  while (myhack > 0) {
    ns.print("ERROR: " + ns.hackAnalyzeChance(target));
    myhack = await ns.hack(target);
    ns.print("SUCCESS:" + myhack);
  }
}