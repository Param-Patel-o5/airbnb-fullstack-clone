"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CalendarCheck,
  Edit3,
  ExternalLink,
  Home,
  IndianRupee,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { API_BASE_URL, useApp } from "@/context/AppContext";
import HostListingModal from "@/components/HostListingModal";
import { Booking, Listing } from "@/types";

export default function HostDashboardPage() {
  const { users, currentUser, switchUserById, showToast } = useApp();

  // Resolve active host account: use currentUser if host, otherwise preview Priya Nair (User #2)
  const defaultHost = users.find((u) => u.role === "host") || null;
  const isGuestMode = currentUser?.role !== "host";
  const activeHost = currentUser?.role === "host" ? currentUser : defaultHost;
  const activeHostId = activeHost?.id ?? 2;

  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "bookings">("listings");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  useEffect(() => {
    let active = true;
    async function loadHostData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/host/listings?host_id=${activeHostId}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setListings(data.listings || []);
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Failed to fetch host dashboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHostData();
    return () => {
      active = false;
    };
  }, [activeHostId]);

  const handleDeleteListing = async (listingId: number) => {
    setDeletingId(listingId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/listings/${listingId}?host_id=${activeHostId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        showToast("Could not delete listing");
        return;
      }
      setListings((prev) => prev.filter((item) => item.id !== listingId));
      setBookings((prev) => prev.filter((b) => b.listing_id !== listingId));
      showToast("Listing deleted");
    } catch (err) {
      console.error(err);
      showToast("Network error while deleting listing");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSavedListing = (saved: Listing, mode: "create" | "edit") => {
    if (mode === "create") {
      setListings((prev) => [saved, ...prev]);
    } else {
      setListings((prev) =>
        prev.map((item) => (item.id === saved.id ? saved : item))
      );
    }
  };

  const totalEarnings = bookings.reduce(
    (sum, b) => sum + (b.total_price || 0),
    0
  );

  const avgRating =
    listings.length > 0
      ? (
          listings.reduce((sum, l) => sum + (l.rating_avg || 4.85), 0) /
          listings.length
        ).toFixed(2)
      : "4.92";

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 space-y-8">
      {/* Guest-Mode Quick Switch Banner */}
      {isGuestMode && defaultHost && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#222222]">
              You are currently browsing as a Guest ({currentUser?.name || "Aarav Sharma"})
            </div>
            <p className="text-xs text-[#6A6A6A] mt-0.5">
              Switch to a Host profile with one click to manage properties and incoming guest reservations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => switchUserById(defaultHost.id)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            Switch to Host Account (Priya Nair — Superhost)
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-[#222222]">
            Welcome back, {activeHost?.name || "Priya Nair"}
          </h1>
          <p className="text-sm text-[#6A6A6A] mt-0.5">
            Manage your listings, pricing, and upcoming guest reservations
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingListing(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-sm hover:opacity-95 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create new listing
        </button>
      </div>

      {/* 4-Card Host Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6A6A6A]">
            <span>Active Listings</span>
            <Home className="w-4 h-4 text-[#FF385C]" />
          </div>
          <div className="text-2xl font-bold text-[#222222] mt-2">
            {listings.length}
          </div>
          <div className="text-xs text-[#6A6A6A] mt-1">
            Published on Airbnb
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6A6A6A]">
            <span>Incoming Reservations</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#222222] mt-2">
            {bookings.length}
          </div>
          <div className="text-xs text-[#6A6A6A] mt-1">
            Confirmed guest stays
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6A6A6A]">
            <span>Total Host Earnings</span>
            <IndianRupee className="w-4 h-4 text-[#222222]" />
          </div>
          <div className="text-2xl font-bold text-[#222222] mt-2">
            ₹{Math.round(totalEarnings).toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-[#6A6A6A] mt-1">
            Across confirmed bookings
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDDDDD] bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6A6A6A]">
            <span>Superhost Status</span>
            <Award className="w-4 h-4 text-[#FF385C]" />
          </div>
          <div className="text-xl font-bold text-[#222222] mt-2 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-[#222222]" />
            <span>{avgRating} Avg Rating</span>
          </div>
          <div className="inline-block text-[11px] font-semibold text-[#FF385C] bg-rose-50 px-2 py-0.5 rounded-full mt-1">
            Superhost Badge Active
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-6 border-b border-[#DDDDDD]">
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "listings"
              ? "border-[#222222] text-[#222222]"
              : "border-transparent text-[#6A6A6A] hover:text-[#222222]"
          }`}
        >
          Your Listings ({listings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "bookings"
              ? "border-[#222222] text-[#222222]"
              : "border-transparent text-[#6A6A6A] hover:text-[#222222]"
          }`}
        >
          Incoming Guest Bookings ({bookings.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-[#EBEBEB] animate-pulse"
            />
          ))}
        </div>
      ) : activeTab === "listings" ? (
        /* Section 1: Owned Listings Grid + Full CRUD */
        listings.length === 0 ? (
          <div className="p-12 rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] text-center">
            <h2 className="text-lg font-semibold text-[#222222]">
              No listings published yet
            </h2>
            <p className="text-sm text-[#6A6A6A] mt-1 mb-5">
              Publish your first stay and start welcoming guests.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingListing(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white text-sm font-semibold cursor-pointer"
            >
              + Create new listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#DDDDDD] overflow-hidden bg-white shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="relative h-48 bg-[#F7F7F7]">
                  <img
                    src={
                      item.images?.[0] ||
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#222222] text-xs font-semibold shadow-sm">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-[#222222] line-clamp-1">
                        {item.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#222222] shrink-0">
                        <Star className="w-3.5 h-3.5 fill-[#222222]" />
                        {item.rating_avg.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6A6A6A] mt-0.5 truncate">
                      {item.location}
                    </p>
                    <p className="text-xs text-[#6A6A6A] mt-2">
                      {item.max_guests} guests · {item.bedrooms} bedroom
                      {item.bedrooms > 1 ? "s" : ""} · {item.baths} bath
                    </p>
                    <div className="mt-2 text-sm font-semibold text-[#222222]">
                      ₹{item.price_per_night.toLocaleString("en-IN")}{" "}
                      <span className="font-normal text-[#6A6A6A] text-xs">
                        / night
                      </span>
                    </div>
                  </div>

                  {/* 3 Action Buttons: View, Edit, Delete */}
                  <div className="pt-3 border-t border-[#EBEBEB] grid grid-cols-3 gap-2">
                    <Link
                      href={`/listings/${item.id}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold text-[#222222] transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingListing(item);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold text-[#222222] transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDeleteListing(item.id)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 disabled:opacity-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === item.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Section 2: Incoming Guest Bookings Table */
        <div className="rounded-2xl border border-[#DDDDDD] bg-white overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#6A6A6A]">
              No guest reservations yet on your properties.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F7] border-b border-[#DDDDDD] text-xs font-semibold text-[#6A6A6A] uppercase tracking-wider">
                    <th className="py-3.5 px-5">Property</th>
                    <th className="py-3.5 px-5">Guest</th>
                    <th className="py-3.5 px-5">Dates</th>
                    <th className="py-3.5 px-5">Guests</th>
                    <th className="py-3.5 px-5">Total Payout</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB] text-sm text-[#222222]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F7F7F7]/60">
                      <td className="py-4 px-5 font-semibold">
                        <Link
                          href={`/listings/${b.listing_id}`}
                          className="hover:underline"
                        >
                          {b.listing_title || `Listing #${b.listing_id}`}
                        </Link>
                      </td>
                      <td className="py-4 px-5 text-[#222222]">
                        {b.guest_name || `Guest #${b.guest_id}`}
                      </td>
                      <td className="py-4 px-5 text-[#6A6A6A]">
                        {b.check_in} → {b.check_out}
                      </td>
                      <td className="py-4 px-5 text-[#6A6A6A]">
                        {b.guests_count}
                      </td>
                      <td className="py-4 px-5 font-semibold">
                        ₹{Math.round(b.total_price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold capitalize">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Listing Modal */}
      <HostListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hostId={activeHostId}
        editingListing={editingListing}
        onSaved={handleSavedListing}
      />
    </div>
  );
}

