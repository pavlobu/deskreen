#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const {execSync, spawnSync} = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const rootPackagePath = path.join(rootDir, 'package.json');
const clientPackagePath = path.join(rootDir, 'src', 'client-viewer', 'package.json');
const envPath = path.join(rootDir, 'src', 'client-viewer', '.env');

const bumpFlags = new Map([
	['--major', 'major'],
	['--minor', 'minor'],
	['--patch', 'patch']
]);

const parsedArgs = parseArgs(process.argv.slice(2));

void main(parsedArgs).catch((error) => {
	if (error instanceof Error) {
		console.error(error.message);
	} else {
		console.error(error);
	}
	process.exit(1);
});

function parseArgs(argv) {
	const matchedFlags = argv.filter((arg) => bumpFlags.has(arg));
	if (matchedFlags.length === 0) {
		throw new Error('Missing bump flag. Use one of --major, --minor, or --patch.');
	}
	if (matchedFlags.length > 1) {
		throw new Error('Multiple bump flags provided. Please supply only one.');
	}
	return {
		type: bumpFlags.get(matchedFlags[0])
	};
}

async function main({type}) {
	process.chdir(rootDir);
	await ensureCleanGit();
	const currentVersion = await readVersion();
	const nextVersion = bumpVersion(currentVersion, type);
	await Promise.all([
		writeRootPackage(nextVersion),
		writeClientPackage(nextVersion),
		writeEnv(nextVersion)
	]);
	await stageFiles();
	await commit(nextVersion);
	await tag(nextVersion);
	console.log(`Version bumped from ${currentVersion} to ${nextVersion}`);
}

async function ensureCleanGit() {
	const output = execSync('git status --porcelain', {encoding: 'utf8'}).trim();
	if (output.length > 0) {
		throw new Error('Working tree is not clean. Please commit or stash changes before bumping the version.');
	}
}

async function readVersion() {
	const raw = await fs.readFile(rootPackagePath, 'utf8');
	const parsed = JSON.parse(raw);
	const version = parsed.version;
	if (typeof version !== 'string') {
		throw new Error('Root package.json does not contain a valid version.');
	}
	assertValidSemver(version);
	return version;
}

async function writeRootPackage(version) {
	await updatePackageJSON(rootPackagePath, version);
}

async function writeClientPackage(version) {
	await updatePackageJSON(clientPackagePath, version);
}

async function updatePackageJSON(filePath, version) {
	const raw = await fs.readFile(filePath, 'utf8');
	const parsed = JSON.parse(raw);
	parsed.version = version;
	const value = `${JSON.stringify(parsed, null, 2)}\n`;
	await fs.writeFile(filePath, value, 'utf8');
}

async function writeEnv(version) {
	const raw = await fs.readFile(envPath, 'utf8');
	const lines = raw.split(/\r?\n/);
	let replaced = false;
	const nextLines = lines.map((line) => {
		if (line.startsWith('VITE_CLIENT_VIEWER_VERSION=')) {
			replaced = true;
			return `VITE_CLIENT_VIEWER_VERSION=${version}`;
		}
		return line;
	});
	if (!replaced) {
		nextLines.push(`VITE_CLIENT_VIEWER_VERSION=${version}`);
	}
	await fs.writeFile(envPath, `${nextLines.join('\n')}\n`, 'utf8');
}

function bumpVersion(current, type) {
	const [major, minor, patch] = current.split('.').map(Number);
	if ([major, minor, patch].some((part) => Number.isNaN(part))) {
		throw new Error(`Unable to bump version. Invalid semantic version: ${current}`);
	}
	if (type === 'major') {
		return `${major + 1}.0.0`;
	}
	if (type === 'minor') {
		return `${major}.${minor + 1}.0`;
	}
	return `${major}.${minor}.${patch + 1}`;
}

function assertValidSemver(value) {
	const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;
	if (!semverPattern.test(value)) {
		throw new Error(`Invalid semantic version: ${value}`);
	}
}

async function stageFiles() {
	execSync(
		`git add ${quote(rootPackagePath)} ${quote(clientPackagePath)}`,
		{stdio: 'inherit'}
	);
}

async function commit(version) {
	const message = version;
	execSync(`git commit -m ${quote(message)}`, {stdio: 'inherit'});
}

async function tag(version) {
	const tagName = `v${version}`;
	const result = spawnSync('git', ['show-ref', '--tags', '--quiet', `refs/tags/${tagName}`]);
	if (result.status === 0) {
		throw new Error(`Tag ${tagName} already exists.`);
	}
	if (result.status !== 1) {
		throw result.error ?? new Error(`git show-ref failed with status ${result.status ?? 'unknown'}`);
	}
	execSync(`git tag ${quote(tagName)}`, {stdio: 'inherit'});
}

function quote(value) {
	return `'${value.replace(/'/g, "'\\''")}'`;
}

