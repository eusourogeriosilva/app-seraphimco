// Servidor local do Site para abrir as páginas no navegador (por exemplo, no teste manual com leitor de tela).
// Uso: npm run site [-- --porta 4173]. Transpila .ts para o navegador, como nos testes. Só escuta em 127.0.0.1.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const MIME: Record<string, string> = { '.woff': 'font/woff', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.ts': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const i = process.argv.indexOf('--porta');
const porta = i > -1 ? Number(process.argv[i + 1]) : 4173;
if (!Number.isInteger(porta) || porta < 1 || porta > 65535) { console.error('Porta inválida. Use --porta 4173.'); process.exit(1); }

createServer(async (req, res) => {
  try {
    const caminho = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]!)).replace(/^(\.\.[/\\])+/, '');
    if (caminho === '/' || caminho === '\\') { res.writeHead(302, { location: '/src/site/index.html' }).end(); return; } // caminhos relativos do HTML dependem de /src/site/
    const arq = join(RAIZ, caminho);
    let corpo: string | Buffer = await readFile(arq);
    if (extname(arq) === '.ts') corpo = stripTypeScriptTypes(corpo.toString('utf8'));
    res.writeHead(200, { 'content-type': MIME[extname(arq)] ?? 'application/octet-stream' });
    res.end(corpo);
  } catch {
    res.writeHead(404).end('não encontrado');
  }
}).listen(porta, '127.0.0.1', () => {
  const base = `http://127.0.0.1:${porta}`;
  console.log(`Site em ${base}/src/site/index.html  (Ctrl+C para parar)`);
  for (const p of ['src/site/index.html', 'src/site/contato.html', 'src/site/servicos/diagnostico-nexo.html', 'src/site/servicos/consultoria-nexo.html', 'src/site/palestras.html']) console.log(`  ${base}/${p}`);
});
