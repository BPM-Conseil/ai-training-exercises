# Exercise 2: Dependency Update Practice

## Overview
This exercise demonstrates how outdated dependencies can cause code to fail when using newer functions.

## The Problem
The project uses **date-fns 1.30.1** (old version from 2018).

The code in `index.js` uses `formatDistanceToNowStrict()` function which was added in **date-fns 2.0.0**.

This means the code will **FAIL** with the current version!

## Project Structure
```
exercise_2/
├── package.json          # Contains date-fns 1.30.1
├── index.js              # Uses formatDistanceToNowStrict() function
└── README.md             # This file
```

## Your Task
1. Install dependencies with `npm install`
2. Try to run the code with `npm start` - it will **FAIL**
3. Update date-fns to version 2.0.0 or higher
4. Run the code again - it will **WORK**

## Setup Instructions
```bash
# Install dependencies
npm install

# Run the application (will fail with old version)
npm start

# After updating date-fns, it will work!
```

## Expected Error
```
Error: Cannot find module 'formatDistanceToNowStrict'
or
TypeError: formatDistanceToNowStrict is not a function
```

## Solution
Update date-fns in package.json to version 2.0.0 or higher, then run `npm install` again.
