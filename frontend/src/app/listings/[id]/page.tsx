"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BellOff,
  Building2,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  KeyRound,
  Laptop,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Mountain,
  Share,
  ShieldAlert,
  Sparkles,
  Star,
  Tag,
  Tv,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wind,
  X,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useApp } from "@/context/AppContext";
import BookingCheckoutModal from "@/components/BookingCheckoutModal";
import { Listing, Review } from "@/types";

interface BookedRange {
  check_in: string;
  check_out: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const AVATAR_PASTELS = [
  "bg-[#E8F5E9] text-[#1B5E20]",
  "bg-[#E3F2FD] text-[#0D47A1]",
  "bg-[#FCE4EC] text-[#880E4F]",
  "bg-[#FFF3E0] text-[#E65100]",
];

function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("wifi")) return Wifi;
  if (lower.includes("kitchen")) return UtensilsCrossed;
  if (lower.includes("parking")) return Car;
  if (lower.includes("workspace")) return Laptop;
  if (lower.includes("pool")) return Waves;
  if (lower.includes("air")) return Wind;
  if (lower.includes("mountain")) return Mountain;
  if (lower.includes("beach")) return Waves;
  if (lower.includes("tv")) return Tv;
  if (lower.includes("lift")) return Building2;
  return Sparkles;
}

