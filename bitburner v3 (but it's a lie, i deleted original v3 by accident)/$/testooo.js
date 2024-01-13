/** @param {NS} ns */
/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.clearLog()
    ns.disableLog('ALL')
    ns.getServer()
    ns.brutessh()
    // all of this can be avoided by setting default values for parameters, javaScript is NOT as dumb as i had though before
    // actually i was wrong, when dealing with ns.args its different
  }