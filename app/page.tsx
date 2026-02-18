"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
    const [phase, setPhase] = useState<"intro" | "home">("intro");
    const [textVisible, setTextVisible] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [hovered, setHovered] = useState<"left" | "right" | null>(null);

    useEffect(() => {
        const t1 = setTimeout(() => setTextVisible(true), 800);
        const t2 = setTimeout(() => setFadeOut(true), 4200);
        const t3 = setTimeout(() => setPhase("home"), 5000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    /* ─── INTRO ─── */
    if (phase === "intro") {
        return (
            <>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #000000; }
          .orb {
            position: absolute; border-radius: 50%;
            filter: blur(100px); pointer-events: none;
          }
          @keyframes f1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,25px)} }
          @keyframes f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-20px)} }
          @keyframes ripple {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.7); opacity: 0; }
          }
          @keyframes blink {
            0%,100% { opacity: 0.2; transform: scale(0.85); }
            50%      { opacity: 1;   transform: scale(1.2); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(32px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .dot { animation: blink 1.3s ease-in-out infinite; }
          .d0  { animation-delay: 0s; }
          .d1  { animation-delay: 0.22s; }
          .d2  { animation-delay: 0.44s; }
        `}</style>

                <div style={{
                    position: "fixed", inset: 0,
                    background: "#000000",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                    transition: "opacity 0.9s ease",
                    opacity: fadeOut ? 0 : 1,
                }}>
                    {/* Orbs */}
                    <div className="orb" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(147, 200, 126, 0.2) 0%, transparent 70%)", top: -120, right: -100, animation: "f1 9s ease-in-out infinite" }} />
                    <div className="orb" style={{ width: 380, height: 380, background: "radial-gradient(circle, rgba(128, 200, 126, 0.1) 0%, transparent 70%)", bottom: -80, left: -80, animation: "f2 11s ease-in-out infinite" }} />

                    {/* Grid */}
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}>
                        <defs>
                            <pattern id="gr" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M60 0L0 0 0 60" fill="none" stroke="#c8a97e" strokeWidth="0.7" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#gr)" />
                    </svg>

                    {/* Logo */}
                    <div style={{
                        position: "relative", width: 84, height: 84, marginBottom: 44,
                        opacity: textVisible ? 1 : 0,
                        transform: textVisible ? "scale(1)" : "scale(0.6)",
                        transition: "opacity 1s ease 0.3s, transform 1s cubic-bezier(0.34,1.56,0.64,1) 0.3s",
                    }}>
                        <div style={{ position: "absolute", inset: -10, border: "1px solid rgba(151, 200, 126, 0.3)", borderRadius: "50%", animation: "ripple 2.2s ease-out infinite" }} />
                        <div style={{ width: "100%", height: "100%", background: "#82c87e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image src="/assets/logo.png" alt="Pithy Means Africa logo" width={28} height={28} style={{ display: "block" }} />
                        </div>
                    </div>

                    {/* Text */}
                    <div style={{
                        textAlign: "center", zIndex: 1,
                        opacity: textVisible ? 1 : 0,
                        transform: textVisible ? "translateY(0)" : "translateY(30px)",
                        transition: "opacity 1.2s ease 0.2s, transform 1.2s ease 0.2s",
                    }}>
                        <p style={{
                            fontFamily: "'Google Sans Code', monospace",
                            fontSize: "clamp(11px, 1.5vw, 13px)",
                            letterSpacing: "0.5em",
                            color: "#93c87e",
                            textTransform: "uppercase",
                            marginBottom: 16,
                        }}>
                            Pithy Means Africa
                        </p>
                        <h1 style={{
                            fontFamily: "'Google Sans Code', monospace",
                            fontSize: "clamp(40px, 7vw, 88px)",
                            fontWeight: 300,
                            color: "#ebf5e8",
                            letterSpacing: "0.06em",
                            lineHeight: 1.0,
                            fontStyle: "italic",
                        }}>
                            presents to you
                        </h1>
                        <div style={{
                            width: 80, height: 1,
                            background: "linear-gradient(90deg, transparent, #8ec87e, transparent)",
                            margin: "30px auto 0",
                            opacity: textVisible ? 1 : 0,
                            transition: "opacity 1s ease 1s",
                        }} />
                    </div>

                    {/* Dots */}
                    <div style={{ display: "flex", gap: 8, marginTop: 56, opacity: textVisible ? 1 : 0, transition: "opacity 0.8s ease 1.2s" }}>
                        {["d0", "d1", "d2"].map((c) => (
                            <span key={c} className={`dot ${c}`} style={{ display: "block", width: 5, height: 5, borderRadius: "50%", background: "#8dc87e" }} />
                        ))}
                    </div>
                </div>
            </>
        );
    }

    /* ─── HOME ─── */
    const leftActive = hovered === "left";
    const rightActive = hovered === "right";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes enterUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pipGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(153, 200, 126, 0); }
          50%      { box-shadow: 0 0 14px 5px rgba(126, 200, 168, 0.45); }
        }
        @keyframes arrowSlide {
          0%   { transform: translateX(0); opacity: 1; }
          45%  { transform: translateX(8px); opacity: 0; }
          55%  { transform: translateX(-8px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .topbar-anim { animation: enterUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .panel-anim  { animation: enterUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both; }

        .panel-link:hover .cta-arrow { animation: arrowSlide 0.6s ease; }

        .panel-link img {
          transition: transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.7s ease;
        }
        .panel-link:hover img {
          transform: scale(1.07) !important;
          filter: grayscale(0%) brightness(0.52) !important;
        }
        .panel-link .panel-copy {
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .panel-link:hover .panel-copy {
          transform: translateY(-10px);
        }
        .panel-link .cta-line {
          transition: width 0.4s ease, border-color 0.4s ease;
        }
        .panel-link:hover .cta-line {
          width: 100% !important;
          border-color: #7ec893 !important;
        }
        .panel-link .big-num {
          transition: opacity 0.5s ease;
        }
        .panel-link:hover .big-num {
          opacity: 0.18 !important;
        }

        @media (max-width: 680px) {
          .split { flex-direction: column !important; height: auto !important; min-height: 100vh; }
          .panel-link { min-height: 50vh !important; flex: 1 !important; width: 100% !important; }
          .vert-divider { display: none !important; }
          .horiz-divider { display: flex !important; }
          .topbar { padding: 16px 22px !important; }
          .hint-text { display: none !important; }
        }
      `}</style>

            <main style={{ minHeight: "100vh", background: "#000000", display: "flex", flexDirection: "column", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

                {/* Top bar */}
                <header className="topbar topbar-anim" style={{
                    position: "absolute", top: 0, left: 0, right: 0, zIndex: 40,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "22px 44px",
                    background: "rgba(0, 0, 0, 0.71)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(154, 200, 126, 0.07)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 38, height: 38, background: "#89c87e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Image src="/assets/logo.png" alt="Pithy Means Africa logo" width={18} height={18} style={{ display: "block" }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Google Sans Code', monospace", color: "#ebf5e8", fontSize: 15, fontWeight: 400, letterSpacing: "0.05em" }}>Pithy means Africa</div>
                            <div style={{ fontFamily: "'Google Sans Code', monospace", color: "#90c87e", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", marginTop: 1 }}>Est. 2024</div>
                        </div>
                    </div>
                    <span className="hint-text" style={{ color: "#767676", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase" }}>
                        Select your path
                    </span>
                </header>

                {/* Split */}
                <div className="split panel-anim" style={{ display: "flex", flex: 1, height: "100vh", position: "relative" }}>

                    {/* ── LEFT: Real Estate ── */}
                    <a
                        href="/real-estates"
                        className="panel-link"
                        onMouseEnter={() => setHovered("left")}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "flex-end",
                            overflow: "hidden",
                            textDecoration: "none",
                            flex: leftActive ? 1.4 : rightActive ? 0.7 : 1,
                            transition: "flex 0.75s cubic-bezier(0.77,0,0.175,1)",
                        }}
                    >
                        {/* Photo */}
                        <img
                            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85&auto=format&fit=crop"
                            alt="Luxury real estate"
                            style={{
                                position: "absolute", inset: 0,
                                width: "100%", height: "100%",
                                objectFit: "cover", objectPosition: "center",
                                filter: "grayscale(25%) brightness(0.6)",
                            }}
                        />

                        {/* Overlay */}
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to top, rgba(8, 8, 8, 0.95) 0%, rgba(8, 8, 8, 0.45) 45%, rgba(8, 8, 8, 0.05) 100%)",
                        }} />

                        {/* Watermark number */}
                        <span className="big-num" style={{
                            position: "absolute", top: 90, left: 30,
                            fontFamily: "Georgia, serif",
                            fontSize: "clamp(100px,18vw,220px)",
                            fontWeight: 700,
                            color: "transparent",
                            WebkitTextStroke: "1px rgba(144, 200, 126, 0.09)",
                            lineHeight: 1,
                            userSelect: "none",
                            pointerEvents: "none",
                            zIndex: 2,
                            opacity: 0.09,
                        }}>01</span>

                        {/* Copy */}
                        <div className="panel-copy" style={{ position: "relative", zIndex: 10, padding: "0 48px 64px" }}>
                            <p style={{ fontSize: 11, letterSpacing: "0.42em", textTransform: "uppercase", color: "#8cc87e", marginBottom: 14 }}>
                                Explore
                            </p>
                            <h2 style={{ fontSize: "clamp(42px,5.5vw,76px)", fontWeight: 300, color: "#ecf5e8", lineHeight: 0.95, letterSpacing: "0.02em", marginBottom: 20 }}>
                                Real<br />Estate
                            </h2>
                            <p style={{ fontSize: "clamp(13px,1.1vw,15px)", lineHeight: 1.7, color: "rgba(237, 245, 232, 0.52)", maxWidth: 300, marginBottom: 32 }}>
                                Premium properties and investment opportunities across Africa's finest locations.
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                                <span className="cta-line" style={{ display: "block", width: 36, height: 0, borderTop: "1px solid rgba(200,169,126,0.4)" }} />
                                <span style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#87c87e" }}>Enter</span>
                                <svg className="cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 8h12M8 2l6 6-6 6" stroke="#99c87e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </a>

                    {/* ── VERTICAL DIVIDER ── */}
                    <div className="vert-divider" style={{
                        position: "absolute", top: 0, bottom: 0, left: "50%",
                        width: 1,
                        background: "rgba(144, 200, 126, 0.22)",
                        zIndex: 30,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: "translateX(-50%)",
                        pointerEvents: "none",
                    }}>
                        <div style={{
                            width: 9, height: 9,
                            border: "1px solid #90c87e",
                            borderRadius: "50%",
                            background: "#000000",
                            animation: "pipGlow 2.8s ease-in-out infinite",
                        }} />
                    </div>

                    {/* ── RIGHT: Human Services ── */}
                    <a
                        href="/human-services"
                        className="panel-link"
                        onMouseEnter={() => setHovered("right")}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "flex-end",
                            overflow: "hidden",
                            textDecoration: "none",
                            flex: rightActive ? 1.4 : leftActive ? 0.7 : 1,
                            transition: "flex 0.75s cubic-bezier(0.77,0,0.175,1)",
                        }}
                    >
                        {/* Photo */}
                        <img
                            src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1400&q=85&auto=format&fit=crop"
                            alt="Community human services"
                            style={{
                                position: "absolute", inset: 0,
                                width: "100%", height: "100%",
                                objectFit: "cover", objectPosition: "center",
                                filter: "grayscale(25%) brightness(0.6)",
                            }}
                        />

                        {/* Overlay */}
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.45) 45%, rgba(8,8,8,0.05) 100%)",
                        }} />

                        {/* Watermark number */}
                        <span className="big-num" style={{
                            position: "absolute", top: 90, right: 30,
                            fontFamily: "Georgia, serif",
                            fontSize: "clamp(100px,18vw,220px)",
                            fontWeight: 700,
                            color: "transparent",
                            WebkitTextStroke: "1px rgba(143, 200, 126, 0.09)",
                            lineHeight: 1,
                            userSelect: "none",
                            pointerEvents: "none",
                            zIndex: 2,
                            opacity: 0.09,
                        }}>02</span>

                        {/* Copy — right-aligned */}
                        <div className="panel-copy" style={{ position: "relative", zIndex: 10, padding: "0 48px 64px", width: "100%", textAlign: "right" }}>
                            <p style={{ fontSize: 11, letterSpacing: "0.42em", textTransform: "uppercase", color: "#7ec8a9", marginBottom: 14 }}>
                                Connect
                            </p>
                            <h2 style={{ fontSize: "clamp(42px,5.5vw,76px)", fontWeight: 300, color: "#eaf5e8", lineHeight: 0.95, letterSpacing: "0.02em", marginBottom: 20 }}>
                                Human<br />Services
                            </h2>
                            <p style={{ fontSize: "clamp(13px,1.1vw,15px)", lineHeight: 1.7, color: "rgba(234, 245, 232, 0.52)", maxWidth: 300, marginBottom: 32, marginLeft: "auto" }}>
                                Community support and essential social programs built for African people.
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, flexDirection: "row-reverse" }}>
                                <span className="cta-line" style={{ display: "block", width: 36, height: 0, borderTop: "1px solid rgba(153, 200, 126, 0.4)" }} />
                                <span style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#94c87e" }}>Enter</span>
                                <svg className="cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: "scaleX(-1)" }}>
                                    <path d="M2 8h12M8 2l6 6-6 6" stroke="#83c87e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </a>

                    {/* Horizontal divider for mobile */}
                    <div className="horiz-divider" style={{
                        display: "none",
                        position: "absolute", top: "50%", left: 0, right: 0,
                        height: 1,
                        background: "rgba(135, 200, 126, 0.22)",
                        zIndex: 30,
                        alignItems: "center", justifyContent: "center",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                    }}>
                        <div style={{ width: 9, height: 9, border: "1px solid #8fc87e", borderRadius: "50%", background: "#080808" }} />
                    </div>
                </div>

                {/* Footer strip */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 40,
                    textAlign: "center",
                    padding: "13px",
                    fontFamily: "Georgia, serif",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: "rgba(107, 107, 107, 0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                    <span>© 2024 Pithy Means Africa</span>
                    <span style={{ color: "#80c87e", opacity: 0.35 }}>·</span>
                    <span>All rights reserved</span>
                </div>

            </main>
        </>
    );
}