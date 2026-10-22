// Runs after every build. Fails it when a post's rendered text differs from its source.txt
// (docs/hard-rules.md, the text rule; docs/content-model.md, the check), and moves the
// generated htaccess.txt to .htaccess, a name Astro cannot route.
import type { AstroIntegration } from 'astro';
import * as cheerio from 'cheerio';
import { existsSync } from 'node:fs';
import { readdir, readFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { blockText, firstDifference } from '../lib/text.ts';

export default function buildChecks(): AstroIntegration {
  let root: URL;
  return {
    name: 'build-checks',
    hooks: {
      'astro:config:done': ({ config }) => { root = config.root; },
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        await rename(`${dist}htaccess.txt`, `${dist}.htaccess`);

        const content = fileURLToPath(new URL('content/posts/', root));
        const failures: string[] = [];
        let checked = 0;
        for (const slug of (await readdir(content)).sort()) {
          const source = `${content}${slug}/source.txt`;
          const page = `${dist}${slug}/index.html`;
          if (!existsSync(page)) continue; // a draft is not built
          // Without its source.txt a published post would go unchecked: that is a failure too.
          if (!existsSync(source)) { failures.push(`${slug}: no source.txt to check the page against`); continue; }
          const $ = cheerio.load(await readFile(page, 'utf8'));
          const body = $('[data-article-body]');
          if (body.length !== 1) { failures.push(`${slug}: no single [data-article-body] in the page`); continue; }
          const diff = firstDifference(await readFile(source, 'utf8'), blockText($, body.toArray()));
          if (diff) failures.push(`${slug}, word ${diff.index}:\n    source.txt: ${diff.expected}\n    page:       ${diff.actual}`);
          checked++;
        }
        if (failures.length) {
          throw new Error(`text integrity: ${failures.length} post(s) differ from source.txt\n  ${failures.join('\n  ')}`);
        }
        logger.info(`text integrity: ${checked} posts equal their source.txt, word for word`);
      },
    },
  };
}
