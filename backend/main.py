from datetime import date
import json
import sqlite3
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import get_db_connection, init_db
from models import (
    BookingCreate,
    ListingCreate,
    ListingUpdate,
    ReviewCreate,
    WishlistToggle,
)
from seed import seed_database

app = FastAPI(title="Airbnb Clone API")

# Allow the Next.js frontend (and local dev tools) to call this FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Ensure SQLite tables exist and initial seed data is loaded when the server boots."""
    init_db()
    seed_database()


def get_db():
    """
    FastAPI dependency that opens a per-request SQLite connection
    and guarantees it is closed after the request finishes.
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def format_listing(row: sqlite3.Row) -> dict:
    """
    Convert a sqlite3.Row from the listings table into a Python dict and
    parse images_json / amenities_json back into standard Python lists.
    """
    listing = dict(row)
    listing["images"] = json.loads(listing.pop("images_json", "[]"))
    listing["amenities"] = json.loads(listing.pop("amenities_json", "[]"))
    return listing


# ---------------------------------------------------------------------------
# 1. Users & Role Switching
# ---------------------------------------------------------------------------
@app.get("/api/users")
def get_users(conn: sqlite3.Connection = Depends(get_db)):
    """Return all seeded guest and host accounts for the navbar user switcher."""
    rows = conn.execute("SELECT * FROM users ORDER BY id ASC;").fetchall()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# 2. Listings & Multi-Criteria Search
# ---------------------------------------------------------------------------
@app.get("/api/listings")
def get_listings(
    location: Optional[str] = None,
    category: Optional[str] = None,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    amenity: Optional[str] = None,
    conn: sqlite3.Connection = Depends(get_db),
):
    """
    Fetch listings filtered dynamically by location/title, category, guest count,
    price range, amenity pill, and date availability using parameterized raw SQL.
    """
    # Start with WHERE 1=1 so optional AND clauses can be appended cleanly.
    query = "SELECT * FROM listings WHERE 1=1"
    params: list = []

    if location:
        # Match partial city/state/title text (case-insensitive for ASCII in SQLite LIKE).
        query += " AND (location LIKE ? OR title LIKE ?)"
        pattern = f"%{location}%"
        params.extend([pattern, pattern])

    if category:
        query += " AND category = ?"
        params.append(category)

    if guests is not None:
        query += " AND max_guests >= ?"
        params.append(guests)

    if min_price is not None:
        query += " AND price_per_night >= ?"
        params.append(min_price)

    if max_price is not None:
        query += " AND price_per_night <= ?"
        params.append(max_price)

    if amenity:
        query += " AND amenities_json LIKE ?"
        params.append(f"%{amenity}%")

    if check_in and check_out:
        # Allen's Interval Algebra for booking date overlap (check_out is exclusive):
        # A booking overlaps [new_check_in, new_check_out) iff:
        #   existing_check_in < new_check_out AND existing_check_out > new_check_in
        # Exclude any listing that has an overlapping confirmed booking.
        query += """
            AND id NOT IN (
                SELECT listing_id
                FROM bookings
                WHERE status = 'confirmed' AND check_in < ? AND check_out > ?
            )
        """
        params.extend([check_out, check_in])

    query += " ORDER BY id ASC;"

    rows = conn.execute(query, params).fetchall()
    return [format_listing(row) for row in rows]


@app.get("/api/listings/{listing_id}")
def get_listing_detail(listing_id: int, conn: sqlite3.Connection = Depends(get_db)):
    """
    Fetch a single listing joined with host details, all guest reviews,
    and confirmed booked date ranges so the frontend calendar can block them.
    """
    row = conn.execute(
        """
        SELECT l.*, u.name AS host_name, u.avatar_url AS host_avatar, u.is_superhost AS host_is_superhost
        FROM listings l
        JOIN users u ON l.host_id = u.id
        WHERE l.id = ?;
        """,
        (listing_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    reviews_rows = conn.execute(
        """
        SELECT r.*, u.name AS user_name, u.avatar_url
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.listing_id = ?
        ORDER BY r.id DESC;
        """,
        (listing_id,),
    ).fetchall()

    booked_rows = conn.execute(
        """
        SELECT check_in, check_out
        FROM bookings
        WHERE listing_id = ? AND status = 'confirmed'
        ORDER BY check_in ASC;
        """,
        (listing_id,),
    ).fetchall()

    return {
        "listing": format_listing(row),
        "reviews": [dict(review) for review in reviews_rows],
        "booked_dates": [dict(b) for b in booked_rows],
    }


# ---------------------------------------------------------------------------
# 3. End-to-End Booking Engine
# ---------------------------------------------------------------------------
@app.post("/api/bookings")
def create_booking(booking: BookingCreate, conn: sqlite3.Connection = Depends(get_db)):
    """
    Validate dates, guest capacity, and date-overlap conflicts, then calculate
    the itemized total price on the server and persist the booking.
    """
    # Step 1: Parse ISO dates and validate check_in < check_out.
    try:
        check_in_date = date.fromisoformat(booking.check_in)
        check_out_date = date.fromisoformat(booking.check_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Dates must be in YYYY-MM-DD format")

    nights = (check_out_date - check_in_date).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    # Step 2: Fetch listing pricing & capacity details.
    listing = conn.execute(
        "SELECT price_per_night, cleaning_fee, service_fee, max_guests FROM listings WHERE id = ?;",
        (booking.listing_id,),
    ).fetchone()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    if booking.guests_count < 1 or booking.guests_count > listing["max_guests"]:
        raise HTTPException(
            status_code=400,
            detail=f"Guest count must be between 1 and {listing['max_guests']}",
        )

    # Step 3: Check for overlapping confirmed bookings using Allen's Interval Algebra.
    # Overlap condition (exclusive check-out):
    #   existing_check_in < new_check_out AND existing_check_out > new_check_in
    conflict = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM bookings
        WHERE listing_id = ? AND status = 'confirmed' AND check_in < ? AND check_out > ?;
        """,
        (booking.listing_id, booking.check_out, booking.check_in),
    ).fetchone()

    if conflict["count"] > 0:
        raise HTTPException(
            status_code=400,
            detail="Selected dates are already booked for this property.",
        )

    # Step 4: Calculate total price on the server to prevent client-side price tampering.
    total_price = (
        (listing["price_per_night"] * nights)
        + listing["cleaning_fee"]
        + listing["service_fee"]
    )

    cursor = conn.execute(
        """
        INSERT INTO bookings (
            listing_id, guest_id, check_in, check_out, guests_count, total_price, status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed');
        """,
        (
            booking.listing_id,
            booking.guest_id,
            booking.check_in,
            booking.check_out,
            booking.guests_count,
            total_price,
        ),
    )
    conn.commit()

    created_row = conn.execute(
        "SELECT * FROM bookings WHERE id = ?;",
        (cursor.lastrowid,),
    ).fetchone()
    result = dict(created_row)
    result["nights"] = nights
    return result


