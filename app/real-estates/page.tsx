"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type NavItem = { label: string; href: string };
type Opportunity = {
    sector: string;
    summary: string;
    country: string;
    capital: string;
    stage: string;
    returnPeriod: string;
};

/* ─────────────────────────────────────
   DATA
───────────────────────────────────── */
const NAV: NavItem[] = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Opportunities", href: "#opportunities" },
    { label: "Why Us", href: "#why" },
    { label: "Team", href: "#team" },
    { label: "Contact", href: "#contact" },
];

const OPPORTUNITIES: Opportunity[] = [
    {
        sector: "Residential Real Estate",
        summary: "Mixed-use development on 4 acres in Kampala's northern corridor — 48 units targeting mid-income buyers with integrated retail space.",
        country: "Uganda",
        capital: "$2.4M",
        stage: "Pre-development",
        returnPeriod: "4 – 6 years",
    },
    {
        sector: "Commercial Property",
        summary: "Grade-A office complex in Nairobi's Westlands district. Anchor tenant secured. Construction-ready with all permits in place.",
        country: "Kenya",
        capital: "$8.5M",
        stage: "Ready to Build",
        returnPeriod: "5 – 8 years",
    },
    {
        sector: "Land Investment",
        summary: "Prime agricultural and development land portfolio — 200 acres across Masaka and Mbarara regions with high appreciation trajectory.",
        country: "Uganda",
        capital: "$650K",
        stage: "Acquisition",
        returnPeriod: "3 – 5 years",
    },
];

const SERVICES = [
    {
        cat: "Real Estate Business",
        icon: "◈",
        items: ["Land investment", "Property development", "Property acquisition", "Property management"],
    },
    {
        cat: "Investment Facilitation",
        icon: "◇",
        items: ["Investment matchmaking", "Facilitation support", "Investor-project alignment"],
    },
    {
        cat: "Advisory & Market Entry",
        icon: "◉",
        items: ["Uganda market entry support", "Regional expansion planning", "Due diligence coordination"],
    },
];

const WHY = [
    { title: "Verified Opportunities", body: "Every project passes legal, financial, and on-ground verification before being listed." },
    { title: "Trusted Local Expertise", body: "Over 20 years of infrastructure and market experience across African countries." },
    { title: "Africa-Wide Access", body: "Starting in Uganda, expanding East Africa and beyond — one platform for the continent." },
    { title: "Diaspora-Ready", body: "Secure remote investing with verified projects, full documentation, and dedicated support." },
    { title: "Risk Management", body: "Diversification, strong legal structures, and active monitoring on every active project." },
    { title: "High-Growth Markets", body: "Urban expansion, young populations, and rising demand drive Africa's investment case." },
];

const TEAM = [
    {
        name: "Denis Irambona",
        role: "Lead Promoter",
        bio: "Civil Engineer with an MSc in Procurement, currently pursuing a PhD in Civil Engineering and Infrastructure Projects Management. Over 20 years of experience delivering infrastructure projects across Africa — including complex operations in fragile markets and post-conflict zones.",
        initials: "DI",
    },
    {
        name: "Elysee Kamikazi",
        role: "Co-Promoter",
        bio: "Holds an MBA from a Ugandan university with over 9 years of experience running organisations in Uganda. Contributes deep local market knowledge, operational networks, and contextual leadership for effective execution within Uganda's economic and social landscape.",
        initials: "EK",
    },
];

