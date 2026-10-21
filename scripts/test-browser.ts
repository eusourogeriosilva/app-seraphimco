// Roda os testes de navegador em um ou mais motores do Playwright.
// Uso: node scripts/test-browser.ts <chromium|firefox|webkit|todos> [--exigir]
//   todos     roda nos motores instalados e pula os ausentes, com aviso
//   --exigir  motor ausente reprova, em vez de ser pulado
// Instalar um motor: npx playwright install <motor> (em Linux, --with-deps para as bibliotecas do sistema).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

type Motor = 'chromium' | 'firefox' | 'webkit';
const TODOS: Motor[] = ['chromium', 'firefox', 'webkit'];
const args = process.argv.slice(2);
const exigir = args.includes('--exigir');
const alvo = args.find((a) => !a.startsWith('--')) ?? 'chromium';
if (alvo !== 'todos' && !TODOS.includes(alvo as Motor)) {
  console.error(`motor inválido: ${alvo} (use chromium, firefox, webkit ou todos)`);
  process.exit(2);
}
const motores: Motor[] = alvo === 'todos' ? TODOS : [alvo as Motor];

async function instalado(m: Motor): Promise<boolean> {
  if (m === 'chromium' && process.env['PW_CHROMIUM']) return existsSync(process.env['PW_CHROMIUM']);
  try {
    const pw = await import('playwright');
    return existsSync(pw[m].executablePath());
  } catch {
    return false;
  }
}

let falhou = false;
const resumo: string[] = [];
for (const m of motores) {
  if (!(await instalado(m))) {
    resumo.push(`${exigir ? '✘' : '!'} ${m}: não instalado (npx playwright install ${m})${exigir ? '' : ', pulado'}`);
    if (exigir) falhou = true;
    continue;
  }
  console.log(`— ${m} —`);
  const r = spawnSync(process.execPath, ['--test', '--test-concurrency=1', 'tests/browser/*.test.ts'], { stdio: 'inherit', env: { ...process.env, PW_BROWSER: m } });
  const ok = r.status === 0;
  resumo.push(`${ok ? '✔' : '✘'} ${m}`);
  if (!ok) falhou = true;
}
console.log(`\ntestes de navegador: ${resumo.join(' · ')}`);
process.exit(falhou ? 1 : 0);