@app.get("/api/bookings/my-trips")
def get_my_trips(guest_id: int = Query(...), conn: sqlite3.Connection = Depends(get_db)):
    """Return all bookings for a guest joined with listing title, location, category, and images."""
    rows = conn.execute(
        """
        SELECT b.*, l.title, l.location, l.category, l.images_json
        FROM bookings b
        JOIN listings l ON b.listing_id = l.id
        WHERE b.guest_id = ?
        ORDER BY b.check_in DESC;
        """,
        (guest_id,),
    ).fetchall()

    trips = []
    for row in rows:
        trip = dict(row)
        trip["images"] = json.loads(trip.pop("images_json", "[]"))
        trips.append(trip)
    return trips


@app.delete("/api/bookings/{booking_id}")
def delete_booking(booking_id: int, conn: sqlite3.Connection = Depends(get_db)):
    """Cancel/delete a booking by ID so previously blocked dates become available again."""
    cursor = conn.execute("DELETE FROM bookings WHERE id = ?;", (booking_id,))
    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {"message": "Booking cancelled", "id": booking_id}


# ---------------------------------------------------------------------------
# 4. Host CRUD & Dashboard
# ---------------------------------------------------------------------------
@app.get("/api/host/listings")
def get_host_listings(host_id: int = Query(...), conn: sqlite3.Connection = Depends(get_db)):
    """
    Return all listings owned by the host plus all incoming guest bookings
    for those properties.
    """
    listing_rows = conn.execute(
        "SELECT * FROM listings WHERE host_id = ? ORDER BY id DESC;",
        (host_id,),
    ).fetchall()

    booking_rows = conn.execute(
        """
        SELECT b.*, l.title AS listing_title, u.name AS guest_name
        FROM bookings b
        JOIN listings l ON b.listing_id = l.id
        JOIN users u ON b.guest_id = u.id
        WHERE l.host_id = ?
        ORDER BY b.created_at DESC;
        """,
        (host_id,),
    ).fetchall()

    return {
        "listings": [format_listing(row) for row in listing_rows],
        "bookings": [dict(row) for row in booking_rows],
    }


