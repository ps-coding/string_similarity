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

  let anythingSame = false;
  for (let i = 0; i < shortSearch.length; i++) {
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

  if (shiftS == longReference.length) shiftS = 0;

  let similarityS = -0.2 * shiftS;
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
    } else if (
      i + 1 < shortSearch.length &&
      longReference[i + shiftS] === shortSearch[i + 1]
    ) {
      similarityS += 0.7;
    } else if (
      i + 2 < shortSearch.length &&
      longReference[i + shiftS] === shortSearch[i + 2]
    ) {
      similarityS += 0.4;
    }
  }

  let shiftE = 0;
  while (
    longReference[0] !== shortSearch[shiftE] &&
    shiftE < longReference.length
  ) {
    shiftE++;
  }

  if (shiftE == longReference.length) shiftE = 0;

  let similarityE = -0.2 * shiftE;
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
    } else if (
      i + 1 < longReference.length &&
      longReference[i + 1] === shortSearch[i + shiftE]
    ) {
      similarityE += 0.7;
    } else if (
      i + 2 < longReference.length &&
      longReference[i + 2] === shortSearch[i + shiftE]
    ) {
      similarityE += 0.4;
    }
  }

  let similarity = Math.max(similarityS, similarityE);

  for (let i = 0; i < longReference.length; i++) {
    let count = 0;
    for (let j = 0; j < shortSearch.length; j++) {
      if (longReference[i] === shortSearch[j]) {
        count++;
      }
    }
    similarity += 0.5 * (count / shortSearch.length);
  }

  similarity += (longReference.length - shortSearch.length) * -0.2;

  return similarity / longReference.length / 1.1;
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
    str +=
      (i + 1).toString() +
      ". " +
      arr[i].name +
      " (" +
      (arr[i].score * 100).toFixed(2) +
      "%)\n";
  }
  return str.trim();
}

let corrected = [];
let original = [];

const editor = () => {
  readline.question("Edit word #", (input) => {
    if (input.trim() === "") {
      console.log("Final: " + corrected.join(" "));
      console.log("\n");
      cliRunner();
      return;
    }

    const wordNum = parseInt(input);

    if (isNaN(wordNum)) {
      console.log("Invalid word number");
      editor();
      return;
    }

    if (wordNum < 1 || wordNum > corrected.length) {
      console.log("Invalid word number");
      editor();
      return;
    }

    const idx = wordNum - 1;

    const ranked = rank(original[idx], commonWords);
    const top = ranked.slice(0, 10);

    console.log("Top Results: ");
    console.log(prettyPrint(top));

    readline.question("Replace with #", (input) => {
      const replaceNum = parseInt(input);

      if (isNaN(replaceNum)) {
        console.log("Invalid suggestion number");
        editor();
        return;
      }

      if (replaceNum < 1 || replaceNum > top.length) {
        console.log("Invalid suggestion number");
        editor();
        return;
      }

      corrected[idx] = top[replaceNum - 1].name;

      console.log("Draft: " + corrected.join(" "));
      editor();
    });
  });
};

const cliRunner = () => {
  readline.question("> ", (input) => {
    if (input.trim() === "") {
      readline.close();
      return;
    }

    const words = input.split(" ");

    if (words.length == 1) {
      const ranked = rank(input, commonWords);
      const top = ranked.slice(0, 10);
      console.log("Top Results: ");
      console.log(prettyPrint(top));
      console.log("Total: " + ranked.length + " results");
      console.log("\n");

      cliRunner();
    } else {
      original = Array.from(words);
      corrected = [];
      for (let i = 0; i < words.length; i++) {
        const ranked = rank(words[i], commonWords);
        const top = ranked[0];
        corrected.push(top.name);
      }

      console.log("Draft: " + corrected.join(" "));
      editor();
    }
  });
};

console.clear();
console.log(
  "Enter a word for suggestions. Enter a sentence to edit the spelling. Press enter without typing any characters to exit."
);

cliRunner();
