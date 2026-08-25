import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const isStaticExport = process.env.EXPORT_MODE === "static";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  ...(isStaticExport
    ? { output: "export" as const, images: { unoptimized: true } }
    : {}),
};

/**
 * Turbopack serialises loader options, so every remark/rehype plugin has to be
 * named as a string rather than imported. Keep it that way — passing the
 * imported function back in fails the build with a non-obvious error.
 */
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      ["remark-gfm", {}],
      ["remark-math", {}],
      ["remark-frontmatter", ["yaml"]],
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
    ],
    rehypePlugins: [
      ["rehype-katex", { strict: false, output: "htmlAndMathml" }],
      ["rehype-slug", {}],
      [
        "rehype-autolink-headings",
        { behavior: "wrap", properties: { className: ["heading-anchor"] } },
      ],
      [
        "rehype-pretty-code",
        {
          theme: { dark: "vesper", light: "github-light" },
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
