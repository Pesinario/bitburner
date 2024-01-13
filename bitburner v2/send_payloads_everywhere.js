/** @param {NS} ns */
import { ArrayifyMyFile } from 'u_txt.js'
export async function main(ns) {
  ns.clearLog()
  ns.tail()
  if (typeof ns.args[0] == "undefined") {
    ns.print("INFO: DEFAULT HOST")
    var host_adress = ns.getHostname() // default to currentserver if not specified
  } else {
    ns.print("INFO: SPECIFIED HOST")
    var host_adress = ns.args[0] // use specified server otherwise
  }

  const targets = ArrayifyMyFile(ns, 'rooted_nodes.txt')
  const payloads = [ns.ls(host_adress, "p_")]
  for (let target_iter = 0; target_iter < targets.length; target_iter++) {
    for (let payload_number = 0; payload_number < payloads.length; payload_number++) {
      ns.scp(payloads[payload_number], targets[target_iter], host_adress)
    }
  }
}