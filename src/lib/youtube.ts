// A paragraph holding only a YouTube watch URL is a video at that point of the article
// (docs/content-model.md). It renders as a click-to-load facade: a thumbnail linking to the
// video, which the post page's script swaps for the player on click (docs/seo.md, video).
import type { HastPluginDefinition } from 'satteri';

const MARKER = /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})$/;

export const youtubeId = (url: string) =>
  url.match(MARKER)?.[1] ?? url.match(/^https:\/\/(?:youtu\.be\/|www\.youtube\.com\/(?:embed\/|shorts\/))([\w-]{11})/)?.[1];

const facade = (id: string) => ({
  href: `https://www.youtube.com/watch?v=${id}`,
  label: 'Redă videoclipul',
  img: { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: 'Imagine din videoclipul YouTube', width: 480, height: 360 },
});

export function facadeHtml(id: string): string {
  const f = facade(id);
  return (
    `<a class="yt-facade" href="${f.href}" data-yt="${id}" aria-label="${f.label}">` +
    `<img src="${f.img.src}" alt="${f.img.alt}" width="${f.img.width}" height="${f.img.height}" loading="lazy" decoding="async">` +
    `</a>`
  );
}

/** The same facade as a HAST element, for the Markdown pipeline. */
function facadeHast(id: string) {
  const f = facade(id);
  return {
    type: 'element' as const,
    tagName: 'a',
    properties: { className: ['yt-facade'], href: f.href, dataYt: id, ariaLabel: f.label },
    children: [
      { type: 'element' as const, tagName: 'img', properties: { ...f.img, loading: 'lazy', decoding: 'async' }, children: [] },
    ],
  };
}

/** Sätteri HAST plugin: marker paragraphs become facades. */
export const youtubeFacade: HastPluginDefinition = {
  name: 'youtube-facade',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      if (node.children.length !== 1 || node.children[0].type !== 'text') return;
      const id = ctx.textContent(node).trim().match(MARKER)?.[1];
      if (id) ctx.replaceNode(node, facadeHast(id));
    },
  },
};
