"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./mark";
import { ThemeToggle } from "./theme-toggle";
import { primaryNav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <a
        href="#main"
        className="font-kicker sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:border focus:border-rule-strong focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-10">
        <div className="flex h-[3.75rem] items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex items-baseline gap-2.5 no-underline"
            aria-label={`${site.name} — home`}
          >
            <Mark
              size={20}
              className="text-ink translate-y-[3px] transition-transform duration-500 group-hover:rotate-[-6deg]"
            />
            <span className="text-ink text-[1.0625rem] tracking-[-0.015em] whitespace-nowrap">
              {site.name}
            </span>
            <span
              className="font-kicker text-ink-faint hidden border-l border-rule pl-2.5 xl:inline"
              aria-hidden="true"
            >
              {site.blogName}
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-6">
                {primaryNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href} className="relative">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`font-kicker transition-colors ${
                          active ? "text-ink" : "text-ink-faint hover:text-accent"
                        }`}
                      >
                        {item.label}
                      </Link>
                      <span
                        aria-hidden="true"
                        className={`absolute -top-[0.85rem] left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </li>
                  );
                })}
              </ul>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Small screens: the nav becomes its own ruled band rather than a hamburger. */}
      <nav
        aria-label="Primary, compact"
        className="border-t border-rule lg:hidden"
      >
        <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {primaryNav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="shrink-0 border-r border-rule last:border-r-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`font-kicker block px-4 py-2.5 transition-colors ${
                    active ? "text-accent bg-accent-wash" : "text-ink-faint"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
