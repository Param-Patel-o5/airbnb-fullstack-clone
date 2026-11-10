"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { SearchFilters, User } from "@/types";

export const API_BASE_URL = "http://localhost:8000";

export const DEFAULT_FILTERS: SearchFilters = {
  location: "",
  category: "",
  check_in: "",
  check_out: "",
  guests: 0,
  min_price: "",
  max_price: "",
  amenity: "",
  property_type: "Any type",
};

interface AppContextValue {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUserById: (userId: number) => void;
  wishlistIds: number[];
  toggleWishlist: (listingId: number) => Promise<void>;
  toast: string | null;
  showToast: (msg: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isFilterModalOpen: boolean;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  activeFilters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  isMapView: boolean;
  setIsMapView: (value: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isMapView, setIsMapView] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load all seeded users on mount and default to User #1 (Aarav Sharma, guest).
  useEffect(() => {
    let active = true;
    async function loadUsers() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`);
        if (!res.ok) return;
        const data: User[] = await res.json();
        if (active && data.length > 0) {
          setUsers(data);
          setCurrentUser((prev) => prev ?? data[0]);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }
    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  // Load wishlist IDs whenever the active user changes.
  useEffect(() => {
    if (!currentUser) {
      setWishlistIds([]);
      return;
    }
    let active = true;
    async function loadWishlist() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/wishlists?user_id=${currentUser!.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.listing_ids)) {
          setWishlistIds(data.listing_ids);
        }
      } catch (err) {
        console.error("Failed to load wishlists:", err);
      }
    }
    loadWishlist();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const switchUserById = (userId: number) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast(
        found.role === "host"
          ? `Switched to Host: ${found.name}`
          : `Switched to Guest: ${found.name}`
      );
    }
  };

  const toggleWishlist = async (listingId: number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlists/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          listing_id: listingId,
        }),
      });
      if (!res.ok) {
        showToast("Could not update wishlist");
        return;
      }
      const data = await res.json();
      if (data.wishlisted) {
        setWishlistIds((prev) => (prev.includes(listingId) ? prev : [...prev, listingId]));
        showToast("Saved to wishlist");
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== listingId));
        showToast("Removed from wishlist");
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      showToast("Failed to update wishlist");
    }
  };

  const setFilters = (filters: Partial<SearchFilters>) => {
    setActiveFilters((prev) => ({ ...prev, ...filters }));
  };

  const resetFilters = () => {
    setActiveFilters(DEFAULT_FILTERS);
    setIsMapView(false);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        switchUserById,
        wishlistIds,
        toggleWishlist,
        toast,
        showToast,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isFilterModalOpen,
        openFilterModal: () => setIsFilterModalOpen(true),
        closeFilterModal: () => setIsFilterModalOpen(false),
        activeFilters,
        setFilters,
        resetFilters,
        isMapView,
        setIsMapView,
      }}
    >
      {children}
      {/* Global toast notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#222222] text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl border border-white/10"
        >
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}

