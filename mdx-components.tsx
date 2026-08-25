import type { MDXComponents } from "mdx/types";
import { Callout, Figure, KeyLine, Ledger, Synthetic } from "@/components/mdx";

/**
 * Components available to every MDX file without an import, plus the
 * element overrides that keep post bodies inside the design system.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Figure,
    Callout,
    KeyLine,
    Synthetic,
    Ledger,
    a: ({ href = "", children, ...rest }) => {
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...rest}
        >
          {children}
        </a>
      );
    },
    ...components,
  };
}
