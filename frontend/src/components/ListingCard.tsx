"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
  variant?: "compact" | "detailed";
  nights?: number;
  dateLabel?: string;
  isHighlighted?: boolean;
  onHover?: (id: number | null) => void;
}

export default function ListingCard({
  listing,
  variant = "compact",
  nights = 2,
  dateLabel = "15–20 Nov",
  isHighlighted = false,
  onHover,
}: ListingCardProps) {
  const { wishlistIds, toggleWishlist } = useApp();
  const [imageIndex, setImageIndex] = useState(0);

  const isWishlisted = wishlistIds.includes(listing.id);
  const images = listing.images?.length
    ? listing.images
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"];

  const totalPrice =
    variant === "detailed"
      ? Math.round(
          listing.price_per_night * nights +
            listing.cleaning_fee +
            listing.service_fee
        )
      : Math.round(listing.price_per_night * 2);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing.id);
  };

  const cycleImage = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <Link
      href={`/listings/${listing.id}`}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group block rounded-2xl transition ${
        isHighlighted
          ? "ring-2 ring-[#222222] ring-offset-4 bg-[#F7F7F7]/50"
          : ""
      }`}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#F7F7F7] ${
          variant === "compact" ? "aspect-square" : "aspect-[4/3]"
        }`}
      >
        <img
          src={images[imageIndex]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
        />

        {/* Top-left badge */}
        {listing.is_guest_favorite === 1 ? (
          <span className="absolute top-3 left-3 bg-white/95 text-[#222222] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Guest favourite
          </span>
        ) : (
          variant === "detailed" && (
            <span className="absolute top-3 left-3 bg-white/95 text-[#222222] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              Superhost
            </span>
          )
        )}

        {/* Top-right Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:scale-110 transition cursor-pointer"
        >
          <Heart
            className={`w-6 h-6 stroke-2 transition ${
              isWishlisted
                ? "fill-[#FF385C] stroke-white"
                : "fill-black/50 stroke-white"
            }`}
          />
        </button>

        {/* Detailed Card Carousel Arrows & Pagination Dots */}
        {variant === "detailed" && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => cycleImage(e, -1)}
              aria-label="Previous photo"
              className="opacity-0 group-hover:opacity-100 absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center shadow transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => cycleImage(e, 1)}
              aria-label="Next photo"
              className="opacity-0 group-hover:opacity-100 absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center shadow transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition ${
                    idx === imageIndex
                      ? "w-2 h-2 bg-white"
                      : "w-1.5 h-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Metadata Below Photo */}
      {variant === "compact" ? (
        <div className="mt-2.5">
          <div className="text-[15px] font-semibold text-[#222222] truncate">
            {listing.title}
          </div>
          <div className="text-[13px] text-[#6A6A6A] truncate">
            {listing.location}
          </div>
          <div className="mt-0.5 text-[14px] text-[#6A6A6A] flex items-center gap-1">
            <span>₹{totalPrice.toLocaleString("en-IN")} for 2 nights</span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5 text-[#222222] font-medium">
              <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
              {listing.rating_avg.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-[#222222] truncate">
              {listing.title}
            </h3>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#222222] shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
              {listing.rating_avg.toFixed(2)} ({listing.reviews_count})
            </span>
          </div>

          <p className="text-sm text-[#6A6A6A] truncate">
            {listing.category} in {listing.location}
          </p>

          <p className="text-sm text-[#6A6A6A] truncate">
            {listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""} ·{" "}
            {listing.beds} bed{listing.beds > 1 ? "s" : ""} · {listing.baths} bath
          </p>

          <p className="text-sm text-[#6A6A6A]">{dateLabel}</p>

          <div className="pt-1 flex items-center justify-between gap-2">
            <span className="text-[15px] text-[#222222]">
              <span className="font-semibold underline">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>{" "}
              <span className="text-[#6A6A6A] text-sm">for {nights} nights</span>
            </span>

            <span className="text-[11px] font-medium text-[#6A6A6A] bg-[#F7F7F7] px-2.5 py-1 rounded-full">
              Free cancellation
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}