@app.post("/api/listings")
def create_listing(listing: ListingCreate, conn: sqlite3.Connection = Depends(get_db)):
    """Create a new property listing, storing images and amenities as JSON strings."""
    cursor = conn.execute(
        """
        INSERT INTO listings (
            host_id, title, location, category, description,
            price_per_night, cleaning_fee, service_fee,
            max_guests, bedrooms, beds, baths,
            images_json, amenities_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            listing.host_id,
            listing.title,
            listing.location,
            listing.category,
            listing.description,
            listing.price_per_night,
            listing.cleaning_fee,
            listing.service_fee,
            listing.max_guests,
            listing.bedrooms,
            listing.beds,
            listing.baths,
            json.dumps(listing.images),
            json.dumps(listing.amenities),
        ),
    )
    conn.commit()

    new_row = conn.execute(
        "SELECT * FROM listings WHERE id = ?;",
        (cursor.lastrowid,),
    ).fetchone()
    return format_listing(new_row)


@app.put("/api/listings/{listing_id}")
def update_listing(
    listing_id: int,
    listing: ListingUpdate,
    conn: sqlite3.Connection = Depends(get_db),
):
    """Update an existing property listing owned by the specified host."""
    if listing.host_id is None:
        raise HTTPException(status_code=400, detail="host_id is required to update a listing")

    existing = conn.execute(
        "SELECT * FROM listings WHERE id = ? AND host_id = ?;",
        (listing_id, listing.host_id),
    ).fetchone()

    if existing is None:
        raise HTTPException(status_code=404, detail="Listing not found or unauthorized")

    updates: list[str] = []
    params: list = []

    scalar_fields = [
        "title",
        "location",
        "category",
        "description",
        "price_per_night",
        "cleaning_fee",
        "service_fee",
        "max_guests",
        "bedrooms",
        "beds",
        "baths",
    ]
    for field in scalar_fields:
        value = getattr(listing, field)
        if value is not None:
            updates.append(f"{field} = ?")
            params.append(value)

    if listing.images is not None:
        updates.append("images_json = ?")
        params.append(json.dumps(listing.images))

    if listing.amenities is not None:
        updates.append("amenities_json = ?")
        params.append(json.dumps(listing.amenities))

    if not updates:
        return format_listing(existing)

    params.extend([listing_id, listing.host_id])
    query = f"UPDATE listings SET {', '.join(updates)} WHERE id = ? AND host_id = ?;"

    conn.execute(query, params)
    conn.commit()

    updated_row = conn.execute(
        "SELECT * FROM listings WHERE id = ?;",
        (listing_id,),
    ).fetchone()
    return format_listing(updated_row)


@app.delete("/api/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    host_id: int = Query(...),
    conn: sqlite3.Connection = Depends(get_db),
):
    """Delete a listing owned by the specified host."""
    cursor = conn.execute(
        "DELETE FROM listings WHERE id = ? AND host_id = ?;",
        (listing_id, host_id),
    )
    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Listing not found or unauthorized")

    return {"message": "Listing deleted", "id": listing_id}


# ---------------------------------------------------------------------------
# 5. Wishlists & Reviews
# ---------------------------------------------------------------------------
@app.get("/api/wishlists")
def get_wishlists(user_id: int = Query(...), conn: sqlite3.Connection = Depends(get_db)):
    """Return all wishlisted listing IDs and full formatted listing objects for a user."""
    rows = conn.execute(
        """
        SELECT l.*
        FROM wishlists w
        JOIN listings l ON w.listing_id = l.id
        WHERE w.user_id = ?
        ORDER BY w.id DESC;
        """,
        (user_id,),
    ).fetchall()

    listings = [format_listing(row) for row in rows]
    listing_ids = [item["id"] for item in listings]
    return {"listing_ids": listing_ids, "listings": listings}


@app.post("/api/wishlists/toggle")
def toggle_wishlist(payload: WishlistToggle, conn: sqlite3.Connection = Depends(get_db)):
    """Add or remove a listing from a user's wishlist and return the new state."""
    existing = conn.execute(
        "SELECT id FROM wishlists WHERE user_id = ? AND listing_id = ?;",
        (payload.user_id, payload.listing_id),
    ).fetchone()

    if existing is not None:
        conn.execute("DELETE FROM wishlists WHERE id = ?;", (existing["id"],))
        conn.commit()
        return {"wishlisted": False}

    # Verify listing exists before inserting to avoid a foreign-key IntegrityError.
    listing = conn.execute(
        "SELECT id FROM listings WHERE id = ?;",
        (payload.listing_id,),
    ).fetchone()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    conn.execute(
        "INSERT INTO wishlists (user_id, listing_id) VALUES (?, ?);",
        (payload.user_id, payload.listing_id),
    )
    conn.commit()
    return {"wishlisted": True}


@app.post("/api/reviews")
def create_review(review: ReviewCreate, conn: sqlite3.Connection = Depends(get_db)):
    """Insert a new guest review and recalculate rating_avg and reviews_count on the listing."""
    listing = conn.execute(
        "SELECT id FROM listings WHERE id = ?;",
        (review.listing_id,),
    ).fetchone()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    created_at = date.today().isoformat()
    cursor = conn.execute(
        """
        INSERT INTO reviews (listing_id, user_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?);
        """,
        (review.listing_id, review.user_id, review.rating, review.comment, created_at),
    )

    # Recalculate the listing's average rating and total review count from all reviews.
    stats = conn.execute(
        """
        SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS total_reviews
        FROM reviews
        WHERE listing_id = ?;
        """,
        (review.listing_id,),
    ).fetchone()

    conn.execute(
        "UPDATE listings SET rating_avg = ?, reviews_count = ? WHERE id = ?;",
        (stats["avg_rating"], stats["total_reviews"], review.listing_id),
    )
    conn.commit()

    created_review = conn.execute(
        """
        SELECT r.*, u.name AS user_name, u.avatar_url
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?;
        """,
        (cursor.lastrowid,),
    ).fetchone()
    return dict(created_review)
