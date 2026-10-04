import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  // This app lives in a subfolder of a larger repo; keep its root here.
  outputFileTracingIncludes: { "/api/mileage": ["./assets/mileage-template.xlsx"] },
  turbopack: { root: path.resolve(__dirname) },
};
export default config;
