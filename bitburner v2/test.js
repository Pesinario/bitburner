/** @param {NS} ns */
export async function main(ns) {
  ns.clearLog()
  ns.tail()
  let myvar = ns.codingcontract.getContractTypes()
  ns.print(myvar.length)
}