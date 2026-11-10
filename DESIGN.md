# AIRBNB DESIGN LANGUAGE SYSTEM (DLS) SPECIFICATION

## 1. Brand Color Tokens
- **Rausch Coral (Primary Brand / CTA):** `#FF385C` (Hover/Active gradient stop: `#E00B41`)
- **Ink Black (Primary Text & Headings):** `#222222` (Used for 90% of text, prices, and active states)
- **Ash Gray (Secondary Text & Subtitles):** `#6A6A6A` (Used for distance, available dates, review counts, muted labels)
- **Hairline Gray (Borders & Dividers):** `#DDDDDD` (`1px solid #DDDDDD` separates navbars, cards, and sections)
- **Soft Cloud (Subtle Backgrounds):** `#F7F7F7` (Used for footers, input hover states, and secondary surfaces)
- **Canvas White:** `#FFFFFF` (Default background)

## 2. Typography & Hierarchy
- **Font Stack:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, sans-serif (clean geometric sans closely matching Airbnb Cereal).
- **Listing Title (Detail Page):** `26px`, `font-semibold` (`600`), `#222222`, tight tracking.
- **Section Heading:** `22px`, `font-semibold` (`600`), `#222222`.
- **Card Title / Price:** `15px`, `font-semibold` (`600`), `#222222`.
- **Card Subtitle / Metadata:** `15px`, `font-normal` (`400`), `#6A6A6A`.

## 3. Core Component Recipes
- **Header Search Pill:** Centered pill (`rounded-full`, `border: 1px solid #DDDDDD`, `shadow-sm hover:shadow-md transition`), divided into 3 clickable segments ("Anywhere" | "Any week" | "Add guests") + circular `#FF385C` search button (`32px x 32px`) with white magnifying glass.
- **Category Strip:** Sticky horizontal row below header with 24px gray icons + `12px` text label. Active category gets `text-[#222222]`, `font-semibold`, and a `2px solid #222222` bottom underline.
- **Listing Card (Explore Grid):**
  - Aspect ratio `20:19` or `square` (`aspect-square`), `rounded-xl` (`12px`), `overflow-hidden`, `relative`.
  - Top-right heart button (`Wishlist`): translucent dark fill with white 2px stroke (`fill-black/50 stroke-white`), turning `#FF385C` when wishlisted.
  - Optional top-left "Guest favourite" white pill badge (`bg-white/95 text-[#222222] text-xs font-semibold px-3 py-1 rounded-full shadow-sm`).
  - Below photo (no card border/shadow): Row 1 = Location (left, bold) + Star Rating `★ 4.92` (right). Row 2 = Property subtitle/host (gray). Row 3 = Price `₹X,XXX` bold + `night` regular.
- **Detail Page 5-Photo Collage:** `rounded-2xl overflow-hidden grid grid-cols-4 grid-rows-2 gap-2 h-[420px]`. First image spans `col-span-2 row-span-2`; next 4 images fill the 2x2 grid on the right.
- **Sticky Booking Card:** Right column (`sticky top-28`), `border border-[#DDDDDD] rounded-xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]`. Joined date/guest table with `1px solid #B0B0B0` rounded-lg border, full-width `#FF385C` "Reserve" button (`rounded-lg py-3.5 text-white font-semibold`), and itemized price calculation (`Nightly Rate × Nights + Cleaning Fee + Service Fee = Total`).