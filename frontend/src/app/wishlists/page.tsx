"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { API_BASE_URL, useApp } from "@/context/AppContext";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/types";

export default function WishlistsPage() {
  const { currentUser, wishlistIds } = useApp();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSavedListings([]);
      setLoading(false);
      return;
    }

    let active = true;
    async function loadWishlists() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/wishlists?user_id=${currentUser!.id}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setSavedListings(data.listings || []);
        }
      } catch (err) {
        console.error("Failed to fetch wishlists:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWishlists();
    return () => {
      active = false;
    };
  }, [currentUser]);

  // Immediately hide a card when the user un-hearts it on this page.
  const visibleListings = savedListings.filter((item) =>
    wishlistIds.includes(item.id)
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDDDDD]">
        <div>
          <h1 className="text-[28px] font-semibold text-[#222222]">
            Wishlists
          </h1>
          <p className="text-sm text-[#6A6A6A] mt-1">
            {visibleListings.length} saved home
            {visibleListings.length === 1 ? "" : "s"} for{" "}
            {currentUser?.name || "your account"}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-[#222222] text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] transition"
        >
          Explore stays
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-square rounded-2xl bg-[#EBEBEB]" />
              <div className="h-4 w-3/4 rounded bg-[#EBEBEB]" />
              <div className="h-3 w-1/2 rounded bg-[#EBEBEB]" />
            </div>
          ))}
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="my-12 p-12 rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-white border border-[#DDDDDD] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-[#FF385C]" />
          </div>
          <h2 className="text-xl font-semibold text-[#222222]">
            Create your first wishlist
          </h2>
          <p className="text-sm text-[#6A6A6A] mt-2 mb-6">
            As you search, click the heart icon to save your favourite places
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white text-sm font-semibold"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
          {visibleListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}

