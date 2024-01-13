/** @param {NS} ns */
import { ArrayifyMyFile } from 'u_txt.js'
export async function main(ns) {
  ns.clearLog()
  ns.tail()

  const targets = ArrayifyMyFile(ns, 'rooted_nodes.txt')
  const payload = 'p_dogshitscript.js'
  const payload_cost = ns.getScriptRam(payload)
  for (let target_iter = 0; target_iter < targets.length; target_iter++) {
    let target = targets[target_iter]
    let target_ram = ns.getServerMaxRam(target)
    let target_curr = ns.getServerUsedRam(target)
    let target_avail = target_ram-target_curr
    let canfit = Math.floor(target_avail / payload_cost)
    ns.print(target)
    if (canfit > 0){
    ns.exec(payload,target,{threads:canfit})
    }
  }
}
