import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-static";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/writing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/research", priority: 0.9, changeFrequency: "monthly" },
  { path: "/publications", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/cv", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = allPosts();
  const newest = posts[0]?.date ?? new Date().toISOString().slice(0, 10);

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: newest,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...posts.map((p) => ({
      url: `${site.url}/writing/${p.slug}`,
      lastModified: p.updated ?? p.date,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
