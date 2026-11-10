"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL, useApp } from "@/context/AppContext";
import FilterBar from "@/components/FilterBar";
import ListingCard from "@/components/ListingCard";
import InteractiveMap from "@/components/InteractiveMap";
import { Listing } from "@/types";

interface CarouselSectionProps {
  title: string;
  subtitle?: string;
  items: Listing[];
  onExploreAll: () => void;
}

function CarouselSection({
  title,
  subtitle,
  items,
  onExploreAll,
}: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -640 : 640;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <button
            type="button"
            onClick={onExploreAll}
            className="inline-flex items-center gap-2 text-[22px] font-semibold text-[#222222] hover:opacity-80 transition cursor-pointer text-left"
          >
            <span>{title}</span>
            <span className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-[#222222]" />
            </span>
          </button>
          {subtitle && (
            <p className="text-sm text-[#6A6A6A] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* < > Scroll Buttons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label={`Scroll ${title} left`}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] bg-white hover:shadow-md flex items-center justify-center text-[#222222] transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label={`Scroll ${title} right`}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] bg-white hover:shadow-md flex items-center justify-center text-[#222222] transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Card Row */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
      >
        {items.map((listing) => (
          <div
            key={listing.id}
            className="w-[240px] sm:w-[255px] lg:w-[265px] shrink-0"
          >
            <ListingCard listing={listing} variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { activeFilters, resetFilters, isMapView, setIsMapView } = useApp();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const hasActiveFilter = Boolean(
    activeFilters.location ||
      activeFilters.category ||
      activeFilters.check_in ||
      activeFilters.check_out ||
      activeFilters.guests > 0 ||
      activeFilters.min_price ||
      activeFilters.max_price ||
      activeFilters.amenity ||
      (activeFilters.property_type &&
        activeFilters.property_type !== "Any type")
  );

  useEffect(() => {
    let active = true;

    async function fetchListings() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeFilters.location) {
          params.set("location", activeFilters.location);
        }
        if (activeFilters.category) {
          params.set("category", activeFilters.category);
        }
        if (activeFilters.check_in && activeFilters.check_out) {
          params.set("check_in", activeFilters.check_in);
          params.set("check_out", activeFilters.check_out);
        }
        if (activeFilters.guests > 0) {
          params.set("guests", String(activeFilters.guests));
        }
        if (activeFilters.min_price) {
          params.set("min_price", activeFilters.min_price);
        }
        if (activeFilters.max_price) {
          params.set("max_price", activeFilters.max_price);
        }
        if (activeFilters.amenity) {
          params.set("amenity", activeFilters.amenity);
        }

        const qs = params.toString();
        const url = `${API_BASE_URL}/api/listings${qs ? `?${qs}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch listings from backend");
        }
        let data: Listing[] = await res.json();

        // Client-side property_type filter ("Room" vs "Entire home")
        if (activeFilters.property_type === "Room") {
          data = data.filter((item) => item.bedrooms <= 1);
        } else if (activeFilters.property_type === "Entire home") {
          data = data.filter((item) => item.bedrooms >= 2);
        }

        if (active) {
          setListings(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load properties"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchListings();
    return () => {
      active = false;
    };
  }, [activeFilters]);

  // Compute nights count for Split-Screen detailed pricing
  const selectedNights = (() => {
    if (activeFilters.check_in && activeFilters.check_out) {
      const start = new Date(activeFilters.check_in);
      const end = new Date(activeFilters.check_out);
      const diff = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff > 0) return diff;
    }
    return 5;
  })();

  const dateLabel = (() => {
    if (activeFilters.check_in && activeFilters.check_out) {
      const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
      return `${fmt(activeFilters.check_in)} – ${fmt(activeFilters.check_out)}`;
    }
    return "10–15 Nov";
  })();

  // Group listings into 3 discovery carousels for Default Home View
  const sectionOneItems = listings.filter((l) =>
    ["Amazing pools", "Luxury", "Lakefront", "Farms"].includes(l.category)
  );
  const sectionTwoItems = listings.filter(
    (l) =>
      l.category === "Beachfront" ||
      l.location.toLowerCase().includes("goa") ||
      l.is_guest_favorite === 1
  );
  const sectionThreeItems = listings.filter((l) =>
    ["Cabins", "Mountain views", "Historical homes"].includes(l.category)
  );

  return (
    <div>
      <FilterBar />

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square rounded-2xl bg-[#EBEBEB]" />
                <div className="h-4 w-3/4 rounded bg-[#EBEBEB]" />
                <div className="h-3 w-1/2 rounded bg-[#EBEBEB]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="my-12 p-8 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] text-center">
            <p className="text-base font-semibold text-[#222222]">{error}</p>
            <p className="text-sm text-[#6A6A6A] mt-1">
              Ensure the FastAPI server is running on http://localhost:8000.
            </p>
          </div>
        ) : !hasActiveFilter && !isMapView ? (
          /* DEFAULT HOME DISCOVERY VIEW */
          <div className="divide-y divide-[#EBEBEB]">
            <CarouselSection
              title="Available in Kondapur this weekend"
              items={sectionOneItems.length ? sectionOneItems : listings.slice(0, 5)}
              onExploreAll={() => setIsMapView(true)}
            />
            <CarouselSection
              title="Guest favourite homes in North Goa"
              subtitle="Indian guests often rate these homes highly"
              items={sectionTwoItems.length ? sectionTwoItems : listings.slice(0, 5)}
              onExploreAll={() => setIsMapView(true)}
            />
            <CarouselSection
              title="Mountain Cabins & Heritage Escapes"
              items={sectionThreeItems.length ? sectionThreeItems : listings}
              onExploreAll={() => setIsMapView(true)}
            />
          </div>
        ) : (
          /* SPLIT-SCREEN MAP VIEW */
          <div className="flex flex-col lg:flex-row gap-8 pt-2">
            {/* Left Column (55% width) */}
            <div className="w-full lg:w-[55%]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <div>
                  <h1 className="text-sm font-semibold text-[#222222]">
                    {listings.length > 0
                      ? `Over ${listings.length} home${listings.length === 1 ? "" : "s"}`
                      : "No homes match your search"}
                  </h1>
                  <p className="text-xs text-[#6A6A6A] mt-0.5">
                    Prices include all fees before taxes
                  </p>
                </div>

                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold underline text-[#222222] hover:opacity-75 cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {listings.length === 0 ? (
                <div className="p-10 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] text-center">
                  <h2 className="text-base font-semibold text-[#222222]">
                    No exact matches found
                  </h2>
                  <p className="text-sm text-[#6A6A6A] mt-1 mb-4">
                    Try changing your destination, dates, or clearing some filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-5 py-2.5 rounded-full bg-[#222222] text-white text-sm font-semibold cursor-pointer"
                  >
                    Remove all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      variant="detailed"
                      nights={selectedNights}
                      dateLabel={dateLabel}
                      isHighlighted={highlightedId === listing.id}
                      onHover={setHighlightedId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (45% width, sticky vector map) */}
            <div className="w-full lg:w-[45%]">
              <div className="lg:sticky lg:top-28 h-[420px] lg:h-[calc(100vh-140px)]">
                <InteractiveMap
                  listings={listings}
                  nights={selectedNights}
                  highlightedId={highlightedId}
                  onSelectListing={setHighlightedId}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
