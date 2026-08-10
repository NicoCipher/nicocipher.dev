import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deserializePublication, serializePublication, getPublicationPath, slugify } from "@/lib/serializer";

const CONTENT_DIR = path.join(process.cwd(), "content/publications");
const VALID_TYPES = ["project", "case-study", "lab", "research"];

/**
 * GET /api/workspace/publications
 * Returns all publications as parsed frontmatter objects.
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Workspace is dev-only" }, { status: 403 });
  }

  const publications = [];

  for (const type of VALID_TYPES) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const pub = deserializePublication(raw);
      pub._filename = file;
      publications.push(pub);
    }
  }

  publications.sort((a, b) => (a.date < b.date ? 1 : -1));

  return NextResponse.json({ publications });
}

/**
 * POST /api/workspace/publications
 * Creates a new publication file.
 * Body: { type, title, slug?, date?, ... }
 */
export async function POST(request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Workspace is dev-only" }, { status: 403 });
  }

  try {
    const data = await request.json();

    if (!data.type || !VALID_TYPES.includes(data.type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
    }

    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = data.slug || slugify(data.title);
    const date = data.date || new Date().toISOString().split("T")[0];
    const filePath = path.join(process.cwd(), getPublicationPath(data.type, slug, date));

    // Check for slug collision
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Publication already exists: ${data.type}/${date}-${slug}.md` }, { status: 409 });
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = serializePublication({ ...data, slug, date });
    fs.writeFileSync(filePath, content, "utf8");

    return NextResponse.json({ success: true, path: getPublicationPath(data.type, slug, date), slug }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
