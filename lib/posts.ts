import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { pillarById, type PillarId } from "@/content/pillars";

const WRITING_DIR = path.join(process.cwd(), "content", "writing");

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  pillar: PillarId;
  /** The one sentence worth lifting out of the piece. */
  quotable?: string;
  /** Tiebreak within a publication date; lower sorts first. */
  order?: number;
  updated?: string;
  draft?: boolean;
  tags?: string[];
};

export type Post = PostFrontmatter & {
  slug: string;
  readingMinutes: number;
  words: number;
  pillarName: string;
  pillarSlug: string;
  /** Second-level headings, for the reading rail. */
  sections: { id: string; title: string }[];
};

const REQUIRED: (keyof PostFrontmatter)[] = ["title", "description", "date", "pillar"];

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** `## Heading` lines, ignoring anything inside a fenced code block. */
function extractSections(body: string): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      const title = m[1].replace(/[*_`]/g, "").trim();
      out.push({ id: slugifyHeading(title), title });
    }
  }
  return out;
}

function read(slug: string): Post | null {
  const file = path.join(WRITING_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  const missing = REQUIRED.filter((k) => data[k] === undefined || data[k] === "");
  if (missing.length) {
    throw new Error(
      `content/writing/${slug}.mdx is missing required frontmatter: ${missing.join(", ")}`,
    );
  }

  const pillar = pillarById(String(data.pillar));
  if (!pillar) {
    throw new Error(
      `content/writing/${slug}.mdx declares unknown pillar "${data.pillar}". ` +
        `Every post belongs to exactly one pillar (P1–P6).`,
    );
  }

  const stats = readingTime(content);

  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    date: String(data.date),
    updated: data.updated ? String(data.updated) : undefined,
    pillar: pillar.id,
    pillarName: pillar.name,
    pillarSlug: pillar.slug,
    quotable: data.quotable ? String(data.quotable) : undefined,
    order: data.order === undefined ? undefined : Number(data.order),
    draft: Boolean(data.draft),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    words: stats.words,
    sections: extractSections(content),
  };
}

let cache: Post[] | null = null;

/** All non-draft posts, newest first. Drafts are included only in development. */
export function allPosts(): Post[] {
  if (cache) return cache;

  if (!fs.existsSync(WRITING_DIR)) return [];

  const posts = fs
    .readdirSync(WRITING_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => read(f.replace(/\.mdx$/, "")))
    .filter((p): p is Post => p !== null)
    .filter((p) => !p.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      // Same publication date: fall back to the explicit order field, then title.
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title);
    });

  cache = posts;
  return posts;
}

export function postSlugs(): string[] {
  return allPosts().map((p) => p.slug);
}

export function getPost(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

export function postsByPillar(pillar: PillarId): Post[] {
  return allPosts().filter((p) => p.pillar === pillar);
}

/**
 * Related reading: same pillar first, then most recent, never the post itself.
 */
export function relatedPosts(slug: string, limit = 3): Post[] {
  const post = getPost(slug);
  if (!post) return [];
  const rest = allPosts().filter((p) => p.slug !== slug);
  const sameP = rest.filter((p) => p.pillar === post.pillar);
  const others = rest.filter((p) => p.pillar !== post.pillar);
  return [...sameP, ...others].slice(0, limit);
}

export function adjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const posts = allPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { next: posts[i - 1], prev: posts[i + 1] };
}
