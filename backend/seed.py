import json
from database import get_db_connection, init_db


def seed_database() -> None:
    """
    Populate the SQLite database with initial users, listings, bookings, and reviews
    only if the listings table is currently empty (idempotent seed).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check whether listings already exist so running seed_database() twice never duplicates data.
    cursor.execute("SELECT COUNT(*) AS total FROM listings;")
    existing_count = cursor.fetchone()["total"]
    if existing_count > 0:
        print(f"Database already seeded ({existing_count} listings found). Skipping seed.")
        conn.close()
        return

    # 1. Seed 4 Users (2 guests, 2 hosts who are also Superhosts).
    users_data = [
        (
            "Aarav Sharma",
            "aarav.sharma@example.com",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
            "guest",
            0,
        ),
        (
            "Priya Nair",
            "priya.nair@example.com",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
            "host",
            1,
        ),
        (
            "Vikramaditya Rao",
            "vikramaditya.rao@example.com",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
            "host",
            1,
        ),
        (
            "Meera Kapoor",
            "meera.kapoor@example.com",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
            "guest",
            0,
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO users (name, email, avatar_url, role, is_superhost)
        VALUES (?, ?, ?, ?, ?);
        """,
        users_data,
    )

    # Fetch inserted user IDs by email so foreign key references remain explicit and safe.
    cursor.execute("SELECT id, email FROM users;")
    user_id_by_email = {row["email"]: row["id"] for row in cursor.fetchall()}

    aarav_id = user_id_by_email["aarav.sharma@example.com"]
    priya_id = user_id_by_email["priya.nair@example.com"]
    vikram_id = user_id_by_email["vikramaditya.rao@example.com"]
    meera_id = user_id_by_email["meera.kapoor@example.com"]

    # 2. Seed 12 Listings across all 8 UI categories, each with 5 distinct high-res Unsplash URLs.
    listings_data = [
        {
            "host_id": priya_id,
            "title": "Sunlit Portuguese Beachfront Villa",
            "location": "Morjim, Goa, India",
            "category": "Beachfront",
            "description": (
                "Wake up to the sound of Arabian Sea waves in this restored Indo-Portuguese "
                "beachfront villa. Features an airy sea-facing veranda, sunlit bedrooms, and "
                "private footpath access straight onto Morjim Beach."
            ),
            "price_per_night": 14500.0,
            "cleaning_fee": 1800.0,
            "service_fee": 1500.0,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 4,
            "baths": 3.0,
            "images": [
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Beach access", "Wifi", "Kitchen", "Air conditioning", "Free parking"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": vikram_id,
            "title": "Cliffside Glass Villa & Infinity Pool",
            "location": "Lonavala, Maharashtra, India",
            "category": "Amazing pools",
            "description": (
                "Perched above the Sahyadri valley, this minimalist architectural villa offers "
                "a heated infinity pool overlooking misty cliffs, floor-to-ceiling glass walls, "
                "and a chef-ready open kitchen."
            ),
            "price_per_night": 18900.0,
            "cleaning_fee": 2200.0,
            "service_fee": 1800.0,
            "max_guests": 8,
            "bedrooms": 4,
            "beds": 5,
            "baths": 4.0,
            "images": [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Pool", "Wifi", "Kitchen", "Free parking", "Air conditioning", "Mountain view"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": priya_id,
            "title": "Deodar Pine A-Frame Mountain Cabin",
            "location": "Old Manali, Himachal Pradesh, India",
            "category": "Cabins",
            "description": (
                "Tucked inside a quiet cedar grove above Old Manali, this handcrafted timber "
                "cabin features a wood-burning hearth, heated oak floors, and a wraparound deck "
                "facing snow-dusted Himalayan peaks."
            ),
            "price_per_night": 7800.0,
            "cleaning_fee": 1200.0,
            "service_fee": 950.0,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 2.0,
            "images": [
                "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Mountain view", "Wifi", "Kitchen", "Dedicated workspace", "Free parking"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": vikram_id,
            "title": "Royal Sandstone Heritage Haveli",
            "location": "Jaipur, Rajasthan, India",
            "category": "Historical homes",
            "description": (
                "Stay inside a lovingly conserved 19th-century courtyard haveli with carved "
                "jharokha arches, hand-painted frescoes, marble plunge courtyard, and rooftop "
                "sunset dining overlooking Amber hills."
            ),
            "price_per_night": 16200.0,
            "cleaning_fee": 2000.0,
            "service_fee": 1600.0,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 3,
            "baths": 3.5,
            "images": [
                "https://images.unsplash.com/photo-1683442136394-178787ba79d4?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1660991473393-3612a4e49127?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Wifi", "Air conditioning", "Pool", "Kitchen", "Dedicated workspace"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": priya_id,
            "title": "Emerald Lakefront Boathouse & Dock",
            "location": "Bhimtal, Uttarakhand, India",
            "category": "Lakefront",
            "description": (
                "Set directly on the calm waters of Bhimtal Lake with a private timber jetty "
                "and two kayaks included. Enjoy morning mist over the water from the glass-walled "
                "reading lounge."
            ),
            "price_per_night": 9600.0,
            "cleaning_fee": 1400.0,
            "service_fee": 1100.0,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 2.0,
            "images": [
                "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Wifi", "Kitchen", "Free parking", "Mountain view", "Dedicated workspace"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": vikram_id,
            "title": "Organic Coffee Estate Farmhouse",
            "location": "Madikeri, Coorg, India",
            "category": "Farms",
            "description": (
                "Surrounded by 18 acres of shade-grown arabica coffee and cardamom trails, "
                "this heritage planter's farmhouse offers farm-to-table breakfasts, veranda "
                "hammocks, and starlit bonfire evenings."
            ),
            "price_per_night": 6900.0,
            "cleaning_fee": 1000.0,
            "service_fee": 850.0,
            "max_guests": 5,
            "bedrooms": 2,
            "beds": 3,
            "baths": 2.0,
            "images": [
                "https://images.unsplash.com/photo-1602088113235-229c19758e9f?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Wifi", "Kitchen", "Free parking", "Dedicated workspace"],
            "is_guest_favorite": 0,
        },
        {
            "host_id": priya_id,
            "title": "Cloudline Tea Ridge Glass Chalet",
            "location": "Munnar, Kerala, India",
            "category": "Mountain views",
            "description": (
                "Floating above rolling emerald tea plantations at 5,800 feet, this serene "
                "glass-and-stone retreat features panoramic ridge views, heated blankets, and "
                "a private deck for sunrise chai."
            ),
            "price_per_night": 8400.0,
            "cleaning_fee": 1200.0,
            "service_fee": 1000.0,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 2.0,
            "images": [
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Mountain view", "Wifi", "Kitchen", "Free parking", "Dedicated workspace"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": vikram_id,
            "title": "The White Pavilion Ultra-Luxury Estate",
            "location": "Alibaug, Maharashtra, India",
            "category": "Luxury",
            "description": (
                "Designed by an award-winning Mumbai studio, The White Pavilion spans 6,500 sq ft "
                "with a sunken courtyard lounge, private 50-foot lap pool, outdoor rain showers, "
                "and dedicated butler pantry."
            ),
            "price_per_night": 28500.0,
            "cleaning_fee": 3500.0,
            "service_fee": 2800.0,
            "max_guests": 10,
            "bedrooms": 5,
            "beds": 6,
            "baths": 5.5,
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Pool", "Wifi", "Kitchen", "Air conditioning", "Free parking", "Dedicated workspace"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": priya_id,
            "title": "Coromandel Driftwood Ocean Cottage",
            "location": "Auroville Coast, Pondicherry, India",
            "category": "Beachfront",
            "description": (
                "A breezy coastal cottage steps from Serenity Beach with lime-plastered walls, "
                "handmade cane furniture, outdoor sand-wash shower, and a shaded pergola for "
                "long afternoon reads."
            ),
            "price_per_night": 7200.0,
            "cleaning_fee": 1100.0,
            "service_fee": 900.0,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "baths": 1.5,
            "images": [
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1602391833977-358a52198938?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Beach access", "Wifi", "Kitchen", "Air conditioning", "Free parking"],
            "is_guest_favorite": 0,
        },
        {
            "host_id": vikram_id,
            "title": "Palm Grove Lagoon Courtyard Pool Villa",
            "location": "Assagao, Goa, India",
            "category": "Amazing pools",
            "description": (
                "Hidden behind flowering bougainvillea walls in Assagao, this tranquil 3-bedroom "
                "villa centers around a turquoise mosaic courtyard pool, poolside bar counter, "
                "and high-speed fiber workspace."
            ),
            "price_per_night": 13400.0,
            "cleaning_fee": 1600.0,
            "service_fee": 1400.0,
            "max_guests": 6,
            "bedrooms": 3,
            "beds": 3,
            "baths": 3.0,
            "images": [
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Pool", "Wifi", "Kitchen", "Air conditioning", "Dedicated workspace", "Free parking"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": priya_id,
            "title": "Canopy Cedar Treehouse Cabin",
            "location": "Jibhi, Himachal Pradesh, India",
            "category": "Cabins",
            "description": (
                "Elevated 20 feet among ancient Himalayan oaks beside a glacial stream, this "
                "boutique wooden treehouse cabin blends rustic warmth with crisp hotel linens "
                "and a stargazing skylight."
            ),
            "price_per_night": 5900.0,
            "cleaning_fee": 900.0,
            "service_fee": 750.0,
            "max_guests": 3,
            "bedrooms": 1,
            "beds": 2,
            "baths": 1.0,
            "images": [
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1618140052121-39fc6db33972?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Mountain view", "Wifi", "Free parking", "Dedicated workspace"],
            "is_guest_favorite": 1,
        },
        {
            "host_id": vikram_id,
            "title": "Dhauladhar Panorama Stone Villa",
            "location": "Dharamkot, Dharamshala, India",
            "category": "Mountain views",
            "description": (
                "Built from local slate and warm teakwood, this sunlit hillside sanctuary frames "
                "uninterrupted Dhauladhar snow peaks from every room, complete with a yoga terrace "
                "and fast remote-work Wi-Fi."
            ),
            "price_per_night": 9100.0,
            "cleaning_fee": 1300.0,
            "service_fee": 1050.0,
            "max_guests": 5,
            "bedrooms": 3,
            "beds": 3,
            "baths": 2.5,
            "images": [
                "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1533619239233-6280475a633a?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1000&q=80",
            ],
            "amenities": ["Mountain view", "Wifi", "Kitchen", "Dedicated workspace", "Free parking"],
            "is_guest_favorite": 0,
        },
    ]

    # Pre-built realistic guest reviews (2 per listing = 24 reviews total).
    # Keeping review pairs right alongside each listing lets us compute exact rating_avg.
    review_templates = [
        (
            (5.0, "Waking up to the ocean breeze right on the veranda was unforgettable. Spotless rooms and super responsive host!"),
            (4.9, "Exact match to the photos. Private path to the beach made early morning walks effortless."),
        ),
        (
            (5.0, "The infinity pool overlooking the valley mist feels like a private resort. Kitchen had everything we needed."),
            (4.9, "Immaculate glass architecture and smooth check-in. Our group of 6 had plenty of space."),
        ),
        (
            (4.9, "Coziest cabin stay in Manali. The fireplace kept us warm all evening and the cedar views are unreal."),
            (4.8, "Fast Wi-Fi for remote work during the day and quiet pine forest trails right outside."),
        ),
        (
            (5.0, "Staying in a genuine heritage haveli with modern air conditioning and marble baths was magical."),
            (4.9, "Rooftop sunsets with tea were the highlight of our Jaipur trip. Vikramaditya's recommendations were gold."),
        ),
        (
            (4.9, "Kayaking straight from our own wooden dock at sunrise was pure bliss. Calm, clean, and thoughtfully stocked."),
            (4.8, "Quiet lakefront escape away from crowded hill stations. The glass lounge is gorgeous."),
        ),
        (
            (4.8, "Smells like fresh rain and coffee blossoms! Morning walks around the estate were so peaceful."),
            (4.7, "Warm hospitality and incredible local breakfasts. Great place to disconnect for a long weekend."),
        ),
        (
            (5.0, "Floating above the tea hills when clouds roll into the balcony is surreal. Spotless and cozy."),
            (4.9, "Priya arranged an early check-in and guided us to hidden viewpoints nearby."),
        ),
        (
            (5.0, "Jaw-dropping architecture and a true 50-foot lap pool. Worth every rupee for a milestone family celebration."),
            (5.0, "Every bathroom, bedroom, and lounge space looks straight out of an architecture magazine."),
        ),
        (
            (4.8, "Bright, breezy, and just a two-minute stroll to the waves. Loved the cane furniture and shaded pergola."),
            (4.7, "Very relaxing stay near Auroville. Clean linens and great natural light all day."),
        ),
        (
            (5.0, "The courtyard pool lit up at night is gorgeous. Assagao cafes are five minutes away."),
            (4.9, "Super reliable fiber internet and comfortable ergonomic seating alongside vacation vibes."),
        ),
        (
            (4.9, "Sleeping among oak trees with the sound of the river below felt like a childhood dream come true."),
            (4.9, "Surprisingly warm and cozy inside with an incredible skylight for stargazing."),
        ),
        (
            (4.8, "Unmatched snow-peak views from the terrace. Ideal blend of stone heritage charm and modern comfort."),
            (4.7, "Peaceful neighborhood above Dharamkot with great cafes nearby and super clean rooms."),
        ),
    ]

    inserted_listing_ids = []
    reviews_to_insert = []

    for index, item in enumerate(listings_data):
        rev_pair = review_templates[index]
        avg_rating = round((rev_pair[0][0] + rev_pair[1][0]) / 2, 2)

        cursor.execute(
            """
            INSERT INTO listings (
                host_id, title, location, category, description,
                price_per_night, cleaning_fee, service_fee,
                max_guests, bedrooms, beds, baths,
                images_json, amenities_json,
                rating_avg, reviews_count, is_guest_favorite
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                item["host_id"],
                item["title"],
                item["location"],
                item["category"],
                item["description"],
                item["price_per_night"],
                item["cleaning_fee"],
                item["service_fee"],
                item["max_guests"],
                item["bedrooms"],
                item["beds"],
                item["baths"],
                json.dumps(item["images"]),
                json.dumps(item["amenities"]),
                avg_rating,
                2,
                item["is_guest_favorite"],
            ),
        )
        listing_id = cursor.lastrowid
        inserted_listing_ids.append((listing_id, item))

        # Queue 2 reviews for this listing (one by Aarav, one by Meera).
        reviews_to_insert.append(
            (listing_id, aarav_id, rev_pair[0][0], rev_pair[0][1], "2026-09-14")
        )
        reviews_to_insert.append(
            (listing_id, meera_id, rev_pair[1][0], rev_pair[1][1], "2026-10-08")
        )

    # 3. Seed 24 Reviews (2 per listing).
    cursor.executemany(
        """
        INSERT INTO reviews (listing_id, user_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?);
        """,
        reviews_to_insert,
    )

    # 4. Seed 3 Sample Bookings so My Trips, Host Dashboard, and date-blocking work immediately.
    #    Total price = (price_per_night * nights) + cleaning_fee + service_fee.
    sample_bookings = [
        # Booking 1: Aarav books Listing 1 (Goa Beachfront Villa) for 4 nights (Dec 15 - Dec 19, 2026)
        (
            inserted_listing_ids[0][0],
            aarav_id,
            "2026-12-15",
            "2026-12-19",
            3,
            (inserted_listing_ids[0][1]["price_per_night"] * 4)
            + inserted_listing_ids[0][1]["cleaning_fee"]
            + inserted_listing_ids[0][1]["service_fee"],
            "confirmed",
        ),
        # Booking 2: Aarav books Listing 3 (Manali Mountain Cabin) for 3 nights (Jan 10 - Jan 13, 2027)
        (
            inserted_listing_ids[2][0],
            aarav_id,
            "2027-01-10",
            "2027-01-13",
            2,
            (inserted_listing_ids[2][1]["price_per_night"] * 3)
            + inserted_listing_ids[2][1]["cleaning_fee"]
            + inserted_listing_ids[2][1]["service_fee"],
            "confirmed",
        ),
        # Booking 3: Meera books Listing 2 (Lonavala Glass Villa) for 2 nights (Dec 24 - Dec 26, 2026)
        (
            inserted_listing_ids[1][0],
            meera_id,
            "2026-12-24",
            "2026-12-26",
            4,
            (inserted_listing_ids[1][1]["price_per_night"] * 2)
            + inserted_listing_ids[1][1]["cleaning_fee"]
            + inserted_listing_ids[1][1]["service_fee"],
            "confirmed",
        ),
    ]

    cursor.executemany(
        """
        INSERT INTO bookings (listing_id, guest_id, check_in, check_out, guests_count, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        sample_bookings,
    )

    conn.commit()

    # Print verification counts for terminal confirmation.
    counts = {}
    for table in ("users", "listings", "bookings", "reviews", "wishlists"):
        cursor.execute(f"SELECT COUNT(*) AS total FROM {table};")
        counts[table] = cursor.fetchone()["total"]

    conn.close()
    print(
        "Seeded database successfully -> "
        f"users: {counts['users']}, "
        f"listings: {counts['listings']}, "
        f"bookings: {counts['bookings']}, "
        f"reviews: {counts['reviews']}, "
        f"wishlists: {counts['wishlists']}"
    )


if __name__ == "__main__":
    init_db()
    seed_database()

