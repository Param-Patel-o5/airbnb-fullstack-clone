"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Luggage, MapPin, Trash2, Users } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useApp } from "@/context/AppContext";
import { Booking } from "@/types";

export default function MyTripsPage() {
  const { currentUser, showToast } = useApp();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadTrips() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/bookings/my-trips?guest_id=${currentUser!.id}`
        );
        if (!res.ok) return;
        const data: Booking[] = await res.json();
        if (active) {
          setTrips(data);
        }
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrips();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const handleCancelReservation = async (bookingId: number) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast("Could not cancel reservation");
        return;
      }
      setTrips((prev) => prev.filter((item) => item.id !== bookingId));
      showToast("Reservation cancelled — dates are now available");
    } catch (err) {
      console.error(err);
      showToast("Network error while cancelling reservation");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDDDDD]">
        <div>
          <h1 className="text-[28px] font-semibold text-[#222222]">Trips</h1>
          <p className="text-sm text-[#6A6A6A] mt-1">
            {currentUser
              ? `Reservations for ${currentUser.name}`
              : "Sign in to view your upcoming stays"}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-[#222222] text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] transition"
        >
          Explore more homes
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-[#EBEBEB] animate-pulse"
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="my-12 p-12 rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-white border border-[#DDDDDD] flex items-center justify-center mx-auto mb-4">
            <Luggage className="w-7 h-7 text-[#FF385C]" />
          </div>
          <h2 className="text-xl font-semibold text-[#222222]">
            No trips booked...yet!
          </h2>
          <p className="text-sm text-[#6A6A6A] mt-1.5 mb-6">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white text-sm font-semibold"
          >
            Explore homes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="rounded-2xl border border-[#DDDDDD] overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col"
            >
              <div className="relative h-52 bg-[#F7F7F7]">
                <img
                  src={
                    trip.images?.[0] ||
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                  }
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-sm capitalize">
                  {trip.status}
                </span>
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 text-[#222222] text-xs font-semibold shadow-sm">
                  #AIR-{trip.id}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#222222]">
                    {trip.title}
                  </h2>
                  <p className="text-sm text-[#6A6A6A] flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{trip.location}</span>
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F7F7F7] text-xs text-[#222222]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6A6A6A] shrink-0" />
                      <div>
                        <div className="font-semibold">Dates</div>
                        <div className="text-[#6A6A6A]">
                          {trip.check_in} → {trip.check_out}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6A6A6A] shrink-0" />
                      <div>
                        <div className="font-semibold">Guests</div>
                        <div className="text-[#6A6A6A]">
                          {trip.guests_count} guest
                          {trip.guests_count > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EBEBEB] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#6A6A6A]">Total paid</div>
                    <div className="text-base font-semibold text-[#222222]">
                      ₹{Math.round(trip.total_price).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/listings/${trip.listing_id}`}
                      className="px-4 py-2 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold text-[#222222] transition"
                    >
                      View Listing
                    </Link>
                    <button
                      type="button"
                      disabled={cancellingId === trip.id}
                      onClick={() => handleCancelReservation(trip.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 disabled:opacity-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {cancellingId === trip.id
                        ? "Cancelling..."
                        : "Cancel Reservation"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

