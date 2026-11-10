"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Compass,
  Globe,
  HelpCircle,
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Minus,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  Luggage,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface SuggestedDestination {
  label: string;
  query: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
}

const SUGGESTED_DESTINATIONS: SuggestedDestination[] = [
  {
    label: "Nearby",
    query: "",
    subtitle: "Find what's around you",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    label: "North Goa, Goa",
    query: "Goa",
    subtitle: "Popular beach destination",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Manali, Himachal Pradesh",
    query: "Manali",
    subtitle: "For sights like cedar valleys & peaks",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    label: "Hyderabad, Telangana",
    query: "Hyderabad",
    subtitle: "Great for weekend city stays",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Bengaluru, Karnataka",
    query: "Bengaluru",
    subtitle: "Garden city & tech hub stays",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    label: "Mumbai, Maharashtra",
    query: "Mumbai",
    subtitle: "Coastal metropolis & nearby Alibaug",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const FLEX_CHIPS = ["Exact dates", "± 1 day", "± 2 days", "± 3 days", "± 7 days"];

function buildMonthCells(year: number, monthZeroBased: number): (string | null)[] {
  const firstDayOfWeek = new Date(year, monthZeroBased, 1).getDay();
  const daysInMonth = new Date(year, monthZeroBased + 1, 0).getDate();
  const cells: (string | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(monthZeroBased + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    cells.push(`${year}-${mm}-${dd}`);
  }
  return cells;
}

function formatShortDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    users,
    currentUser,
    switchUserById,
    openAuthModal,
    activeFilters,
    setFilters,
    resetFilters,
    setIsMapView,
    showToast,
  } = useApp();

  const [activeNavTab, setActiveNavTab] = useState<"All" | "Homes" | "Experiences" | "Services">("Homes");
  const [openPopover, setOpenPopover] = useState<"where" | "when" | "who" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Local draft search inputs synced with activeFilters
  const [locationInput, setLocationInput] = useState(activeFilters.location);
  const [checkIn, setCheckIn] = useState(activeFilters.check_in);
  const [checkOut, setCheckOut] = useState(activeFilters.check_out);
  const [dateMode, setDateMode] = useState<"Dates" | "Flexible">("Dates");
  const [flexRange, setFlexRange] = useState("Exact dates");
  const [adults, setAdults] = useState(activeFilters.guests > 0 ? activeFilters.guests : 0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);

  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLocationInput(activeFilters.location);
    setCheckIn(activeFilters.check_in);
    setCheckOut(activeFilters.check_out);
    if (activeFilters.guests === 0) {
      setAdults(0);
      setChildrenCount(0);
      setInfants(0);
    }
  }, [activeFilters]);

  // Close popovers & user dropdown when clicking outside the header
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const totalGuests = adults + childrenCount;

  const handleDateClick = (isoDate: string) => {
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

  const handleSearch = () => {
    setFilters({
      location: locationInput.trim(),
      check_in: checkIn,
      check_out: checkOut,
      guests: totalGuests,
    });
    setOpenPopover(null);
    setIsMapView(true);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleLogoClick = () => {
    resetFilters();
    setLocationInput("");
    setCheckIn("");
    setCheckOut("");
    setAdults(0);
    setChildrenCount(0);
    setInfants(0);
    setOpenPopover(null);
    setIsMenuOpen(false);
    router.push("/");
  };

  const handleRoleSwitch = () => {
    if (users.length === 0) return;
    const nextRole = currentUser?.role === "host" ? "guest" : "host";
    const targetUser = users.find((u) => u.role === nextRole) || users[0];
    switchUserById(targetUser.id);
    setIsMenuOpen(false);
  };

  const novCells = buildMonthCells(2026, 10); // November 2026
  const decCells = buildMonthCells(2026, 11); // December 2026

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-white border-b border-[#DDDDDD]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-4 pb-4">
        {/* Top Bar: Brand Logo | Center 3D Tabs | Right Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Airbnb Bélo Logo + Wordmark */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-[#FF385C] cursor-pointer shrink-0"
          >
            <svg viewBox="0 0 32 32" className="w-8 h-8 fill-[#FF385C]" aria-hidden="true">
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.267 3.42-6.414 3.615l-.28.019-.267.006C5.377 31 2.5 28.584 2.5 24.522l.005-.469c.026-.928.23-1.768.83-3.244l.216-.524c.966-2.298 6.083-12.989 7.707-16.034C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.605 2.24l-.009.33v.206c0 2.938 1.98 4.478 4.357 4.478 1.72 0 3.666-1.158 5.588-3.175l.204-.219c.237-.264.478-.544.716-.834l.635-.814.635.814c.238.29.479.57.716.834l.204.219c1.922 2.017 3.868 3.175 5.588 3.175 2.377 0 4.357-1.54 4.357-4.478v-.206l-.009-.33c-.032-.585-.178-1.169-.605-2.24l-.345-.836c-.971-2.262-5.105-10.916-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3zm0 11.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
            </svg>
            <span className="text-[22px] font-bold tracking-tight">airbnb</span>
          </button>

          {/* Center 3D Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              type="button"
              onClick={() => {
                setActiveNavTab("All");
                resetFilters();
                router.push("/");
              }}
              className={`flex items-center gap-2 pb-2 border-b-2 transition cursor-pointer ${
                activeNavTab === "All"
                  ? "border-[#222222] text-[#222222] font-semibold"
                  : "border-transparent text-[#6A6A6A] hover:text-[#222222]"
              }`}
            >
              <span className="w-7 h-7 rounded-xl bg-sky-50 flex items-center justify-center shadow-xs">
                <Globe className="w-4 h-4 text-sky-600" />
              </span>
              <span className="text-sm">All</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavTab("Homes");
                router.push("/");
              }}
              className={`flex items-center gap-2 pb-2 border-b-2 transition cursor-pointer ${
                activeNavTab === "Homes"
                  ? "border-[#222222] text-[#222222] font-semibold"
                  : "border-transparent text-[#6A6A6A] hover:text-[#222222]"
              }`}
            >
              <span className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center shadow-xs">
                <Home className="w-4 h-4 text-[#FF385C]" />
              </span>
              <span className="text-sm">Homes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavTab("Experiences");
                showToast("Experiences & Services — Coming Soon in Demo");
              }}
              className={`flex items-center gap-2 pb-2 border-b-2 transition cursor-pointer ${
                activeNavTab === "Experiences"
                  ? "border-[#222222] text-[#222222] font-semibold"
                  : "border-transparent text-[#6A6A6A] hover:text-[#222222]"
              }`}
            >
              <span className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4 text-amber-600" />
              </span>
              <span className="text-sm">Experiences</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavTab("Services");
                showToast("Experiences & Services — Coming Soon in Demo");
              }}
              className={`flex items-center gap-2 pb-2 border-b-2 transition cursor-pointer ${
                activeNavTab === "Services"
                  ? "border-[#222222] text-[#222222] font-semibold"
                  : "border-transparent text-[#6A6A6A] hover:text-[#222222]"
              }`}
            >
              <span className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4 text-indigo-600" />
              </span>
              <span className="text-sm">Services</span>
            </button>
          </nav>

          {/* Right Controls: Host Link + User Avatar + Hamburger Dropdown */}
          <div className="flex items-center gap-3 relative">
            {currentUser?.role === "host" ? (
              <Link
                href="/host"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FF385C]" />
                Host Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="hidden sm:inline-block text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3.5 py-2 rounded-full transition cursor-pointer"
              >
                Become a host
              </button>
            )}

            {/* Profile Avatar Circle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Open profile menu"
              className="w-10 h-10 rounded-full bg-[#F7F7F7] border border-[#DDDDDD] overflow-hidden flex items-center justify-center hover:shadow-sm transition cursor-pointer"
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-[#222222]">
                  {currentUser?.name?.[0] ?? "A"}
                </span>
              )}
            </button>

            {/* Hamburger Circle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="w-10 h-10 rounded-full bg-[#F7F7F7] hover:bg-[#EBEBEB] flex items-center justify-center text-[#222222] transition cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-13 w-68 bg-white rounded-2xl shadow-xl border border-[#DDDDDD] py-2 z-50">
                {currentUser && (
                  <div className="px-4 py-3 border-b border-[#DDDDDD]">
                    <div className="text-sm font-semibold text-[#222222]">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-[#6A6A6A] flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize">{currentUser.role}</span>
                      {currentUser.is_superhost === 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-[#FF385C] font-semibold">
                          Superhost
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRoleSwitch}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F7F7] hover:bg-[#EBEBEB] text-xs font-semibold text-[#222222] transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {currentUser.role === "host"
                        ? "Switch to Guest (Aarav)"
                        : "Switch to Host (Priya)"}
                    </button>
                  </div>
                )}

                <div className="py-1.5">
                  <Link
                    href="/trips"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] font-medium"
                  >
                    <Luggage className="w-4 h-4 text-[#6A6A6A]" />
                    My Trips
                  </Link>
                  <Link
                    href="/wishlists"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] font-medium"
                  >
                    <Heart className="w-4 h-4 text-[#6A6A6A]" />
                    Wishlists
                  </Link>
                  <Link
                    href="/host"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#6A6A6A]" />
                    Host Dashboard
                  </Link>
                </div>

                <div className="border-t border-[#DDDDDD] py-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] text-left cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-[#6A6A6A]" />
                    Log in or sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      showToast("Help Centre — 24/7 Demo Support");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] text-left cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[#6A6A6A]" />
                    Help Centre
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Pill: Where | When | Who + Search Button */}
        <div className="mt-4 relative max-w-[850px] mx-auto">
          <div className="rounded-full border border-[#DDDDDD] shadow-md bg-white flex items-center divide-x divide-[#DDDDDD]">
            {/* Segment 1: Where */}
            <div
              onClick={() => setOpenPopover("where")}
              className={`flex-1 px-6 py-2.5 rounded-full cursor-pointer transition ${
                openPopover === "where" ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]/70"
              }`}
            >
              <div className="text-xs font-semibold text-[#222222]">Where</div>
              <input
                type="text"
                value={locationInput}
                onFocus={() => setOpenPopover("where")}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search destinations"
                className="w-full bg-transparent text-sm text-[#222222] placeholder:text-[#6A6A6A] focus:outline-none truncate"
              />
            </div>

            {/* Segment 2: When */}
            <button
              type="button"
              onClick={() =>
                setOpenPopover((prev) => (prev === "when" ? null : "when"))
              }
              className={`flex-1 px-6 py-2.5 text-left rounded-full cursor-pointer transition ${
                openPopover === "when" ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]/70"
              }`}
            >
              <div className="text-xs font-semibold text-[#222222]">When</div>
              <div className="text-sm text-[#6A6A6A] truncate">
                {checkIn && checkOut
                  ? `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}`
                  : checkIn
                  ? `${formatShortDate(checkIn)} – Add end`
                  : "Add dates"}
              </div>
            </button>

            {/* Segment 3: Who + Search Button */}
            <div
              className={`flex-[1.1] pl-6 pr-2 py-1.5 rounded-full flex items-center justify-between gap-2 transition ${
                openPopover === "who" ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]/70"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenPopover((prev) => (prev === "who" ? null : "who"))
                }
                className="flex-1 text-left cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#222222]">Who</div>
                <div className="text-sm text-[#6A6A6A] truncate">
                  {totalGuests > 0
                    ? `${totalGuests} guest${totalGuests > 1 ? "s" : ""}${
                        infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""
                      }`
                    : "Add guests"}
                </div>
              </button>

              <button
                type="button"
                onClick={handleSearch}
                aria-label="Search stays"
                className="h-11 px-4 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                {openPopover && <span>Search</span>}
              </button>
            </div>
          </div>

          {/* POPOVER 1: Suggested Destinations ("Where") */}
          {openPopover === "where" && (
            <div className="absolute left-0 top-[calc(100%+12px)] w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 z-50">
              <div className="text-xs font-semibold text-[#222222] mb-3">
                Suggested destinations
              </div>
              <div className="space-y-1.5">
                {SUGGESTED_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.label}
                    type="button"
                    onClick={() => {
                      setLocationInput(dest.query);
                      setFilters({ location: dest.query });
                      setOpenPopover("when");
                    }}
                    className="w-full flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#F7F7F7] transition text-left cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${dest.iconBg} flex items-center justify-center shrink-0`}
                    >
                      {dest.label === "Nearby" ? (
                        <Navigation className={`w-5 h-5 ${dest.iconColor}`} />
                      ) : (
                        <MapPin className={`w-5 h-5 ${dest.iconColor}`} />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#222222]">
                        {dest.label}
                      </div>
                      <div className="text-xs text-[#6A6A6A]">{dest.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* POPOVER 2: 2-Month Side-by-Side Calendar ("When") */}
          {openPopover === "when" && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-full max-w-[740px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 z-50">
              {/* Dates | Flexible Toggle */}
              <div className="flex justify-center mb-5">
                <div className="inline-flex rounded-full bg-[#EBEBEB] p-1">
                  {(["Dates", "Flexible"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDateMode(mode)}
                      className={`px-5 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${
                        dateMode === mode
                          ? "bg-white text-[#222222] shadow-sm"
                          : "text-[#6A6A6A] hover:text-[#222222]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {dateMode === "Dates" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { title: "November 2026", cells: novCells },
                    { title: "December 2026", cells: decCells },
                  ].map((month) => (
                    <div key={month.title}>
                      <div className="text-center text-sm font-semibold text-[#222222] mb-3">
                        {month.title}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
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
                          if (!iso) {
                            return <div key={`empty-${idx}`} className="h-9" />;
                          }
                          const dayNumber = Number(iso.split("-")[2]);
                          const isStart = iso === checkIn;
                          const isEnd = iso === checkOut;
                          const isInRange =
                            Boolean(checkIn && checkOut) &&
                            iso > checkIn &&
                            iso < checkOut;

                          return (
                            <button
                              key={iso}
                              type="button"
                              onClick={() => handleDateClick(iso)}
                              className={`h-9 text-xs font-medium flex items-center justify-center transition cursor-pointer ${
                                isStart || isEnd
                                  ? "bg-[#222222] text-white rounded-full font-semibold"
                                  : isInRange
                                  ? "bg-[#F7F7F7] text-[#222222]"
                                  : "hover:border hover:border-[#222222] rounded-full text-[#222222]"
                              }`}
                            >
                              {dayNumber}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm font-semibold text-[#222222] mb-4">
                    How long would you like to stay?
                  </p>
                  <div className="flex justify-center gap-3">
                    {[
                      { label: "Weekend (2 nights)", ci: "2026-11-20", co: "2026-11-22" },
                      { label: "Week (5 nights)", ci: "2026-12-07", co: "2026-12-12" },
                      { label: "Holiday Escape", ci: "2026-12-20", co: "2026-12-24" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setCheckIn(opt.ci);
                          setCheckOut(opt.co);
                          setDateMode("Dates");
                        }}
                        className="px-4 py-2.5 rounded-full border border-[#DDDDDD] hover:border-[#222222] text-sm font-medium text-[#222222] cursor-pointer"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Quick Chips */}
              <div className="mt-5 pt-4 border-t border-[#DDDDDD] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {FLEX_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFlexRange(chip)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                        flexRange === chip
                          ? "border-[#222222] border-2 text-[#222222] font-semibold"
                          : "border-[#DDDDDD] text-[#222222] hover:border-[#222222]"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {(checkIn || checkOut) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckIn("");
                      setCheckOut("");
                      setFilters({ check_in: "", check_out: "" });
                    }}
                    className="text-xs font-semibold underline text-[#222222] cursor-pointer"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>
          )}

          {/* POPOVER 3: Guest Counter ("Who") */}
          {openPopover === "who" && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-full max-w-[380px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 z-50">
              {[
                {
                  title: "Adults",
                  subtitle: "Ages 13 or above",
                  count: adults,
                  setCount: setAdults,
                },
                {
                  title: "Children",
                  subtitle: "Ages 2–12",
                  count: childrenCount,
                  setCount: setChildrenCount,
                },
                {
                  title: "Infants",
                  subtitle: "Under 2",
                  count: infants,
                  setCount: setInfants,
                },
              ].map((row, index) => (
                <div
                  key={row.title}
                  className={`flex items-center justify-between py-4 ${
                    index > 0 ? "border-t border-[#DDDDDD]" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-[#222222]">
                      {row.title}
                    </div>
                    <div className="text-xs text-[#6A6A6A]">{row.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={row.count === 0}
                      onClick={() => row.setCount((c) => Math.max(0, c - 1))}
                      aria-label={`Decrease ${row.title}`}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-[#222222] disabled:opacity-30 hover:border-[#222222] transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-[#222222]">
                      {row.count}
                    </span>
                    <button
                      type="button"
                      onClick={() => row.setCount((c) => c + 1)}
                      aria-label={`Increase ${row.title}`}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center text-[#222222] hover:border-[#222222] transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

