import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeKatex from 'rehype-katex';
import fs from 'node:fs';

const files = process.argv.slice(2);
let bad = 0;
for (const f of files) {
  try {
    const out = await compile(fs.readFileSync(f), {
      remarkPlugins: [remarkGfm, remarkMath, [remarkFrontmatter, ['yaml']], [remarkMdxFrontmatter, {name:'frontmatter'}]],
      rehypePlugins: [[rehypeKatex, {strict:false, throwOnError:true, output:'htmlAndMathml'}]],
    });
    console.log('OK  ', f, String(out).length, 'bytes');
  } catch (e) {
    bad++;
    console.log('FAIL', f);
    console.log('   ', e.message);
  }
}
process.exit(bad ? 1 : 0);
