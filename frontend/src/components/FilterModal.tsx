"use client";

import React, { useEffect, useState } from "react";
import {
  Car,
  UtensilsCrossed,
  WashingMachine,
  X,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const RECOMMENDED_CARDS = [
  { label: "Washing machine", icon: WashingMachine, amenityValue: "Washing machine" },
  { label: "Free parking", icon: Car, amenityValue: "Free parking" },
  { label: "Kitchen", icon: UtensilsCrossed, amenityValue: "Kitchen" },
  { label: "Instant Book", icon: Zap, amenityValue: "" },
];

const PLACE_TYPES = ["Any type", "Room", "Entire home"];

export default function FilterModal() {
  const {
    isFilterModalOpen,
    closeFilterModal,
    activeFilters,
    setFilters,
    setIsMapView,
  } = useApp();

  const [selectedAmenity, setSelectedAmenity] = useState(activeFilters.amenity);
  const [instantBook, setInstantBook] = useState(false);
  const [propertyType, setPropertyType] = useState(activeFilters.property_type || "Any type");
  const [minPrice, setMinPrice] = useState(activeFilters.min_price);
  const [maxPrice, setMaxPrice] = useState(activeFilters.max_price);

  useEffect(() => {
    if (isFilterModalOpen) {
      setSelectedAmenity(activeFilters.amenity);
      setPropertyType(activeFilters.property_type || "Any type");
      setMinPrice(activeFilters.min_price);
      setMaxPrice(activeFilters.max_price);
    }
  }, [isFilterModalOpen, activeFilters]);

  if (!isFilterModalOpen) {
    return null;
  }

  const handleClearAll = () => {
    setSelectedAmenity("");
    setInstantBook(false);
    setPropertyType("Any type");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleApply = () => {
    setFilters({
      amenity: selectedAmenity,
      property_type: propertyType,
      min_price: minPrice.trim(),
      max_price: maxPrice.trim(),
    });
    setIsMapView(true);
    closeFilterModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-modal-title"
        className="w-full max-w-[600px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <button
            type="button"
            onClick={closeFilterModal}
            aria-label="Close filters"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F7F7] text-[#222222] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 id="filters-modal-title" className="text-base font-semibold text-[#222222]">
            Filters
          </h2>
          <div className="w-8" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-7">
          {/* Section 1: Recommended for you */}
          <section>
            <h3 className="text-lg font-semibold text-[#222222] mb-4">
              Recommended for you
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RECOMMENDED_CARDS.map((card) => {
                const Icon = card.icon;
                const isInstant = card.label === "Instant Book";
                const isSelected = isInstant
                  ? instantBook
                  : selectedAmenity === card.amenityValue;

                return (
                  <button
                    key={card.label}
                    type="button"
                    onClick={() => {
                      if (isInstant) {
                        setInstantBook((prev) => !prev);
                      } else {
                        setSelectedAmenity((prev) =>
                          prev === card.amenityValue ? "" : card.amenityValue
                        );
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-4 transition cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#222222] bg-[#F7F7F7]"
                        : "border-[#DDDDDD] hover:border-[#222222]"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-[#222222]" />
                    <span className="text-xs font-semibold text-[#222222]">
                      {card.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-[#DDDDDD]" />

          {/* Section 2: Type of place */}
          <section>
            <h3 className="text-lg font-semibold text-[#222222] mb-1">
              Type of place
            </h3>
            <p className="text-sm text-[#6A6A6A] mb-4">
              Search rooms, entire homes, or any type of place
            </p>
            <div className="grid grid-cols-3 rounded-xl border border-[#DDDDDD] p-1 bg-white">
              {PLACE_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#222222] bg-[#F7F7F7] text-[#222222]"
                        : "border-2 border-transparent text-[#222222] hover:bg-[#F7F7F7]/60"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-[#DDDDDD]" />

          {/* Section 3: Price range */}
          <section>
            <h3 className="text-lg font-semibold text-[#222222] mb-1">
              Price range
            </h3>
            <p className="text-sm text-[#6A6A6A] mb-4">
              Nightly prices before fees and taxes
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#DDDDDD] px-4 py-2.5 focus-within:border-[#222222]">
                <label className="block text-xs text-[#6A6A6A] mb-0.5">
                  Minimum
                </label>
                <div className="flex items-center gap-1 text-sm font-medium text-[#222222]">
                  <span>₹</span>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="2000"
                    className="w-full focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#DDDDDD] px-4 py-2.5 focus-within:border-[#222222]">
                <label className="block text-xs text-[#6A6A6A] mb-0.5">
                  Maximum
                </label>
                <div className="flex items-center gap-1 text-sm font-medium text-[#222222]">
                  <span>₹</span>
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="30000"
                    className="w-full focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DDDDDD] bg-white">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-semibold text-[#222222] underline hover:opacity-80 cursor-pointer"
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-3 rounded-xl bg-[#222222] hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
          >
            Show places
          </button>
        </div>
      </div>
    </div>
  );
}

