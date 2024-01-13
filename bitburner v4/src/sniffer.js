/** @param {NS} ns */
import { PORTS_BY_NAME } from "./utils_constants.js";
import { bracketify, colorMyString } from "./utils_regular.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  ns.clearLog();
  ns.tail();
  ns.disableLog('sleep');
  function sniff(portNumber, portName) {
    const peek = ns.peek(portNumber);
    switch (portName) {
      case 'RAM_TOTAL':
      case 'RAM_AVAIL':
        if (peek == 'NULL PORT DATA') break;
        ns.print(`${colorMyString(ns.formatRam(peek), 57)} @ ${colorMyString(portName + bracketify(portNumber), 255)}`);
        break;
      default:
        ns.print(`${colorMyString(peek, 57)} @ ${colorMyString(portName + bracketify(portNumber), 255)}`);
        break
    }
    if (peek == 'NULL PORT DATA') { return false; }
  }
  while (true) {
    ns.clearLog();
    for (let i = 1; i < PORTS_BY_NAME.length; i++) {
      sniff(i, PORTS_BY_NAME[i]);
    }
    await ns.sleep(20);
  }
}