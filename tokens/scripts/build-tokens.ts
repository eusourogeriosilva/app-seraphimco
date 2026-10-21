// Seraphim.co — build de design tokens.
// Fonte: tokens/seraphim.tokens.json (W3C DTCG 2025.10).
// Saídas: tokens/dist/tokens.css, tokens/dist/tokens.ts, tokens/dist/design-system.tokens.json
// Uso: node tokens/scripts/build-tokens.ts [--check]
//   --check  não escreve nada; falha se dist/ estiver desatualizado em relação à fonte.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  DIST, type Dimension, type Json, type Token, asDimension, colorPrimitives, contrast, cssName, cssValue, dim, fail, fmt,
  hexa, loadSource, refTarget, rem, resolve, rgba, version, walk,
} from './lib.ts';

// Pares de contraste obrigatórios: [texto, fundo, mínimo WCAG 2.1]
const CONTRAST: ReadonlyArray<readonly [string, string, number]> = [
  ['color.text.primary', 'color.bg.page', 4.5], ['color.text.primary', 'color.bg.surface', 4.5],
  ['color.text.primary', 'color.bg.muted', 4.5],
  ['color.text.secondary', 'color.bg.page', 4.5], ['color.text.secondary', 'color.bg.surface', 4.5],
  ['color.text.secondary', 'color.bg.subtle', 4.5],
  ['color.text.brand', 'color.bg.page', 4.5], ['color.text.brand', 'color.bg.surface', 4.5],
  ['color.text.brand', 'color.bg.accent-subtle', 4.5],
  ['color.text.accent', 'color.bg.page', 4.5], ['color.text.accent', 'color.bg.surface', 4.5],
  ['color.text.on-brand', 'color.bg.brand', 4.5], ['color.text.on-brand', 'color.bg.brand-hover', 4.5],
  ['color.text.on-dark', 'color.bg.ink', 4.5], ['color.text.on-dark', 'color.bg.brand', 4.5],
  ['color.text.secondary-on-dark', 'color.bg.ink', 4.5],
  ['color.text.accent-on-dark', 'color.bg.brand', 4.5], ['color.text.accent-on-dark', 'color.bg.ink', 4.5],
  ['color.status.success', 'color.status.success-bg', 4.5], ['color.status.warning', 'color.status.warning-bg', 4.5],
  ['color.status.danger', 'color.status.danger-bg', 4.5], ['color.status.info', 'color.status.info-bg', 4.5],
  // botão primário
  ['color.button.primary-light-text', 'color.button.primary-light-bg', 4.5],
  ['color.button.primary-light-text', 'color.button.primary-light-bg-hover', 4.5],
  ['color.button.primary-dark-text', 'color.button.primary-dark-bg', 4.5],
  ['color.button.primary-dark-text', 'color.button.primary-dark-bg-hover', 4.5],
  // botão secundário
  ['color.button.secondary-light-text', 'color.button.secondary-light-bg-hover', 4.5],
  ['color.button.secondary-light-border', 'color.bg.surface', 3], ['color.button.secondary-light-border', 'color.bg.page', 3],
  ['color.button.secondary-dark-text', 'color.bg.brand', 4.5], ['color.button.secondary-dark-text', 'color.bg.ink', 4.5],
  ['color.button.secondary-dark-border', 'color.bg.brand', 3], ['color.button.secondary-dark-border', 'color.bg.ink', 3],
  ['color.button.secondary-dark-text-hover', 'color.button.secondary-dark-bg-hover', 4.5],
  // botão terciário
  ['color.button.tertiary-light-text', 'color.bg.page', 4.5], ['color.button.tertiary-light-text', 'color.bg.surface', 4.5],
  ['color.button.tertiary-light-underline', 'color.bg.surface', 3],
  ['color.button.tertiary-light-underline-hover', 'color.bg.surface', 3],
  ['color.button.tertiary-dark-text', 'color.bg.brand', 4.5], ['color.button.tertiary-dark-text', 'color.bg.ink', 4.5],
  ['color.button.tertiary-dark-underline', 'color.bg.brand', 3], ['color.button.tertiary-dark-underline', 'color.bg.ink', 3],
  ['color.button.tertiary-dark-text-hover', 'color.bg.brand', 4.5], ['color.button.tertiary-dark-text-hover', 'color.bg.ink', 4.5],
  ['color.button.tertiary-dark-underline-hover', 'color.bg.brand', 3], ['color.button.tertiary-dark-underline-hover', 'color.bg.ink', 3],
  ['color.border.control', 'color.bg.surface', 3], ['color.border.control', 'color.bg.page', 3],
  ['color.focus.ring', 'color.bg.page', 3], ['color.focus.ring', 'color.bg.surface', 3],
  ['color.focus.ring-on-dark', 'color.bg.brand', 3], ['color.focus.ring-on-dark', 'color.bg.ink', 3],
  // desabilitado e erro (texto desabilitado é isento na WCAG; o mínimo de 3 garante que siga legível)
  ['color.button.disabled-dark-text', 'color.bg.brand', 3], ['color.button.disabled-dark-text', 'color.bg.ink', 3],
  ['color.button.disabled-dark-border', 'color.bg.brand', 3], ['color.button.disabled-dark-border', 'color.bg.ink', 3],
  ['color.text.disabled', 'color.input.bg-disabled', 3], ['color.text.disabled', 'color.button.disabled-bg', 3],
  ['color.input.border-error', 'color.input.bg', 3], ['color.status.danger', 'color.input.bg', 4.5],
  // hover de campo: nunca abaixo do mínimo de borda de controle
  ['color.input.border-hover', 'color.input.bg', 3], ['color.input.border-hover', 'color.bg.page', 3],
  // campo somente leitura, link dentro do alerta, cartão clicável (hover) e modo de contraste aumentado
  ['color.text.primary', 'color.bg.subtle', 4.5],
  ['color.text.primary', 'color.status.success-bg', 4.5], ['color.text.primary', 'color.status.warning-bg', 4.5],
  ['color.text.primary', 'color.status.danger-bg', 4.5], ['color.text.primary', 'color.status.info-bg', 4.5],
  ['color.border.control', 'color.bg.subtle', 3],
  ['color.border.brand', 'color.bg.surface', 3], ['color.border.brand', 'color.bg.subtle', 3],
  ['color.border.strong', 'color.bg.page', 3], ['color.border.strong', 'color.bg.surface', 3],
];
// Reprovado por desenho: framboesa sobre grafite (2,3:1). Nenhum token "on-dark" ou "-dark-" pode resolver para ela.
const FORBIDDEN_ON_DARK = 'color.framboesa.600';

