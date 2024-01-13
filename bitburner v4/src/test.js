
// This is the default thingy for scritps in game
/** @param {NS} ns */
// Above every function insert the following line to get autocomplete and ns.* info:
/** @param {import("../..").NS } ns */


export async function main(ns) {
  ns.clearLog()
  ns.tail()

}