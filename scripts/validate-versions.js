#!/usr/bin/env node

// Ensure matching version numbers in package.json and package-lock.json
const { version: packageVersion } = require('../package.json');
const { version: packageLockVersion } = require('../package-lock.json');
if (packageVersion === packageLockVersion) {
  const foregroundGreen = '\x1b[32m%s\x1b[0m';
  console.info(
    foregroundGreen,
    `✔ Versions match: package.json (${packageVersion}) vs package-lock.json (${packageLockVersion})`
  );
} else {
  const foregroundRed = '\x1b[31m%s\x1b[0m';
  console.error(
    foregroundRed,
    `✘ Version mismatch: package.json (${packageVersion}) vs package-lock.json (${packageLockVersion})`
  );
  process.exitCode = 1;
}
