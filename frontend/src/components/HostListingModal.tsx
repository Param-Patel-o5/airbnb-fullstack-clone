"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { API_BASE_URL, useApp } from "@/context/AppContext";
import { Listing } from "@/types";

const CATEGORIES = [
  "Beachfront",
  "Cabins",
  "Amazing pools",
  "Farms",
  "Mountain views",
  "Luxury",
  "Historical homes",
  "Lakefront",
];

const AMENITY_OPTIONS = [
  "Wifi",
  "Kitchen",
  "Free parking",
  "Air conditioning",
  "Pool",
  "Washing machine",
  "Dedicated workspace",
  "TV",
  "Lift",
  "Mountain view",
  "Beach access",
];

const VERIFIED_VILLA_PHOTOS = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
];

interface HostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: number;
  editingListing: Listing | null;
  onSaved: (saved: Listing, mode: "create" | "edit") => void;
}

export default function HostListingModal({
  isOpen,
  onClose,
  hostId,
  editingListing,
  onSaved,
}: HostListingModalProps) {
  const { showToast } = useApp();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Beachfront");
  const [pricePerNight, setPricePerNight] = useState("8500");
  const [cleaningFee, setCleaningFee] = useState("1500");
  const [serviceFee, setServiceFee] = useState("1200");
  const [maxGuests, setMaxGuests] = useState("4");
  const [bedrooms, setBedrooms] = useState("2");
  const [beds, setBeds] = useState("2");
  const [baths, setBaths] = useState("2");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>(["Wifi", "Kitchen"]);
  const [images, setImages] = useState<string[]>(["", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (editingListing) {
      setTitle(editingListing.title);
      setLocation(editingListing.location);
      setCategory(editingListing.category);
      setPricePerNight(String(editingListing.price_per_night));
      setCleaningFee(String(editingListing.cleaning_fee));
      setServiceFee(String(editingListing.service_fee));
      setMaxGuests(String(editingListing.max_guests));
      setBedrooms(String(editingListing.bedrooms));
      setBeds(String(editingListing.beds));
      setBaths(String(editingListing.baths));
      setDescription(editingListing.description);
      setAmenities(editingListing.amenities || []);
      const paddedImages = [...(editingListing.images || [])];
      while (paddedImages.length < 5) paddedImages.push("");
      setImages(paddedImages.slice(0, 5));
    } else {
      setTitle("");
      setLocation("");
      setCategory("Beachfront");
      setPricePerNight("8500");
      setCleaningFee("1500");
      setServiceFee("1200");
      setMaxGuests("4");
      setBedrooms("2");
      setBeds("2");
      setBaths("2");
      setDescription("");
      setAmenities(["Wifi", "Kitchen", "Free parking"]);
      setImages(["", "", "", "", ""]);
    }
  }, [isOpen, editingListing]);

  if (!isOpen) return null;

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)));
  };

  const handleAutofillPhotos = () => {
    setImages(VERIFIED_VILLA_PHOTOS);
    showToast("Filled 5 verified high-res villa photos");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanedImages = images.map((u) => u.trim()).filter(Boolean);
    const finalImages =
      cleanedImages.length > 0 ? cleanedImages : VERIFIED_VILLA_PHOTOS;

    if (!title.trim() || !location.trim() || !description.trim()) {
      setErrorMsg("Please fill in title, location, and description.");
      return;
    }

    const payload = {
      host_id: hostId,
      title: title.trim(),
      location: location.trim(),
      category,
      description: description.trim(),
      price_per_night: Number(pricePerNight) || 5000,
      cleaning_fee: Number(cleaningFee) || 0,
      service_fee: Number(serviceFee) || 0,
      max_guests: Number(maxGuests) || 2,
      bedrooms: Number(bedrooms) || 1,
      beds: Number(beds) || 1,
      baths: Number(baths) || 1,
      images: finalImages,
      amenities,
    };

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingListing);
      const url = isEdit
        ? `${API_BASE_URL}/api/listings/${editingListing!.id}`
        : `${API_BASE_URL}/api/listings`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Could not save listing.");
        return;
      }

      onSaved(data, isEdit ? "edit" : "create");
      showToast(isEdit ? "Listing updated!" : "New listing published!");
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Network error while saving."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[700px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#222222] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-base font-semibold text-[#222222]">
            {editingListing ? "Edit Listing" : "Create New Listing"}
          </h2>
          <div className="w-8" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Listing Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sunset Infinity Pool Villa"
                className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., North Goa, Goa"
                className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#222222]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Price / Night (₹)
              </label>
              <input
                type="number"
                min={500}
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Cleaning Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Service Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3 py-2 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Max Guests
              </label>
              <input
                type="number"
                min={1}
                required
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3 py-2 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min={1}
                required
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3 py-2 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Beds
              </label>
              <input
                type="number"
                min={1}
                required
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3 py-2 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1">
                Baths
              </label>
              <input
                type="number"
                step="0.5"
                min={1}
                required
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                className="w-full rounded-xl border border-[#DDDDDD] px-3 py-2 text-sm focus:outline-none focus:border-[#222222]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#222222] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architecture, neighborhood vibe, and special touches..."
              className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#222222]"
            />
          </div>

          {/* Amenities Multi-Select Pills */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((item) => {
                const selected = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer ${
                      selected
                        ? "border-2 border-[#222222] bg-[#F7F7F7] text-[#222222] font-semibold"
                        : "border-[#DDDDDD] text-[#6A6A6A] hover:border-[#222222]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 Photo URL Inputs + Auto-fill Helper */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-[#222222]">
                Property Photos (5 high-res URLs)
              </label>
              <button
                type="button"
                onClick={handleAutofillPhotos}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-[#FF385C] text-xs font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-fill 5 Verified Luxury Villa Photos
              </button>
            </div>
            <div className="space-y-2">
              {images.map((url, idx) => (
                <input
                  key={idx}
                  type="url"
                  value={url}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder={`Photo URL ${idx + 1} (https://images.unsplash.com/...)`}
                  className="w-full rounded-xl border border-[#DDDDDD] px-3.5 py-2 text-xs text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#DDDDDD] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#DDDDDD] text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? "Saving..."
                : editingListing
                ? "Save Changes"
                : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

