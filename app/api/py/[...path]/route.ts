export const runtime = "nodejs";

function getBackendBase() {
  return (
    process.env.PY_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:8000"
  );
}

function filterResponseHeaders(headers: Headers) {
  const out = new Headers(headers);
  out.delete("content-encoding");
  out.delete("content-length");
  out.delete("transfer-encoding");
  out.delete("connection");
  return out;
}

async function proxy(req: Request, path: string[]) {
  const base = getBackendBase().replace(/\/+$/, "");
  const targetPath = path.map(encodeURIComponent).join("/");
  const url = new URL(req.url);
  const targetUrl = `${base}/${targetPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    // Node.js fetch requires duplex when sending a stream body.
    init.duplex = "half";
  }

  const res = await fetch(targetUrl, init);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: filterResponseHeaders(res.headers),
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function OPTIONS(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

