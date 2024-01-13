/** @param {NS} ns */
export async function main(ns) {
  let prefix = 'home-'
  for (let i = ns.args[0]; i < 25; i++) {
    ns.purchaseServer(prefix + i, 2)
  }
}