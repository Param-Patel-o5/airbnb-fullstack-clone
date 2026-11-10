"use client";

import React from "react";
import { CheckCircle2, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";

const FOOTER_COLUMNS = [
  {
    heading: "Support",
    links: [
      "Help Centre",
      "AirCover",
      "Anti-discrimination",
      "Cancellation options",
    ],
  },
  {
    heading: "Hosting",
    links: [
      "Airbnb your home",
      "AirCover for Hosts",
      "Hosting resources",
      "Community forum",
    ],
  },
  {
    heading: "Airbnb",
    links: ["Newsroom", "New features", "Careers", "Investors"],
  },
];

export default function Footer() {
  const { showToast } = useApp();

  const handleLinkClick = (label: string) => {
    showToast(`${label} — Info page available in production release`);
  };

  return (
    <footer className="bg-[#F7F7F7] border-t border-[#DDDDDD] text-sm text-[#222222] mt-14">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">
        {/* 3 Footer Link Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-[#DDDDDD]">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-semibold text-[#222222] mb-3">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => handleLinkClick(label)}
                      className="text-[#222222] hover:underline text-left cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal, Locale & Identity Verification Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#222222]">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span>© 2026 Airbnb Clone · SDE Fullstack Assignment</span>
            <span>·</span>
            {["Privacy", "Terms", "Sitemap"].map((item, idx) => (
              <React.Fragment key={item}>
                <button
                  type="button"
                  onClick={() => handleLinkClick(item)}
                  className="hover:underline cursor-pointer"
                >
                  {item}
                </button>
                {idx < 2 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() =>
                showToast("Locale: English (India) · Currency: INR (₹)")
              }
              className="inline-flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>English (IN) · ₹ INR</span>
            </button>

            <button
              type="button"
              onClick={() =>
                showToast(
                  "Identity Verified Platform — Host & Guest profiles verified"
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold text-[#222222] transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity Verified Platform</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

