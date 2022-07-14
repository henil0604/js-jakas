# Js-Jakas

Javascript Runtime wrapper for adding additional functionalities to your code.

## Installation

```bash
npm i -g js-jakas
```

## Running a File
```bash
js-jakas <file>
```


## Functionalities

### Top Level Await

This Wrapper Functionality provides top level await for your code.

```js
const sleep = (ms)=>{return new Promise(resolve=>{setTimeout(resolve, ms)})};

console.log("Hello Before");
await sleep(2000);
console.log("Hello After");
```


### Direct Usage for NPM Packages

Sometimes you don't you are tired of installing packages manually, so this wrapper functionality automatically downloads and install a package that your try to `require` and puts it into separate space so the wrapper can use it again when you run the code.

- However, you will have to use await for this, but no worries because there is top-level-await.

```js
const express = await require("express")
const app = express();

...
```

- By Default when the package is installed it will be stored in `.jsjakas` folder at your workspace, but if you don't want to store the installed module, you can set `require.autoUnrequire` to `true`;

```js
require.autoUnrequire = true;
const module = await require("<moduleName>"); // Module loaded

...

const module2 = await require("<sameModuleNameAsBefore>") // Module will download again

```

- You can also `unrequire` a module when you don't need it anymore

```js
unrequire("<moduleName>");
```

### More Wrapper Functionalities Coming Soon...

-------------

# Coded By [Henil Malaviya](https://github.com/henil0604) With ❤️
