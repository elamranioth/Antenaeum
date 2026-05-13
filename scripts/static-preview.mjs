import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 5173);
const root = process.cwd();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function resolvePath(urlPath) {
  let path = decodeURIComponent(urlPath);
  path = path.replace(/^\/Antenaeum\/?/, "/");
  if (path === "/" || path === "") path = "/index.html";
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  return join(root, safe);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const filePath = resolvePath(url.pathname);
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, () => {
  console.log(`Athenaeum static preview listening on http://localhost:${port}/Antenaeum/`);
});
