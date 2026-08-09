# nicocipher.dev

**Engineering Portfolio & Technical Publication System**

`nicocipher.dev` is my engineering portfolio — a structured record of the systems I build, the problems I investigate, the infrastructure I operate, and the technical decisions behind the work.

This is not a collection of polished project cards.

It is designed as a **technical publication system** where the work itself is the evidence.

---

## What This Is

The portfolio documents work across:

* Cybersecurity
* Infrastructure & networking
* Software engineering
* Systems architecture
* Technical research
* Hands-on laboratories

The objective is simple:

> **Show how I think, build, investigate, and solve technical problems — not just what technologies I have used.**

Publications can include architecture diagrams, terminal output, configuration, test results, packet captures, implementation details, troubleshooting evidence, and technical reasoning where appropriate.

---

## Evidence Over Claims

A conventional portfolio often says:

> "Built a secure and scalable system."

This portfolio is designed to answer:

* What was actually built?
* Why was it designed that way?
* What constraints existed?
* What failed?
* How was it investigated?
* What evidence supports the result?
* What trade-offs were made?
* What was learned?

The goal is to make technical work **inspectable rather than merely presentable**.

---

## Publication Model

The system uses four primary publication types.

| Type              | Purpose                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Project**       | Significant systems, applications, architectures, or engineering builds.                                      |
| **Case Study**    | Technical investigations, failures, troubleshooting, and problem resolution.                                  |
| **Lab**           | Controlled experiments, infrastructure exercises, security testing, and hands-on learning.                    |
| **Research Note** | Technical analysis, emerging technologies, threat research, RFC-style thinking, and engineering observations. |

Each publication follows a structured schema so that content remains consistent as the portfolio grows.

---

## Architecture

The portfolio is built as a small software product rather than a static template.

### Core stack

* **Next.js 15**
* **React**
* **TypeScript**
* **CSS Modules**
* **CSS Custom Properties**
* **Markdown**
* **YAML frontmatter**

### Design decisions

**Server-first rendering**

The primary reading experience is designed around server-rendered content. Client-side JavaScript is introduced only where interaction requires it.

**Custom design system**

The interface uses CSS Modules and custom properties rather than a UI framework. This keeps the visual system under direct control and avoids unnecessary abstraction.

**Content as structured data**

Publications are stored as Markdown documents with structured metadata rather than being hard-coded into individual pages.

**Minimal dependency surface**

The system intentionally avoids unnecessary libraries and abstractions. Dependencies should solve real problems rather than exist simply because they are conventional.

---

## Content Architecture

```text
content/
└── publications/
    ├── project/
    ├── case-study/
    ├── lab/
    └── research/
```

A publication is the canonical source of its content.

The application consumes these documents and generates the appropriate presentation, indexing, taxonomy, and cross-references.

This separation keeps **content independent from presentation**.

---

## Project Structure

```text
app/
├── publications/       Publication routes
├── systems/            Technology and domain taxonomy
├── about/              Engineering methodology and profile
└── ...

components/
├── layout/
├── content/
├── home/
└── command-palette/

lib/
├── content/
├── search/
└── ...

content/
└── publications/
    ├── project/
    ├── case-study/
    ├── lab/
    └── research/

data/
└── Profile and domain data

scripts/
└── new-pub.js          Publication authoring CLI
```

---

## Authoring

New publications can be generated through the authoring CLI:

```bash
npm run new-pub
```

The command collects the required metadata and generates a structured publication template.

This keeps publication structure predictable while allowing the actual technical content to remain flexible.

---

## Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/NicoCipher/nicocipher.dev.git
cd nicocipher.dev
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Engineering Philosophy

The system is guided by a few principles:

### 01 — Evidence over adjectives

Technical credibility should come from demonstrated work rather than descriptions such as *innovative*, *scalable*, or *cutting-edge*.

### 02 — Decisions matter

A finished system is only part of the story. The constraints, alternatives, failures, and reasoning behind decisions are equally important.

### 03 — Build in public, document responsibly

The portfolio can expose engineering process without exposing secrets, credentials, private infrastructure, or sensitive information.

### 04 — Learning is part of engineering

Labs and experiments are treated as legitimate engineering artifacts when they demonstrate meaningful investigation and understanding.

### 05 — The portfolio is itself a system

The portfolio is not only documentation of engineering work.

**It is also an engineering project.**

Its architecture, content pipeline, authoring workflow, performance, accessibility, and maintainability are themselves subject to engineering decisions and iteration.

---

## Status

`nicocipher.dev` is an actively evolving system.

The architecture and publication model will continue to change as the portfolio grows and new engineering requirements emerge.

---

## License

Copyright © 2026 NicoCipher. All rights reserved.

The source code, designs, written content, graphics, and other materials in this repository are proprietary to NicoCipher.

See [`LICENSE`](LICENSE) for the full terms.
