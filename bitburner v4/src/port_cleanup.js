/** @param {NS} ns */
import { PORTS_BY_NAME } from "./utils_constants.js";
import { colorMyString } from "./utils_regular.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  for (let i = 1; i < PORTS_BY_NAME.length; i++) {
    ns.clearPort(i);
  }
  ns.tprint(colorMyString(`PORTS HAVE BEEN ANHILATED`, 'darkgrey', 'red'));
}