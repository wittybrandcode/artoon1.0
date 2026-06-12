const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const { parse } = require('../dist');

const fixturePath = path.resolve(__dirname, '../../artoon-examples/sample-article.artoon');
const fallback = `>.t1:: Benchmark Title\n>.p:: This is a benchmark paragraph.\n>.p:: Another paragraph with [s::modifier].`;

const source = fs.existsSync(fixturePath)
  ? fs.readFileSync(fixturePath, 'utf8')
  : fallback;

const iterations = 300;
const start = performance.now();
for (let i = 0; i < iterations; i++) {
  parse(source);
}
const end = performance.now();

const totalMs = end - start;
const avgMs = totalMs / iterations;

console.log('ARTOON Parser Benchmark');
console.log(`iterations: ${iterations}`);
console.log(`totalMs: ${totalMs.toFixed(2)}`);
console.log(`avgMs: ${avgMs.toFixed(4)}`);

// Large document benchmark
const largeDoc = source.repeat(50);
const startL = performance.now();
parse(largeDoc);
const endL = performance.now();
console.log('Large Document (50x):', (endL - startL).toFixed(4), 'ms');

// Incremental Update Benchmark
const { initIncremental, updateLine } = require('../dist');
const incrementalState = initIncremental(largeDoc);
const startI = performance.now();
for (let i = 0; i < 100; i++) {
  updateLine(incrementalState, 10, '>.p:: Updated line ' + i);
}
const endI = performance.now();
console.log('Incremental Update (100 updates on 50x doc):', (endI - startI).toFixed(4), 'ms');
console.log('Avg Incremental Update:', ((endI - startI) / 100).toFixed(4), 'ms');
