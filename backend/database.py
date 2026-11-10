import os
import sqlite3

# Always resolve airbnb.db inside the backend/ directory so the same database file
# is used whether commands are run from the project root or from inside backend/.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "airbnb.db")


def get_db_connection() -> sqlite3.Connection:
    """
    Create and return a SQLite database connection.
    - Uses sqlite3.Row so query results behave like dictionaries (row["column_name"]).
    - Enables PRAGMA foreign_keys so relational constraints and ON DELETE CASCADE work.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db() -> None:
    """
    Initialize all 5 relational tables in SQLite if they do not already exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table: stores both guests and hosts (and whether a host is a Superhost).
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            avatar_url TEXT,
            role TEXT NOT NULL,
            is_superhost INTEGER DEFAULT 0
        );
        """
    )

    # 2. Listings table: each property belongs to a host in users(id).
    #    images_json and amenities_json store JSON-serialized string arrays.
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            host_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            location TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            price_per_night REAL NOT NULL,
            cleaning_fee REAL NOT NULL DEFAULT 1500,
            service_fee REAL NOT NULL DEFAULT 1200,
            max_guests INTEGER NOT NULL,
            bedrooms INTEGER NOT NULL,
            beds INTEGER NOT NULL,
            baths REAL NOT NULL,
            images_json TEXT NOT NULL,
            amenities_json TEXT NOT NULL,
            rating_avg REAL DEFAULT 4.85,
            reviews_count INTEGER DEFAULT 0,
            is_guest_favorite INTEGER DEFAULT 1,
            FOREIGN KEY (host_id) REFERENCES users(id)
        );
        """
    )

    # 3. Bookings table: links a guest (users) to a property (listings).
    #    ON DELETE CASCADE automatically removes bookings if a listing is deleted.
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER NOT NULL,
            guest_id INTEGER NOT NULL,
            check_in TEXT NOT NULL,
            check_out TEXT NOT NULL,
            guests_count INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'confirmed',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
            FOREIGN KEY (guest_id) REFERENCES users(id)
        );
        """
    )

    # 4. Reviews table: stores guest ratings and comments for each listing.
    #    ON DELETE CASCADE automatically removes reviews if a listing is deleted.
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating REAL NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """
    )

    # 5. Wishlists table: tracks saved listings per user.
    #    UNIQUE(user_id, listing_id) prevents a user from wishlisting the same listing twice.
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS wishlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            listing_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
            UNIQUE(user_id, listing_id)
        );
        """
    )

    conn.commit()
    conn.close()

