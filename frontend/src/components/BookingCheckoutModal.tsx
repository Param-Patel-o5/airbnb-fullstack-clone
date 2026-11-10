"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, ShieldCheck, Smartphone, X } from "lucide-react";
import { API_BASE_URL, useApp } from "@/context/AppContext";
import { Listing } from "@/types";

interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalPrice: number;
  onBookingSuccess: (newRange: { check_in: string; check_out: string }) => void;
}

export default function BookingCheckoutModal({
  isOpen,
  onClose,
  listing,
  checkIn,
  checkOut,
  nights,
  guestsCount,
  totalPrice,
  onBookingSuccess,
}: BookingCheckoutModalProps) {
  const router = useRouter();
  const { currentUser, openAuthModal, showToast } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!currentUser) {
      onClose();
      openAuthModal();
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          guest_id: currentUser.id,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Could not complete booking.");
        return;
      }

      setConfirmedBookingId(data.id);
      onBookingSuccess({ check_in: checkIn, check_out: checkOut });
      showToast("Reservation confirmed!");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Network error while booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBookingId(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[560px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close checkout"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F7F7] text-[#222222] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-[#222222]">
            {confirmedBookingId ? "Reservation Confirmed" : "Confirm and pay"}
          </h2>
          <div className="w-8" />
        </div>

        {confirmedBookingId ? (
          /* Celebratory Confirmation State */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-[#222222]">
                You&apos;re going to {listing.location.split(",")[0]}!
              </h3>
              <p className="text-sm text-[#6A6A6A] mt-1">
                Booking Reference:{" "}
                <span className="font-semibold text-[#222222]">
                  #AIR-{confirmedBookingId}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDDDDD] p-4 bg-[#F7F7F7] text-left flex items-center gap-4">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#222222] truncate">
                  {listing.title}
                </div>
                <div className="text-xs text-[#6A6A6A] mt-0.5">
                  {checkIn} → {checkOut} · {guestsCount} guest
                  {guestsCount > 1 ? "s" : ""}
                </div>
                <div className="text-sm font-semibold text-[#222222] mt-1">
                  Total paid: ₹{Math.round(totalPrice).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push("/trips");
                }}
                className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white font-semibold text-sm cursor-pointer"
              >
                View My Trips
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-full border border-[#222222] text-[#222222] font-semibold text-sm hover:bg-[#F7F7F7] cursor-pointer"
              >
                Back to listing
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Body */
          <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Property Summary */}
            <div className="flex items-center gap-4 pb-5 border-b border-[#DDDDDD]">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-24 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs text-[#6A6A6A]">{listing.category}</div>
                <div className="text-sm font-semibold text-[#222222] truncate">
                  {listing.title}
                </div>
                <div className="text-xs text-[#6A6A6A] mt-0.5">
                  {listing.location}
                </div>
              </div>
            </div>

            {/* Your Trip Details */}
            <div className="space-y-2 pb-5 border-b border-[#DDDDDD]">
              <h3 className="text-base font-semibold text-[#222222]">
                Your trip
              </h3>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#222222]">Dates</span>
                <span className="text-[#6A6A6A]">
                  {checkIn} to {checkOut} ({nights} night{nights > 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#222222]">Guests</span>
                <span className="text-[#6A6A6A]">
                  {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pb-5 border-b border-[#DDDDDD]">
              <h3 className="text-base font-semibold text-[#222222]">
                Price details
              </h3>
              <div className="flex justify-between text-sm text-[#6A6A6A]">
                <span>
                  ₹{listing.price_per_night.toLocaleString("en-IN")} × {nights}{" "}
                  night{nights > 1 ? "s" : ""}
                </span>
                <span>
                  ₹
                  {Math.round(listing.price_per_night * nights).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-[#6A6A6A]">
                <span>Cleaning fee</span>
                <span>₹{listing.cleaning_fee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6A6A6A]">
                <span>Airbnb service fee</span>
                <span>₹{listing.service_fee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#222222] pt-2 border-t border-[#EBEBEB]">
                <span>Total (INR)</span>
                <span>₹{Math.round(totalPrice).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Mocked Payment Method Selector */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#222222]">
                Pay with (Mock Payment)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-2 border-[#222222] bg-[#F7F7F7]"
                      : "border-[#DDDDDD] hover:border-[#222222]"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#222222] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#222222]">
                      UPI / Google Pay
                    </div>
                    <div className="text-xs text-[#6A6A6A]">Instant demo pay</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-2 border-[#222222] bg-[#F7F7F7]"
                      : "border-[#DDDDDD] hover:border-[#222222]"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#222222] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#222222]">
                      Card •••• 4242
                    </div>
                    <div className="text-xs text-[#6A6A6A]">Visa / Mastercard</div>
                  </div>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white font-semibold text-base hover:opacity-95 disabled:opacity-60 transition cursor-pointer"
            >
              {submitting
                ? "Confirming reservation..."
                : "Confirm and Book (Mock Payment)"}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-[#6A6A6A]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Demo reservation — no real charge will be made</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

