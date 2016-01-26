const del = require("del");
const Promise = require("promise");
const fs = require("fs");

const argv = require('minimist')(process.argv.slice(2));
const child_process = require("child_process");

const REPOS_DIR = "repos";
const REPOS_PATH = REPOS_DIR + "/";

if(!argv["url"] || !argv["test-engine"]) {
	console.log("Usage: node CrashMonk.js [--config] --url=<repo URL> --test-engine=<test engine> [--test-dir=<test folder path>] [--num-commits=<filter commits num>]");
	process.exit(0);
}

function cleanRepos() {
	console.log("Cleaning Repos Directory");
	del.sync(REPOS_PATH + "**", {force: true});
	child_process.execSync("mkdir " + REPOS_DIR);
}

function getRepo(repoURL) {
	child_process.execSync('git clone ' + repoURL, {cwd: REPOS_DIR});
	return /\/([^\/]+).git$/.exec(repoURL)[1];
}

function installDeps(repoName) {
	var packageJSON = fs.readFileSync(REPOS_PATH + repoName + "/package.json", {encoding: "utf8"});
	packageJSON = JSON.parse(packageJSON);
	
	console.log("Installing Dependencies");
	var installRes = child_process.execSync("npm install", {cwd: REPOS_PATH + repoName});
	console.log("Done");
}

function main() {
	console.log("");
	cleanRepos();
	var repoName = getRepo(argv["url"]);
	installDeps(repoName);
}

main();
