/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AuthState } from "@/types/schema";
import { Route } from "next";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, signout } = useAuthStore((state) => state as AuthState);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleCloseMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/human-services/about", label: "About" },
    { href: "/human-services/how-it-works", label: "How It Works" },
    { href: "/human-services/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-gradient-to-b from-black/60 to-transparent backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4">
        <div className="flex justify-between items-center">
          {/* Logo with glow effect */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#5AC35A] to-emerald-400 rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
            <div className="relative text-2xl font-bold">
              <Logo />
            </div>
          </div>

          {/* Hamburger Menu Icon for Small Screens */}
          <div className="lg:hidden">
            <Button
              onClick={handleToggle}
              className="relative text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </Button>
          </div>

          {/* Links for larger screens */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                prefetch={true}
                className={`relative px-4 py-2 text-white/90 text-sm font-medium hover:text-white transition-all duration-300 group ${
                  pathname === link.href ? "text-white" : ""
                }`}
              >
                <span className="relative z-10 font-bold">{link.label}</span>
                {pathname === link.href ? (
                  <span className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"></span>
                ) : (
                  <span className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                )}
              </Link>
            ))}

            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/10">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="relative px-4 py-2 text-white/90 text-sm font-medium hover:text-white transition-all duration-300 group"
                  >
                    <span className="relative z-10 font-bold">Dashboard</span>
                    <span className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    className="relative px-5 py-2 text-white text-sm font-medium bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 overflow-hidden group"
                    aria-label="Logout"
                  >
                    <span className="relative z-10 font-bold">Logout</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/signIn"
                    className="relative px-5 py-2 text-white text-sm font-medium bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 group overflow-hidden"
                  >
                    <span className="relative z-10 font-bold">Login</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#5AC35A]/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                  <Link
                    href="/signUp"
                    className="relative px-5 py-2 text-white text-sm font-semibold bg-gradient-to-r from-[#5AC35A] to-emerald-500 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#5AC35A]/50 hover:scale-105 overflow-hidden group"
                  >
                    <span className="relative z-10 font-bold">Sign Up</span>
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu with Glassmorphism */}
        {isOpen && (
          <div
            ref={menuRef}
            className="lg:hidden mt-4 p-6 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href as Route}
                  onClick={handleCloseMenu}
                  className={`relative px-4 py-3 text-white/90 hover:text-white transition-all duration-300 rounded-xl group ${
                    pathname === link.href ? "text-white bg-white/10" : ""
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="relative z-10 font-medium">{link.label}</span>
                  {pathname !== link.href && (
                    <span className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                  )}
                </Link>
              ))}

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={handleCloseMenu}
                    className="relative px-4 py-3 text-white/90 hover:text-white transition-all duration-300 rounded-xl group"
                  >
                    <span className="relative z-10 font-medium">Dashboard</span>
                    <span className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      handleCloseMenu();
                    }}
                    className="w-full px-4 py-3 text-white font-medium bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/signIn"
                    onClick={handleCloseMenu}
                    className="relative px-4 py-3 text-white font-medium bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300 text-center group overflow-hidden"
                  >
                    <span className="relative z-10">Login</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#5AC35A]/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                  <Link
                    href="/signUp"
                    onClick={handleCloseMenu}
                    className="relative px-4 py-3 text-white font-semibold bg-gradient-to-r from-[#5AC35A] to-emerald-500 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#5AC35A]/50 text-center group overflow-hidden"
                  >
                    <span className="relative z-10">Sign Up</span>
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;