const check = process.argv.includes('--check');
const source = loadSource();
const tokens = walk(source);
for (const path of tokens.keys()) resolve(tokens, path);

// ---------- contraste
let failed = false;
for (const [fg, bg, min] of CONTRAST) {
  const r = contrast(resolve(tokens, fg), resolve(tokens, bg));
  if (r < min) { failed = true; console.error(`FALHA ${r.toFixed(2)}:1 (mín ${min}) ${fg} sobre ${bg}`); }
}
const forbidden = rgba(resolve(tokens, FORBIDDEN_ON_DARK));
for (const t of tokens.values()) {
  if (t.type === 'color' && t.tier !== 'primitive' && /on-dark|-dark-/.test(t.path) && rgba(resolve(tokens, t.path)) === forbidden) {
    failed = true; console.error(`FALHA: ${t.path} resolve para ${FORBIDDEN_ON_DARK}, reprovado sobre escuro`);
  }
}
if (failed) fail('par de contraste abaixo do mínimo');
console.log(`contraste: ${CONTRAST.length} pares aprovados`);

const typo = [...tokens.values()].filter((t) => t.type === 'typography');
const plain = [...tokens.values()].filter((t) => t.type !== 'typography');
const privateColors = colorPrimitives(tokens);
const ver = version(source);

interface TypoBand { fontSize: Dimension; lineHeight: number; letterSpacing: Dimension }
const TYPO_KEYS = new Set(['fontSize', 'lineHeight', 'letterSpacing']);

