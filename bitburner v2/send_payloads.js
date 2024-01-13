/** @param {NS} ns */
export async function main(ns) {
  const tgt_adress = ns.args[0]
  if (typeof ns.args[1] == "undefined") {
    ns.print("WARN: NULL HOST")
    var host_adress = ns.getHostname() // default to currentserver if not specified
  } else {
    ns.print("INFO: NOT NULL HOST")
    var host_adress = ns.args[1] // use specified server otherwise
  }

  var payloads = [ns.ls(host_adress, "p_")]
  for (let i = 0; i < payloads.length; i++) {
    ns.scp(payloads[i], tgt_adress, host_adress)
  }
}