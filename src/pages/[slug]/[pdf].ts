// A post's PDF (`pdf` in docs/content-model.md), copied from its folder in content/ to
// /<slug>/<file>.pdf, next to the post's page.
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { getPosts, type Post } from '../../lib/site.ts';

export async function getStaticPaths() {
  return (await getPosts())
    .filter((post) => post.data.pdf)
    .map((post) => ({ params: { slug: post.id, pdf: post.data.pdf!.slice(2) }, props: { post } }));
}

export async function GET({ props }: { props: { post: Post } }) {
  const { post } = props;
  const bytes = await readFile(`${dirname(post.filePath!)}/${post.data.pdf!.slice(2)}`);
  return new Response(bytes, { headers: { 'content-type': 'application/pdf' } });
}
