import http from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, "dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    let filePath = req.url === "/" ? "/index.html" : req.url;
    const fullPath = join(distPath, filePath);
    const data = await readFile(fullPath);
    const ext = extname(fullPath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(data);
  } catch (err) {
    // SPA fallback
    const index = await readFile(join(distPath, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(index);
  }
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`✅ Servindo app em http://localhost:${PORT}`)
);
