/** @param {NS} ns */
import { colorMyString } from "./utils_regular.js";
/** @param {import("../..").NS } ns */
export async function main(ns) {
  let banner = ns.read('banner.txt');
  // banner = banner.split('\n');
  // banner = banner.map(function (x) { return colorMyString(x, 'random') });
  // banner = banner.toString();
  // banner = banner.replaceAll(',', '\n')
  // chatGPT golfed my code :
  banner = banner.split('\n').map(x => colorMyString(x, 'random')).join('\n');
  ns.tprint(`\n`, banner);
}