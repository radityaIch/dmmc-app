import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const entry = path.join(projectRoot, "bookmarklets-src", "bookmarklet-maimai-export.v2.ts");
  const out = path.join(projectRoot, "public", "bookmarklet-maimai-export.v2.js");

  await esbuild.build({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: "browser",
    target: ["es2017"],
    format: "iife",
    charset: "utf8",
    logLevel: "info",
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "production"),
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
