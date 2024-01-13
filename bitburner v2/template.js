/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog()
  ns.disableLog('ALL')
  if (typeof ns.args[0] == 'undefined') {
    var tgt_adress = ns.getHostname()
  } else {
    var tgt_adress = ns.args[0]
  }
  // all of this can be avoided by setting default values for parameters, javaScript is NOT as dumb as i had though before
  // actually i was wrong, when dealing with ns.args its different
}