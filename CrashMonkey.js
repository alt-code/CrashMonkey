const del = require("del");

const argv = require('minimist')(process.argv.slice(2));
const child_process = require("child_process");

if(!argv["url"] || !argv["test-engine"]) {
	console.log("Usage: node CrashMonk.js [--config] --url=<repo URL> --test-engine=<test engine> [--test-dir=<test folder path>] [--num-commits=<filter commits num>]");
	process.exit(0);
}

function cleanRepos() {
	del.sync("repos/**");
	child_process.execSync("mkdir repos");
}

function getRepo(repoURL) {
	child_process.exec('git clone ' + repoURL, {cwd: "repos"} , (error, stdout, stderr) => {
		if (error !== null) {
			console.log(`exec error: ${error}`);
			process.exit(1);
		}
	});
}

function main() {
	cleanRepos();
	getRepo(argv["url"]);
}

main();
