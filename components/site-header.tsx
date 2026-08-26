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
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur-xl backdrop-saturate-[180%] supports-[backdrop-filter]:bg-[var(--glass-bg)]">
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
            <span className="text-ink text-[1.0625rem] font-semibold tracking-[-0.022em] whitespace-nowrap">
              {site.name}
            </span>
            <span
              className="text-ink-faint hidden border-l border-rule pl-2.5 text-[0.8125rem] tracking-[-0.01em] xl:inline"
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
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`text-[0.875rem] tracking-[-0.012em] transition-colors ${
                          active
                            ? "text-ink font-semibold"
                            : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
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
                  className={`block px-4 py-2.5 text-[0.8125rem] tracking-[-0.01em] transition-colors ${
                    active ? "text-accent bg-accent-wash font-semibold" : "text-ink-muted"
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
