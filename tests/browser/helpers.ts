// Auxiliares dos testes de navegador: servidor estático (transpila .ts para o navegador) e Chromium.
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright';

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.ts': 'text/javascript; charset=utf-8', '.json': 'application/json' };

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

export async function abrir(a: Ambiente, caminho: string, largura = 1440, opcoes: Parameters<Browser['newPage']>[0] = {}): Promise<Page> {
  const page = await a.browser.newPage({ viewport: { width: largura, height: 900 }, ...opcoes });
  await page.goto(`${a.base}${caminho}`);
  await page.waitForLoadState('load');
  return page;
}
