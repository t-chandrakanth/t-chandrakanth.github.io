import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const read = (f: string) => fs.readFileSync(path.join(FONT_DIR, f));

const PAPER = "#ffffff";
const INK = "#1d1d1f";
const INK_MUTED = "#515154";
const INK_FAINT = "#6e6e73";
const RULE = "#d2d2d7";
const ACCENT = "#0071e3";

/**
 * The social card is the same surface the site is: white, hairlines, a tracked
 * kicker and one tight sans line. Satori has no system fonts, so the SF stack
 * cannot resolve here — Inter stands in, the same face non-Apple visitors see.
 * It has to be legible as a 400px-wide thumbnail, so the title never drops
 * below 48px and there are at most four elements on it.
 */
export async function renderOgImage({
  kicker,
  title,
  meta,
}: {
  kicker: string;
  title: string;
  meta?: string;
}) {
  const long = title.length > 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "58px 64px",
          position: "relative",
        }}
      >
        {/* hairline frame */}
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            right: 22,
            bottom: 22,
            border: `1px solid ${RULE}`,
          }}
        />
        {/* accent tie, top-left */}
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            width: 150,
            height: 4,
            background: ACCENT,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontSize: 21,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 600,
            }}
          >
            {kicker}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: long ? 60 : 74,
            lineHeight: 1.07,
            letterSpacing: -2.2,
            color: INK,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: 1, background: RULE, marginBottom: 24 }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 30, letterSpacing: -0.7, color: INK }}>
                {site.name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontSize: 19,
                  letterSpacing: -0.3,
                  color: INK_MUTED,
                  marginTop: 8,
                }}
              >
                {site.url.replace(/^https?:\/\//, "")}
              </div>
            </div>
            {meta ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: 18,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: INK_FAINT,
                }}
              >
                {meta}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: read("Inter-Regular.ttf"), weight: 400, style: "normal" },
        { name: "Inter", data: read("Inter-SemiBold.ttf"), weight: 600, style: "normal" },
      ],
    },
  );
}
