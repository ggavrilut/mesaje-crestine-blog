// The text a reader sees on a live WordPress post page. Shared by the importer (live page
// against the imported text) and bin/verify-text.ts (live page against source.txt), so both
// read a page the same way.
import type * as cheerio from 'cheerio';
import { blockText } from '../../src/lib/text.ts';

/** Ten posts are rendered by Bricks text elements instead of a post-content element. */
export const isBricksPage = (page: cheerio.CheerioAPI) => page('.bricks-element-post-content').length === 0;

/** The text a reader sees on the live page, for the word-for-word comparison. */
export function liveText(page: cheerio.CheerioAPI, bricks: boolean): string {
  if (bricks) {
    const els = page('main .bricks-element-text .text-wrapper')
      .toArray()
      .filter((el) => page(el).text().trim() !== 'Publicat de');
    return blockText(page, els);
  }
  const content = page('.bricks-element-post-content');
  if (content.length !== 1) throw new Error(`expected one post-content element, found ${content.length}`);
  return blockText(page, content.toArray());
}
