/** @param {NS} ns */
export async function main(ns) {
  if (typeof ns.args[0] == 'undefined') {
    var tgt_adress = ns.getHostname()
  } else {
    var tgt_adress = ns.args[0]
  }
  const money_threshhold = ns.getServerMaxMoney(tgt_adress) * 0.95
  var money_current = ns.getServerMoneyAvailable(tgt_adress)
  while (money_threshhold > money_current) {
    await ns.grow(tgt_adress)
    var money_current = ns.getServerMoneyAvailable(tgt_adress)
  }
}