/** @param {NS} ns */
export async function main(ns) {
  ns.tail()
  let wanted = Math.floor((ns.getServerMaxRam('home') - 20) / ns.getScriptRam('miner_for_home.js'));
  ns.run('miner_for_home.js', { threads: wanted }, 'rho-construction')
}