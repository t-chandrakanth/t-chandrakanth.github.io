import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const read = (f: string) => fs.readFileSync(path.join(FONT_DIR, f));

const PAPER = "#fbf9f5";
const INK = "#17150f";
const INK_MUTED = "#56524a";
const INK_FAINT = "#8b857b";
const RULE = "#ded6c7";
const ACCENT = "#a93b22";

/**
 * The social card is the same document the site is: paper, hairlines, a mono
 * kicker and a serif line. It has to be legible as a 400px-wide thumbnail, so
 * the title never drops below 48px and there are at most four elements on it.
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
              fontFamily: "Plex",
              fontSize: 21,
              letterSpacing: 3.4,
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 500,
            }}
          >
            {kicker}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Newsreader",
            fontSize: long ? 62 : 76,
            lineHeight: 1.08,
            letterSpacing: -1.8,
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
              <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: 32, color: INK }}>
                {site.name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Plex",
                  fontSize: 19,
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
                  fontFamily: "Plex",
                  fontSize: 19,
                  letterSpacing: 2.2,
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
        { name: "Newsreader", data: read("Newsreader-Regular.ttf"), weight: 400, style: "normal" },
        { name: "Plex", data: read("IBMPlexMono-Regular.ttf"), weight: 400, style: "normal" },
        { name: "Plex", data: read("IBMPlexMono-Medium.ttf"), weight: 500, style: "normal" },
      ],
    },
  );
}
