# String Similarity

## Info

- The `compare` function compares two strings and returns a similarity score
  - It is a custom algorithm so it may not work in all cases, but it was pretty good in tests
- The `rank` function can be used for search features: it ranks results based on their comparison score using the `compare` function
- If you run the file, you can see a demo of the algorithm with the ability to intelligently search a list of the 1000 most common words

## Run

- Install [node](https://nodejs.org) and npm (which should come with node)
- Clone the repo
- Inside the directory, run `npm install` in the terminal to install the required packages for the demo (readline)
- To execute, run `node index.js` or `node .`
