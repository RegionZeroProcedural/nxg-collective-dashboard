// Serve the production export without requiring a Next.js runtime.
import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";

const root = path.resolve("out");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};
const port = Number(process.env.PORT || 3000);
http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      let file = path.resolve(root, `.${pathname}`);
      if (file !== root && !file.startsWith(root + path.sep))
        throw new Error("Invalid path");
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const content = await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      });
      response.end(content);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`NXG production preview: http://127.0.0.1:${port}`),
  );
