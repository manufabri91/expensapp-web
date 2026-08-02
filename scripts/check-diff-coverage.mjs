#!/usr/bin/env node
// Enforces the same 80% rule Codecov's "patch" check applies in CI (see ../codecov.yml), but
// locally and pre-push: only lines added/changed under src/ since the branch diverged from
// origin/develop need to be covered - untested pre-existing code is never penalized. Run manually
// with `npm run check:diff-coverage`; wired into .husky/pre-push automatically.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const THRESHOLD_PERCENT = 80;
const BASE_REF = process.env.DIFF_BASE_REF || 'origin/develop';
const LCOV_PATH = path.join('coverage', 'lcov.info');
// Jest's own JS entry point, not the node_modules/.bin/jest shell wrapper - the wrapper is a
// .cmd/.ps1 file on Windows that execFileSync can't spawn directly without a shell.
const JEST_BIN = path.join('node_modules', 'jest', 'bin', 'jest.js');

const run = (command, args) => execFileSync(command, args, { encoding: 'utf8' });

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const findMergeBase = () => {
  const [remote, branch] = BASE_REF.includes('/') ? BASE_REF.split('/') : [null, BASE_REF];
  if (remote) {
    try {
      run('git', ['fetch', '--quiet', remote, branch]);
    } catch {
      console.warn(`Could not fetch ${BASE_REF}; diffing against whatever is already fetched locally.`);
    }
  }
  try {
    return run('git', ['merge-base', 'HEAD', BASE_REF]).trim();
  } catch {
    console.warn(`Could not find a merge base with ${BASE_REF}; skipping diff-coverage check.`);
    process.exit(0);
  }
};

// Parses a unified diff (-U0) into { file -> [added line numbers in the new version] }.
const collectAddedLines = (mergeBase, files) => {
  const addedLinesByFile = new Map();
  for (const file of files) {
    const diffOutput = run('git', ['diff', '-U0', mergeBase, 'HEAD', '--', file]);
    const addedLines = [];
    let newLineCursor = null;
    for (const line of diffOutput.split('\n')) {
      const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
      if (hunkMatch) {
        newLineCursor = Number(hunkMatch[1]);
        continue;
      }
      if (newLineCursor === null) continue;
      if (line.startsWith('+++') || line.startsWith('---')) continue;
      if (line.startsWith('+')) {
        addedLines.push(newLineCursor);
        newLineCursor += 1;
      } else if (!line.startsWith('-')) {
        newLineCursor += 1;
      }
    }
    if (addedLines.length > 0) addedLinesByFile.set(file, addedLines);
  }
  return addedLinesByFile;
};

// Builds { "src/normalized/path.tsx" -> Map<lineNr, hitCount> } from Jest's lcov.info. SF: paths
// use backslashes on Windows, so they're normalized to forward slashes to match git's output.
const parseLcov = (lcovText) => {
  const coverageByFile = new Map();
  let currentLines = null;
  for (const line of lcovText.split('\n')) {
    if (line.startsWith('SF:')) {
      const file = line.slice(3).trim().replace(/\\/g, '/');
      currentLines = new Map();
      coverageByFile.set(file, currentLines);
    } else if (line.startsWith('DA:') && currentLines) {
      const [nr, hits] = line.slice(3).split(',');
      currentLines.set(Number(nr), Number(hits));
    } else if (line.startsWith('end_of_record')) {
      currentLines = null;
    }
  }
  return coverageByFile;
};

const mergeBase = findMergeBase();

const changedFiles = run('git', ['diff', '--name-only', '--diff-filter=ACMR', mergeBase, 'HEAD', '--', 'src'])
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => /\.(ts|tsx)$/.test(line))
  .filter((line) => !/\.(test|spec)\.(ts|tsx)$/.test(line))
  .filter((line) => !line.includes('__tests__/') && !line.includes('testFixtures/'));

if (changedFiles.length === 0) {
  console.log('No changed src files - skipping diff-coverage check.');
  process.exit(0);
}

const addedLinesByFile = collectAddedLines(mergeBase, changedFiles);
if (addedLinesByFile.size === 0) {
  console.log('No added lines in changed files - skipping diff-coverage check.');
  process.exit(0);
}

console.log('Running `jest --coverage` to produce a fresh coverage report...');
try {
  run('node', [JEST_BIN, '--coverage', '--silent', '--ci']);
} catch {
  fail('Tests failed - fix them before pushing.');
}

if (!existsSync(LCOV_PATH)) {
  fail(`Expected a coverage report at ${LCOV_PATH} but none was found.`);
}

const coverageByFile = parseLcov(readFileSync(LCOV_PATH, 'utf8'));

let coveredCount = 0;
let coverableCount = 0;
const uncoveredByFile = new Map();

for (const [file, addedLines] of addedLinesByFile) {
  const coverage = coverageByFile.get(file);
  if (!coverage) continue; // Not instrumented (e.g. a type-only file, or untouched by any test).

  for (const lineNr of addedLines) {
    if (!coverage.has(lineNr)) continue; // Not a coverable line (blank, comment, brace, import).

    coverableCount += 1;
    if (coverage.get(lineNr) > 0) {
      coveredCount += 1;
    } else {
      const list = uncoveredByFile.get(file) ?? [];
      list.push(lineNr);
      uncoveredByFile.set(file, list);
    }
  }
}

if (coverableCount === 0) {
  console.log('No coverable added lines (only comments/imports/braces changed) - skipping diff-coverage check.');
  process.exit(0);
}

const percentage = (coveredCount / coverableCount) * 100;
console.log(`\nDiff coverage: ${coveredCount}/${coverableCount} lines covered (${percentage.toFixed(1)}%)\n`);

if (percentage + 1e-9 < THRESHOLD_PERCENT) {
  console.error(`Uncovered added lines (need ${THRESHOLD_PERCENT}% diff coverage):`);
  for (const [file, lineNrs] of uncoveredByFile) {
    console.error(`  ${file}: ${lineNrs.join(', ')}`);
  }
  fail(`Diff coverage ${percentage.toFixed(1)}% is below the ${THRESHOLD_PERCENT}% threshold.`);
}

console.log('Diff coverage check passed.');
