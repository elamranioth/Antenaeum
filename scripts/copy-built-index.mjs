import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

await copyFile("dist/src/index.html", "dist/index.html");

const builtIndex = await readFile("dist/index.html", "utf8");
const portableIndex = builtIndex
  .replaceAll("/Antenaeum/assets/", "assets/")
  .replaceAll("/Antenaeum/manifest.webmanifest", "manifest.webmanifest")
  .replaceAll("/Antenaeum/config.js", "config.js")
  .replaceAll("/Antenaeum/icons/", "icons/");

await writeFile("dist/index.html", portableIndex);
await writeFile("index.html", portableIndex);

await mkdir("assets", { recursive: true });
const builtAssets = await readdir("dist/assets");
await Promise.all(
  builtAssets
    .filter((name) => name.startsWith("index-") && name.endsWith(".js"))
    .map((name) => copyFile(join("dist/assets", name), join("assets", name)))
);

await copyFile("dist/manifest.webmanifest", "manifest.webmanifest");
await copyFile("dist/sw.js", "sw.js");
await copyFile("dist/config.js", "config.js");
await mkdir("icons", { recursive: true });

const builtIcons = await readdir("dist/icons");
await Promise.all(
  builtIcons.map((name) => copyFile(join("dist/icons", name), join("icons", name)))
);
