import { createReadStream } from "node:fs";
import { join, normalize } from "node:path";
import { stat } from "node:fs/promises";
import handler from "../dist/server/index.js";

const CLIENT_DIR = join(process.cwd(), "dist", "client");

/**
 * Serve a static file from dist/client/ if it exists, otherwise null.
 */
async function fetchAsset(pathname) {
  // Prevent directory traversal
  const safe = normalize(pathname).replace(/^\/+/, "");
  const filePath = join(CLIENT_DIR, safe);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;

    const body = createReadStream(filePath);
    return new Response(body, {
      status: 200,
      headers: { "Content-Length": String(info.size) },
    });
  } catch {
    return null;
  }
}

/**
 * Vercel serverless entry point. Forwards all requests to the vinext
 * Cloudflare Workers handler with a shim for the ASSETS binding.
 */
export default async function server(req, res) {
  const host = req.headers.host ?? "localhost";
  const protocol = req.headers["x-forwarded-proto"] ?? "http";
  const url = new URL(req.url, `${protocol}://${host}`);

  // Build a Web Request from the Node.js incoming message
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? req
        : undefined,
  });

  // Shim the Cloudflare ASSETS binding with our local file system
  const env = {
    ASSETS: { fetch: (assetReq) => fetchAsset(new URL(assetReq.url).pathname) },
  };

  try {
    const response = await handler.fetch(webRequest, env, {});

    res.statusCode = response.status;

    // Forward response headers, skipping transfer-encoding (Node manages it)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    if (response.body) {
      // Stream the web Response body into the Node.js response
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(value);
        }
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err) {
    console.error("[vinext-vercel]", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
