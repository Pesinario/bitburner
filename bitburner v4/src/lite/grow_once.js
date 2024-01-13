/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  if (target == undefined) {
    ns.tprint(`ERROR: No target defined, killing ${ns.getScriptName()} @ ${ns.pid}`);
    ns.exit();
  }
  await ns.grow(target);
}