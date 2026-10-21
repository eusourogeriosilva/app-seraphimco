// Gate local: reproduz o job "verify" do workflow (e o job "browser", quando há Chromium) sem depender do GitHub Actions.
// Uso: node scripts/gate.ts [--hook] [--no-browser] [--browser] [--verbose] [--base <ref>]
//   --hook         modo pre-push (lê as refs do stdin; push que só apaga branch passa direto)
//   --no-browser   pula os testes de navegador (também: GATE_SKIP_BROWSER=1)
//   --browser      exige os testes de navegador: sem Chromium, falha em vez de pular
//   --verbose      mostra a saída completa de cada passo (por padrão, só a dos que falham)
//   --base <ref>   base da checagem de versão (padrão: origin/main; sem ela, HEAD, com aviso)
// Chromium: PW_CHROMIUM (caminho de um executável) ou o instalado por `npx playwright install chromium`.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const modoHook = args.includes('--hook');
const verboso = args.includes('--verbose');
const exigeNavegador = args.includes('--browser');
const semNavegador = args.includes('--no-browser') || process.env['GATE_SKIP_BROWSER'] === '1';
const WIN = process.platform === 'win32';

interface Resultado { nome: string; ok: boolean; ms: number }

function sync(cmd: string, a: string[], timeout?: number) {
  return spawnSync(cmd, a, { encoding: 'utf8', shell: WIN, maxBuffer: 64 * 1024 * 1024, timeout });
}

function recuar(texto: string): string {
  return texto.trimEnd().split('\n').map((l) => `    ${l}`).join('\n');
}

function passo(nome: string, a: string[]): Resultado {
  const t0 = Date.now();
  const r = sync('npm', a);
  const ms = Date.now() - t0;
  const ok = r.status === 0;
  console.log(`${ok ? '✔' : '✘'} ${nome} (${(ms / 1000).toFixed(1)}s)`);
  if (!ok || verboso) console.log(recuar(`${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? `\n${r.error.message}` : ''}`));
  return { nome, ok, ms };
}

/** Um push que só remove branches (local sha zerado) não tem o que verificar. */
function pushApenasExclusao(): boolean {
  if (!modoHook || process.stdin.isTTY) return false;
  let entrada = '';
  try {
    entrada = readFileSync(0, 'utf8');
  } catch {
    return false;
  }
  const linhas = entrada.split('\n').map((l) => l.trim()).filter(Boolean);
  return linhas.length > 0 && linhas.every((l) => /^0+$/.test(l.split(' ')[1] ?? ''));
}

function resolverBase(): { ref: string; aviso?: string } {
  const i = args.indexOf('--base');
  const dada = i >= 0 ? args[i + 1] : undefined;
  if (dada) return { ref: dada };
  sync('git', ['fetch', 'origin', 'main', '--quiet'], 20_000); // melhor esforço: sem rede, usa o que houver
  if (sync('git', ['rev-parse', '--verify', '--quiet', 'origin/main']).status === 0) return { ref: 'origin/main' };
  return { ref: 'HEAD', aviso: 'origin/main não existe neste clone; a checagem de versão compara com HEAD e não pega mudanças já commitadas.' };
}

async function motorDisponivel(m: 'chromium' | 'firefox' | 'webkit'): Promise<boolean> {
  const manual = process.env['PW_CHROMIUM'];
  if (m === 'chromium' && manual) return existsSync(manual);
  try {
    const pw = await import('playwright');
    return existsSync(pw[m].executablePath());
  } catch {
    return false;
  }
}

async function main(): Promise<number> {
  if (pushApenasExclusao()) {
    console.log('gate: o push só remove branch; nada a verificar.');
    return 0;
  }
  const base = resolverBase();
  console.log(`gate local (sem GitHub Actions) — base da versão: ${base.ref}`);
  const avisos: string[] = [];
  if (base.aviso) avisos.push(base.aviso);

  const estaticos: [string, string[]][] = [
    ['build de tokens em dia + contraste', ['run', 'tokens:check']],
    ['versão e CHANGELOG', ['run', 'tokens:version', '--', '--base', base.ref]],
    ['tipos (TypeScript 7)', ['run', 'typecheck']],
    ['tipos (TypeScript 6)', ['run', 'typecheck:ts6']],
    ['CSS sem cor solta', ['run', 'lint:css']],
    ['tokens existentes e semânticos', ['run', 'lint:tokens']],
    ['HTML (h1, níveis, lang, alt, rótulos)', ['run', 'lint:html']],
  ];
  const resultados: Resultado[] = estaticos.map(([nome, a]) => passo(nome, a));
  const estaticoOk = resultados.every((r) => r.ok);

  if (!estaticoOk) {
    avisos.push('testes de navegador não rodaram: as verificações estáticas falharam.');
  } else if (semNavegador) {
    avisos.push('testes de navegador pulados (--no-browser ou GATE_SKIP_BROWSER=1).');
  } else {
    if (await motorDisponivel('chromium')) {
      resultados.push(passo('testes de navegador: Chromium (axe, formulário, layout por faixa)', ['run', 'test:browser']));
    } else if (exigeNavegador) {
      console.log('✘ testes de navegador: Chromium indisponível (defina PW_CHROMIUM ou rode `npx playwright install chromium`).');
      resultados.push({ nome: 'testes de navegador', ok: false, ms: 0 });
    } else {
      avisos.push('testes de navegador PULADOS: Chromium indisponível. Defina PW_CHROMIUM ou rode `npx playwright install chromium`.');
    }
    // Firefox e WebKit: rodam quando instalados; ausentes só geram aviso (o Chromium é o mínimo exigido).
    for (const [m, nome] of [['firefox', 'Firefox'], ['webkit', 'WebKit']] as const) {
      if (await motorDisponivel(m)) resultados.push(passo(`testes de navegador: ${nome}`, ['run', `test:browser:${m}`]));
      else avisos.push(`testes de navegador em ${nome} pulados: não instalado (npx playwright install ${m}).`);
    }
  }

  const falhas = resultados.filter((r) => !r.ok);
  console.log('');
  for (const a of avisos) console.log(`! ${a}`);
  if (falhas.length) {
    console.log(`gate REPROVADO: ${falhas.map((f) => f.nome).join('; ')}`);
    if (modoHook) console.log('Para enviar mesmo assim (emergência): git push --no-verify');
    return 1;
  }
  console.log(`gate aprovado (${resultados.length} verificações, ${(resultados.reduce((s, r) => s + r.ms, 0) / 1000).toFixed(1)}s).`);
  return 0;
}

process.exit(await main());
