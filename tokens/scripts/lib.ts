// Seraphim.co — utilitários compartilhados pelos scripts de tokens.
// Só sintaxe apagável (roda direto no Node 24 com type stripping).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };
export type Tier = 'primitive' | 'semantic' | 'component';

export interface Token {
  path: string;
  type: string;
  value: Json;
  description: string;
  ext: JsonObject;
  groupExt: JsonObject;
  tier: Tier;
  /** Mensagem de `$deprecated` (DTCG), ou null se o token está em vigor. */
  deprecated: string | null;
}

export interface ColorValue { colorSpace: string; components: number[]; hex: string; alpha?: number }
export interface Dimension { value: number; unit: string }

export const TOKENS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = join(TOKENS_DIR, 'seraphim.tokens.json');
export const DIST = join(TOKENS_DIR, 'dist');

const REF = /^\{([^{}]+)\}$/;
const PREFIX_DROP = new Set(['dimension']);

export function fail(message: string): never {
  console.error(`ERRO: ${message}`);
  process.exit(1);
}

function isObject(v: Json | undefined): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function seraphimExt(node: JsonObject): JsonObject {
  const ext = node['$extensions'];
  if (!isObject(ext)) return {};
  const own = ext['co.seraphim'];
  return isObject(own) ? own : {};
}

export function loadSource(path: string = SOURCE): JsonObject {
  const parsed: Json = JSON.parse(readFileSync(path, 'utf8'));
  if (!isObject(parsed)) fail(`${path} não é um objeto JSON`);
  return parsed;
}

/** Percorre os grupos DTCG e devolve os tokens na ordem em que aparecem. */
export function walk(node: JsonObject, path: string[] = [], inherited?: string): Map<string, Token> {
  const out = new Map<string, Token>();
  const ownType = typeof node['$type'] === 'string' ? node['$type'] : inherited;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || !isObject(child)) continue;
    const childPath = [...path, key];
    if ('$value' in child) {
      const ext = seraphimExt(child);
      const groupExt = seraphimExt(node);
      const tierRaw = ext['tier'] ?? groupExt['tier'] ?? 'primitive';
      const type = typeof child['$type'] === 'string' ? child['$type'] : ownType;
      if (!type) fail(`token sem $type: ${childPath.join('.')}`);
      out.set(childPath.join('.'), {
        path: childPath.join('.'),
        type,
        value: child['$value'] as Json,
        description: typeof child['$description'] === 'string' ? child['$description'] : '',
        ext,
        groupExt,
        tier: tierRaw === 'semantic' || tierRaw === 'component' ? tierRaw : 'primitive',
        deprecated: typeof child['$deprecated'] === 'string' ? child['$deprecated'] : child['$deprecated'] === true ? 'Obsoleto.' : null,
      });
    } else {
      const childType = typeof child['$type'] === 'string' ? child['$type'] : ownType;
      for (const [p, t] of walk(child, childPath, childType)) out.set(p, t);
    }
  }
  return out;
}

export function cssName(path: string): string {
  const parts = path.split('.');
  if (PREFIX_DROP.has(parts[0] ?? '')) parts.shift();
  return parts.join('-');
}

export function refTarget(value: Json): string | undefined {
  return typeof value === 'string' ? REF.exec(value)?.[1] : undefined;
}

export function resolve(tokens: Map<string, Token>, path: string, seen: string[] = []): Json {
  if (seen.includes(path)) fail(`ciclo de alias em ${[...seen, path].join(' -> ')}`);
  const token = tokens.get(path);
  if (!token) fail(`alias para token inexistente: ${path} (de ${seen.at(-1) ?? '?'})`);
  const target = refTarget(token.value);
  return target ? resolve(tokens, target, [...seen, path]) : token.value;
}

export function asColor(v: Json): ColorValue {
  if (!isObject(v) || typeof v['hex'] !== 'string' || !Array.isArray(v['components'])) fail(`cor inválida: ${JSON.stringify(v)}`);
  const color: ColorValue = { colorSpace: String(v['colorSpace']), components: v['components'].map(Number), hex: v['hex'] };
  if (typeof v['alpha'] === 'number') color.alpha = v['alpha'];
  return color;
}

export function asDimension(v: Json): Dimension {
  if (!isObject(v) || typeof v['value'] !== 'number' || typeof v['unit'] !== 'string') fail(`dimensão inválida: ${JSON.stringify(v)}`);
  return { value: v['value'], unit: v['unit'] };
}

export const fmt = (n: number): string => String(Number(n.toPrecision(6)));
export const dim = (v: Json): string => { const d = asDimension(v); return `${fmt(d.value)}${d.unit}`; };

export function rgba(v: Json): string {
  const c = asColor(v);
  const a = c.alpha ?? 1;
  if (a === 1) return c.hex.toLowerCase();
  const [r, g, b] = c.components.map((x) => Math.round(x * 255));
  return `rgba(${r}, ${g}, ${b}, ${fmt(a)})`;
}

export function hexa(v: Json): string {
  const c = asColor(v);
  const a = c.alpha ?? 1;
  return a === 1 ? c.hex.toLowerCase() : c.hex.toLowerCase() + Math.round(a * 255).toString(16).padStart(2, '0');
}

function luminance(v: Json): number {
  const hex = asColor(v).hex.replace('#', '');
  const ch = (i: number): number => {
    const x = parseInt(hex.slice(i, i + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}

export function contrast(a: Json, b: Json): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Valor CSS de um token não-tipográfico; aliases viram var(). */
export function cssValue(token: Token): string {
  const target = refTarget(token.value);
  if (target) return `var(--${cssName(target)})`;
  const v = token.value;
  switch (token.type) {
    case 'color': return rgba(v);
    case 'dimension':
    case 'duration': return dim(v);
    case 'fontFamily': {
      const families = Array.isArray(v) ? v.map(String) : [String(v)];
      return families.map((f) => (f.includes(' ') ? `'${f}'` : f)).join(', ');
    }
    case 'number': {
      const unit = token.ext['unit'] ?? token.groupExt['unit'] ?? '';
      return `${fmt(Number(v))}${String(unit)}`;
    }
    case 'fontWeight': return String(v);
    case 'cubicBezier': return `cubic-bezier(${(v as number[]).map(fmt).join(', ')})`;
    case 'shadow': {
      if (!isObject(v)) fail(`sombra inválida em ${token.path}`);
      const colorRef = refTarget(v['color'] ?? null);
      const color = colorRef ? `var(--${cssName(colorRef)})` : rgba(v['color'] ?? null);
      return `${dim(v['offsetX'] ?? null)} ${dim(v['offsetY'] ?? null)} ${dim(v['blur'] ?? null)} ${dim(v['spread'] ?? null)} ${color}`;
    }
    default: fail(`tipo sem saída CSS: ${token.type} em ${token.path}`);
  }
}

/** Primitivos de cor são privados: só outros tokens podem apontar para eles. */
export function colorPrimitives(tokens: Map<string, Token>): Set<string> {
  return new Set([...tokens.values()].filter((t) => t.type === 'color' && t.tier === 'primitive').map((t) => cssName(t.path)));
}

export function version(source: JsonObject): string {
  const ext = seraphimExt(source);
  const v = ext['version'];
  if (typeof v !== 'string' || !/^\d+\.\d+\.\d+$/.test(v)) fail('versão ausente ou inválida em $extensions["co.seraphim"].version');
  return v;
}
