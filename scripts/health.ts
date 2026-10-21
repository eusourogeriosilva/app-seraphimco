// Saúde do projeto: o gate local (npm run ci) mais a auditoria de dependências, com exceções datadas.
// Uso: node scripts/health.ts [--sem-gate] [opções do gate, ex.: --no-browser]
// Reprova quando:
//   - o gate reprova;
//   - há alerta alto ou crítico em dependência de produção (exceção não vale aqui);
//   - há alerta alto ou crítico em dependência de desenvolvimento sem exceção, ou com exceção vencida;
//   - o npm audit não pôde rodar (sem rede, registro fora): saúde não verificada não é saúde aprovada.
// Exceções: security/audit-excecoes.json (escopo "dev", motivo, prazo de no máximo 6 meses).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const WIN = process.platform === 'win32';
const args = process.argv.slice(2);
const semGate = args.includes('--sem-gate');
const argsGate = args.filter((a) => a !== '--sem-gate');
const GRAVES = new Set(['high', 'critical']);
const ARQUIVO = 'security/audit-excecoes.json';
const PRAZO_MAXIMO_DIAS = 183;

interface Excecao { id: string; cve?: string; pacote: string; escopo: string; motivo: string; registrada: string; revisarAte: string }
interface Alerta { id: string; pacote: string; titulo: string; severidade: string; url: string }

const hoje = new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local

function dias(de: string, ate: string): number {
  return Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000);
}

function auditar(somenteProducao: boolean): Alerta[] {
  const r = spawnSync('npm', ['audit', '--json', ...(somenteProducao ? ['--omit=dev'] : [])], { encoding: 'utf8', shell: WIN, maxBuffer: 64 * 1024 * 1024 });
  let json: { message?: string; error?: { summary?: string; detail?: string }; vulnerabilities?: Record<string, { via: unknown[] }> };
  try {
    json = JSON.parse(r.stdout);
  } catch {
    throw new Error(`npm audit não devolveu JSON (sem rede ou registro fora?): ${(r.stderr || r.stdout || '').trim().slice(0, 300)}`);
  }
  if (json.error) throw new Error(`npm audit falhou (sem rede ou registro fora?): ${json.error.summary || json.error.detail || json.message || 'erro sem descrição'}`);
  // Cada alerta aparece como objeto em "via" do pacote afetado; os que o herdam só citam o nome. Conta-se a causa, uma vez.
  const alertas = new Map<string, Alerta>();
  for (const v of Object.values(json.vulnerabilities ?? {})) {
    for (const via of v.via) {
      if (typeof via !== 'object' || via === null) continue;
      const a = via as { url?: string; name?: string; title?: string; severity?: string };
      const id = a.url?.split('/').pop() || `${a.name}:${a.title}`;
      alertas.set(id, { id, pacote: a.name ?? '?', titulo: a.title ?? '', severidade: a.severity ?? '?', url: a.url ?? '' });
    }
  }
  return [...alertas.values()];
}

function carregarExcecoes(problemas: string[]): Excecao[] {
  let lista: Excecao[];
  try {
    lista = (JSON.parse(readFileSync(ARQUIVO, 'utf8')) as { excecoes: Excecao[] }).excecoes ?? [];
  } catch (e) {
    problemas.push(`${ARQUIVO} ilegível: ${(e as Error).message}`);
    return [];
  }
  return lista.filter((x) => {
    const erro =
      !x.id || !x.pacote || !x.motivo ? 'faltam id, pacote ou motivo'
      : x.escopo !== 'dev' ? 'escopo deve ser "dev" (dependência de produção não tem exceção)'
      : Number.isNaN(Date.parse(x.registrada)) || Number.isNaN(Date.parse(x.revisarAte)) ? 'datas inválidas (AAAA-MM-DD)'
      : dias(x.registrada, x.revisarAte) > PRAZO_MAXIMO_DIAS ? `prazo acima de ${PRAZO_MAXIMO_DIAS} dias`
      : '';
    if (erro) problemas.push(`exceção ${x.id ?? '(sem id)'} inválida: ${erro}`);
    return !erro;
  });
}

function main(): number {
  const problemas: string[] = [];
  const avisos: string[] = [];

  if (semGate) {
    avisos.push('gate não rodou (--sem-gate).');
  } else {
    console.log('— gate local —');
    const g = spawnSync('node', ['scripts/gate.ts', ...argsGate], { stdio: 'inherit', shell: WIN });
    if (g.status !== 0) problemas.push('gate local reprovado (ver acima).');
    console.log('');
  }

  console.log('— dependências (npm audit) —');
  let todos: Alerta[] = [];
  let producao: Alerta[] = [];
  let auditou = false;
  try {
    todos = auditar(false);
    producao = auditar(true);
    auditou = true;
  } catch (e) {
    problemas.push((e as Error).message);
  }
  const idsProducao = new Set(producao.map((a) => a.id));
  const excecoes = carregarExcecoes(problemas);
  const porId = new Map(excecoes.map((x) => [x.id, x]));

  for (const a of todos) {
    const rotulo = `${a.id} (${a.pacote}, ${a.severidade}): ${a.titulo}`;
    if (!GRAVES.has(a.severidade)) {
      avisos.push(`alerta ${a.severidade}, não bloqueia: ${rotulo}`);
      continue;
    }
    if (idsProducao.has(a.id)) {
      problemas.push(`em dependência de PRODUÇÃO: ${rotulo}`);
      continue;
    }
    const x = porId.get(a.id);
    if (!x) problemas.push(`novo alerta sem exceção: ${rotulo} — ${a.url}`);
    else if (hoje > x.revisarAte) problemas.push(`exceção vencida em ${x.revisarAte}, reavaliar: ${rotulo}`);
    else console.log(`~ aceito até ${x.revisarAte} (dev): ${rotulo}\n    motivo: ${x.motivo}`);
  }
  if (auditou) {
    const ativos = new Set(todos.map((a) => a.id));
    for (const x of excecoes) if (!ativos.has(x.id)) avisos.push(`exceção ${x.id} não corresponde a nenhum alerta atual: remover de ${ARQUIVO}.`);
    console.log(`produção: ${producao.length} alerta(s); total: ${todos.length} alerta(s) único(s).`);
  }

  console.log('');
  for (const a of avisos) console.log(`! ${a}`);
  if (problemas.length) {
    for (const p of problemas) console.log(`✘ ${p}`);
    console.log('saúde REPROVADA.');
    return 1;
  }
  console.log('saúde aprovada.');
  return 0;
}

process.exit(main());
