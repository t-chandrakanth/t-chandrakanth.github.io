"use client";

import { useEffect, useState } from "react";

/** A hairline that fills as you move through the article. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const start = article.offsetTop;
      const span = article.offsetHeight - window.innerHeight * 0.4;
      const travelled = window.scrollY - start;
      setPct(Math.min(1, Math.max(0, span > 0 ? travelled / span : 0)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[55] h-px bg-transparent"
    >
      <div
        className="h-px origin-left bg-accent transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  );
}
