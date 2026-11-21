// Twin Lanterns — the hand-in program (Node 22, standard library only).
// It copies the playable game and its screenshots into the output directory
// and writes dossier.json with the kit's vendored library, so the judge can
// read the game from the dossier alone. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });

cpSync(join(root, 'game'), join(outDir, 'game'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps from the gate: at most 4 screenshots of 256 KiB, game/ at most 993
// entries and 48 MiB, every path under game/ at most 1000 bytes, and the
// dossier text at most 160 KiB. buildDossier refuses anything over them,
// so a bad hand-in fails here instead of on the server.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Twin Lanterns handed in to ${outDir}`);
