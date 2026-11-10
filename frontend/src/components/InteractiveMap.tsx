"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Maximize2, Minus, Plus, Star, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Listing } from "@/types";

interface InteractiveMapProps {
  listings: Listing[];
  nights: number;
  highlightedId: number | null;
  onSelectListing: (id: number | null) => void;
}

// Compute deterministic percentage coordinates (x%, y%) inside the vector map
// based on city keywords so pins appear naturally spread across the canvas.
function getPinPosition(listing: Listing, index: number): { x: number; y: number } {
  const loc = listing.location.toLowerCase();
  if (loc.includes("morjim")) return { x: 24, y: 66 };
  if (loc.includes("assagao")) return { x: 32, y: 71 };
  if (loc.includes("lonavala")) return { x: 34, y: 54 };
  if (loc.includes("alibaug")) return { x: 22, y: 51 };
  if (loc.includes("manali")) return { x: 52, y: 18 };
  if (loc.includes("jibhi")) return { x: 61, y: 24 };
  if (loc.includes("dharamkot") || loc.includes("dharamshala")) return { x: 40, y: 21 };
  if (loc.includes("jaipur")) return { x: 41, y: 37 };
  if (loc.includes("bhimtal")) return { x: 67, y: 31 };
  if (loc.includes("coorg") || loc.includes("madikeri")) return { x: 42, y: 78 };
  if (loc.includes("munnar")) return { x: 56, y: 84 };
  if (loc.includes("pondicherry") || loc.includes("auroville")) return { x: 69, y: 75 };

  // Fallback grid position for newly created Host Dashboard listings
  const col = (index % 4) * 18 + 20;
  const row = (Math.floor(index / 4) % 3) * 22 + 25;
  return { x: col, y: row };
}

export default function InteractiveMap({
  listings,
  nights,
  highlightedId,
  onSelectListing,
}: InteractiveMapProps) {
  const { wishlistIds, toggleWishlist } = useApp();
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const selectedListing =
    listings.find((item) => item.id === selectedPinId) || null;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#DDDDDD] bg-[#EAE6DF] select-none shadow-sm">
      {/* Vector Map Canvas (Scalable with zoom controls) */}
      <div
        style={{ transform: `scale(${zoom})` }}
        className="w-full h-full transition-transform duration-300 origin-center relative"
      >
        <svg
          viewBox="0 0 800 700"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Base Map Landmass */}
          <rect width="800" height="700" fill="#F1EFEA" />

          {/* Coastal / Water Zones */}
          <path
            d="M0 0 L155 0 C140 160, 120 310, 150 470 C170 570, 220 640, 260 700 L0 700 Z"
            fill="#CFE6F3"
          />
          <path
            d="M660 520 C700 570, 750 630, 800 660 L800 700 L610 700 C630 630, 640 570, 660 520 Z"
            fill="#CFE6F3"
          />

          {/* National Park & Mountain Greenery */}
          <ellipse cx="480" cy="140" rx="160" ry="70" fill="#DCEBD3" />
          <ellipse cx="380" cy="560" rx="120" ry="65" fill="#DCEBD3" />
          <ellipse cx="560" cy="360" rx="95" ry="55" fill="#E3EEDB" />

          {/* Road Network */}
          <path
            d="M170 420 Q360 360 640 240"
            stroke="#FFFFFF"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M220 560 Q400 470 590 540"
            stroke="#FFFFFF"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M340 110 Q380 310 350 610"
            stroke="#FFFFFF"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M200 260 Q450 280 710 340"
            stroke="#E2DDD5"
            strokeWidth="3"
            fill="none"
          />

          {/* Subtle Regional Labels */}
          <text x="58" y="340" fill="#7CA1B5" fontSize="13" fontWeight="600" letterSpacing="2">
            ARABIAN SEA
          </text>
          <text x="415" y="135" fill="#6F8A64" fontSize="11" fontWeight="600" letterSpacing="1.5">
            HIMALAYAN FOOTHILLS
          </text>
          <text x="310" y="330" fill="#8C867B" fontSize="11" fontWeight="600" letterSpacing="1.5">
            WESTERN INDIA
          </text>
          <text x="370" y="575" fill="#6F8A64" fontSize="11" fontWeight="600" letterSpacing="1.5">
            WESTERN GHATS
          </text>
        </svg>

        {/* Clickable Price Markers */}
        {listings.map((listing, idx) => {
          const pos = getPinPosition(listing, idx);
          const total = Math.round(
            listing.price_per_night * nights +
              listing.cleaning_fee +
              listing.service_fee
          );
          const isActive =
            highlightedId === listing.id || selectedPinId === listing.id;

          return (
            <button
              key={listing.id}
              type="button"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseEnter={() => onSelectListing(listing.id)}
              onMouseLeave={() => onSelectListing(null)}
              onClick={() =>
                setSelectedPinId((prev) => (prev === listing.id ? null : listing.id))
              }
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition transform cursor-pointer ${
                isActive
                  ? "bg-[#222222] text-white scale-110 z-30 ring-2 ring-white"
                  : "bg-white text-[#222222] hover:scale-105 hover:z-20 border border-[#DDDDDD]"
              }`}
            >
              ₹{total.toLocaleString("en-IN")}
            </button>
          );
        })}
      </div>

      {/* Right Map Zoom / Expand Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col bg-white rounded-xl shadow-md border border-[#DDDDDD] overflow-hidden">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
          aria-label="Zoom in map"
          className="w-9 h-9 flex items-center justify-center hover:bg-[#F7F7F7] text-[#222222] border-b border-[#DDDDDD] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
          aria-label="Zoom out map"
          className="w-9 h-9 flex items-center justify-center hover:bg-[#F7F7F7] text-[#222222] border-b border-[#DDDDDD] cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Reset map zoom"
          className="w-9 h-9 flex items-center justify-center hover:bg-[#F7F7F7] text-[#222222] cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mini Popup Card when a Price Marker is clicked */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[300px] bg-white rounded-2xl shadow-2xl border border-[#DDDDDD] overflow-hidden z-30">
          <div className="relative h-36 bg-[#F7F7F7]">
            <img
              src={selectedListing.images[0]}
              alt={selectedListing.title}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setSelectedPinId(null)}
              aria-label="Close map preview"
              className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/95 text-[#222222] flex items-center justify-center shadow cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(selectedListing.id)}
              aria-label="Toggle wishlist"
              className="absolute top-2.5 right-2.5 p-1 cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 stroke-2 ${
                  wishlistIds.includes(selectedListing.id)
                    ? "fill-[#FF385C] stroke-white"
                    : "fill-black/50 stroke-white"
                }`}
              />
            </button>
          </div>
          <Link
            href={`/listings/${selectedListing.id}`}
            className="block p-3.5 hover:bg-[#F7F7F7]/50 transition"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-[#222222] truncate">
                {selectedListing.title}
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#222222] shrink-0">
                <Star className="w-3.5 h-3.5 fill-[#222222]" />
                {selectedListing.rating_avg.toFixed(2)}
              </div>
            </div>
            <div className="text-xs text-[#6A6A6A] truncate mt-0.5">
              {selectedListing.location}
            </div>
            <div className="text-sm font-semibold text-[#222222] mt-1.5">
              ₹
              {Math.round(
                selectedListing.price_per_night * nights +
                  selectedListing.cleaning_fee +
                  selectedListing.service_fee
              ).toLocaleString("en-IN")}{" "}
              <span className="font-normal text-[#6A6A6A] text-xs">
                for {nights} nights
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

