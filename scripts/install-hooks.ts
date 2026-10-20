// Aponta o git para os hooks versionados em .githooks (roda no `prepare`, após `npm ci`/`npm install`).
// Nunca falha a instalação: fora de um clone git (tarball, CI sem .git) simplesmente não faz nada.
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';

if (existsSync('.git') && existsSync('.githooks')) {
  const r = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { encoding: 'utf8' });
  if (r.status === 0) {
    try {
      chmodSync('.githooks/pre-push', 0o755);
    } catch {
      // sem permissão para chmod: o git avisa se o hook não puder rodar
    }
    console.log('hooks: core.hooksPath = .githooks (pre-push roda o gate local; pular em emergência: git push --no-verify)');
  }
}
