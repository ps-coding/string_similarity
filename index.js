// IMPORTS FOR DEMO
const fs = require("fs");
const path = require("path");

// MAIN FUNCTIONS
function compare(longReference, shortSearch) {
  longReference = longReference.toLowerCase();
  shortSearch = shortSearch.toLowerCase();

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
    } else if (
      i + shiftS + 1 < longReference.length &&
      longReference[i + shiftS + 1] === shortSearch[i]
    ) {
      similarityS += 0.7;
    } else if (
      i + shiftS + 2 < longReference.length &&
      longReference[i + shiftS + 2] === shortSearch[i]
    ) {
      similarityS += 0.4;
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
    } else if (
      i + shiftE + 1 < shortSearch.length &&
      longReference[i] === shortSearch[i + shiftE + 1]
    ) {
      similarityE += 0.7;
    } else if (
      i + shiftE + 2 < shortSearch.length &&
      longReference[i] === shortSearch[i + shiftE + 2]
    ) {
      similarityE += 0.4;
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

  return similarity < 1.2 * longReference.length
    ? similarity / (1.2 * longReference.length)
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

const cliRunner = () =>
  readline.question("Enter a word/phrase/command: ", (input) => {
    if (input.trim() === "") {
      readline.close();
      return;
    }

    const words = input.split(" ");

    if (words.length == 1) {
      const ranked = rank(input, commonWords);
      const top = ranked.slice(0, 10);
      console.log("Top 10 results: ");
      console.log(prettyPrint(top));
      console.log("Total: " + ranked.length + " results");
      console.log("\n--------------------------");
    } else {
      let corrected = [];
      for (let i = 0; i < words.length; i++) {
        const ranked = rank(words[i], commonWords);
        const top = ranked[0];
        corrected.push(top.name);
      }

      console.log("Corrected: " + corrected.join(" "));
      console.log("\n--------------------------");
    }

    cliRunner();
  });

cliRunner();
