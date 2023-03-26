// IMPORTS FOR DEMO
const fs = require("fs");
const path = require("path");

// MAIN FUNCTIONS
function compare(longReference, shortSearch) {
  if (longReference === shortSearch) return 1;

  if (longReference.length < shortSearch.length) {
    const temp = longReference;
    longReference = shortSearch;
    shortSearch = temp;
  }

  var anythingSame = false;
  for (var i = 0; i < shortSearch.length; i++) {
    if (longReference.indexOf(shortSearch[i]) !== -1) {
      anythingSame = true;
      break;
    }
  }

  if (!anythingSame) return 0;

  let shiftS = 0;
  while (
    longReference[shiftS] !== shortSearch[0] &&
    shiftS < longReference.length
  ) {
    shiftS++;
  }
  let similarityS = 0;
  for (let i = 0; i < shortSearch.length; i++) {
    if (longReference[i + shiftS] === shortSearch[i]) {
      similarityS++;
    }
  }
  for (let i = 0; i < longReference.length; i++) {
    let count = 0;
    for (let j = 0; j < shortSearch.length; j++) {
      if (longReference[i] === shortSearch[j]) {
        count++;
      }
    }
    similarityS += 0.5 * (count / shortSearch.length);
  }

  let shiftE = 0;
  while (
    longReference[0] !== shortSearch[shiftE] &&
    shiftE < longReference.length
  ) {
    shiftE++;
  }
  let similarityE = 0;
  for (let i = 0; i < shortSearch.length; i++) {
    if (longReference[i] === shortSearch[i + shiftE]) {
      similarityE++;
    }
  }
  for (let i = 0; i < longReference.length; i++) {
    let count = 0;
    for (let j = 0; j < shortSearch.length; j++) {
      if (longReference[i] === shortSearch[j]) {
        count++;
      }
    }
    similarityE += 0.5 * (count / shortSearch.length);
  }

  const similarity = Math.max(similarityS, similarityE);

  return similarity < longReference.length
    ? similarity / longReference.length
    : 1;
}

function rank(input, options) {
  let results = [];
  for (let i = 0; i < options.length; i++) {
    results.push({
      name: options[i],
      score: compare(input, options[i]),
    });
  }
  return results.sort((a, b) => b.score - a.score).filter((a) => a.score > 0);
}

// DEMO
const commonWords = fs
  .readFileSync(path.join(__dirname, "commonWords.txt"), "utf8")
  .trim()
  .split("\n");

// Get user input from terminal
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prettyPrint(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += arr[i].name + " (" + (arr[i].score * 100).toFixed(2) + "%)\n";
  }
  return str;
}

readline.question("Enter a word: ", (input) => {
  const ranked = rank(input, commonWords);
  const top = ranked.slice(0, 10);
  console.log("Top 10 results: ");
  console.log(prettyPrint(top));
  console.log("Total: " + ranked.length + " results");
  readline.close();
});