function typoParts(t: Token) {
  const v = t.value as { [k: string]: Json };
  const famRef = refTarget(v['fontFamily'] ?? null);
  if (!famRef) fail(`fontFamily de ${t.path} precisa ser alias`);
  const base: TypoBand = {
    fontSize: asDimension(v['fontSize'] ?? null),
    lineHeight: Number(v['lineHeight']),
    letterSpacing: asDimension(v['letterSpacing'] ?? null),
  };
  // Sobrescritas por faixa (md = tablet, sm = celular). Tracking não declarado mantém a razão em em do desktop.
  const bands: Record<string, TypoBand> = {};
  const r = t.ext['responsive'];
  let prev = base.fontSize.value;
  for (const [band] of BANDS) {
    const o = r && typeof r === 'object' && !Array.isArray(r) ? (r[band] as { [k: string]: Json } | undefined) : undefined;
    if (!o) continue;
    for (const k of Object.keys(o)) if (!TYPO_KEYS.has(k)) fail(`${t.path}: responsive.${band}.${k} não é aceito (fontSize, lineHeight, letterSpacing)`);
    const fontSize = o['fontSize'] ? asDimension(o['fontSize']) : base.fontSize;
    if (fontSize.unit !== 'px') fail(`${t.path}: responsive.${band}.fontSize precisa estar em px`);
    if (fontSize.value > prev) fail(`${t.path}: responsive.${band}.fontSize (${fontSize.value}) maior que a faixa anterior (${prev}); títulos só encolhem`);
    prev = fontSize.value;
    const lineHeight = o['lineHeight'] === undefined ? base.lineHeight : Number(o['lineHeight']);
    const letterSpacing = o['letterSpacing']
      ? asDimension(o['letterSpacing'])
      : { value: Math.round((base.letterSpacing.value / base.fontSize.value) * fontSize.value * 100) / 100, unit: 'px' };
    bands[band] = { fontSize, lineHeight, letterSpacing };
  }
  return {
    name: cssName(t.path).replace(/^typography-/, ''),
    family: famRef,
    ...base,
    fontWeight: Number(v['fontWeight']),
    upper: t.ext['textTransform'] === 'uppercase',
    bands,
  };
}

// ---------- faixas responsivas: md (tablet) e sm (celular) sobrescrevem o valor padrão (desktop)
const BANDS: ReadonlyArray<readonly [string, string]> = [['md', 'dimension.breakpoint.md'], ['sm', 'dimension.breakpoint.sm']];
const bandMax = (bpPath: string): number => asDimension(resolve(tokens, bpPath)).value - 1;
function responsiveOf(band: string): Array<[Token, Json]> {
  const out: Array<[Token, Json]> = [];
  for (const t of plain) {
    const r = t.ext['responsive'];
    if (r && typeof r === 'object' && !Array.isArray(r) && band in r) out.push([t, r[band] as Json]);
  }
  return out;
}

// ---------- tokens.css
function buildCss(): string {
  const lines = ['/* Seraphim.co — gerado de seraphim.tokens.json (DTCG 2025.10). Não edite à mão. */', ':root {'];
  for (const tier of ['primitive', 'semantic', 'component'] as const) {
    lines.push(`  /* ${tier} */`);
    for (const t of plain) if (t.tier === tier) lines.push(`  --${cssName(t.path)}: ${cssValue(t)};`);
  }
  lines.push('  /* typography (composto) */');
  for (const t of typo) {
    const p = typoParts(t);
    const n = `typography-${p.name}`;
    lines.push(
      `  --${n}-font-family: var(--${cssName(p.family)});`, `  --${n}-font-size: ${rem(p.fontSize as unknown as Json)};`,
      `  --${n}-font-weight: ${p.fontWeight};`, `  --${n}-line-height: ${fmt(p.lineHeight)};`,
      `  --${n}-letter-spacing: ${dim(p.letterSpacing as unknown as Json)};`,
    );
  }
  lines.push('}');
  for (const t of typo) {
    const p = typoParts(t);
    const n = `typography-${p.name}`;
    lines.push(`.type-${p.name} { font-family: var(--${n}-font-family); font-size: var(--${n}-font-size); font-weight: var(--${n}-font-weight); line-height: var(--${n}-line-height); letter-spacing: var(--${n}-letter-spacing); ${p.upper ? 'text-transform: uppercase; ' : ''}}`);
  }
  for (const [name, bp] of BANDS) {
    const rows = responsiveOf(name).map(([t, v]) => `--${cssName(t.path)}: ${cssValue({ ...t, value: v })};`);
    for (const t of typo) {
      const p = typoParts(t);
      const b = p.bands[name];
      if (b) rows.push(`--typography-${p.name}-font-size: ${rem(b.fontSize as unknown as Json)}; --typography-${p.name}-line-height: ${fmt(b.lineHeight)}; --typography-${p.name}-letter-spacing: ${dim(b.letterSpacing as unknown as Json)};`);
    }
    if (rows.length) lines.push(`@media (max-width: ${bandMax(bp)}px) { :root { ${rows.join(' ')} } }`);
  }
  lines.push('@media (prefers-reduced-motion: reduce) { :root { --motion-duration-fast: 0ms; --motion-duration-base: 0ms; --motion-duration-slow: 0ms; } }');
  return lines.join('\n') + '\n';
}

