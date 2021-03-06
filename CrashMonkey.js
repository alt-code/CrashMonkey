const del = require("del");
const Promise = require("promise");
const fs = require("fs");

const TestEngineParser = require("./lib/TestEngineParser.js");
const Util = require("./lib/Util.js");

const argv = require('minimist')(process.argv.slice(2));
const child_process = require("child_process");

const REPOS_DIR = "repos";
const REPOS_PATH = REPOS_DIR + "/";
const PROGRAM_MODE = argv["mode"];

if(!PROGRAM_MODE) {
	console.log("Usage: node CrashMonk.js [--config] --mode=fetch/generate --url=<repo URL> --test-engine=<test engine> [--test-dir=<test folder path>] [--num-commits=<filter commits num>]");
	process.exit(0);
}

if(PROGRAM_MODE === "fetch" & (!argv["url"] || !argv["test-engine"])) {
	console.log("Usage: node CrashMonk.js [--config] --mode=fetch/generate --url=<repo URL> --test-engine=<test engine> [--test-dir=<test folder path>] [--num-commits=<filter commits num>]");
	process.exit(0);
}

if(PROGRAM_MODE === "generate" & (!argv["url"] || !argv["test-engine"])) {
	console.log("Usage: node CrashMonk.js [--config] --mode=fetch/generate --url=<repo URL> --test-engine=<test engine> [--test-dir=<test folder path>] [--num-commits=<filter commits num>]");
	process.exit(0);
}

function cleanRepos() {
	console.log("Cleaning Repos Directory");
	del.sync(REPOS_PATH + "**", {force: true});
	child_process.execSync("mkdir " + REPOS_DIR);
}

function getRepo(repoURL) {
	child_process.execSync('git clone ' + repoURL, {cwd: REPOS_DIR});
	return Util.repoNamefromURL(repoURL);
}

function installDeps(repoName) {
	var packageJSON = fs.readFileSync(REPOS_PATH + repoName + "/package.json", {encoding: "utf8"});
	packageJSON = JSON.parse(packageJSON);
	
	console.log("Installing Dependencies");
	var installRes = child_process.execSync("npm install --progress=false", {cwd: REPOS_PATH + repoName});
	console.log("Done");
}

function main() {
	console.log("");
	
	if(PROGRAM_MODE === "fetch") {
		cleanRepos();
		var repoName = getRepo(argv["url"]);
		installDeps(repoName);
	}
    if(PROGRAM_MODE === "generate") {
        var repoName = Util.repoNamefromURL(argv["url"]);
        process.env.PATH = process.env.PATH + ";" + __dirname + "\\repos\\" + repoName + "\\node_modules\\.bin";
        var parser = new TestEngineParser("TAP", {
            repoPath: REPOS_PATH + repoName
        });
        parser.runTestCases();
    }
}

main();
