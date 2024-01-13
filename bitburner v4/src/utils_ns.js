/** @param {import("../..").NS } ns */

export function ensureRam(ns, scriptName, desiredThreads, executeOn, ...details) { // This function makes sure we can run the script
  if (desiredThreads == 0) {
    ns.print(`ERROR: There was an attempt to execute 0 threads of ${scriptName} @ ${executeOn} from ${ns.getScriptName()}${String(...details)}`);
    return false;
  }
  let reservedRam;
  switch (executeOn) {
    case 'home':
      reservedRam = 32;
      break;
    default:
      reservedRam = 0;
      break;
  }
  return ns.getScriptRam(scriptName, executeOn) * desiredThreads < (ns.getServerMaxRam(executeOn) - ns.getServerUsedRam(executeOn) - reservedRam) ? true : false; // This is a ternary operator which is a fancy if else combo
}

export function arrayifyMyFile(ns, myFilePath) {
  let myFile = ns.read(myFilePath);
  let output = myFile.split(',');
  return output;
}
import { SEPARATOR } from "./utils_constants.js";
import { colorMyString, bracketify } from "./utils_regular.js";
export function constructGHWrequest(ns, target, grows = 0, hacks = 0, weakens = 0, priority = Infinity, signature = ns.getScriptName()) {
  let packet = ''.concat(target, SEPARATOR, grows, SEPARATOR, hacks, SEPARATOR, weakens, SEPARATOR, priority, SEPARATOR, signature);
  ns.print(colorMyString(`Constructed a packet of G:${bracketify(grows)}| H:${bracketify(hacks)}| W:${bracketify(weakens)} > ${target} from ${signature}`, 'GHWRequest'));
  return packet;
}
