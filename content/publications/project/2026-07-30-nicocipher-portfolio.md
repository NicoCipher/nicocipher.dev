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
featured: true
evidence:
  - id: "architecture-summary"
    type: "config"
    title: "Dependency Budget in package.json"
    content: |
      "dependencies": {
        "gray-matter": "^4.0.3",
        "marked": "^15.0.7",
        "next": "^15.1.7",
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
      }
    language: "json"
---

## 1. Objective

Build an engineering portfolio publication system that presents evidence-backed technical work across cybersecurity, networking, and software infrastructure without generic marketing fluff or bloated dependencies.

## 2. Environment & Architecture

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Vanilla CSS with custom properties design tokens and CSS Modules
- **Rendering**: 100% static HTML pre-generation at build time
- **Client JS Budget**: Under 50KB total, isolated to command palette search and domain filtering

## 3. Key Design Decisions

- Reject Tailwind CSS in favor of framework-agnostic CSS Custom Properties for tokens.
- Reject skill percentage bars in favor of a structured technology map.
- Elevate evidence (logs, PCAPs, diagrams, configs) into first-class schema properties.
