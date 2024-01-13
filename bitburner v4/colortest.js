const inputString1 = "THIS IS MY STRING \x1b[38;5;1;48;5;2mTHIS IS OLD\x1b[0m AND THEN THERE MAY BE MORE STRING TO DO! \x1b[38;5;69;48;5;69mTHIS IS NEW\x1b[0m PEPEGABASS";
const inputString2 = "\x1b[38;5;1;48;5;2mTHIS IS OLD\x1b[0m AND THEN THERE MAY BE MORE STRING TO DO! \x1b[38;5;69;48;5;69mTHIS IS NEW\x1b[0m PEPEGABASS";
const inputString3 = "THIS IS MY STRING \x1b[38;5;1;48;5;2mTHIS IS OLD\x1b[0m AND THEN THERE MAY BE MORE STRING TO DO! \x1b[38;5;69;48;5;69mTHIS IS NEW\x1b[0m";
const inputString4 = "\x1b[38;5;1;48;5;2mTHIS IS OLD\x1b[0m AND THEN THERE MAY BE MORE STRING TO DO! \x1b[38;5;69;48;5;69mTHIS IS NEW\x1b[0m";
const inputNotColored = "THIS IS A SERVER HACKNET ULTRAELITE BOTNET MESSAGE"
const inputOnlyColored = "\x1b[38;5;1;48;5;2mTHIS IS OLD\x1b[0m"
//console.log(inputString1);
//console.log(inputString2);
//console.log(inputString3);
//console.log(inputString4);
function colorThisString(stringToColor, fColor = undefined, bColor = undefined) {
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

function colorMyString(fullString, fColor = undefined, bColor = undefined) {
  const regIsColored = /(\x1b\[.)*?(\x1b\[0m)/;
  const regColoredEnd = /(?<=\x1b\[0m)/;
  let workingString = fullString.slice();
  let finalString = '';
  while (workingString.length > 1) {
    loops = loops + 1;
    const coloredIndex = workingString.search(regIsColored);
    const noColorIndex = workingString.search(regColoredEnd);
    if (coloredIndex == -1) { // if we don't have any colored strings to escape
      finalString += colorThisString(workingString,fColor,bColor);
      return finalString;
    }
    if (coloredIndex == 0) { // if the text at the start is colored
      finalString += workingString.slice(0, noColorIndex);
      workingString = workingString.slice(noColorIndex, workingString.length);
    } else { // if it isn't
      finalString += colorThisString(workingString.slice(0, coloredIndex),fColor,bColor);
      workingString = workingString.slice(coloredIndex, workingString.length);
    }
  }
  return finalString;
}
var loops = 0;
console.log('START ' + colorMyString(inputString1, 'random', 'rainbow') + ' FINISH')
console.log(loops)
var loops = 0;
console.log('START ' + colorMyString(inputString3, 'random', 'rainbow') + ' FINISH')
console.log(loops)
var loops = 0;
console.log('START ' + colorMyString(inputString2, 'random', 'rainbow') + ' FINISH')
console.log(loops)
var loops = 0;
console.log('START ' + colorMyString(inputString4, 'random', 'rainbow') + ' FINISH')
console.log(loops)
var loops = 0;
console.log('START ' + colorMyString(inputNotColored, 'random', 'rainbow') + ' FINISH')
console.log(loops)
var loops = 0;
console.log('START ' + colorMyString(inputOnlyColored, 'random', 'rainbow') + ' FINISH')
console.log(loops)