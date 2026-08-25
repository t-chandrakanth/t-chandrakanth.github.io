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
    // Markdown tables have no natural width limit. Without a scrolling
    // wrapper a wide one stretches the whole page on a phone.
    table: ({ children, ...rest }) => (
      <div className="-mx-5 my-8 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table {...rest}>{children}</table>
      </div>
    ),
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
