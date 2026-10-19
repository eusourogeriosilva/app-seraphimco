// Auxiliares dos testes de navegador: servidor estático (transpila .ts para o navegador) e Chromium.
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const MIME: Record<string, string> = { '.woff': 'font/woff', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.ts': 'text/javascript; charset=utf-8', '.json': 'application/json' };

export interface Ambiente { server: Server; base: string; browser: Browser }

export async function subir(): Promise<Ambiente> {
  const server = createServer(async (req, res) => {
    try {
      const caminho = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]!)).replace(/^(\.\.[/\\])+/, '');
      const arq = join(RAIZ, caminho);
      let corpo: string | Buffer = await readFile(arq);
      if (extname(arq) === '.ts') corpo = stripTypeScriptTypes(corpo.toString('utf8'));
      res.writeHead(200, { 'content-type': MIME[extname(arq)] ?? 'application/octet-stream' });
      res.end(corpo);
    } catch {
      res.writeHead(404).end('não encontrado');
    }
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const porta = (server.address() as { port: number }).port;
  const browser = await chromium.launch({ executablePath: process.env['PW_CHROMIUM'] || undefined });
  return { server, base: `http://127.0.0.1:${porta}`, browser };
}

export async function descer(a: Ambiente): Promise<void> {
  await a.browser.close();
  await new Promise((ok) => a.server.close(ok));
}

// Fontes reais (Newsreader e Hanken Grotesk, via @fontsource) para medir quebras de linha como no navegador do usuário.
const FONTES = [
  ...[['Newsreader', 'newsreader', [400, 500], ['normal', 'italic']], ['Hanken Grotesk', 'hanken-grotesk', [400, 500, 600, 700], ['normal']]] as const,
].flatMap(([fam, dir, pesos, estilos]) => pesos.flatMap((w) => estilos.map((st) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url(/node_modules/@fontsource/${dir}/files/${dir}-latin-${w}-${st}.woff)}`))).join('\n');

export interface OpcoesPagina { fontes?: boolean; esperar?: number; extraCss?: string }

export async function abrir(a: Ambiente, caminho: string, largura = 1440, opcoes: Parameters<Browser['newPage']>[0] & OpcoesPagina = {}): Promise<Page> {
  const { fontes, esperar, extraCss, ...ctx } = opcoes;
  const page = await a.browser.newPage({ viewport: { width: largura, height: 900 }, ...ctx });
  await page.goto(`${a.base}${caminho}`);
  await page.waitForLoadState('load');
  if (fontes || extraCss) await page.addStyleTag({ content: `${fontes ? FONTES : ''}\n${extraCss ?? ''}` });
  if (fontes) await page.evaluate('document.fonts.ready.then(() => 0)');
  if (caminho.includes('/fixtures/') && (await page.locator('script[type=module]').count())) await page.waitForFunction('document.documentElement.dataset.pronto === "1"');
  if (esperar) await page.waitForTimeout(esperar);
  return page;
}

/** Coleta verificações nomeadas (como as suítes originais) e falha uma vez, listando todas as reprovadas. */
export function verificacoes() {
  const R: { nome: string; ok: boolean; extra?: unknown }[] = [];
  return {
    ok(nome: string, cond: unknown, extra?: unknown) { R.push({ nome, ok: !!cond, extra }); },
    get total() { return R.length; },
    fim() {
      const f = R.filter((x) => !x.ok).map((x) => `${x.nome} :: ${JSON.stringify(x.extra)}`);
      assert.deepEqual(f, [], `${f.length} de ${R.length} verificações falharam`);
      console.log(`# ${R.length} verificações`);
      return R.length;
    },
  };
}