// ---------- tokens.ts
function resolvedValue(t: Token): string | number | readonly number[] {
  const v = resolve(tokens, t.path);
  switch (t.type) {
    case 'color': return rgba(v);
    case 'dimension': case 'duration': return dim(v);
    case 'shadow': return cssValue({ ...t, value: v }).replace(/var\(--([\w-]+)\)/g, (_, n: string) => {
      const p = [...tokens.values()].find((x) => cssName(x.path) === n);
      return p ? rgba(resolve(tokens, p.path)) : n;
    });
    case 'cubicBezier': return v as number[];
    case 'fontWeight': return Number(v);
    case 'number': return Number(v);
    default: return cssValue({ ...t, value: v });
  }
}

function buildTs(): string {
  const pub: Record<string, unknown> = {};
  const priv: Record<string, unknown> = {};
  for (const t of plain) (privateColors.has(cssName(t.path)) ? priv : pub)[cssName(t.path)] = resolvedValue(t);
  const responsive: Record<string, Record<string, unknown>> = {};
  for (const [band] of BANDS) {
    for (const [t, v] of responsiveOf(band)) {
      const target = refTarget(v);
      const raw = target ? resolve(tokens, target) : v;
      (responsive[cssName(t.path)] ??= {})[band] = t.type === 'number' ? Number(raw) : dim(raw);
    }
  }
  const typography: Record<string, unknown> = {};
  for (const t of typo) {
    const p = typoParts(t);
    typography[p.name] = {
      fontFamily: cssValue({ ...tokens.get(p.family)!, value: resolve(tokens, p.family) }),
      fontSize: dim(p.fontSize as unknown as Json), fontWeight: p.fontWeight, lineHeight: p.lineHeight,
      letterSpacing: dim(p.letterSpacing as unknown as Json), ...(p.upper ? { textTransform: 'uppercase' } : {}),
      ...(Object.keys(p.bands).length
        ? { responsive: Object.fromEntries(Object.entries(p.bands).map(([k, b]) => [k, { fontSize: dim(b.fontSize as unknown as Json), lineHeight: b.lineHeight, letterSpacing: dim(b.letterSpacing as unknown as Json) }])) }
        : {}),
    };
  }
  const j = (o: unknown) => JSON.stringify(o, null, 2);
  const deprecatedMap: Record<string, string> = {};
  for (const t of plain) if (t.deprecated) deprecatedMap[cssName(t.path)] = t.deprecated;
  return `// Seraphim.co — gerado de seraphim.tokens.json (DTCG 2025.10). Não edite à mão.
// Primitivos de cor ficam em \`privatePrimitives\` e fora de \`cssVar\`: use os semânticos.

export const version = ${JSON.stringify(ver)} as const;

/** Tokens públicos (semânticos, de componente e escalas), com valores resolvidos. */
export const tokens = ${j(pub)} as const;

/** Paleta bruta. Só para documentação; o lint de tokens recusa o uso direto. */
export const privatePrimitives = ${j(priv)} as const;

/** Tokens obsoletos e o que usar no lugar. Seguem funcionando até a próxima major. */
export const deprecated = ${j(deprecatedMap)} as const;

/** Valores de tablet (md, até 959 px) e celular (sm, até 639 px). O padrão em \`tokens\` é o desktop. */
export const responsive = ${j(responsive)} as const;

/** Estilos de texto compostos. No CSS, as classes são \`.type-<nome>\`. */
export const typography = ${j(typography)} as const;

export type TokenName = keyof typeof tokens;
export type ColorToken = Extract<TokenName, \`color-\${string}\`>;
export type SpaceToken = Extract<TokenName, \`space-\${string}\` | \`layout-\${string}\`>;
export type TypographyName = keyof typeof typography;

/** Referência CSS a um token público: cssVar('color-bg-brand') → 'var(--color-bg-brand)'. */
export function cssVar<T extends TokenName>(name: T): \`var(--\${T})\` {
  return \`var(--\${name})\`;
}

/** Classe CSS de um estilo de texto: typeClass('h1') → 'type-h1'. */
export function typeClass<T extends TypographyName>(name: T): \`type-\${T}\` {
  return \`type-\${name}\`;
}
`;
}

