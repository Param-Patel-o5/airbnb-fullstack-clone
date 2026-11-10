"use client";

import React from "react";
import {
  LayoutGrid,
  Map as MapIcon,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const AMENITY_PILLS = [
  "Wifi",
  "Washing machine",
  "Free parking",
  "Kitchen",
  "Air conditioning",
  "Pool",
];

const CATEGORIES = [
  "Beachfront",
  "Cabins",
  "Amazing pools",
  "Mountain views",
  "Luxury",
  "Lakefront",
  "Historical homes",
  "Farms",
];

export default function FilterBar() {
  const {
    activeFilters,
    setFilters,
    openFilterModal,
    isMapView,
    setIsMapView,
  } = useApp();

  // Count how many filters are currently active to display a badge on the Filters pill.
  const activeCount = [
    activeFilters.amenity,
    activeFilters.min_price,
    activeFilters.max_price,
    activeFilters.category,
    activeFilters.property_type && activeFilters.property_type !== "Any type"
      ? activeFilters.property_type
      : "",
  ].filter(Boolean).length;

  const toggleAmenity = (amenity: string) => {
    const next = activeFilters.amenity === amenity ? "" : amenity;
    setFilters({ amenity: next });
    if (next) {
      setIsMapView(true);
    }
  };

  const toggleCategory = (category: string) => {
    const next = activeFilters.category === category ? "" : category;
    setFilters({ category: next });
    if (next) {
      setIsMapView(true);
    }
  };

  return (
    <div className="border-b border-[#DDDDDD] bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-3 flex items-center justify-between gap-4">
        {/* Scrollable Quick Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 flex-1">
          {/* Filters Modal Trigger */}
          <button
            type="button"
            onClick={openFilterModal}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition cursor-pointer ${
              activeCount > 0
                ? "border-[#222222] bg-[#F7F7F7] text-[#222222]"
                : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#222222] text-white text-[11px] flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Amenity Quick Pills */}
          {AMENITY_PILLS.map((pill) => {
            const isSelected = activeFilters.amenity === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => toggleAmenity(pill)}
                className={`shrink-0 px-4 py-2 rounded-full border text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#222222] bg-[#F7F7F7] text-[#222222] font-semibold"
                    : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
                }`}
              >
                {pill}
              </button>
            );
          })}

          <div className="h-5 w-px bg-[#DDDDDD] shrink-0 mx-1" />

          {/* Category Quick Pills */}
          {CATEGORIES.map((cat) => {
            const isSelected = activeFilters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full border text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#222222] bg-[#222222] text-white font-semibold"
                    : "border-[#DDDDDD] bg-white text-[#6A6A6A] hover:text-[#222222] hover:border-[#222222]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Floating Fee Badge + Map/Grid Toggle */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="rounded-xl shadow-sm border border-[#EBEBEB] bg-white px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-[#222222]">
            <Tag className="w-4 h-4 text-[#FF385C]" />
            <span>Prices include all fees</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMapView(!isMapView)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#222222] hover:bg-black text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            {isMapView ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Show Grid</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5" />
                <span>Show Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Map/Grid Toggle */}
      <div className="lg:hidden px-6 pb-3 flex items-center justify-between gap-2">
        <div className="rounded-xl border border-[#EBEBEB] bg-white px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#222222]">
          <Tag className="w-3.5 h-3.5 text-[#FF385C]" />
          <span>Prices include all fees</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMapView(!isMapView)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#222222] text-white text-xs font-semibold cursor-pointer"
        >
          {isMapView ? (
            <>
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Show Grid</span>
            </>
          ) : (
            <>
              <MapIcon className="w-3.5 h-3.5" />
              <span>Show Map</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