function buildMonthCells(year: number, monthZeroBased: number): (string | null)[] {
  const firstDay = new Date(year, monthZeroBased, 1).getDay();
  const daysCount = new Date(year, monthZeroBased + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) {
    const mm = String(monthZeroBased + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push(`${year}-${mm}-${dd}`);
  }
  return cells;
}

function LaurelSvg({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 36 64"
      className={`w-7 h-12 text-[#222222] shrink-0 ${flip ? "-scale-x-100" : ""}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 58c-9-7-15-18-15-30C9 17 13 8 20 3c-2 6-3 13-2 20 1 11 5 22 12 31l-6 4zM7 33c-3-2-5-6-5-10 4 1 7 4 8 8-1 1-2 2-3 2zm1 11c-4-2-6-6-6-10 4 1 7 4 8 8-1 1-1 1-2 2zm4 10c-4-1-7-5-7-9 4 0 8 3 9 7l-2 2zM9 22c-3-2-5-6-4-10 4 1 6 5 6 9l-2 1zm5-10c-2-3-3-7-1-10 3 2 5 6 4 10h-3z" />
    </svg>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params?.id as string;
  const { currentUser, wishlistIds, toggleWishlist, showToast } = useApp();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookedDates, setBookedDates] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Booking form state
  const [checkIn, setCheckIn] = useState("2026-11-20");
  const [checkOut, setCheckOut] = useState("2026-11-25");
  const [guestsCount, setGuestsCount] = useState(2);

  // Calendar display offset (0 => Nov & Dec 2026, 1 => Dec 2026 & Jan 2027)
  const [calendarOffset, setCalendarOffset] = useState(0);

  // UI modals & scroll sub-nav
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  // Leave a review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const photosRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    async function loadDetail() {
      setLoading(true);
      setNotFoundError(false);
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings/${listingId}`);
        if (res.status === 404) {
          if (active) setNotFoundError(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load listing");
        const data = await res.json();
        if (active) {
          setListing(data.listing);
          setReviews(data.reviews || []);
          setBookedDates(data.booked_dates || []);
          setGuestsCount((prev) =>
            Math.min(prev, data.listing.max_guests || 2)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (listingId) loadDetail();
    return () => {
      active = false;
    };
  }, [listingId]);

  // Show sticky sub-nav once user scrolls past the 5-photo collage
  useEffect(() => {
    function onScroll() {
      if (!photosRef.current) return;
      const rect = photosRef.current.getBoundingClientRect();
      setShowStickyNav(rect.bottom <= 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDateBooked = (isoDate: string): boolean => {
    // Check-out day itself is exclusive (a guest checking out on X allows check-in on X).
    return bookedDates.some(
      (b) => b.check_in <= isoDate && isoDate < b.check_out
    );
  };

  const hasValidRange = Boolean(checkIn && checkOut && checkOut > checkIn);

  const nights = (() => {
    if (!hasValidRange) return 1;
    const diff = Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(1, diff);
  })();

  // Allen's Interval Algebra: existing_check_in < new_check_out AND existing_check_out > new_check_in
  const hasOverlap = Boolean(
    hasValidRange &&
      bookedDates.some(
        (b) => b.check_in < checkOut && b.check_out > checkIn
      )
  );

  const handleCalendarDateSelect = (isoDate: string) => {
    if (isDateBooked(isoDate)) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(isoDate);
      setCheckOut("");
    } else if (isoDate > checkIn) {
      setCheckOut(isoDate);
    } else {
      setCheckIn(isoDate);
      setCheckOut("");
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Listing link copied to clipboard");
    } catch {
      showToast("Link ready to share");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !currentUser) return;
    if (!reviewComment.trim()) {
      showToast("Please write a short comment before submitting");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          user_id: currentUser.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      if (!res.ok) {
        showToast("Failed to submit review");
        return;
      }
      const created: Review = await res.json();
      const updatedReviews = [created, ...reviews];
      setReviews(updatedReviews);

      const newAvg =
        updatedReviews.reduce((acc, r) => acc + r.rating, 0) /
        updatedReviews.length;
      setListing({
        ...listing,
        rating_avg: Number(newAvg.toFixed(2)),
        reviews_count: updatedReviews.length,
      });
      setReviewComment("");
      setReviewRating(5);
      showToast("Review published! Thank you for sharing.");
    } catch (err) {
      console.error(err);
      showToast("Network error while submitting review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-10 animate-pulse space-y-6">
        <div className="h-8 w-1/2 bg-[#EBEBEB] rounded" />
        <div className="h-[420px] bg-[#EBEBEB] rounded-2xl" />
        <div className="grid grid-cols-3 gap-12">
          <div className="col-span-2 space-y-4">
            <div className="h-6 w-2/3 bg-[#EBEBEB] rounded" />
            <div className="h-24 bg-[#EBEBEB] rounded-xl" />
          </div>
          <div className="h-80 bg-[#EBEBEB] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFoundError || !listing) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#222222]">
          Listing not found
        </h1>
        <p className="text-sm text-[#6A6A6A] mt-2 mb-6">
          This property may have been removed by the host.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-[#222222] text-white text-sm font-semibold"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(listing.id);
  const totalPrice =
    listing.price_per_night * nights +
    listing.cleaning_fee +
    listing.service_fee;

  const images = listing.images?.length
    ? listing.images
    : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      ];

  const monthsToShow =
    calendarOffset === 0
      ? [
          { title: "November 2026", cells: buildMonthCells(2026, 10) },
          { title: "December 2026", cells: buildMonthCells(2026, 11) },
        ]
      : [
          { title: "December 2026", cells: buildMonthCells(2026, 11) },
          { title: "January 2027", cells: buildMonthCells(2027, 0) },
        ];

  const categoryScores = [
    { label: "Cleanliness", score: "5.0", icon: Sparkles },
    { label: "Accuracy", score: "5.0", icon: CheckCircle2 },
    { label: "Check-in", score: "5.0", icon: KeyRound },
    { label: "Communication", score: "5.0", icon: MessageSquare },
    { label: "Location", score: "5.0", icon: MapPin },
    { label: "Value", score: "4.9", icon: Tag },
  ];

  return (
    <div className="bg-white">
      {/* Scroll-Triggered Sticky Sub-Nav */}
      {showStickyNav && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#DDDDDD] z-40 h-20 shadow-xs">
          <div className="max-w-[1120px] mx-auto px-6 h-full flex items-center justify-between gap-4">
            <nav className="flex items-center gap-6 text-sm font-semibold text-[#222222]">
              {[
                { id: "photos", label: "Photos" },
                { id: "amenities", label: "Amenities" },
                { id: "reviews", label: "Reviews" },
                { id: "location", label: "Location" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="hover:underline py-2 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm text-[#222222]">
                  <span className="font-semibold underline">
                    ₹{Math.round(totalPrice).toLocaleString("en-IN")}
                  </span>{" "}
                  <span className="text-[#6A6A6A]">
                    for {nights} night{nights > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-xs text-[#6A6A6A] flex items-center justify-end gap-1">
                  <Star className="w-3 h-3 fill-[#222222] text-[#222222]" />
                  <span className="font-semibold text-[#222222]">
                    {listing.rating_avg.toFixed(2)}
                  </span>
                  <span>·</span>
                  <span>{listing.reviews_count} reviews</span>
                </div>
              </div>

              <button
                type="button"
                disabled={!hasValidRange || hasOverlap}
                onClick={() => setIsCheckoutOpen(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white font-semibold text-sm hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
              >
                Reserve
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1120px] mx-auto px-6 pt-6 pb-16">
        {/* Title & 5-Photo Collage (#photos) */}
        <section id="photos" ref={photosRef}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h1 className="text-[26px] font-semibold text-[#222222] tracking-tight">
              {listing.title}
            </h1>

            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222222] underline hover:bg-[#F7F7F7] px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(listing.id)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222222] underline hover:bg-[#F7F7F7] px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted
                      ? "fill-[#FF385C] stroke-[#FF385C]"
                      : "stroke-[#222222]"
                  }`}
                />
                {isWishlisted ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* 5-Photo Collage Grid */}
          <div className="relative rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[420px]">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="md:col-span-2 md:row-span-2 overflow-hidden bg-[#F7F7F7] cursor-pointer"
            >
              <img
                src={images[0]}
                alt={listing.title}
                className="w-full h-full object-cover hover:brightness-95 transition"
              />
            </div>

            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                onClick={() => setIsLightboxOpen(true)}
                className="hidden md:block overflow-hidden bg-[#F7F7F7] cursor-pointer"
              >
                <img
                  src={images[idx] || images[0]}
                  alt={`${listing.title} view ${idx + 1}`}
                  className="w-full h-full object-cover hover:brightness-95 transition"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 bg-white border border-[#222222] rounded-lg px-4 py-1.5 text-sm font-semibold text-[#222222] shadow-sm inline-flex items-center gap-2 hover:bg-[#F7F7F7] transition cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              Show all photos
            </button>
          </div>
        </section>

        {/* 2-Column Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
          {/* Left Column (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-7">
            {/* 1. Property Subtitle & Capacity */}
            <div className="pb-6 border-b border-[#DDDDDD]">
              <h2 className="text-[22px] font-semibold text-[#222222]">
                Entire rental unit in {listing.location}
              </h2>
              <p className="text-[15px] text-[#222222] mt-1">
                {listing.max_guests} guests · {listing.bedrooms} bedroom
                {listing.bedrooms > 1 ? "s" : ""} · {listing.beds} bed
                {listing.beds > 1 ? "s" : ""} · {listing.baths} bathroom
              </p>

              {/* 2. Guest Favourite Laurel Banner Box */}
              {listing.is_guest_favorite === 1 && (
                <div className="rounded-xl border border-[#DDDDDD] p-5 my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <LaurelSvg />
                    <div className="text-center font-semibold text-sm leading-tight text-[#222222]">
                      <div>Guest</div>
                      <div>favourite</div>
                    </div>
                    <LaurelSvg flip />
                  </div>

                  <p className="text-sm font-medium text-[#222222] text-center sm:text-left max-w-[260px]">
                    One of the most loved homes on Airbnb, according to guests
                  </p>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#222222]">
                        {listing.rating_avg.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-0.5 text-[#222222]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-2.5 h-2.5 fill-[#222222] text-[#222222]"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-9 w-px bg-[#DDDDDD]" />
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#222222]">
                        {listing.reviews_count}
                      </div>
                      <div className="text-xs font-medium underline text-[#222222]">
                        Reviews
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Host Row */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#E8F5E9] text-[#1B5E20] font-semibold flex items-center justify-center text-base shrink-0">
                    {(listing.host_name || "Priya")[0]}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-[#222222]">
                      Hosted by {listing.host_name || "Priya Nair"}
                    </div>
                    <div className="text-sm text-[#6A6A6A]">
                      {listing.host_is_superhost === 1 ? "Superhost · " : ""}2
                      years hosting
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast("Messaging Host — Coming Soon")}
                  className="px-4 py-2 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-sm font-semibold text-[#222222] transition cursor-pointer shrink-0"
                >
                  Message Host
                </button>
              </div>
            </div>

            {/* 4. 3 Property Highlights */}
            <div className="space-y-5 pb-7 border-b border-[#DDDDDD]">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-[#222222] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[15px] font-semibold text-[#222222]">
                    Prime location in {listing.location}
                  </div>
                  <div className="text-sm text-[#6A6A6A]">
                    Easy access to local attractions and transit
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <UtensilsCrossed className="w-6 h-6 text-[#222222] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[15px] font-semibold text-[#222222]">
                    Full kitchen and free parking
                  </div>
                  <div className="text-sm text-[#6A6A6A]">
                    Equipped with modern essentials and dedicated parking
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-[#222222] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[15px] font-semibold text-[#222222]">
                    Praised for comfort and hosting
                  </div>
                  <div className="text-sm text-[#6A6A6A]">
                    Guests highlight the clean rooms and warm hospitality
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Description & Amenities (#amenities) */}
            <div className="pb-7 border-b border-[#DDDDDD]">
              <p className="text-[15px] leading-relaxed text-[#222222]">
                {listing.description}
              </p>
            </div>

            <div id="amenities" className="pb-7 border-b border-[#DDDDDD]">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-5">
                What this place offers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listing.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3.5 text-[15px] text-[#222222]"
                    >
                      <Icon className="w-5 h-5 text-[#222222] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3.5 text-[15px] text-[#6A6A6A] line-through">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Carbon monoxide alarm</span>
                </div>
                <div className="flex items-center gap-3.5 text-[15px] text-[#6A6A6A] line-through">
                  <BellOff className="w-5 h-5 shrink-0" />
                  <span>Smoke alarm</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAmenitiesOpen(true)}
                className="mt-6 bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#222222]/15 rounded-xl px-6 py-3 font-semibold text-sm text-[#222222] transition cursor-pointer"
              >
                Show all amenities
              </button>
            </div>

            {/* 6. Interactive Availability Calendar Section */}
            <div className="pb-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-[22px] font-semibold text-[#222222]">
                    {hasValidRange
                      ? `${nights} night${nights > 1 ? "s" : ""} in ${
                          listing.location.split(",")[0]
                        }`
                      : "Select check-in date"}
                  </h2>
                  <p className="text-sm text-[#6A6A6A]">
                    {hasValidRange
                      ? `${checkIn} – ${checkOut}`
                      : "Booked dates are crossed out and unavailable"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={calendarOffset === 0}
                    onClick={() => setCalendarOffset(0)}
                    aria-label="Previous months"
                    className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center disabled:opacity-30 hover:border-[#222222] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={calendarOffset === 1}
                    onClick={() => setCalendarOffset(1)}
                    aria-label="Next months"
                    className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center disabled:opacity-30 hover:border-[#222222] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-5">
                {monthsToShow.map((month) => (
                  <div
                    key={month.title}
                    className="p-4 rounded-2xl border border-[#EBEBEB]"
                  >
                    <div className="text-center text-sm font-semibold text-[#222222] mb-3">
                      {month.title}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                      {WEEKDAYS.map((day) => (
                        <div
                          key={day}
                          className="text-xs font-medium text-[#6A6A6A] py-1"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 text-center">
                      {month.cells.map((iso, idx) => {
                        if (!iso) return <div key={`e-${idx}`} className="h-9" />;
                        const dayNum = Number(iso.split("-")[2]);
                        const booked = isDateBooked(iso);
                        const isEndpoint = iso === checkIn || iso === checkOut;
                        const isBetween =
                          hasValidRange && iso > checkIn && iso < checkOut;

                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={booked}
                            title={booked ? "Booked" : iso}
                            onClick={() => handleCalendarDateSelect(iso)}
                            className={`h-9 text-xs font-medium flex flex-col items-center justify-center transition ${
                              booked
                                ? "text-[#B0B0B0] line-through bg-[#F7F7F7] rounded-full cursor-not-allowed"
                                : isEndpoint
                                ? "bg-[#222222] text-white rounded-full font-semibold cursor-pointer"
                                : isBetween
                                ? "bg-[#EBEBEB] text-[#222222] cursor-pointer"
                                : "text-[#222222] hover:border hover:border-[#222222] rounded-full cursor-pointer"
                            }`}
                          >
                            <span>{dayNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {bookedDates.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#6A6A6A]">
                  <span className="font-semibold text-[#222222]">
                    Unavailable (Booked):
                  </span>
                  {bookedDates.map((b, i) => (
                    <span
                      key={`${b.check_in}-${i}`}
                      className="px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#DDDDDD] line-through"
                    >
                      {b.check_in} → {b.check_out} · Booked
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              {/* Top Floating Fee Banner */}
              <div className="rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#EBEBEB] p-3.5 mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#222222] bg-white">
                <Tag className="w-4 h-4 text-[#FF385C]" />
                <span>Prices include all fees</span>
              </div>

              {/* Main Booking Card */}
              <div className="rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[#DDDDDD] p-6 bg-white">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-semibold text-[#222222] underline">
                    ₹{Math.round(totalPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-[#6A6A6A]">
                    for {nights} night{nights > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Joined Check-in / Checkout / Guests Box */}
                <div className="border border-[#717171] rounded-xl overflow-hidden my-4">
                  <div className="grid grid-cols-2 border-b border-[#717171] divide-x divide-[#717171]">
                    <div className="p-2.5">
                      <label
                        htmlFor="booking-checkin"
                        className="block text-[10px] font-bold uppercase tracking-wider text-[#222222]"
                      >
                        CHECK-IN
                      </label>
                      <input
                        id="booking-checkin"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-xs font-medium text-[#222222] focus:outline-none mt-0.5 bg-transparent"
                      />
                    </div>
                    <div className="p-2.5">
                      <label
                        htmlFor="booking-checkout"
                        className="block text-[10px] font-bold uppercase tracking-wider text-[#222222]"
                      >
                        CHECKOUT
                      </label>
                      <input
                        id="booking-checkout"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs font-medium text-[#222222] focus:outline-none mt-0.5 bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-2.5">
                    <label
                      htmlFor="booking-guests"
                      className="block text-[10px] font-bold uppercase tracking-wider text-[#222222]"
                    >
                      GUESTS
                    </label>
                    <select
                      id="booking-guests"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full text-xs font-medium text-[#222222] focus:outline-none mt-0.5 bg-transparent cursor-pointer"
                    >
                      {Array.from({ length: listing.max_guests }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} guest{i + 1 > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Date-Overlap / Validation Warning */}
                {!hasValidRange && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                    Check-out date must be after check-in date.
                  </div>
                )}

                {hasOverlap && (
                  <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                    Selected dates are already booked
                  </div>
                )}

                <button
                  type="button"
                  disabled={!hasValidRange || hasOverlap}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full rounded-full py-3.5 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white font-semibold text-base hover:opacity-95 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Reserve
                </button>

                <p className="text-center text-xs text-[#6A6A6A] mt-3">
                  You won&apos;t be charged yet
                </p>

                {/* Itemized Price Breakdown */}
                <div className="mt-5 space-y-2.5 text-sm text-[#222222]">
                  <div className="flex justify-between">
                    <span className="underline text-[#6A6A6A]">
                      ₹{listing.price_per_night.toLocaleString("en-IN")} ×{" "}
                      {nights} night{nights > 1 ? "s" : ""}
                    </span>
                    <span>
                      ₹
                      {Math.round(
                        listing.price_per_night * nights
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline text-[#6A6A6A]">
                      Cleaning fee
                    </span>
                    <span>₹{listing.cleaning_fee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline text-[#6A6A6A]">
                      Airbnb service fee
                    </span>
                    <span>₹{listing.service_fee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-3 border-t border-[#DDDDDD] flex justify-between font-semibold text-base">
                    <span>Total before taxes</span>
                    <span>₹{Math.round(totalPrice).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast("Listing report submitted for review")}
                className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#6A6A6A] underline hover:text-[#222222] cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Report this listing
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Reviews Hero & Grid (#reviews) */}
        <section
          id="reviews"
          className="mt-14 pt-12 border-t border-[#DDDDDD]"
        >
          {/* Giant Laurel Hero Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-3">
              <LaurelSvg />
              <span className="text-6xl font-bold text-[#222222] tracking-tight">
                {listing.rating_avg.toFixed(1)}
              </span>
              <LaurelSvg flip />
            </div>
            <h2 className="text-[22px] font-semibold text-[#222222] mt-2">
              Guest favourite
            </h2>
            <p className="text-sm text-[#6A6A6A] max-w-md mt-1">
              This home is a guest favourite based on ratings, reviews and
              reliability
            </p>
          </div>

          {/* 7-Column Category Breakdown Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 pb-10 mb-10 border-b border-[#DDDDDD]">
            {/* Col 1: Overall Rating Bars */}
            <div className="pr-4 lg:border-r border-[#DDDDDD]">
              <div className="text-xs font-semibold text-[#222222] mb-2">
                Overall rating
              </div>
              <div className="space-y-1">
                {[
                  { stars: 5, pct: "90%" },
                  { stars: 4, pct: "10%" },
                  { stars: 3, pct: "0%" },
                  { stars: 2, pct: "0%" },
                  { stars: 1, pct: "0%" },
                ].map((bar) => (
                  <div key={bar.stars} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 text-[#6A6A6A]">{bar.stars}</span>
                    <div className="flex-1 h-1 rounded-full bg-[#EBEBEB] overflow-hidden">
                      <div
                        style={{ width: bar.pct }}
                        className="h-full bg-[#222222] rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cols 2-7: Category Scores */}
            {categoryScores.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className={`flex flex-col justify-between px-2 ${
                    idx < categoryScores.length - 1
                      ? "lg:border-r border-[#DDDDDD]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-[#222222]">
                      {cat.label}
                    </div>
                    <div className="text-lg font-semibold text-[#222222] mt-0.5">
                      {cat.score}
                    </div>
                  </div>
                  <Icon className="w-6 h-6 text-[#222222] mt-4" />
                </div>
              );
            })}
          </div>

          {/* 2-Column Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            {reviews.map((rev, idx) => {
              const isExpanded = expandedReviews.includes(rev.id);
              const pastel = AVATAR_PASTELS[idx % AVATAR_PASTELS.length];
              return (
                <div key={rev.id} className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    {rev.avatar_url ? (
                      <img
                        src={rev.avatar_url}
                        alt={rev.user_name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold ${pastel}`}
                      >
                        {rev.user_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-[#222222]">
                        {rev.user_name}
                      </div>
                      <div className="text-xs text-[#6A6A6A]">India</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#222222]">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.round(rev.rating) }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-[#222222] text-[#222222]"
                          />
                        )
                      )}
                    </div>
                    <span>·</span>
                    <span className="text-[#6A6A6A]">{rev.created_at}</span>
                  </div>

                  <p
                    className={`text-sm leading-relaxed text-[#222222] ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {rev.comment}
                  </p>

                  {rev.comment.length > 90 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReviews((prev) =>
                          prev.includes(rev.id)
                            ? prev.filter((x) => x !== rev.id)
                            : [...prev, rev.id]
                        )
                      }
                      className="text-xs font-semibold underline text-[#222222] cursor-pointer"
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leave a Review Form */}
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] p-6 max-w-2xl"
          >
            <h3 className="text-base font-semibold text-[#222222] mb-1">
              Leave a Review
            </h3>
            <p className="text-xs text-[#6A6A6A] mb-4">
              Posting as{" "}
              <span className="font-semibold text-[#222222]">
                {currentUser?.name || "Aarav Sharma"}
              </span>
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-[#222222] mr-1">
                Rating:
              </span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReviewRating(num)}
                  aria-label={`Rate ${num} stars`}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      num <= reviewRating
                        ? "fill-[#FF385C] text-[#FF385C]"
                        : "text-[#DDDDDD]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share what you loved about the home, host, or location..."
              className="w-full rounded-xl border border-[#DDDDDD] bg-white p-3.5 text-sm text-[#222222] focus:outline-none focus:border-[#222222]"
            />

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="mt-3 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-black text-white text-sm font-semibold disabled:opacity-50 transition cursor-pointer"
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </section>

        {/* Location Section (#location) */}
        <section
          id="location"
          className="mt-14 pt-12 border-t border-[#DDDDDD]"
        >
          <h2 className="text-[22px] font-semibold text-[#222222] mb-1">
            Where you&apos;ll be
          </h2>
          <p className="text-sm text-[#6A6A6A] mb-5">{listing.location}</p>

          <div className="relative h-[320px] rounded-2xl overflow-hidden border border-[#DDDDDD] bg-[#F1EFEA]">
            <svg
              viewBox="0 0 900 320"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <rect width="900" height="320" fill="#F1EFEA" />
              <ellipse cx="220" cy="120" rx="140" ry="70" fill="#DCEBD3" />
              <ellipse cx="700" cy="210" rx="160" ry="80" fill="#CFE6F3" />
              <path
                d="M0 190 Q300 120 900 210"
                stroke="#FFFFFF"
                strokeWidth="8"
                fill="none"
              />
              <path
                d="M420 0 Q450 160 490 320"
                stroke="#FFFFFF"
                strokeWidth="6"
                fill="none"
              />
            </svg>

            {/* Centered Property Pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#FF385C]/15 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#FF385C] text-white flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 bg-white px-4 py-1.5 rounded-full shadow-md border border-[#DDDDDD] text-xs font-semibold text-[#222222]">
                Exact location provided after booking
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full-Screen Photo Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 text-white overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 py-3 bg-black/80 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 cursor-pointer"
              >
                <X className="w-5 h-5" />
                Close gallery
              </button>
              <span className="text-sm text-white/70">
                {images.length} photos
              </span>
            </div>

            <div className="space-y-4">
              {images.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`${listing.title} gallery ${i + 1}`}
                  className="w-full max-h-[540px] object-cover rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show All Amenities Modal */}
      {isAmenitiesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[520px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDDDDD]">
              <h3 className="text-lg font-semibold text-[#222222]">
                What this place offers
              </h3>
              <button
                type="button"
                onClick={() => setIsAmenitiesOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {listing.amenities.map((amenity) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-4 pb-3 border-b border-[#EBEBEB] text-sm text-[#222222]"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mocked Checkout & Confirmation Modal */}
      <BookingCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        listing={listing}
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        guestsCount={guestsCount}
        totalPrice={totalPrice}
        onBookingSuccess={(newRange) =>
          setBookedDates((prev) => [...prev, newRange])
        }
      />
    </div>
  );
}

