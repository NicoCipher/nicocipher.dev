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
      $ ./backup.sh
      bash: ./backup.sh: Permission denied
    language: "bash"
  - id: "permission-fix"
    type: "terminal"
    title: "Targeted Permission Fix"
    content: |
      $ chmod 744 backup.sh
      $ ls -l backup.sh
      -rwxr--r--  1 nico nico  220 Jun 19 09:14 backup.sh
      $ ./backup.sh
      Backup completed successfully.
    language: "bash"
  - id: "permission-table"
    type: "snippet"
    title: "Permission Bit Reference"
    content: |
      Octal  Binary  Permissions
      0      000     ---
      1      001     --x
      2      010     -w-
      3      011     -wx
      4      100     r--
      5      101     r-x
      6      110     rw-
      7      111     rwx
    language: "text"
---

## 1. Objective

Get comfortable enough with file permissions that I can read, evaluate, and assign appropriate modes without stopping to mentally translate symbolic notation.

## 2. Setup & Execution

Working in a disposable Ubuntu VM, I created several test scripts and intentionally misconfigured their permissions to observe failure modes under different user contexts:

- Created `backup.sh`, `deploy.sh`, and `cleanup.sh` as test subjects
- Switched between `root`, the primary user, and a newly created `testuser` account
- Tested execution, read, and write operations under each context
- Logged every `ls -l` output before and after permission changes

The key experiment was running a script as the file owner vs. as `testuser` (who falls under "other") to see where permission boundaries actually bite.

## 3. The Friction Point

Hit a permission denied error on `backup.sh` and reflexively ran `chmod 777` to unblock myself. It worked immediately, which was the problem — I had learned nothing about *why* it failed, and I had opened full read/write/execute permissions to every account on the system.

In a production context, `chmod 777` on a backup script means any user can read its contents (potentially exposing credentials or paths), modify its logic, or execute it. This is the security equivalent of removing every lock from every door because one key didn't work.

## 4. Analysis

The actual failure was that `testuser` lacked execute permission. The file was `744` (`rwxr--r--`), which gives the owner full access but only read to group and others. The fix was either:

- `chmod 745` — add execute for others specifically
- `chmod 755` — add read+execute for group and others (the common default for scripts)
- Add `testuser` to the owner's group and use `chmod 754`

Each option has different security implications. The right choice depends on who needs to run the script and what the script accesses.

### Numeric vs. Symbolic Notation

| Notation | Command | Reads As |
|---|---|---|
| Numeric | `chmod 755` | "Owner: all. Group: read+execute. Others: read+execute." |
| Symbolic | `chmod u=rwx,go=rx` | "Set user to rwx, group and others to rx." |
| Symbolic (relative) | `chmod o+x` | "Add execute for others." |

Numeric is faster to read at sight once memorized. Symbolic is safer for surgical changes because you're adding or removing specific bits rather than overwriting the full mode.

## 5. What Went Wrong

- Reached for `chmod 777` as a debugging shortcut instead of diagnosing the actual permission gap
- Did not verify which user context the script was being executed under before changing permissions
- Initially confused the group field with the others field in `ls -l` output

## 6. Permanent Takeaway

The octal system is a base-8 encoding of three binary permission bits (read=4, write=2, execute=1) applied to three identity classes (user, group, other). Once that mapping is internalized, any three-digit mode can be read instantly without translation.

`chmod 777` is never the answer in any context where security matters. The correct workflow is: identify who needs what access, calculate the minimum octal mode, apply it, and verify with `ls -l`.