/* ─────────────────────────────────────
   COMPONENT
───────────────────────────────────── */
export default function RealEstatePage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [oppForm, setOppForm] = useState({ sector: "", country: "", capital: "", summary: "", docs: "" });
    const [contactForm, setContactForm] = useState({ name: "", email: "", type: "investor", message: "" });
    const [submitted, setSubmitted] = useState<"opp" | "contact" | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleOppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted("opp");
        setTimeout(() => setSubmitted(null), 4000);
    };
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted("contact");
        setTimeout(() => setSubmitted(null), 4000);
    };

    /* ── inline styles shared ── */
    const S = {
        gold: "#4ab864",
        ink: "#121a12",
        inkMid: "#303d28",
        inkSoft: "#7a6e62",
        cream: "#f1f8ef",
        white: "#ffffff",
        creamDark: "#dfedde",
        serif: "'Cormorant Garamond', Georgia, serif",
        sans: "'DM Sans', sans-serif",
    } as const;

    const inputStyle: React.CSSProperties = {
        width: "100%",
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(184,146,74,0.25)",
        borderRadius: 2,
        padding: "14px 18px",
        color: S.cream,
        fontFamily: S.sans,
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.3s",
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f8f5ef; color: #1a1612; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        ::selection { background: #4ab864; color: #fff; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #ede8de; }
        ::-webkit-scrollbar-thumb { background: #4ab864; border-radius: 3px; }
        a { color: inherit; text-decoration: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(48px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes gradShift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }

        .hero-line {
          transform-origin: left;
          animation: lineGrow 1.2s cubic-bezier(0.22,1,0.36,1) 0.8s both;
        }
        .h1-reveal { animation: heroReveal 1.1s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .h1-sub    { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
        .cta-row   { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.75s both; }
        .nav-anim  { animation: fadeIn 0.7s ease both; }
        .float-el  { animation: float 6s ease-in-out infinite; }

        .service-card:hover { transform: translateY(-4px); border-color: rgba(184,146,74,0.5) !important; }
        .service-card { transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease; }
        .service-card:hover { box-shadow: 0 16px 48px rgba(98, 184, 74, 0.1); }

        .opp-card:hover { transform: translateY(-3px); }
        .opp-card { transition: transform 0.35s ease; }

        .why-item:hover .why-icon { color: #4ab864 !important; transform: scale(1.1); }
        .why-icon { transition: color 0.3s ease, transform 0.3s ease; }

        .btn-primary {
          background: #4ab864;
          color: #fff;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 16px 36px;
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .btn-primary:hover { background: #38a06e; transform: translateY(-1px); }

        .btn-outline {
          background: transparent;
          border: 1px solid #4ab864;
          color: #4ab864;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 15px 36px;
          transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
        }
        .btn-outline:hover { background: #4ab864; color: #fff; transform: translateY(-1px); }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 15px 36px;
          transition: border-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
        }
        .btn-ghost:hover { border-color: #4ab864; color: #4ab864; transform: translateY(-1px); }

        input:focus, textarea:focus, select:focus {
          border-color: #4ab864 !important;
          box-shadow: 0 0 0 3px rgba(74,184,100,0.08);
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .opp-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr 1fr !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .hero-img-col { display: none !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .why-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .cta-row { flex-direction: column !important; align-items: flex-start !important; }
          .hero-stat-row { flex-wrap: wrap !important; gap: 24px !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

            {/* ══════════════════════════════
          NAV
      ══════════════════════════════ */}
            <nav
                className="nav-anim"
                style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                    background: scrolled ? "rgba(21, 26, 18, 0.96)" : "transparent",
                    backdropFilter: scrolled ? "blur(18px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(74, 184, 80, 0.12)" : "1px solid transparent",
                    transition: "background 0.5s ease, border-color 0.5s ease, backdrop-filter 0.5s ease",
                    padding: "0 40px",
                    height: 72,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
            >
                {/* Logo */}
                <a href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: S.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Image src="/assets/logo.png" alt="Pithy Means Africa Logo" width={21} height={21} />
                    </div>
                    <div>
                        <div style={{ fontFamily: "-apple-system", fontSize: 15, color: scrolled ? "#f5f0e8" : "#f5f0e8", fontWeight: 500, lineHeight: 1.1 }}>Pithy Means Africa</div>
                        <div style={{ fontFamily: S.sans, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: S.gold, lineHeight: 1 }}>Real Estate & Investments</div>
                    </div>
                </a>

                {/* Nav links */}
                <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 36 }}>
                    {NAV.map((n) => (
                        <a
                            key={n.href}
                            href={n.href}
                            style={{ fontFamily: S.sans, fontSize: 12, fontWeight: 400, letterSpacing: "0.1em", color: "rgba(245,240,232,0.75)", transition: "color 0.25s ease" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = S.gold)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.75)")}
                        >
                            {n.label}
                        </a>
                    ))}
                    <a href="#contact" className="btn-primary" style={{ padding: "10px 24px", fontSize: 11 }}>Invest With Us</a>
                </div>

                {/* Mobile burger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8 }}
                    className="mobile-burger"
                    aria-label="Menu"
                >
                    <div style={{ width: 24, height: 1.5, background: S.gold, marginBottom: 5 }} />
                    <div style={{ width: 18, height: 1.5, background: S.gold, marginBottom: 5 }} />
                    <div style={{ width: 24, height: 1.5, background: S.gold }} />
                </button>
            </nav>

            {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
            <section
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(160deg, #161a12 0%, #1f2c18 55%, #141a12 100%)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "120px 40px 80px",
                }}
            >
                {/* Texture grid */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}>
                    <defs>
                        <pattern id="hg" width="70" height="70" patternUnits="userSpaceOnUse">
                            <path d="M70 0L0 0 0 70" fill="none" stroke="#4ab864" strokeWidth="0.6" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hg)" />
                </svg>

                {/* Orb */}
                <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,146,74,0.14) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "5%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,146,74,0.08) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

                <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 60, maxWidth: 1200, margin: "0 auto", width: "100%", alignItems: "center" }}>

                    {/* LEFT */}
                    <div>
                        <div className="h1-sub" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                            <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>Uganda · East Africa · The Continent</span>
                        </div>

                        <h1 className="h1-reveal" style={{ fontFamily: S.serif, fontSize: "clamp(48px,6vw,84px)", fontWeight: 300, color: "#f5f0e8", lineHeight: 1.0, letterSpacing: "0.02em", marginBottom: 32 }}>
                            Africa Real Estate<br />
                            <em style={{ color: S.gold, fontStyle: "italic" }}>&amp; Investments</em>
                        </h1>

                        <p className="h1-sub" style={{ fontFamily: S.sans, fontSize: "clamp(14px,1.2vw,16px)", lineHeight: 1.75, color: "rgba(245,240,232,0.58)", maxWidth: 480, marginBottom: 48 }}>
                            A Uganda-based company connecting real capital to real opportunities across Africa. From land and property to high-impact investment projects — we bridge investors with verified African opportunities.
                        </p>

                        <div className="cta-row" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 72 }}>
                            <a href="#contact" className="btn-primary">Invest With Us</a>
                            <a href="#submit" className="btn-ghost">Submit Opportunity</a>
                            <a href="#contact" className="btn-ghost">Book Consultation</a>
                        </div>

                        {/* Stats */}
                        <div className="hero-stat-row" style={{ display: "flex", gap: 48 }}>
                            {[
                                { val: "20+", label: "Years of Experience" },
                                { val: "3", label: "African Regions Covered" },
                                { val: "100%", label: "Verified Opportunities" },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div style={{ fontFamily: S.serif, fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 300, color: S.gold, lineHeight: 1 }}>{s.val}</div>
                                    <div style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.08em", color: "rgba(245,240,232,0.4)", marginTop: 6 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — image mosaic */}
                    <div className="hero-img-col" style={{ position: "relative", height: 560 }}>
                        <img
                            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=700&q=80&auto=format&fit=crop"
                            alt="African real estate"
                            className="float-el"
                            style={{ position: "absolute", top: 0, right: 0, width: "80%", height: "65%", objectFit: "cover", borderRadius: 2, filter: "brightness(0.82)" }}
                        />
                        <img
                            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=500&q=80&auto=format&fit=crop"
                            alt="Kampala skyline"
                            style={{ position: "absolute", bottom: 0, left: 0, width: "55%", height: "45%", objectFit: "cover", borderRadius: 2, filter: "brightness(0.75)", animationDelay: "1.5s" }}
                            className="float-el"
                        />
                        {/* Gold accent frame */}
                        <div style={{ position: "absolute", top: "8%", right: "8%", width: "80%", height: "65%", border: "1px solid rgba(184,146,74,0.3)", borderRadius: 2, transform: "translate(12px, 12px)", pointerEvents: "none" }} />
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: S.sans, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(245,240,232,0.3)" }}>Scroll</span>
                    <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(184,146,74,0.6), transparent)" }} />
                </div>
            </section>

            {/* ══════════════════════════════
          ABOUT  §2
      ══════════════════════════════ */}
            <section id="about" style={{ background: S.cream, padding: "120px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 28, height: 1, background: S.gold }} />
                                <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>Who We Are</span>
                            </div>
                            <h2 style={{ fontFamily: S.serif, fontSize: "clamp(36px,4.5vw,58px)", fontWeight: 300, color: S.ink, lineHeight: 1.08, marginBottom: 28 }}>
                                Founded in Uganda.<br />
                                <em>Built for Africa.</em>
                            </h2>
                            <p style={{ fontFamily: S.sans, fontSize: 15, lineHeight: 1.8, color: S.inkSoft, marginBottom: 20 }}>
                                Pithy Means Africa is a Uganda-based real estate and investment company with continent-wide ambition. We connect investors — local, regional, and diaspora — with verified, high-potential opportunities across Uganda, East Africa, and beyond.
                            </p>
                            <p style={{ fontFamily: S.sans, fontSize: 15, lineHeight: 1.8, color: S.inkSoft, marginBottom: 40 }}>
                                Our work spans real estate development, investment facilitation, and advisory services — underpinned by rigorous due diligence and deep on-ground expertise built over two decades of African infrastructure experience.
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                {[
                                    { label: "Vision", text: "Africa real estate and investment integration" },
                                    { label: "Mission", text: "Connecting real capital to real opportunities" },
                                    { label: "Focus", text: "Uganda · East Africa · Pan-Africa" },
                                    { label: "Edge", text: "Verified deals. Trusted expertise. Full support." },
                                ].map((v) => (
                                    <div key={v.label} style={{ borderLeft: `2px solid ${S.gold}`, paddingLeft: 16 }}>
                                        <div style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: S.gold, marginBottom: 4 }}>{v.label}</div>
                                        <div style={{ fontFamily: S.serif, fontSize: 16, color: S.inkMid, fontStyle: "italic" }}>{v.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ position: "relative" }}>
                            <img
                                src="https://images.unsplash.com/photo-1675756261486-09bd1e0f6c8a?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80&auto=format&fit=crop"
                                alt="Kampala Uganda"
                                style={{ width: "100%", height: 480, objectFit: "cover", borderRadius: 2, filter: "brightness(0.88)" }}
                            />
                            {/* Floating badge */}
                            <div style={{ position: "absolute", bottom: -24, left: -24, background: S.ink, padding: "24px 28px", borderLeft: `3px solid ${S.gold}` }}>
                                <div style={{ fontFamily: S.serif, fontSize: 32, fontWeight: 300, color: S.gold, lineHeight: 1 }}>2024</div>
                                <div style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.18em", color: "rgba(245,240,232,0.55)", marginTop: 4 }}>Founded · Kampala</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════
          SERVICES  §3
      ══════════════════════════════ */}
            <section id="services" style={{ background: S.creamDark, padding: "120px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 72 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                            <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>What We Do</span>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                        </div>
                        <h2 style={{ fontFamily: S.serif, fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 300, color: S.ink, lineHeight: 1.1 }}>
                            Our Services &amp; <em>Activities</em>
                        </h2>
                    </div>

                    <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
                        {SERVICES.map((s) => (
                            <div
                                key={s.cat}
                                className="service-card"
                                style={{ background: S.white, border: "1px solid rgba(184,146,74,0.15)", padding: "44px 36px", cursor: "default" }}
                            >
                                <div style={{ fontFamily: S.serif, fontSize: 32, color: S.gold, marginBottom: 20, lineHeight: 1 }}>{s.icon}</div>
                                <h3 style={{ fontFamily: S.serif, fontSize: "clamp(20px,2vw,24px)", fontWeight: 400, color: S.ink, marginBottom: 24, lineHeight: 1.2 }}>{s.cat}</h3>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                                    {s.items.map((item) => (
                                        <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                            <span style={{ color: S.gold, fontSize: 10, lineHeight: "22px", flexShrink: 0 }}>◆</span>
                                            <span style={{ fontFamily: S.sans, fontSize: 14, color: S.inkSoft, lineHeight: 1.5 }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════
          OPPORTUNITIES  §4
      ══════════════════════════════ */}
            <section id="opportunities" style={{ background: S.ink, padding: "120px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 72, flexWrap: "wrap", gap: 24 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 28, height: 1, background: S.gold }} />
                                <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>Live Listings</span>
                            </div>
                            <h2 style={{ fontFamily: S.serif, fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 300, color: "#f5f0e8", lineHeight: 1.08 }}>
                                Investment<br /><em style={{ color: S.gold }}>Opportunities</em>
                            </h2>
                        </div>
                        <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: "rgba(245,240,232,0.45)", maxWidth: 340 }}>
                            Where money meets projects. Every listing has passed our due-diligence process — legal, financial, and on-ground verification.
                        </p>
                    </div>

                    <div className="opp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                        {OPPORTUNITIES.map((o, i) => (
                            <div
                                key={i}
                                className="opp-card"
                                style={{ border: "1px solid rgba(184,146,74,0.18)", background: "rgba(255,255,255,0.02)", padding: "36px 32px", position: "relative", overflow: "hidden" }}
                            >
                                {/* Top accent */}
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${S.gold}, transparent)` }} />

                                <div style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: 16 }}>{o.sector}</div>
                                <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.7, color: "rgba(245,240,232,0.6)", marginBottom: 32 }}>{o.summary}</p>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid rgba(184,146,74,0.12)", paddingTop: 24 }}>
                                    {[
                                        { k: "Country", v: o.country },
                                        { k: "Capital", v: o.capital },
                                        { k: "Stage", v: o.stage },
                                        { k: "Return Period", v: o.returnPeriod },
                                    ].map((row) => (
                                        <div key={row.k}>
                                            <div style={{ fontFamily: S.sans, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(184,146,74,0.55)", marginBottom: 4 }}>{row.k}</div>
                                            <div style={{ fontFamily: S.serif, fontSize: 15, color: "#f5f0e8", fontStyle: "italic" }}>{row.v}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 28 }}>
                                    <a href="#contact" className="btn-outline" style={{ display: "inline-block", fontSize: 10, padding: "11px 24px", borderColor: "rgba(184,146,74,0.4)", color: S.gold }}>
                                        Express Interest
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════
          SUBMIT OPPORTUNITY  §5
      ══════════════════════════════ */}
            <section id="submit" style={{ background: S.creamDark, padding: "120px 40px" }}>
                <div style={{ maxWidth: 840, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 60 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                            <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>List Your Project</span>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                        </div>
                        <h2 style={{ fontFamily: S.serif, fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, color: S.ink, marginBottom: 20, lineHeight: 1.1 }}>
                            Submit an <em>Opportunity</em>
                        </h2>
                        <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: S.inkSoft, maxWidth: 520, margin: "0 auto" }}>
                            Are you a developer, land owner, or business seeking investment? Submit your project and connect with verified investors across Africa.
                        </p>
                    </div>

                    {/* Who should submit */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 52 }}>
                        {["Developers", "Land Owners", "Businesses Seeking Investment", "Partnership Seekers"].map((t) => (
                            <span key={t} style={{ fontFamily: S.sans, fontSize: 12, padding: "8px 18px", border: `1px solid rgba(184,146,74,0.35)`, color: S.inkMid, borderRadius: 1, letterSpacing: "0.06em" }}>{t}</span>
                        ))}
                    </div>

                    <form onSubmit={handleOppSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, background: S.white, padding: "48px 44px", border: `1px solid rgba(184,146,74,0.15)` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div>
                                <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Sector</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Residential Real Estate"
                                    value={oppForm.sector}
                                    onChange={(e) => setOppForm({ ...oppForm, sector: e.target.value })}
                                    style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Country</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Uganda"
                                    value={oppForm.country}
                                    onChange={(e) => setOppForm({ ...oppForm, country: e.target.value })}
                                    style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Capital Required (USD)</label>
                            <input
                                type="text"
                                placeholder="e.g. $500,000"
                                value={oppForm.capital}
                                onChange={(e) => setOppForm({ ...oppForm, capital: e.target.value })}
                                style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Project Summary</label>
                            <textarea
                                rows={5}
                                placeholder="Describe your project — location, scope, stage, and why it's a strong opportunity..."
                                value={oppForm.summary}
                                onChange={(e) => setOppForm({ ...oppForm, summary: e.target.value })}
                                style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink, resize: "vertical" }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Supporting Documents</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                style={{ fontFamily: S.sans, fontSize: 13, color: S.inkSoft }}
                            />
                            <p style={{ fontFamily: S.sans, fontSize: 11, color: S.inkSoft, marginTop: 6, opacity: 0.7 }}>PDF, DOC, or XLS — project plans, financials, title deeds</p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                            <button type="submit" className="btn-primary">Submit Opportunity</button>
                            {submitted === "opp" && (
                                <span style={{ fontFamily: S.sans, fontSize: 13, color: "#4a9e6b", letterSpacing: "0.06em" }}>✓ Received — we'll be in touch shortly</span>
                            )}
                        </div>
                    </form>
                </div>
            </section>

            {/* ══════════════════════════════
          WHY US  §6
      ══════════════════════════════ */}
            <section id="why" style={{ background: S.ink, padding: "120px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                            <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>The Pithy Advantage</span>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                        </div>
                        <h2 style={{ fontFamily: S.serif, fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 300, color: "#f5f0e8", lineHeight: 1.08 }}>
                            Why Invest <em style={{ color: S.gold }}>With Us</em>
                        </h2>
                    </div>

                    <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                        {WHY.map((w, i) => (
                            <div
                                key={w.title}
                                className="why-item"
                                style={{ padding: "44px 36px", border: "1px solid rgba(184,146,74,0.1)", cursor: "default", transition: "background 0.3s ease", position: "relative" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(184,146,74,0.04)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                            >
                                <div className="why-icon" style={{ fontFamily: S.serif, fontSize: 28, color: "rgba(184,146,74,0.4)", marginBottom: 20, lineHeight: 1 }}>0{i + 1}</div>
                                <h3 style={{ fontFamily: S.serif, fontSize: "clamp(18px,2vw,22px)", fontWeight: 400, color: "#f5f0e8", marginBottom: 14 }}>{w.title}</h3>
                                <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.7, color: "rgba(245,240,232,0.45)" }}>{w.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Diaspora callout */}
                    <div style={{ marginTop: 48, padding: "44px 48px", border: `1px solid ${S.gold}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 28 }}>
                        <div>
                            <div style={{ fontFamily: S.sans, fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: S.gold, marginBottom: 12 }}>Diaspora Investors</div>
                            <h3 style={{ fontFamily: S.serif, fontSize: "clamp(22px,3vw,32px)", fontWeight: 300, color: "#f5f0e8", lineHeight: 1.2 }}>
                                Invest securely from anywhere<br />
                                <em style={{ color: S.gold }}>in the world.</em>
                            </h3>
                        </div>
                        <div style={{ maxWidth: 360 }}>
                            <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.75, color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>
                                We provide verified projects, complete legal documentation, and full remote support — so you can invest confidently in Africa without being on the ground.
                            </p>
                            <a href="#contact" className="btn-primary" style={{ display: "inline-block" }}>Connect as a Diaspora Investor</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════
          TEAM  §8
      ══════════════════════════════ */}
            <section id="team" style={{ background: S.cream, padding: "120px 40px" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 72 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                            <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>The Promoters</span>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                        </div>
                        <h2 style={{ fontFamily: S.serif, fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 300, color: S.ink, lineHeight: 1.08 }}>
                            People Behind <em>Pithy</em>
                        </h2>
                    </div>

                    <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
                        {TEAM.map((t) => (
                            <div key={t.name} style={{ background: S.white, border: "1px solid rgba(184,146,74,0.12)", padding: "44px 40px", position: "relative" }}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${S.gold}, transparent)` }} />
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
                                    <div style={{ width: 60, height: 60, background: S.ink, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <span style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 500, color: S.gold }}>{t.initials}</span>
                                    </div>
                                    <div>
                                        <h3 style={{ fontFamily: S.serif, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 400, color: S.ink, lineHeight: 1.1 }}>{t.name}</h3>
                                        <div style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: S.gold, marginTop: 4 }}>{t.role}</div>
                                    </div>
                                </div>
                                <p style={{ fontFamily: S.sans, fontSize: 14, lineHeight: 1.8, color: S.inkSoft }}>{t.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════
          CONTACT  §7
      ══════════════════════════════ */}
            <section id="contact" style={{ background: S.creamDark, padding: "120px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 72 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                            <span style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.42em", textTransform: "uppercase", color: S.gold }}>Get In Touch</span>
                            <div style={{ width: 28, height: 1, background: S.gold }} />
                        </div>
                        <h2 style={{ fontFamily: S.serif, fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 300, color: S.ink, lineHeight: 1.08 }}>
                            Contact &amp; <em>Partnership</em>
                        </h2>
                    </div>

                    <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60, alignItems: "start" }}>

                        {/* Info */}
                        <div>
                            <div style={{ marginBottom: 40 }}>
                                <h3 style={{ fontFamily: S.serif, fontSize: 22, fontWeight: 400, color: S.ink, marginBottom: 24, fontStyle: "italic" }}>Reach Us Directly</h3>

                                {[
                                    {
                                        icon: "📍",
                                        label: "Uganda Office",
                                        value: "ROFRA House, Gaba Road, Kansanga, Kampala, Uganda",
                                    },
                                    {
                                        icon: "💬",
                                        label: "WhatsApp",
                                        value: "+256 787 739532",
                                    },
                                    {
                                        icon: "✉️",
                                        label: "Email",
                                        value: "info@pithymeansafrica.com",
                                    },
                                ].map((c) => (
                                    <div key={c.label} style={{ display: "flex", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(184,146,74,0.12)" }}>
                                        <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>
                                        <div>
                                            <div style={{ fontFamily: S.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: S.gold, marginBottom: 4 }}>{c.label}</div>
                                            <div style={{ fontFamily: S.sans, fontSize: 14, color: S.inkMid, lineHeight: 1.5 }}>{c.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: "28px 32px", background: S.ink, borderLeft: `3px solid ${S.gold}` }}>
                                <div style={{ fontFamily: S.sans, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: 10 }}>Regional Representation</div>
                                <p style={{ fontFamily: S.sans, fontSize: 13, lineHeight: 1.7, color: "rgba(245,240,232,0.5)" }}>
                                    East Africa and wider continent representation coming soon. We are expanding to serve investors and projects across the region.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleContactSubmit} style={{ background: S.white, padding: "48px 44px", border: "1px solid rgba(184,146,74,0.12)", display: "flex", flexDirection: "column", gap: 20 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                <div>
                                    <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Email</label>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Inquiry Type</label>
                                <select
                                    value={contactForm.type}
                                    onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                                    style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink, appearance: "none" }}
                                >
                                    <option value="investor">Investor Inquiry</option>
                                    <option value="partnership">Partnership Inquiry</option>
                                    <option value="consultation">Book a Consultation</option>
                                    <option value="diaspora">Diaspora Investor</option>
                                    <option value="general">General Inquiry</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontFamily: S.sans, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: S.inkSoft, display: "block", marginBottom: 8 }}>Message</label>
                                <textarea
                                    rows={5}
                                    placeholder="Tell us about your investment interest, project, or question..."
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    style={{ ...inputStyle, background: S.cream, border: "1px solid rgba(184,146,74,0.2)", color: S.ink, resize: "vertical" }}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                <button type="submit" className="btn-primary">Send Inquiry</button>
                                {submitted === "contact" && (
                                    <span style={{ fontFamily: S.sans, fontSize: 13, color: "#4a9e6b", letterSpacing: "0.06em" }}>✓ Sent — we'll respond within 48 hours</span>
                                )}
                            </div>

                            <p style={{ fontFamily: S.sans, fontSize: 12, color: S.inkSoft, lineHeight: 1.6 }}>
                                Or reach us directly on WhatsApp:{" "}
                                <a href="https://wa.me/256787739532" target="_blank" rel="noopener noreferrer" style={{ color: S.gold, borderBottom: `1px solid rgba(184,146,74,0.4)` }}>+256 787 739532</a>
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
            <footer style={{ background: "#000000", padding: "60px 40px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid rgba(105, 184, 74, 0.1)" }}>

                        <div style={{ maxWidth: 320 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, background: S.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Image src="/assets/logo.png" alt="Pithy Means Africa Logo" width={24} height={24} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: S.serif, fontSize: 16, color: "#f5f0e8", fontWeight: 400 }}>Pithy Means Africa</div>
                                    <div style={{ fontFamily: S.sans, fontSize: 9, letterSpacing: "0.28em", color: S.gold, textTransform: "uppercase" }}>Real Estate & Investments</div>
                                </div>
                            </div>
                            <p style={{ fontFamily: S.sans, fontSize: 13, lineHeight: 1.75, color: "rgba(245,240,232,0.35)" }}>
                                Connecting real capital to real opportunities. Uganda-based, Africa-focused.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
                            <div>
                                <div style={{ fontFamily: S.sans, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: 16 }}>Navigate</div>
                                {NAV.map((n) => (
                                    <div key={n.href} style={{ marginBottom: 10 }}>
                                        <a href={n.href} style={{ fontFamily: S.sans, fontSize: 13, color: "rgba(245,240,232,0.4)", transition: "color 0.25s" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = S.gold)}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.4)")}
                                        >{n.label}</a>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontFamily: S.sans, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: S.gold, marginBottom: 16 }}>Contact</div>
                                <div style={{ fontFamily: S.sans, fontSize: 13, color: "rgba(245,240,232,0.4)", lineHeight: 2 }}>
                                    <div>ROFRA House, Gaba Road</div>
                                    <div>Kansanga, Kampala</div>
                                    <div>+256 787 739532</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <span style={{ fontFamily: S.sans, fontSize: 11, color: "rgba(245,240,232,0.2)", letterSpacing: "0.1em" }}>
                            © 2024 Pithy Means Africa Ltd. All rights reserved.
                        </span>
                        <span style={{ fontFamily: S.sans, fontSize: 11, color: "rgba(245,240,232,0.2)", letterSpacing: "0.06em" }}>
                            Kampala, Uganda
                        </span>
                    </div>
                </div>
            </footer>
        </>
    );
}