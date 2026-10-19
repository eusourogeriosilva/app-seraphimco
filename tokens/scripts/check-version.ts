// Seraphim.co — exige versão nova e CHANGELOG quando os tokens mudam.
// Uso: node tokens/scripts/check-version.ts [--base origin/main]
//
// Regra de semver:
//   token removido ou renomeado  → major
//   token novo                   → minor
//   valor ou descrição alterados → patch
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { SOURCE, TOKENS_DIR, type JsonObject, fail, version, walk } from './lib.ts';

const i = process.argv.indexOf('--base');
const base = i > 0 ? process.argv[i + 1] ?? 'origin/main' : 'origin/main';
const repoPath = relative(execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim(), SOURCE).replaceAll('\\', '/');

let before: JsonObject;
try {
  before = JSON.parse(execFileSync('git', ['show', `${base}:${repoPath}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
} catch {
  console.log(`versão: ${repoPath} não existe em ${base}; primeira versão, nada a comparar.`);
  process.exit(0);
}
const after: JsonObject = JSON.parse(readFileSync(SOURCE, 'utf8'));

const flat = (src: JsonObject) => new Map([...walk(src)].map(([p, t]) => [p, JSON.stringify([t.type, t.value, t.description, t.deprecated, t.ext['responsive'] ?? null])]));
const a = flat(before);
const b = flat(after);
const removed = [...a.keys()].filter((k) => !b.has(k));
const added = [...b.keys()].filter((k) => !a.has(k));
const changed = [...b.keys()].filter((k) => a.has(k) && a.get(k) !== b.get(k));

if (!removed.length && !added.length && !changed.length) {
  console.log('versão: tokens sem mudança em relação à base.');
  process.exit(0);
}

const need = removed.length ? 'major' : added.length ? 'minor' : 'patch';
const parse = (v: string) => v.split('.').map(Number) as [number, number, number];
const [M0, m0, p0] = parse(version(before));
const [M1, m1, p1] = parse(version(after));
const bump = M1 > M0 ? 'major' : M1 === M0 && m1 > m0 ? 'minor' : M1 === M0 && m1 === m0 && p1 > p0 ? 'patch' : 'nenhum';
const rank = { nenhum: 0, patch: 1, minor: 2, major: 3 } as const;

console.log(`versão: ${version(before)} → ${version(after)} · removidos ${removed.length}, novos ${added.length}, alterados ${changed.length}`);
if (removed.length) console.log(`  removidos: ${removed.join(', ')}`);
if (rank[bump] < rank[need]) fail(`a mudança exige versão ${need}, mas o bump foi ${bump}. Atualize $extensions["co.seraphim"].version.`);

const changelog = readFileSync(join(TOKENS_DIR, 'CHANGELOG.md'), 'utf8');
if (!new RegExp(`^## \\[?${version(after).replaceAll('.', '\\.')}\\]?`, 'm').test(changelog)) {
  fail(`CHANGELOG.md não tem a seção "## ${version(after)}".`);
}
console.log('versão: ok.');
