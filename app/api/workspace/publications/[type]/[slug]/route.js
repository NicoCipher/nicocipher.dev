import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deserializePublication, serializePublication } from "@/lib/serializer";

const CONTENT_DIR = path.join(process.cwd(), "content/publications");

/**
 * Resolve a publication file by type and slug.
 * Scans the directory for a file ending with `-<slug>.md`.
 */
function resolveFile(type, slug) {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    // Match: <date>-<slug>.md or just <slug>.md
    if (file.endsWith(`-${slug}.md`) || file === `${slug}.md`) {
      return path.join(dir, file);
    }
  }
  return null;
}

/**
 * GET /api/workspace/publications/[type]/[slug]
 */
export async function GET(request, { params }) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Workspace is dev-only" }, { status: 403 });
  }

  const { type, slug } = await params;
  const filePath = resolveFile(type, slug);

  if (!filePath) {
    return NextResponse.json({ error: `Not found: ${type}/${slug}` }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const pub = deserializePublication(raw);
  pub._filename = path.basename(filePath);
  pub._filepath = filePath;

  return NextResponse.json({ publication: pub });
}

/**
 * PUT /api/workspace/publications/[type]/[slug]
 * Updates an existing publication.
 */
export async function PUT(request, { params }) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Workspace is dev-only" }, { status: 403 });
  }

  const { type, slug } = await params;
  const filePath = resolveFile(type, slug);

  if (!filePath) {
    return NextResponse.json({ error: `Not found: ${type}/${slug}` }, { status: 404 });
  }

  try {
    const data = await request.json();
    const content = serializePublication(data);
    fs.writeFileSync(filePath, content, "utf8");

    return NextResponse.json({ success: true, path: path.relative(process.cwd(), filePath) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/workspace/publications/[type]/[slug]
 */
export async function DELETE(request, { params }) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Workspace is dev-only" }, { status: 403 });
  }

  const { type, slug } = await params;
  const filePath = resolveFile(type, slug);

  if (!filePath) {
    return NextResponse.json({ error: `Not found: ${type}/${slug}` }, { status: 404 });
  }

  try {
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true, deleted: path.basename(filePath) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
