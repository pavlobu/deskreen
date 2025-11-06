#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const {execSync, spawnSync} = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const rootPackagePath = path.join(rootDir, 'package.json');
const clientPackagePath = path.join(rootDir, 'src', 'client-viewer', 'package.json');
const envPath = path.join(rootDir, 'src', 'client-viewer', '.env');

void main().catch((error) => {
	if (error instanceof Error) {
		console.error(error.message);
	} else {
		console.error(error);
	}
	process.exit(1);
});

async function main() {
	process.chdir(rootDir);
	await ensureCleanGit();
	
	const latestTag = await getLatestVersionTag();
	if (!latestTag) {
		throw new Error('No version tag found. Nothing to undo.');
	}
	
	const tagVersion = latestTag.replace(/^v/, '');
	console.log(`Found latest version tag: ${latestTag} (version: ${tagVersion})`);
	
	const tagCommit = await getTagCommit(latestTag);
	const parentCommit = await getParentCommit(tagCommit);
	
	if (!parentCommit) {
		throw new Error('Cannot find parent commit. The version bump commit might be the first commit.');
	}
	
	const previousVersion = await getVersionFromCommit(parentCommit);
	console.log(`Previous version: ${previousVersion}`);
	
	await Promise.all([
		writeRootPackage(previousVersion),
		writeClientPackage(previousVersion),
		writeEnv(previousVersion)
	]);
	
	await deleteRemoteTag(latestTag);
	await deleteLocalTag(latestTag);
	
	console.log(`Version reverted from ${tagVersion} to ${previousVersion}`);
	console.log(`Tag ${latestTag} has been deleted locally and remotely (if it existed).`);
	console.log('Files have been updated. You may want to commit these changes.');
}

async function ensureCleanGit() {
	const output = execSync('git status --porcelain', {encoding: 'utf8'}).trim();
	if (output.length > 0) {
		throw new Error('Working tree is not clean. Please commit or stash changes before undoing the version bump.');
	}
}

async function getLatestVersionTag() {
	const result = spawnSync('git', ['tag', '--sort=-version:refname', '--list', 'v*'], {
		encoding: 'utf8'
	});
	
	if (result.status !== 0) {
		throw new Error('Failed to get git tags.');
	}
	
	const tags = result.stdout.trim().split('\n').filter(Boolean);
	return tags[0] || null;
}

async function getTagCommit(tagName) {
	const result = spawnSync('git', ['rev-parse', tagName], {encoding: 'utf8'});
	
	if (result.status !== 0) {
		throw new Error(`Failed to get commit for tag ${tagName}.`);
	}
	
	return result.stdout.trim();
}

async function getParentCommit(commitHash) {
	const result = spawnSync('git', ['rev-parse', `${commitHash}^`], {encoding: 'utf8'});
	
	if (result.status !== 0) {
		return null;
	}
	
	return result.stdout.trim();
}

async function getVersionFromCommit(commitHash) {
	const result = spawnSync('git', ['show', `${commitHash}:package.json`], {encoding: 'utf8'});
	
	if (result.status !== 0) {
		throw new Error(`Failed to read package.json from commit ${commitHash}.`);
	}
	
	const parsed = JSON.parse(result.stdout);
	const version = parsed.version;
	
	if (typeof version !== 'string') {
		throw new Error('Root package.json from parent commit does not contain a valid version.');
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
	let raw;
	try {
		raw = await fs.readFile(envPath, 'utf8');
	} catch (error) {
		if (error.code === 'ENOENT') {
			raw = '';
		} else {
			throw error;
		}
	}
	
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

function assertValidSemver(value) {
	const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;
	if (!semverPattern.test(value)) {
		throw new Error(`Invalid semantic version: ${value}`);
	}
}

async function deleteLocalTag(tagName) {
	const result = spawnSync('git', ['show-ref', '--tags', '--quiet', `refs/tags/${tagName}`]);
	
	if (result.status === 0) {
		execSync(`git tag -d ${quote(tagName)}`, {stdio: 'inherit'});
		console.log(`Deleted local tag: ${tagName}`);
	} else {
		console.log(`Local tag ${tagName} does not exist.`);
	}
}

async function deleteRemoteTag(tagName) {
	const result = spawnSync('git', ['ls-remote', '--tags', 'origin', tagName], {encoding: 'utf8'});
	
	if (result.status === 0 && result.stdout.trim().length > 0) {
		execSync(`git push origin :refs/tags/${quote(tagName)}`, {stdio: 'inherit'});
		console.log(`Deleted remote tag: ${tagName}`);
	} else {
		console.log(`Remote tag ${tagName} does not exist.`);
	}
}

function quote(value) {
	return `'${value.replace(/'/g, "'\\''")}'`;
}

