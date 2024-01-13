/** @param {NS} ns */
export async function main(ns) {
  let targetAdress = ns.args[0]
  if (typeof (targetAdress) == 'undefined') {
    targetAdress = ns.getHostname();
  }
  let securityTreshold = ns.getServerMinSecurityLevel(targetAdress) * 1.25
  let moneyTreshold = ns.getServerMaxMoney(targetAdress) * 0.75
  while (true) {
    if (ns.getServerSecurityLevel(targetAdress) > securityTreshold) {
      await ns.weaken(targetAdress)
    } else if (ns.getServerMoneyAvailable(targetAdress) < moneyTreshold) {
      await ns.grow(targetAdress)
    } else {
      await ns.sleep(250);
      ns.tprint("ERROR: MINERFORHOMEJOBDONE");
    }
  }
}