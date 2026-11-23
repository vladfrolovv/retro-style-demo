import { createServer } from "node:http";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "site");
const port = Number(process.env.PORT || 8790);
const base = "/" + (process.env.BASE || "retro-style-demo").replace(/^\/|\/$/g, "") + "/";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".wasm": "application/wasm",
  ".unityweb": "application/octet-stream",
  ".bin": "application/octet-stream",
  ".hash": "text/plain",
  ".xml": "application/xml"
};

async function exactPath(file) {
  const relative = path.relative(root, file).split(path.sep);
  let current = root;
  for (const part of relative) {
    const names = await fs.readdir(current);
    if (!names.includes(part)) {
      return false;
    }
    current = path.join(current, part);
  }
  return true;
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const log = () => console.log(`${res.statusCode} ${req.method} ${url.pathname}${req.headers.range ? " " + req.headers.range : ""}`);

  if (url.pathname === base.slice(0, -1) || url.pathname === "/") {
    res.writeHead(301, { Location: base });
    res.end();
    log();
    return;
  }
  if (!url.pathname.startsWith(base)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not under " + base);
    log();
    return;
  }

  let file = path.join(root, decodeURIComponent(url.pathname.slice(base.length)));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    log();
    return;
  }

  try {
    let stat = await fs.stat(file);
    if (stat.isDirectory()) {
      file = path.join(file, "index.html");
      stat = await fs.stat(file);
    }
    if (!(await exactPath(file))) {
      throw new Error("case mismatch");
    }
    const headers = {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store"
    };
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (range && (range[1] || range[2])) {
      let start = range[1] ? Number(range[1]) : stat.size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : stat.size - 1;
      end = Math.min(end, stat.size - 1);
      if (start > end || start < 0) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        res.end();
        log();
        return;
      }
      res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": end - start + 1 });
      if (req.method === "HEAD") {
        res.end();
      } else {
        createReadStream(file, { start, end }).pipe(res);
      }
      log();
      return;
    }
    res.writeHead(200, { ...headers, "Content-Length": stat.size });
    if (req.method === "HEAD") {
      res.end();
    } else {
      createReadStream(file).pipe(res);
    }
    log();
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    log();
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}${base} (no Content-Encoding, like GitHub Pages for .unityweb)`);
});
