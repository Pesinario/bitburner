/** @param {NS} ns */

import { PORT_GHW } from "./utils_constants";

/** @param {import("../..").NS } ns */
export async function main(ns) {
  const request = ns.args[0];
  const REFRESH_RATE = ns.args[1];
  let totalDuration = ns.args[2];
  ns.tprint(`INFO: Howdy, i'm the instagrammer ${request}`);
  while (totalDuration > 0) {
    let successful = ns.tryWritePort(PORT_GHW, request);
    if (!successful) { ns.tprint('ERROR FROM INSTAGRAMMER'); ns.exit(); }
    totalDuration -= REFRESH_RATE;
    await ns.sleep(REFRESH_RATE);
  }
}