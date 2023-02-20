#!/usr/bin/env node

/* eslint-disable */
const { readFile, writeFile, copy } = require('fs-extra');

const { resolve, join, basename } = require('path');

const packagePath = process.cwd();
const distPath = join(packagePath, './dist');

const writeJson = (targetPath, obj) => writeFile(targetPath, JSON.stringify(obj, null, 2), 'utf8');

async function createPackageFile() {
  const packageData = await readFile(resolve(packagePath, './package.json'), 'utf8');
  const { scripts, devDependencies, ...packageOthers } = JSON.parse(packageData);
  const newPackageData = {
    ...packageOthers,
    private: false,
    main: 'index.mjs',
    module: 'index.mjs',
    types: 'index.d.ts',
  };

  const targetPath = resolve(distPath, './package.json');

  await writeJson(targetPath, newPackageData);
  console.log(`Created package.json in ${targetPath}`);
}

async function addFile(file) {
  const sourcePath = resolve(packagePath, file);
  const targetPath = resolve(distPath, basename(file));
  await copy(sourcePath, targetPath);
  console.log(`Copied ${sourcePath} to ${targetPath}`);
}

async function run() {
  try {
    await createPackageFile();
    await addFile('../../../LICENSE');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
