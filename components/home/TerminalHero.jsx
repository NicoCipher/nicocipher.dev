"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import sessions from "@/data/terminal-sessions.json";
import styles from "./TerminalHero.module.css";

/* Typing speed — realistic variation */
function charDelay() {
  return 45 + Math.random() * 65;
}

export default function TerminalHero() {
  const [sessionIdx, setSessionIdx]   = useState(0);
  const [cmdIdx, setCmdIdx]           = useState(0);
  const [typedChars, setTypedChars]   = useState(0);
  const [committedLines, setCommittedLines] = useState([]); // {kind, prompt?, text}
  const [phase, setPhase]             = useState("typing");
  const [isPaused, setIsPaused]       = useState(false);
  const timerRef = useRef(null);

  const session  = sessions[sessionIdx];
  const command  = session.commands[cmdIdx];
  const fullCmd  = command?.command ?? "";
  const prompt   = command?.prompt  ?? "$";

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsPaused(true);
      // Immediately display complete session
      const allLines = [];
      session.commands.forEach((c) => {
        allLines.push({ kind: "cmd", prompt: c.prompt || "$", text: c.command });
        if (c.output) {
          c.output.split("\n").forEach((t) => allLines.push({ kind: "out", text: t }));
        }
      });
      setCommittedLines(allLines);
      setPhase("pause");
    }
  }, [session]);

  /* Reset everything when session changes */
  useEffect(() => {
    if (isPaused) return;
    setCommittedLines([]);
    setCmdIdx(0);
    setTypedChars(0);
    setPhase("typing");
  }, [sessionIdx, isPaused]);

  /* Reset cursor when command index changes */
  useEffect(() => {
    if (isPaused) return;
    setTypedChars(0);
    setPhase("typing");
  }, [cmdIdx, isPaused]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    if (phase === "typing") {
      if (typedChars < fullCmd.length) {
        // Type next character
        timerRef.current = setTimeout(() => {
          setTypedChars((n) => n + 1);
        }, charDelay());
      } else {
        // Done typing — commit the command line then show output
        timerRef.current = setTimeout(() => {
          const outputLines = (command.output || "").split("\n").map((t) => ({ kind: "out", text: t }));
          setCommittedLines((prev) => [
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
        }, 900);
      } else {
        // Session done — wait then move to next session
        timerRef.current = setTimeout(() => {
          setSessionIdx((i) => (i + 1) % sessions.length);
        }, 3200);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [phase, typedChars, cmdIdx, sessionIdx, isPaused, fullCmd, command, prompt, session.commands.length]);

  const cursor = fullCmd.slice(0, typedChars);
  const isTyping = phase === "typing" && !isPaused;

  const nextSession = () => {
    setSessionIdx((i) => (i + 1) % sessions.length);
  };

  const prevSession = () => {
    setSessionIdx((i) => (i - 1 + sessions.length) % sessions.length);
  };

  return (
    <section className={styles.section} aria-label="Terminal evidence replay">
      <div className={styles.terminal}>

        {/* Title bar */}
        <div className={styles.titleBar}>
          <div className={styles.dots} aria-hidden="true">
            <span className={styles.dot} style={{ background: "#ff5f57" }} />
            <span className={styles.dot} style={{ background: "#febc2e" }} />
            <span className={styles.dot} style={{ background: "#28c840" }} />
          </div>
          <span className={styles.sessionLabel}>{session.title}</span>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.cycleBtn}
              onClick={prevSession}
              aria-label="Previous terminal session"
              title="Previous session"
            >
              ←
            </button>
            <button
              type="button"
              className={styles.playbackBtn}
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? "Resume terminal animation" : "Pause terminal animation"}
              title={isPaused ? "Resume animation" : "Pause animation"}
            >
              {isPaused ? "▶ Play" : "❚❚ Pause"}
            </button>
            <button
              type="button"
              className={styles.cycleBtn}
              onClick={nextSession}
              aria-label="Next terminal session"
              title="Next session"
            >
              →
            </button>
          </div>
        </div>

        {/* Context bar — explains what this command proves */}
        {session.description && (
          <div className={styles.contextBar}>
            <span className={styles.contextDot} aria-hidden="true" />
            <span className={styles.contextPrefix}>Replay: </span>
            <span className={styles.contextText}>{session.description}</span>
          </div>
        )}

        {/* Accessible screen reader summary */}
        <div className="visually-hidden">
          Demonstration replay for {session.title}: {session.description}.
        </div>

        {/* Terminal body - aria-hidden from screen readers to prevent rapid character interruptions */}
        <div className={styles.body} aria-hidden="true">
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
            <span className={styles.caret}>▋</span>
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
