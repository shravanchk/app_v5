#!/usr/bin/env node
// Regenerates the downloadable dataset behind /india-take-home-salary-report.
// The CSV is committed so it is a plain static file people can link to; the
// test in test/indiaTakeHomeReport.test.js fails if it drifts from the engine.
const fs = require('fs');
const path = require('path');
const { toCSV } = require('../utils/indiaTakeHomeReport');

const target = path.join(__dirname, '..', 'public', 'data', 'india-take-home-fy-2026-27.csv');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, toCSV());
console.log(`wrote ${path.relative(process.cwd(), target)}`);
