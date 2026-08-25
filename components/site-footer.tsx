import Link from "next/link";
import { Mark } from "./mark";
import { Kicker } from "./primitives";
import { disclaimer, footerNav, liveProfiles, site } from "@/lib/site";

function isExternal(href: string) {
  return href.startsWith("http");
}

export function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="border-t border-rule-strong mt-28">
      <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 py-14 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-[34ch]">
            <div className="flex items-baseline gap-2.5">
              <Mark size={20} className="text-ink translate-y-[3px]" />
              <span className="text-[1.0625rem] tracking-[-0.015em]">{site.name}</span>
            </div>
            <p className="text-ink-muted mt-4 text-[0.95rem] leading-relaxed">
              {site.blogName} — {site.tagline}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {liveProfiles().map((p) => (
                <li key={p.label}>
                  <a
                    href={p.href}
                    rel="me noopener"
                    target="_blank"
                    className="font-kicker text-ink-faint hover:text-accent transition-colors"
                  >
                    {p.label}
                    <span aria-hidden="true" className="ml-1 opacity-60">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <Kicker className="border-t border-rule pt-3">{group.heading}</Kicker>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {isExternal(link.href) ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener"
                          className="link-quiet text-ink-muted text-[0.95rem]"
                        >
                          {link.label}
                          <span aria-hidden="true" className="ml-1 opacity-60">↗</span>
                        </a>
                      ) : (
                        <Link href={link.href} className="link-quiet text-ink-muted text-[0.95rem]">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-t border-rule py-7">
          <p className="text-ink-faint max-w-[70ch] text-[0.8125rem] leading-relaxed italic">
            {disclaimer}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
            <Kicker>
              © {year} {site.name}
            </Kicker>
            <Kicker className="text-right">
              Set in Newsreader &amp; IBM Plex Mono
            </Kicker>
          </div>
        </div>
      </div>
    </footer>
  );
}
