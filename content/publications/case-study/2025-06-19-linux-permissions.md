---
type: "case-study"
title: "chmod Numeric Modes vs Symbolic Translation"
slug: "linux-permissions"
date: "2025-06-19"
status: "complete"
domain: "infrastructure"
summary: "Debugging script execution failures in disposable VMs and analyzing the operational trade-offs of chmod 777 vs 744."
effort: "2h"
technologies:
  - "Linux"
  - "Bash"
  - "Ubuntu"
tags:
  - "Linux"
  - "Permissions"
  - "CLI"
featured: true
evidence:
  - id: "permission-log"
    type: "terminal"
    title: "Initial File Permission Audit"
    content: |
      $ ls -l backup.sh
      -rwxr--r--  1 nico nico  220 Jun 19 09:14 backup.sh
    language: "bash"
---

## 1. Objective

Get comfortable enough with file permissions that I can read, evaluate, and assign appropriate modes without stopping to mentally translate symbolic notation.

## 2. Setup & Execution

Working in a disposable VM, deliberately breaking and fixing permissions on test scripts to verify execution mechanics under different user contexts.

## 3. The "D'oh!" Friction Point

Hit a permission denied error on a script and, instead of figuring out what access level was required, ran `chmod 777` to make it execute. It worked immediately, which made it worse — I had learned nothing and opened full read/write/execute permissions to all system accounts. 

## 4. Resolution & Takeaway

Went back afterward and calculated the precise minimum permission required: `chmod 744` (`rwxr--r--`). Numeric mode `744` can be read at sight; symbolic mode (`u+x, g-w, o=r`) still requires conscious translation.
