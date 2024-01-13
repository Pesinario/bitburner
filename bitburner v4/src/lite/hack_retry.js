/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  if (target == undefined) {
    ns.tprint(`ERROR: No target defined, killing ${ns.getScriptName()} @ ${ns.pid}`);
    ns.exit();
  }
  let hackAttempts = 0;
  let hackResult;
  do {
    hackResult = await ns.hack(target);
    hackAttempts++;
  }
  while (!hackResult > 0);
  ns.print("We had to do [" + String(hackAttempts) + "] attempts to hack " + target);
}