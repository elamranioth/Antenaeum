import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

await copyFile("dist/src/index.html", "dist/index.html");
await copyFile("dist/index.html", "index.html");

await mkdir("assets", { recursive: true });

const builtAssets = await readdir("dist/assets");
await Promise.all(
  builtAssets
    .filter((name) => name.startsWith("index-") && name.endsWith(".js"))
    .map((name) => copyFile(join("dist/assets", name), join("assets", name)))
);
