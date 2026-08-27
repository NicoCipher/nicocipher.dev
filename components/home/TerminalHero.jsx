"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import sessions from "@/data/terminal-sessions.json";
import styles from "./TerminalHero.module.css";

/* Typing speed — realistic variation */
function charDelay() {
  return 45 + Math.random() * 65;
}

/*
  State machine phases:
    "typing"  → type one char of current command
    "output"  → show output lines instantly, then pause
    "pause"   → wait before next command / next session
*/

export default function TerminalHero() {
  const [sessionIdx, setSessionIdx]   = useState(0);
  const [cmdIdx, setCmdIdx]           = useState(0);
  const [typedChars, setTypedChars]   = useState(0);
  const [committedLines, setCommittedLines] = useState([]); // {kind, prompt?, text}
  const [phase, setPhase]             = useState("typing");
  const timerRef = useRef(null);

  const session  = sessions[sessionIdx];
  const command  = session.commands[cmdIdx];
  const fullCmd  = command?.command ?? "";
  const prompt   = command?.prompt  ?? "$";

  /* Reset everything when session changes */
  useEffect(() => {
    setCommittedLines([]);
    setCmdIdx(0);
    setTypedChars(0);
    setPhase("typing");
  }, [sessionIdx]);

  /* Reset cursor when command index changes */
  useEffect(() => {
    setTypedChars(0);
    setPhase("typing");
  }, [cmdIdx]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (phase === "typing") {
      if (typedChars < fullCmd.length) {
        // Type next character
        timerRef.current = setTimeout(() => {
          setTypedChars(n => n + 1);
        }, charDelay());
      } else {
        // Done typing — commit the command line then show output
        timerRef.current = setTimeout(() => {
          const outputLines = (command.output || "").split("\n").map(t => ({ kind: "out", text: t }));
          setCommittedLines(prev => [
            ...prev,
            { kind: "cmd", prompt, text: fullCmd },
            ...outputLines,
          ]);
          setTypedChars(0);
          setPhase("pause");
        }, 280);
      }
    }

    if (phase === "pause") {
      const nextCmdIdx = cmdIdx + 1;
      if (nextCmdIdx < session.commands.length) {
        // More commands in this session
        timerRef.current = setTimeout(() => {
          setCmdIdx(nextCmdIdx);
          // phase reset handled in cmdIdx effect
        }, 900);
      } else {
        // Session done — wait then move to next session
        timerRef.current = setTimeout(() => {
          setSessionIdx(i => (i + 1) % sessions.length);
        }, 3200);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [phase, typedChars, cmdIdx, sessionIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const cursor = fullCmd.slice(0, typedChars);
  const isTyping = phase === "typing";

  return (
    <section className={styles.section} aria-label="Live terminal session replay">
      <div className={styles.terminal}>

        {/* Title bar */}
        <div className={styles.titleBar}>
          <div className={styles.dots}>
            <span className={styles.dot} style={{ background: "#ff5f57" }} />
            <span className={styles.dot} style={{ background: "#febc2e" }} />
            <span className={styles.dot} style={{ background: "#28c840" }} />
          </div>
          <span className={styles.sessionLabel}>{session.title}</span>
          <span className={styles.sessionMeta}>{session.label}</span>
        </div>

        {/* Terminal body */}
        <div className={styles.body} aria-live="polite">
          {committedLines.map((line, i) =>
            line.kind === "cmd" ? (
              <div key={i} className={styles.line}>
                <span className={styles.prompt}>{line.prompt}</span>
                <span className={styles.cmd}>{line.text}</span>
              </div>
            ) : (
              <div key={i} className={`${styles.line} ${styles.output}`}>
                {line.text}
              </div>
            )
          )}

          {/* Active typing line */}
          <div className={styles.line}>
            <span className={styles.prompt}>{prompt}</span>
            {isTyping && <span className={styles.cmd}>{cursor}</span>}
            <span className={styles.caret} aria-hidden="true">▋</span>
          </div>
        </div>

        {/* Footer — link to publication */}
        <div className={styles.footer}>
          <span className={styles.footerLabel}>Evidence from</span>
          <Link href={session.link} className={styles.footerLink}>
            {session.title} →
          </Link>
        </div>
      </div>
    </section>
  );
}
