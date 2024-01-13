// This has been split into different files, only here for legacy reasons
/** @param {import("../..").NS } ns */
export const PORTS_BY_NAME = [null, 'REBOOT', 'RAM_TOTAL', 'RAM_AVAIL', 'GHW', 'GHW_JIT', 'TARGET_JIT'];
export const PORT_REBOOT = PORTS_BY_NAME.findIndex(x => x === 'REBOOT');
export const PORT_RAM_TOTAL = PORTS_BY_NAME.findIndex(x => x === 'RAM_TOTAL');
export const PORT_RAM_AVAIL = PORTS_BY_NAME.findIndex(x => x === 'RAM_AVAIL');
export const PORT_GHW = PORTS_BY_NAME.findIndex(x => x === 'GHW');
export const PORT_GHW_JIT = PORTS_BY_NAME.findIndex(x => x === 'GHW');
export const PORT_TARGET_JIT = PORTS_BY_NAME.findIndex(x => x === 'GHW');

export const SEPARATOR = '█';
//export const PATIENCE = Infinity;
export const PATIENCE = 1000 * 60 * 10;
export const GREED = 0.25;
export const RESERVE = 0.5;
export const GHW_PAYLOADS = ['lite/grow_once.js', 'lite/hack_retry.js', 'lite/weaken_once.js'];

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

export function constructGHWrequest(ns, target, grows = 0, hacks = 0, weakens = 0, priority = Infinity, signature = ns.getScriptName()) {
  let packet = ''.concat(target, SEPARATOR, grows, SEPARATOR, hacks, SEPARATOR, weakens, SEPARATOR, priority, SEPARATOR, signature);
  ns.print(colorMyString(`Constructed a packet of G:${bracketify(grows)}| H:${bracketify(hacks)}| W:${bracketify(weakens)} > ${target} from ${signature}`, 'GHWRequest'));
  return packet;
}

export function bracketify(myVar) {
  return (" [" + String(myVar) + "] ");
}

function colorThisString(stringToColor, fColor = undefined, bColor = undefined) { // this is actually a helper function that shouldn't be called
  const myColors = [
    'darkgrey', 'maroon', 'green', 'olive', 'navy', 'purple', 'teal', 'silver',
    'grey', 'red', 'lime', 'yellow', 'blue', 'fuchsia', 'aqua', 'white', 'black']; // 17 indexes
  const fRandom = Math.round(Math.random() * 255);
  const bRandom = Math.round(Math.random() * 255);
  while (myColors.length < 256) { myColors.push('someothercolor') };
  myColors[214] = 'poop';
  myColors[225] = 'GHWRequest';
  myColors[31] = 'serverInfo';
  myColors[93] = 'perfect';
  myColors[19] = 'suboptimal';
  myColors[88] = 'expectedError';
  // finished doing color definition

  const escape = '\x1b['; // hex
  const foregroundCode = '38;5;';
  const backgroundCode = '48;5;';
  const finish = 'm';
  const stopTheFormatting = escape + '0' + finish;
  let colorizedString = escape;
  // so the string is ESCAPESQUENCE -\u001b- then PARAMETERS -38;5- (separated by;) then finish -m- then the string -myStr-
  if (fColor != undefined) { // if we want to color foreground
    const isIndex = myColors.findIndex(color => color === fColor); // if in array
    if (isIndex != -1) { fColor = isIndex; } // change it to the index
    switch (fColor) {  // check if it's a string representing a special type of random
      case 'random':
        fColor = fRandom;
        break;
      case 'rainbow': // the difference here is that it will change mid-string if there are colored strings pre-existing in the input
        fColor = Math.round(Math.random() * 255);
        break;

    }
    colorizedString += foregroundCode + String(fColor);
  }

  if (bColor != undefined) { // if we want to color background
    if (fColor != undefined) { colorizedString += ';' } // if we did foreground color
    const isIndex = myColors.findIndex(color => color === bColor); // if in array
    if (isIndex != -1) { bColor = isIndex; } // change it to the index
    switch (bColor) {
      case 'random':
        bColor = bRandom;
        break;
      case 'rainbow': // the difference here is that it will change mid-string if there are colored strings pre-existing in the input
        bColor = Math.round(Math.random() * 255);
        break;
    }
    colorizedString += backgroundCode + String(bColor);
  }

  colorizedString += finish + stringToColor; // payload completed
  return colorizedString + stopTheFormatting;
}

export function colorMyString(fullString, fColor = undefined, bColor = undefined) {
  const regIsColored = /(\x1b\[.)*?(\x1b\[0m)/;
  const regColoredEnd = /(?<=\x1b\[0m)/;
  let workingString = String(fullString).slice();
  let finalString = '';
  while (workingString.length > 1) {
    const coloredIndex = workingString.search(regIsColored);
    const noColorIndex = workingString.search(regColoredEnd);
    if (coloredIndex == -1) { // if we don't have any colored strings to escape
      finalString += colorThisString(workingString, fColor, bColor);
      return finalString;
    }
    if (coloredIndex == 0) { // if the text at the start is colored
      finalString += workingString.slice(0, noColorIndex);
      workingString = workingString.slice(noColorIndex, workingString.length);
    } else { // if it isn't
      finalString += colorThisString(workingString.slice(0, coloredIndex), fColor, bColor);
      workingString = workingString.slice(coloredIndex, workingString.length);
    }
  }
  return finalString;
}
