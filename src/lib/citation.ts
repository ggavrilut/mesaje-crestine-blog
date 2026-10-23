// A post's `source` (docs/content-model.md): the citation under the article, the author's or
// translator's words. Plain text with `[text](url)` links, line breaks and blank lines between
// paragraphs; nothing else is markup. Rendered on the post page and read back as plain text by
// the importer, which compares it word for word with the live page.

const LINK = /\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:)[^)\s]+)\)/g;
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function citationHtml(source: string): string {
  return source
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => {
      const lines = paragraph.split('\n').map((line) => {
        let html = '';
        let last = 0;
        for (const m of line.matchAll(LINK)) {
          html += escape(line.slice(last, m.index)) + `<a href="${escape(m[2])}">${escape(m[1])}</a>`;
          last = m.index! + m[0].length;
        }
        return html + escape(line.slice(last));
      });
      return `<p>${lines.join('<br>')}</p>`;
    })
    .join('');
}

/** The citation as a reader sees it: links reduced to their text. */
export const citationText = (source: string) => source.replace(LINK, '$1');
