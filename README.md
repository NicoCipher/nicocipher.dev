# nicocipher.dev

Engineering Portfolio Publication System — projects, case studies, labs, and research notes.

Built with Next.js 15. Designed as a software product, not a template.

---

## What This Is

An engineering publication system that documents, organizes, and presents evidence-backed work across cybersecurity, infrastructure, networking, and software engineering.

This product is built for depth and credibility:
- **Zero generic marketing fluffs** or hero banner gimmicks.
- **Evidence-first methodology**: Terminal outputs, architecture diagrams, diffs, packet captures, and checksummed artifacts rendered alongside explanations.
- **Strict publication types**: Projects, Case Studies, Labs, and Research Notes.

## Architectural Principles

| Principle | Decision |
|---|---|
| **Next.js 15 (App Router)** | Static HTML generation, file-based routing, server components by default. Instant load performance. |
| **CSS Modules + Custom Properties** | Zero-runtime styling. Complete design token isolation in `globals.css` with scoped CSS modules. |
| **Zero Tailwind / Zero UI Frameworks** | Custom design system built with CSS custom properties. Maximum control, minimum dependency weight. |
| **Minimal Dependencies** | Next.js, React, React DOM, gray-matter, marked. Zero unnecessary runtime bloat. |
| **Client JS Budget < 50KB** | Interactivity isolated to search command palette and filters. Core reading paths are 100% server HTML. |

## Publication Types

1. **Project** (`/publications/project`) — Macro-level system creation or major architecture builds.
2. **Case Study** (`/publications/case-study`) — Technical investigations, troubleshooting, and production incident resolution.
3. **Lab** (`/publications/lab`) — Hands-on experiments, learning exercises, and infrastructure builds.
4. **Research Note** (`/publications/research`) — Technical analysis, RFC-style thinking, and threat research.

## Authoring Workflow

Publications are written in structured Markdown + YAML in `content/publications/`.

To create a new publication interactively:

```bash
npm run new-pub
```

This CLI tool prompts for type, title, and metadata, generating a strictly formatted template.

## Local Development

```bash
git clone https://github.com/NicoCipher/nicocipher.dev.git
cd nicocipher.dev
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Architecture

```
app/                    Routes (App Router)
  publications/         Master publication routes (/projects, /case-studies, /labs, /research)
  systems/              Technology & domain taxonomy map
  about/                Engineering methodology & profile
components/             UI components (layout, content, home, command-palette)
lib/                    Core logic (markdown parsing, search index, cross-referencing)
content/publications/   Source publication files (project, case-study, lab, research)
data/                   Profile, current focus, and domain data
scripts/                CLI authoring scripts (new-pub.js)
```

## License

[MIT](LICENSE)
