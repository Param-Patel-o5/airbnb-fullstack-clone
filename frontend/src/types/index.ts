// Flat TypeScript interfaces matching the FastAPI + SQLite API responses.

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
  is_superhost: number;
}

export interface Listing {
  id: number;
  host_id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  images: string[];
  amenities: string[];
  rating_avg: number;
  reviews_count: number;
  is_guest_favorite: number;
  host_name?: string;
  host_avatar?: string;
  host_is_superhost?: number;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  avatar_url: string;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: string;
  created_at: string;
  title: string;
  location: string;
  images: string[];
  category?: string;
  listing_title?: string;
  guest_name?: string;
}

export interface SearchFilters {
  location: string;
  category: string;
  check_in: string;
  check_out: string;
  guests: number;
  min_price: string;
  max_price: string;
  amenity: string;
  property_type: string;
}

