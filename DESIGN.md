# AIRBNB 2026 DESIGN LANGUAGE SYSTEM (PIXEL-EXACT FROM SCREENSHOTS)

## 1. Brand Color Tokens & Surfaces
- **Rausch Coral / Reserve Gradient:** Primary CTA uses `bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466]` or solid `#FF385C` with white bold text and `rounded-full` (pill) or `rounded-xl`.
- **Ink Black:** `#222222` (Primary headings, underlined total prices `₹10,530`, active tabs).
- **Ash Gray:** `#6A6A6A` (Subtitles, `for 5 nights`, `1 bedroom · 1 king bed`, date ranges).
- **Hairline Gray:** `#DDDDDD` (`1px solid #DDDDDD` borders on cards, search pill, and section dividers).
- **Soft Cloud:** `#EBEBEB` / `#F7F7F7` (Inactive pill backgrounds, avatar circles, hover states).

## 2. Header & Search Bar (2 States)
- **Left:** Airbnb Bélo logo + `airbnb` wordmark in `#FF385C`.
- **Center Top Tabs (Home State):** Horizontal tab strip with 3D-style icon badges: `All` (globe), `Homes` (house), `Experiences` (hot air balloon), `Services` (bell). Active tab has a `2px solid #222222` bottom underline and bold `#222222` text.
- **Right Controls:** `Become a host` text link + circular gray Profile button (`w-10 h-10 rounded-full bg-[#F7F7F7]`) + circular Hamburger Menu button (`w-10 h-10 rounded-full bg-[#F7F7F7]`).
  - Clicking Hamburger opens a clean white rounded-2xl dropdown (`w-64 shadow-xl border border-[#DDDDDD]`) with: `Languages & currency`, `Help Centre`, `Become a host`, and our **Role Switcher ("Switch between Guest / Host")** + `My Trips` & `Wishlists`.
- **Expanded Search Pill (`max-w-[850px] mx-auto rounded-full border border-[#DDDDDD] shadow-md bg-white`):**
  - 3 sections separated by vertical hairlines:
    1. `Where` (`Search destinations`) -> Clicking opens a rounded-3xl white dropdown card (`Suggested destinations`: `Nearby`, `Hyderabad, Telangana`, `North Goa, Goa`, `Bengaluru, Karnataka`, `Mumbai, Maharashtra`) with soft pastel square icons.
    2. `When` (`Add dates`) -> Clicking opens a centered rounded-3xl modal card with a `Dates | Flexible` segmented pill at top, a 2-month side-by-side calendar (`November 2026` & `December 2026`), and bottom flexibility chips (`Exact dates`, `± 1 day`, `± 2 days`, `± 3 days`, `± 7 days`).
    3. `Who` (`Add guests`) + circular/pill `#FF385C` Search button on the right.

## 3. Home View vs. Search Split-Map View
- **Floating Fee Banner:** Centered or top-right white pill card (`rounded-xl shadow-md border border-[#EBEBEB] px-4 py-2.5 flex items-center gap-2`) with a pink price-tag icon and `"Prices include all fees"` in bold `#222222`.
- **Default Home View (`/`):**
  - Horizontal carousel sections with bold headers: `"Available in Kondapur this weekend ->"` and `"Guest favourite homes in North Goa ->"` (with subtitle `"Indian guests often rate these homes highly"` and `< >` circular scroll buttons on the right).
  - Compact Square/Rounded Cards (`rounded-2xl overflow-hidden`): Top-left `"Guest favourite"` white pill badge (`bg-white/90 text-[#222222] text-xs font-semibold px-3 py-1 rounded-full`), top-right translucent heart icon (`fill-black/50 stroke-white`), and below the image: Title (`Flat in Hyderabad`), and single metadata line `₹9,750 for 2 nights · ★ 5.0`.
- **Filtered / Search View (When filters or search are active):**
  - Sub-header pill row: `Filters` button (with slider icon) | `Wifi` | `Washing machine` | `Free parking` | `Kitchen` | `Air conditioning` | `Instant Book` | `1+ bathrooms`.
  - Split Screen Layout:
    - **Left (55% width):** `"Over 1,000 homes"` count + `"Prices include all fees"` tag + 2-column grid of detailed cards showing `"Guest favourite"` or `"Superhost"` badge, carousel dots at bottom of photo, Title + `★ 4.85 (102)`, subtitle, `1 bedroom · 1 king bed · 1 bathroom`, date range `10–15 Nov`, underlined total price `₹11,116 for 5 nights`, and a gray `"Free cancellation"` badge.
    - **Right (45% width, sticky):** Interactive/styled map container (`rounded-2xl overflow-hidden`) displaying clickable white pill price markers (`₹16,926`, `₹11,116`, `₹21,966`) that highlight or navigate to the corresponding listing, plus `+ / - / expand` map buttons on the right.
