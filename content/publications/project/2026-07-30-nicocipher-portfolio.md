---
type: "project"
title: "Engineering Portfolio Publication System"
slug: "nicocipher-portfolio"
date: "2026-07-30"
status: "active"
domain: "development"
summary: "A production Next.js 15 publication engine built with zero-Tailwind CSS modules, evidence-first schemas, and 5 total npm dependencies."
effort: "ongoing"
technologies:
  - "Next.js 15"
  - "React 19"
  - "CSS Modules"
  - "JavaScript"
tags:
  - "Frontend Architecture"
  - "Web Performance"
  - "Design Systems"
  - "Static Site Generation"
featured: true
related:
  - "linux-permissions"
  - "domain-controller"
evidence:
  - id: "dependency-budget"
    type: "config"
    title: "Dependency Budget — package.json"
    content: |
      "dependencies": {
        "gray-matter": "^4.0.3",
        "marked": "^15.0.7",
        "next": "^15.1.7",
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
      }
    language: "json"
  - id: "build-output"
    type: "terminal"
    title: "Production Build Output"
    content: |
      $ npm run build

      ▲ Next.js 15.5.22

      Creating an optimized production build ...
      ✓ Compiled successfully in 2.5s
      ✓ Generating static pages (13/13)

      Route (app)                              Size  First Load JS
      ○ /                                     851 B         107 kB
      ○ /about                                535 B         106 kB
      ● /publications/[type]/[slug]         1.39 kB         107 kB
      + First Load JS shared by all           103 kB
    language: "bash"
  - id: "architecture-diagram"
    type: "diagram"
    title: "Publication Data Flow"
    caption: "Content flows from Markdown files through the build pipeline to statically rendered pages."
---

## 1. Objective

Build an engineering portfolio publication system that presents evidence-backed technical work without generic marketing fluff, bloated dependencies, or runtime JavaScript overhead.

The system must function as a static site generator that takes structured Markdown files with YAML frontmatter and produces fully pre-rendered HTML pages at build time.

## 2. Architecture

### Core Constraints

| Constraint | Rationale |
|---|---|
| Zero Tailwind | Full control over the design system via CSS Custom Properties |
| 5 npm dependencies | Minimal supply chain surface area |
| 100% SSG | No server runtime required — deploy anywhere as static files |
| CSS Modules | Scoped styles without naming conventions or build plugins |
| Vanilla JS | No TypeScript overhead for a content-focused system |

### Publication Schema

Every publication is a Markdown file in `content/publications/<type>/<date>-<slug>.md` with structured YAML frontmatter:

- **type** — project, case-study, lab, or research
- **evidence** — array of typed evidence blocks (terminal, config, diagram, log, artifact)
- **technologies** — searchable technology tags
- **domain** — engineering domain classification
- **status** — complete, active, paused, or planned

### Rendering Pipeline

1. `gray-matter` parses YAML frontmatter from Markdown files
2. `marked` converts Markdown body to HTML with GFM support
3. Next.js `generateStaticParams` pre-renders every publication at build time
4. Evidence blocks render through type-dispatched React components (no dangerouslySetInnerHTML)
5. The command palette search index is built server-side and serialized to the client as a prop

## 3. Key Design Decisions

### Evidence as First-Class Data

Evidence blocks are not embedded in Markdown body text — they live in the YAML frontmatter as a structured array. This means:

- Each evidence item has a `type`, `title`, `id`, and typed `content`
- Terminal logs, config snippets, and diagrams render with distinct UI treatments
- Evidence is indexable, searchable, and structurally consistent across all publications
- The same evidence schema will be used by the future Publishing Workspace authoring UI

### Scored Command Palette Search

The command palette indexes every publication's title, tags, technologies, domain, evidence types, and summary. Search scoring uses 8 levels of relevance — exact title matches score highest, evidence type matches score lowest. Results are grouped by kind (publication, page, type filter).

### CSS Architecture

The design system is built entirely with CSS Custom Properties defined in `globals.css`:

- 7 background/surface colors
- 3 text hierarchy levels
- 2 accent colors (warm amber primary, green for active status)
- Modular type scale (1.25 ratio, base 16px)
- 4px spacing scale
- 2 motion tokens (120ms fast, 200ms base)

All component styles use CSS Modules. No global class names except the reset and token definitions.

## 4. What Went Wrong

- Initially tried to use TypeScript, but the type definitions added friction to a system where the data shapes are simple and stable. Removed it in favor of JSDoc comments where needed.
- The search scoring function was initially in `lib/search.js` alongside the server-side index builder, which imports `fs`. When the command palette (`"use client"`) imported it, webpack failed because `fs` can't resolve in the browser. Fixed by extracting the pure scoring logic into `lib/searchClient.js`.
- First pass at prose styles used `:global()` selectors too broadly, causing style leaks. Scoped them strictly to `.prose :global(h2)` etc.

## 5. Current State

The system is production-deployed with:

- 4 publications across all 4 types
- Dynamic sitemap and robots.txt generation
- Scored command palette with match highlighting
- Full WCAG accessibility (focus rings, skip link, aria-current, reduced motion)
- 103 kB shared JS budget (mostly React + Next.js framework overhead)

## 6. Permanent Takeaway

The best portfolio is the one that demonstrates engineering discipline in its own construction. Every architectural decision in this system — from the 5-dependency budget to the evidence-first schema to the CSS-only design system — is itself a demonstration of the engineering judgment it aims to showcase.
