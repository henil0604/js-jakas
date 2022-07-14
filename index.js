#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const { Codify, ERROR, RUN, CreateContext } = require("./lib/utils")

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv

let FILE_DEST = argv._[0];
FILE_DEST = path.resolve(process.cwd(), FILE_DEST);

let FILE = {
    path: FILE_DEST,
    ext: null,
    content: null,
    name: null
}

FILE.name = path.basename(FILE.path)
FILE.dir = path.dirname(FILE.path)
FILE.ext = FILE.path.split('.').pop();


// Exists Check
if (fs.existsSync(FILE.path) === false) {
    ERROR(`Module ${FILE.path} not found`)
}

FILE.content = fs.readFileSync(FILE.path, "utf8");

const CODE = Codify(FILE.content)


let Context = CreateContext(FILE);

RUN(CODE, Context, FILE.name)