// ---------- formato do artefato Design System
function buildDs(): string {
  const label = { primitive: 'Primitivo', semantic: 'Semântico', component: 'Componente' } as const;
  // Tokens obsoletos ficam de fora do editor: ninguém deve escolher um deles em um design novo.
  const colors = plain.filter((t) => t.type === 'color' && !t.deprecated).map((t) => {
    const target = refTarget(t.value);
    return { name: cssName(t.path), value: target ? `{${cssName(target)}}` : hexa(t.value), usage: `${label[t.tier]}. ${t.description}`.trim() };
  });
  const list = (prefix: string, value: (t: Token) => string = (t) => (t.type === 'number' ? fmt(Number(resolve(tokens, t.path))) : dim(resolve(tokens, t.path)))) =>
    plain.filter((t) => t.path.startsWith(prefix)).map((t) => ({ name: cssName(t.path), value: value(t), usage: t.description }));
  const shadow = tokens.get('shadow.overlay');
  const groups = new Map<string, Array<Record<string, unknown>>>([['Títulos', []], ['Texto', []], ['Redes sociais (base 1080)', []]]);
  for (const t of typo) {
    const p = typoParts(t);
    const fam = p.family.split('.').at(-1)!;
    const usage = (t.description + (p.upper && !t.description.includes('Caixa-alta') ? ' Caixa-alta.' : '')).trim();
    const style = {
      name: p.name, family: fam, fontSize: `${fmt(p.fontSize.value)}px`, lineHeight: p.lineHeight, fontWeight: p.fontWeight,
      letterSpacing: `${fmt(Math.round((p.letterSpacing.value / p.fontSize.value) * 1000) / 1000)}em`, usage,
    };
    const g = p.name.startsWith('social') ? 'Redes sociais (base 1080)' : fam === 'serif' ? 'Títulos' : 'Texto';
    groups.get(g)!.push(style);
  }
  const ds = {
    name: 'Seraphim.co', version: 1,
    meta: { source: `seraphim.tokens.json ${ver} (W3C DTCG 2025.10), gerado por build-tokens.ts` },
    color: { themes: [{ id: 'light', name: 'Claro' }], tokens: colors },
    type: {
      fonts: [],
      families: { serif: '"Newsreader", Georgia, serif', sans: '"Hanken Grotesk", system-ui, sans-serif' },
      groups: [...groups].filter(([, s]) => s.length).map(([name, styles]) => ({ name, family: String(styles[0]!['family']), styles })),
    },
    spacing: { note: 'Escala base 4 e papéis de layout.', tokens: [...list('dimension.space.'), ...list('dimension.layout.')] },
    radius: { tokens: list('dimension.radius.') },
    shadow: { tokens: shadow ? [{ name: 'shadow-overlay', value: String(resolvedValue(shadow)), usage: shadow.description }] : [] },
    borderWidth: { tokens: list('dimension.border-width.') },
    size: { tokens: list('dimension.size.') },
    breakpoint: { tokens: list('dimension.breakpoint.') },
    tracking: { tokens: list('font.tracking.', (t) => cssValue(t)) },
    leading: { tokens: list('font.leading.', (t) => fmt(Number(t.value))) },
  };
  return JSON.stringify(ds, null, 2) + '\n';
}

const outputs: Record<string, string> = {
  'tokens.css': buildCss(),
  'tokens.ts': buildTs(),
  'design-system.tokens.json': buildDs(),
};

if (check) {
  const stale = Object.entries(outputs).filter(([f, body]) => {
    const p = join(DIST, f);
    return !existsSync(p) || readFileSync(p, 'utf8') !== body;
  }).map(([f]) => f);
  if (stale.length) fail(`dist/ desatualizado (${stale.join(', ')}). Rode: npm run tokens:build`);
  console.log(`dist/ em dia com a fonte · ${tokens.size} tokens · v${ver}`);
} else {
  mkdirSync(DIST, { recursive: true });
  for (const [f, body] of Object.entries(outputs)) writeFileSync(join(DIST, f), body);
  const tiers = { primitive: 0, semantic: 0, component: 0 };
  for (const t of tokens.values()) tiers[t.tier]++;
  console.log(`${tokens.size} tokens (${tiers.primitive} primitivos, ${tiers.semantic} semânticos, ${tiers.component} de componente) · v${ver} → ${DIST}`);
}
