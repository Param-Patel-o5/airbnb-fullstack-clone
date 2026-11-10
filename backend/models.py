from typing import Optional
from pydantic import BaseModel


class ListingCreate(BaseModel):
    """Request body schema for creating a new property listing."""

    title: str
    location: str
    category: str
    description: str
    price_per_night: float
    cleaning_fee: float = 1500
    service_fee: float = 1200
    max_guests: int
    bedrooms: int
    beds: int
    baths: float
    images: list[str]
    amenities: list[str]
    host_id: int


class ListingUpdate(BaseModel):
    """Request body schema for updating an existing property listing."""

    title: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    images: Optional[list[str]] = None
    amenities: Optional[list[str]] = None
    host_id: Optional[int] = None


class BookingCreate(BaseModel):
    """Request body schema for creating a reservation."""

    listing_id: int
    guest_id: int
    check_in: str
    check_out: str
    guests_count: int


class WishlistToggle(BaseModel):
    """Request body schema for adding or removing a listing from a user's wishlist."""

    user_id: int
    listing_id: int


class ReviewCreate(BaseModel):
    """Request body schema for submitting a guest review."""

    listing_id: int
    user_id: int
    rating: float
    comment: str

