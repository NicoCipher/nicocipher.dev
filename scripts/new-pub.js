#!/usr/bin/env node

/**
 * CLI Publication Generator Script for nicocipher.dev
 * Run with: npm run new-pub
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n=== NICOCIPHER Publication Generator ===\n");

  console.log("Select Publication Type:");
  console.log("1) Project       (Macro engineering build or system)");
  console.log("2) Case Study    (Troubleshooting, investigation, production fix)");
  console.log("3) Lab           (Hands-on experiment, learning build)");
  console.log("4) Research Note (Threat research, analysis, RFC)");

  const typeChoice = await question("\nChoice (1-4): ");
  const typeMap = {
    "1": "project",
    "2": "case-study",
    "3": "lab",
    "4": "research",
  };

  const type = typeMap[typeChoice.trim()] || "case-study";

  const title = await question("Publication Title: ");
  const domain = await question("Domain (infrastructure | networking | security | development | creative): ") || "infrastructure";
  const effort = await question("Effort (e.g. 4h, 2 days, ongoing): ") || "2h";
  const techInput = await question("Technologies (comma separated): ");
  const tagsInput = await question("Tags (comma separated): ");

  const date = new Date().toISOString().slice(0, 10);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const technologies = techInput ? techInput.split(",").map((t) => t.trim()) : ["Linux"];
  const tags = tagsInput ? tagsInput.split(",").map((t) => t.trim()) : ["CLI"];

  const template = `---
type: "${type}"
title: "${title}"
slug: "${slug}"
date: "${date}"
status: "complete" # complete | active | paused
domain: "${domain}"
summary: "One sentence describing the ${type} and key outcome."
effort: "${effort}"
technologies:
${technologies.map((t) => `  - "${t}"`).join("\n")}
tags:
${tags.map((t) => `  - "${t}"`).join("\n")}
featured: false
evidence:
  - id: "evidence-1"
    type: "terminal" # diagram | terminal | log | config | pcap | artifact | snippet
    title: "Terminal Output / Log Excerpt"
    content: |
      $ echo "Sample evidence log"
    language: "bash"
---

## 1. Objective

Describe the goal and technical motivation.

## 2. Environment & Setup

Detail the initial configuration, hardware/VM specs, and prerequisites.

## 3. Implementation & Analysis

Document the exact steps, commands, and architecture.

## 4. Evidence & Diagnostics

Reference evidence blocks and detail empirical findings.

## 5. What Went Wrong (The Friction Point)

Detail the error, failure mode, or misconfiguration encountered and how it was diagnosed.

## 6. Resolution & Takeaways

Explain the resolution and permanent takeaways.
`;

  const targetDir = path.join(process.cwd(), "content", "publications", type);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, `${date}-${slug}.md`);
  fs.writeFileSync(filePath, template, "utf8");

  console.log(`\n✅ Publication template generated successfully:`);
  console.log(`   ${filePath}\n`);

  rl.close();
}

main().catch((err) => {
  console.error("Error generating publication:", err);
  rl.close();
});
