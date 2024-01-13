/** @param {NS} ns */
import { ArrayifyMyFile } from 'u_txt.js'
import { CrackAttempt } from 'u_cracker.js'
export async function main(ns) {
  ns.tail()
  ns.clearLog()
  ns.disableLog('getServerNumPortsRequired')
  ns.disableLog('sleep')
  await ns.run('build_database.js') // every script that intendson using the database should worry about updating it
  // we get unrooted nodes
  const targets = ArrayifyMyFile(ns, "not_rooted_nodes.txt")

  for (let i = 0; i < targets.length; i++) {
    var breaches_done = 0
    let cur_target = targets[i]
    let cur_ports_needed = ns.getServerNumPortsRequired(cur_target)
    if (cur_ports_needed > 0) {
      if (CrackAttempt(ns, cur_target, cur_ports_needed)) {
        ns.nuke(cur_target)
        ns.print("INFO: Just penetrated " + cur_target + "!")
        breaches_done += 1
            await ns.sleep(500)
      } else {
        ns.print("ERROR: Could not penetrate " + cur_target + "[" + cur_ports_needed + "]")
            await ns.sleep(100)
      }
    } else {
      ns.nuke(cur_target)
      ns.print("INFO: Just penetrated " + cur_target + "!")
      breaches_done += 1
          await ns.sleep(500)
    }
  }
  ns.tprint("Finished hacking the entire universe, or at least [" + breaches_done + "] servers")
  ns.print ("WARN: The window will now close.")
  await ns.sleep(1000)
  ns.closeTail()
}