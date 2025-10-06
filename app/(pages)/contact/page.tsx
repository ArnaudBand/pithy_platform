/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import TitleDot from "@/components/TitleDot";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import ContactInfo from "@/components/ContactInfo";
import { Card } from "@/components/ui/card";
import FreqAskeQuestion from "@/components/FreqAskeQuestion";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ThankYouMessage from "@/components/ThankYouMessage";
import LiquidEther from "@/components/LiquidEther";
import { Metadata } from "next";

const DynamicMap = dynamic(() => import("../../../components/Map"), {
  ssr: false,
});

const metadata: Metadata = {
  title: "Contact",
  description: "Contact Pithy Means for questions, feedback or support.",
  keywords: ["Pithy Means", "contact", "questions", "feedback", "support"],
  openGraph: {
    title: "Contact",
    description: "Contact Pithy Means for questions, feedback or support.",
    url: "https://www.pithymeans.com/contact",
    siteName: "Pithy Means",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Pithy Means - Empowering Individuals",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact",
    description: "Contact Pithy Means for questions, feedback or support.",
    images: ["/opengraph-image.png"],
  },
}

const Contact = () => {
  const [responseMessage, setResponseMessage] = useState("");

  return (
    <>
      {/* Hero Section with LiquidEther Background */}
      <div className="relative flex flex-col justify-center items-center bg-black min-h-[60vh] overflow-hidden px-4 py-32 w-full">
        {/* LiquidEther Background */}
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#0AF41D', '#529652', '#20CC6B']}
            mouseForce={100}
            cursorSize={180}
            isViscous={true}
            viscous={20}
            resolution={0.7}
            autoDemo={true}
            autoSpeed={0.7}
            autoIntensity={2.8}
            takeoverDuration={0.25}
            autoResumeDelay={1000}
            autoRampDuration={0.9}
            className="w-full h-full"
          />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70 z-[1]"></div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20 z-[2]"
          style={{
            backgroundImage: `linear-gradient(rgba(90,195,90,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(90,195,90,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5AC35A]/10 backdrop-blur-sm border border-[#5AC35A]/30 mb-4">
            <svg
              className="w-4 h-4 text-[#5AC35A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-[#5AC35A] font-medium">We`re Here to Help</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="block text-white mb-2">Get In</span>
            <span className="bg-gradient-to-r from-[#5AC35A] via-[#00AE76] to-[#5AC35A] bg-clip-text text-transparent">
              Touch
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Have questions? We&apos;d love to hear from you. Send us a message and we`ll respond as soon as possible.
          </p>

          {/* Quick Contact Options */}
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <a
              href="mailto:management@pithymeansplus.com"
              className="group flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-[#5AC35A]/50 transition-all duration-300"
            >
              <svg
                className="w-5 h-5 text-[#5AC35A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-white text-sm font-medium">Email Us</span>
            </a>

            <a
              href="tel:+13073740993"
              className="group flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-[#5AC35A]/50 transition-all duration-300"
            >
              <svg
                className="w-5 h-5 text-[#5AC35A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-white text-sm font-medium">Call Us</span>
            </a>

            <button
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5AC35A] to-[#00AE76] rounded-xl hover:shadow-lg hover:shadow-[#5AC35A]/30 transition-all duration-300 hover:scale-105"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-white text-sm font-medium">Send Message</span>
            </button>
          </div>

          {/* Response Time Badge */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#5AC35A] animate-pulse"></div>
              <span className="text-xs text-gray-400">Avg. response time: 24 hours</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-6 h-6 text-[#5AC35A]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <div className="bg-white">
        <div className="flex lg:flex-row flex-col-reverse justify-between p-10">
          <div className="flex flex-col lg:items-start items-center space-y-8 w-full">
            <div className="text-center mt-4 -mb-4">
              <TitleDot title="get in touch" />
              <p className="text-base text-black capitalize">
                contact us for questions, feedback or support
              </p>
            </div>
            <ContactInfo
              title={"Contact In USA"}
              location={
                "1309 Coffeen Avenue STE 10269, Sheridan, WY 82801, USA"
              }
              email={"management@pithymeansplus.com"}
              phone={["+1 (307) 374-0993", " +1 (307) 205-5983"]}
              className="text-black break-normal"
            />
            <ContactInfo
              title={"Contact In Africa"}
              location={
                "Plot No 546, ROFRA house, 4th Floor, Room No 2, Ggaba Road, Kansanga, Kampala."
              }
              email={"pithymeansafrica@gmail.com"}
              phone={[
                "+256 750 175 892",
                "+256 760 389 466",
                "+256 783 184 543",
              ]}
              className="text-black"
            />
            <SocialMediaLinks className="text-black" />
          </div>
          {!responseMessage ? (
            <ContactForm setResponseMessage={setResponseMessage} />
          ) : (
            <ThankYouMessage />
          )}
        </div>
        <div className="h-24">
          <div
            className="bg-contain bg-no-repeat bg-left-bottom"
            style={{
              backgroundImage: "url('/assets/leftfooter.png')",
              height: "300px",
              width: "300px",
            }}
          />
        </div>
        <div className="bg-gradient-to-b from-[#61BC5B] to-white z-10 py-10">
          <div className="flex justify-center items-center flex-col space-y-4 py-10">
            <h3 className="text-black text-xl font-bold">Find Us Here</h3>
            <p className="text-black capitalize">
              our uganda office location
            </p>
            <Card className="bg-white w-5/6 flex items-center justify-center">
              <div className="">
                <DynamicMap />
              </div>
            </Card>
          </div>
        </div>
        <FreqAskeQuestion />
        <Footer />
      </div>
    </>
  );
};

export default Contact;