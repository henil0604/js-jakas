const { VM } = require('vm2');
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");
const log = require("./log")

const ERROR = (message) => {
    throw new Error(message);
}

function execute(command) {

    return new Promise(function (resolve) {

        childProcess.exec(command, function (error, standardOutput, standardError) {
            if (error) {
                resolve(error);

                return;
            }

            if (standardError) {
                resolve(standardError);

                return;
            }

            resolve(standardOutput);
        });
    });
}

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

const Codify = (code) => {

    code = code.replace("module.exports = ", "return ");
    code = code.replace("module.exports=", "return ");
    code = code.replace("module.exports =", "return ");
    code = code.replace("module.exports= ", "return ");
    code = code.replace("export default ", "return ");
    code = code.replace("exports ", "return ");


    return `
const C = (async function(){
${code}
})();

module.exports = C;
`
}

const CreateContext = (FILE) => {
    let Context = {};

    Context.require = (moduleName) => {

        if (!moduleName) {
            ERROR("Module Name is required!");
        }

        return new Promise(async resolve => {

            try {

                const modulePath = require.resolve(path.resolve(FILE.dir, moduleName))
                let code = Codify(fs.readFileSync(modulePath, "utf-8"))

                let NEWFILE = {
                    path: modulePath,
                    ext: null,
                    content: null,
                    name: null
                }

                NEWFILE.name = path.basename(NEWFILE.path)
                NEWFILE.dir = path.dirname(NEWFILE.path)
                NEWFILE.ext = NEWFILE.path.split('.').pop();

                module = await RUN(code, CreateContext(NEWFILE), path.basename(modulePath));

                return resolve(module);
            } catch (e) {
                // Downloading Dynamic Package

                const JSJAKAS = path.resolve(process.cwd(), ".jsjakas");
                const modulePath = path.resolve(JSJAKAS, "node_modules", moduleName);

                if (fs.existsSync(JSJAKAS) === false) {
                    fs.mkdirSync(JSJAKAS);
                    let json = {
                        name: Date.now().toString(),
                        version: "1.0.0",
                        description: "",
                        main: "index.js",
                        scripts: {},
                    }
                    fs.writeFileSync(path.resolve(JSJAKAS, "package.json"), JSON.stringify(json));
                    return resolve(Context.require(moduleName));
                }

                if (fs.existsSync(modulePath) === true) {
                    return resolve(require(modulePath));
                }


                let i = 1;
                let interval = setInterval(() => {
                    if (i > 3) {
                        i = 1;
                        return;
                    }
                    log.clear()
                    log(`Installing ${moduleName} ${'.'.repeat(i)}`.cyan.bold, true);
                    i++
                }, 100);

                try {
                    const install = await execute(`cd "${JSJAKAS}" && npm i ${moduleName}`);

                    clearInterval(interval)
                    log.clear();

                    const module = require(modulePath);

                    if (Context.require.autoUnrequire === true) {
                        Context.unrequire(moduleName);
                    }

                    return resolve(module);
                } catch (e) {
                    clearInterval(interval)
                    log.clear();
                    log(`Failed to install Module ${moduleName}`.red.bold)
                    log(`Exiting...`.red.bold)
                    process.exit(1)
                }
            }

        })


    }
    Context.require.autoUnrequire = false;


    Context.unrequire = (moduleName) => {

        if (!moduleName) {
            ERROR("Module Name is required!");
        }

        const JSJAKAS = path.resolve(process.cwd(), ".jsjakas");
        const modulePath = path.resolve(JSJAKAS, "node_modules", moduleName);

        if (fs.existsSync(JSJAKAS) === false) {
            return true;
        }

        if (fs.existsSync(modulePath) === false) {
            return true;
        }

        deleteFolderRecursive(modulePath)
    }


    return Context;
}

const RUN = async (code, exposed = {}, filename) => {

    let sandbox = {
        console,
        ...global,
        ...globalThis,
        process,
        module,
        require,
        ...exposed,
    }

    const vm = new VM({
        console: 'inherit',
        sandbox,
    });

    const run = await vm.run(code, {
        filename
    });

    return run;
}

module.exports = {
    ERROR,
    RUN,
    CreateContext,
    Codify
}