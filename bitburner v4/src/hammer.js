// This is the default thingy for scritps in game
/** @param {NS} ns */
// Above every function insert the following line to get autocomplete and ns.* info:
import { PORT_GHW } from "./utils_constants.js";
import { constructGHWrequest } from "./utils_ns.js";
import { bracketify, colorMyString } from "./utils_regular.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  ns.clearLog();
  const grows = 0 * ns.args[0];
  const hacks = 1000 * ns.args[0];
  const weakens = 0 * ns.args[0];
  const priority = 15;
  let packet = constructGHWrequest(ns, 'netlink', grows, hacks, weakens, priority);
  for (let i = 0; i < 1; i++) {
    ns.print(bracketify(i), ns.tryWritePort(PORT_GHW, packet));
  }
  ns.tprint(colorMyString(`Threw a bunch of shit ${bracketify(grows + hacks + weakens)} !${priority}!`, 'poop'));
}