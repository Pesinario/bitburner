/** @param {NS} ns */
export async function main(ns) {
  if (typeof ns.args[0] == 'undefined') {
    var tgt_adress = ns.getHostname()
  } else {
    var tgt_adress = ns.args[0]
  }
  const security_min = ns.getServerMinSecurityLevel(tgt_adress) * 1.05
  var security_current = ns.getServerSecurityLevel(tgt_adress)
  while (security_current > security_min) {
    await ns.weaken(tgt_adress)
    var security_current = ns.getServerSecurityLevel
  }
}