import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pithy Means Africa — Real Estate & Investments",
    description:
        "Uganda-based, Africa-focused real estate and investment company. Connecting real capital to real opportunities across Uganda, East Africa, and the continent.",
    keywords: [
        "Africa real estate",
        "Uganda investment",
        "property development Africa",
        "investment opportunities Uganda",
        "Pithy Means Africa",
    ],
};

export default function RealEstateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #f8f5ef;
          color: #1a1612;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --gold:       #b8924a;
          --gold-light: #d4a962;
          --gold-pale:  rgba(184,146,74,0.12);
          --ink:        #1a1612;
          --ink-mid:    #3d3228;
          --ink-soft:   #7a6e62;
          --cream:      #f8f5ef;
          --cream-dark: #ede8de;
          --white:      #ffffff;
          --serif:      'Cormorant Garamond', Georgia, serif;
          --sans:       'DM Sans', sans-serif;
        }

        ::selection { background: var(--gold); color: var(--white); }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--cream-dark); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; }

        /* Global link reset */
        a { color: inherit; text-decoration: none; }

        /* Section utility */
        .section-eyebrow {
          font-family: var(--sans);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-eyebrow::after {
          content: '';
          display: block;
          width: 32px;
          height: 1px;
          background: var(--gold);
          opacity: 0.5;
        }

        /* Fade-in on scroll */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
            {children}
        </>
    );
}