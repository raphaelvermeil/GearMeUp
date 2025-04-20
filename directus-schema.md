<!-- # Directus Schema for Outdoor Gear Rental App

## Collections

### users

- id (primary key)
- email (string, unique)
- password (string, hashed)
- first_name (string)
- last_name (string)
- phone (string)
- location (string)
- avatar (file)
- rating (float)
- created_at (datetime)
- updated_at (datetime)

### gear_listings

- id (primary key)
- user_id (foreign key to users)
- title (string)
- description (text)
- category (string) [hiking, camping, skiing, climbing, etc.]
- price_per_day (float)
- condition (string) [new, like_new, good, fair]
- location (string)
- latitude (float)
- longitude (float)
- availability_start (date)
- availability_end (date)
- status (string) [available, rented, maintenance]
- created_at (datetime)
- updated_at (datetime)

### gear_images

- id (primary key)
- gear_listing (foreign key to gear_listings)
- image (file)
- is_primary (boolean)
- created_at (datetime)

### rental_requests

- id (primary key)
- gear_listing (foreign key to gear_listings)
- renter_id (foreign key to users)
- owner_id (foreign key to users)
- start_date (date)
- end_date (date)
- status (string) [pending, approved, rejected, completed]
- created_at (datetime)
- updated_at (datetime)

### reviews

- id (primary key)
- rental_request_id (foreign key to rental_requests)
- reviewer_id (foreign key to users)
- reviewed_id (foreign key to users)
- rating (integer, 1-5)
- comment (text)
- created_at (datetime)

### messages

- id (primary key)
- sender_id (foreign key to users)
- receiver_id (foreign key to users)
- rental_request_id (foreign key to rental_requests)
- content (text)
- created_at (datetime)
- read_at (datetime) -->