- **Filters Modal:**
  - Centered `rounded-3xl` dialog with header `"Filters"` and `X` button.
  - Section 1: `"Recommended for you"` — 4 large square icon cards (`Washing machine`, `Free parking`, `Kitchen`, `Instant Book`).
  - Section 2: `"Type of place"` — 3-segment pill toggle (`Any type` | `Room` | `Entire home`) where active option has a `2px solid #222222` border.
  - Section 3: `"Price"` — Min and Max price inputs.
  - Sticky Footer: `"Clear all"` link on left + dark `#222222` pill button `"Show X places"` on right.

## 4. Listing Detail Page (`/listings/[id]`)
- **Scroll-Triggered Sticky Sub-Nav:** Top bar with `Photos | Amenities | Reviews | Location` links on the left, and price `₹10,530 for 5 nights` + pink pill `Reserve` button on the right.
- **Header & 5-Photo Collage:** Title (`26px font-semibold`) + `Share` & `Save` links on top right. Below is a 5-photo grid (`rounded-2xl overflow-hidden grid grid-cols-4 grid-rows-2 gap-2 h-[420px]`) with a white button `"Show all photos"` (with 9-dot grid icon) in the bottom-right corner.
- **2-Column Body (`max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12`):**
  - **Left Column (`lg:col-span-2`):**
    1. Subtitle (`Entire rental unit in Hyderabad, India`) + `4 guests · 2 bedrooms · 3 beds · 1 bathroom`.
    2. **Guest Favourite Laurel Box:** Rounded-xl border box (`border border-[#DDDDDD] p-5 flex items-center justify-between`) with left/right laurel leaf icons around `"Guest favourite"`, middle text `"One of the most loved homes on Airbnb, according to guests"`, `5.0 ★★★★★` column, vertical divider, and `6 Reviews` column.
    3. **Host Row:** Initials avatar circle (`bg-[#E8F5E9] text-[#1B5E20] font-semibold`) + `"Hosted by Priya"` + `"2 years hosting"`.
    4. **3 Highlight Rows with Icons:** e.g., `Near Airport / Prime Location`, `Full kitchen and free parking`, `Praised for comfort and hosting`.
    5. **What this place offers (Amenities):** 2-column grid of icons + labels (`Kitchen`, `Wifi`, `Dedicated workspace`, `Free parking on premises`, `TV`, `Lift`, plus strikethrough `Carbon monoxide alarm` / `Smoke alarm` styling) and a `"Show all amenities"` button (`bg-[#F7F7F7] border border-[#222222]/10 rounded-xl px-6 py-3 font-semibold`).
  - **Right Column (Sticky Booking Card):**
    1. Top floating card: `"🏷️ Prices include all fees"` (`rounded-xl shadow-md border border-[#EBEBEB] p-3.5 mb-4 flex items-center justify-center gap-2 font-semibold text-sm`).
    2. Main Booking Card (`rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[#DDDDDD] p-6`):
       - Price Header: Underlined bold total `₹10,530` + `for 5 nights` (dynamically calculated from selected dates).
       - Joined Input Box (`border border-[#717171] rounded-xl overflow-hidden`): Top half split into `CHECK-IN` and `CHECKOUT` date inputs; bottom half is `GUESTS` dropdown (`1 guest`, `2 guests`, etc.).
       - Full-width Pill CTA: `Reserve` (`rounded-full py-3.5 bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white font-semibold text-base`).
       - Subtitle: `"You won't be charged yet"` + expandable price breakdown (`Nightly rate × nights + Cleaning fee + Service fee`).
       - Below card: `"🚩 Report this listing"` muted link.
- **Full-Width Bottom Sections:**
  - **Reviews Hero Header:** Giant `5.0` flanked by laurel wreaths, `"Guest favourite"` title, subtitle `"This home is a guest favourite based on ratings, reviews and reliability"`, and a 7-column category rating strip (`Overall rating` bar chart | `Cleanliness 5.0` | `Accuracy 5.0` | `Check-in 5.0` | `Communication 5.0` | `Location 5.0` | `Value 4.8` with bottom icons).
  - **2-Column Review Cards Grid:** Pastel circular letter avatars (`K`, `B`, `S`, `R`) or photo avatars, reviewer name, `"India"` or `"3 years on Airbnb"`, `★★★★★ · 4 days ago`, review comment, and underlined `Show more`.

  ## 5. Auth / Login Modal (`/login` or Popup Overlay)
- **Overlay Background:** Backdrop blur with blurred illustrated travel card background (Torres, Paris, Miami, Edinburgh, etc.)[cite: 16].
- **Modal Card (`w-[568px] bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] p-6 relative`):**
  - Top header: Centered red Airbnb Bélo logo + bold title `"Log in or sign up"`.
  - Form Body:
    - Input field: Rounded border box (`border border-[#717171] rounded-xl px-4 py-3.5 text-sm`) with placeholder `"Phone number or email"`.
    - Primary CTA: Full-width pink gradient button (`bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white font-semibold py-3.5 rounded-xl text-base`) with text `"Continue"`.
  - Divider: `"or"` text with horizontal hairlines on left and right.
  - Social Logins: Two side-by-side icon buttons (Google "G" icon and Apple logo icon) inside `rounded-xl border border-[#DDDDDD] py-3 flex items-center justify-center hover:bg-[#F7F7F7] transition`.