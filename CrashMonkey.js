const del = require("del");
const Promise = require("promise");

const argv = require('minimist')(process.argv.slice(2));
const child_process = require("child_process");

const REPOS_DIR = "repos";
const REPOS_PATH = REPOS_DIR + "/";

if(!argv["url"] || !argv["test-engine"]) {
	console.log("Usage: node CrashMonk.js [--config] --url=<repo URL> --test-engine=<test engine> [--test-dir=<test folder path>] [--num-commits=<filter commits num>]");
	process.exit(0);
}

function cleanRepos() {
	del.sync(REPOS_PATH + "**", {force: true});
	child_process.execSync("mkdir " + REPOS_DIR);
}

function getRepo(repoURL) {
	return new Promise((resolve, reject) => {
		child_process.exec('git clone ' + repoURL, {cwd: "repos"} , (error, stdout, stderr) => {
			if (error !== null) {
				console.log(`exec error: ${error}`);
				process.exit(1);
			}
			resolve(/\/([^\/]+).git$/.exec(repoURL)[1]);
		});
	});
}

function installDeps(repoName) {
	
}

function main() {
	cleanRepos();
	getRepo(argv["url"])
		.then(installDeps);
}

main();
