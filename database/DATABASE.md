# Database Schema

## Table: applications

| Column         | Type         | Constraints                        | Description                                 |
|----------------|--------------|------------------------------------|---------------------------------------------|
| application_id | SERIAL/INT   | PRIMARY KEY                        | Unique application identifier               |
| property_id    | INT          | NOT NULL, FK to properties         | Property being applied for                  |
| renter_id      | INT          | NOT NULL, FK to users              | Renter submitting the application           |
| owner_id       | INT          | NOT NULL, FK to users              | Owner of the property                       |
| status         | application_status (ENUM) | NOT NULL DEFAULT 'pending'         | 'pending', 'approved', 'rejected', 'cancelled', 'completed' |
| message        | TEXT         | NULLABLE                           | Message/notes for the application           |
| date_applied   | TIMESTAMP    | NOT NULL                           | Date/time application was submitted         |
| date_updated   | TIMESTAMP    | NULLABLE                           | Date/time application status was updated    |

**Primary Key:** `application_id`
**Foreign Keys:** `property_id` → `properties.property_id`, `renter_id` → `users.user_id`, `owner_id` → `users.user_id`

---

## Table: users

| Column             | Type         | Constraints                | Description                        |
|--------------------|-------------|----------------------------|------------------------------------|
| user_id            | SERIAL/INT   | PRIMARY KEY                | Unique user identifier             |
| auth_id            | UUID         | UNIQUE, NULLABLE           | Supabase Auth user UUID            |
| first_name         | TEXT         | NOT NULL                   | User's first name                  |
| last_name          | TEXT         | NOT NULL                   | User's last name                   |
| email              | TEXT         | NOT NULL, UNIQUE           | User's email address               |
| phone_number       | TEXT         | NOT NULL, UNIQUE           | User's phone number                |
| user_type          | user_type (ENUM) | NOT NULL                   | 'renter', 'owner', or 'admin'      |
| profile_picture    | TEXT         | NULLABLE                   | URL or path to profile image       |
| birth_date         | DATE         | NULLABLE                   | User's birth date                  |
| price_range        | TEXT         | NULLABLE                   | Preferred price range for rent     |
| room_preference    | TEXT         | NULLABLE                   | Preferred room type/category       |
| occupation         | TEXT         | NULLABLE                   | User's occupation                  |
| place_of_work_study| TEXT         | NULLABLE                   | Place of work or study             |
| rented_property    | INT          | NULLABLE, FK to properties | Property currently rented (if any) |
| is_warned          | BOOLEAN      | NOT NULL DEFAULT FALSE     | User is warned                     |
| is_banned          | BOOLEAN      | NOT NULL DEFAULT FALSE     | User is banned                     |
| is_verified        | BOOLEAN      | NOT NULL DEFAULT FALSE     | User is verified                   |
| account_created_date | DATE       | NULLABLE                   | Date when account was created      |
| last_login_date    | TIMESTAMP    | NULLABLE                   | Last login timestamp               |

**Primary Key:** `user_id`
**Foreign Keys:**
- `auth_id` → `auth.users.id`
- `rented_property` → `properties.property_id`

---

## Table: reports

| Column         | Type         | Constraints                        | Description                                 |
|----------------|--------------|------------------------------------|---------------------------------------------|
| report_id      | SERIAL/INT   | PRIMARY KEY                        | Unique report identifier                    |
| reported_by    | INT          | NOT NULL, FK to users              | User who submitted the report               |
| reported_user  | INT          | NULLABLE, FK to users              | User being reported (if applicable)         |
| property_id    | INT          | NULLABLE, FK to properties         | Property being reported (if applicable)     |
| report_title   | TEXT         | NOT NULL                           | Title/summary of the report                 |
| description    | TEXT         | NULLABLE                           | Additional details provided by reporter     |
| status         | report_status (ENUM) | NOT NULL DEFAULT 'pending'         | 'pending', 'under investigation', 'resolved', 'dismissed' |
| reviewed_by    | INT          | NULLABLE, FK to users (admin)      | Admin who reviewed/resolved the report      |
| date_created   | TIMESTAMP    | NOT NULL                           | Date/time report was created                |
| date_resolved  | TIMESTAMP    | NULLABLE                           | Date/time report was resolved               |
| proof          | TEXT[]       | NULLABLE                           | Array of proof URLs/paths (images, etc.)    |

**Primary Key:** `report_id`
**Foreign Keys:** `reported_by` → `users.user_id`, `reported_user` → `users.user_id`, `property_id` → `properties.property_id`, `reviewed_by` → `users.user_id`

---

## Table: properties

| Column         | Type                | Constraints                                   | Description                                 |
|--------------- |--------------------|-----------------------------------------------|---------------------------------------------|
| property_id    | SERIAL/INT         | PRIMARY KEY                                   | Unique property identifier                  |
| owner_id       | INT                | NOT NULL, FK to users                         | Owner of the property                       |
| title          | TEXT               | NOT NULL                                      | Title/name of the property                  |
| description    | TEXT               | NULLABLE                                      | Description of the property                 |
| category       | property_category (ENUM) | NOT NULL                                 | 'rooms', 'apartments', 'bedspace'          |
| street         | TEXT               | NULLABLE                                      | Street address                              |
| barangay       | TEXT               | NULLABLE                                      | Barangay                                    |
| city           | TEXT               | NULLABLE                                      | City                                        |
| coordinates    | TEXT               | NULLABLE                                      | GPS coordinates (lat,long)                  |
| image_url      | TEXT[]             | NULLABLE                                      | Array of image URLs/paths                   |
| rent           | NUMERIC            | NOT NULL                                      | Monthly rent price                          |
| amenities      | TEXT[]             | NULLABLE                                      | List of amenities                           |
| rating         | DOUBLE PRECISION   | NULLABLE                                      | Average rating                              |
| max_renters    | INT                | NOT NULL                                      | Maximum number of renters allowed           |
| is_available   | BOOLEAN            | NOT NULL                                      | Availability status                         |
| landmarks      | TEXT[]             | NULLABLE                                      | List of nearby landmarks                    |
| is_verified    | BOOLEAN            | NOT NULL DEFAULT FALSE                        | Property is verified                        |
| has_internet   | BOOLEAN            | NULLABLE                                      | Property provides internet                  |
| allows_pets    | BOOLEAN            | NULLABLE                                      | Property allows pets                        |
| is_furnished   | BOOLEAN            | NULLABLE                                      | Property is furnished                       |
| has_ac         | BOOLEAN            | NULLABLE                                      | Property has air conditioning               |
| is_secure      | BOOLEAN            | NULLABLE                                      | Property is gated/with cctv                 |
| has_parking    | BOOLEAN            | NULLABLE                                      | Property has parking                        |
| number_reviews | INT                | NULLABLE DEFAULT 0                            | Total number of reviews                     |

**Primary Key:** `property_id`
**Foreign Keys:**
- `owner_id` → `users.user_id` (ON UPDATE CASCADE, ON DELETE SET NULL)

---

## Table: reviews

| Column       | Type         | Constraints                | Description                        |
|--------------|-------------|----------------------------|------------------------------------|
| review_id    | SERIAL/INT   | PRIMARY KEY                | Unique review identifier           |
| user_id      | INT          | NOT NULL, FK to users      | Reviewer (must be renter)          |
| property_id  | INT          | NOT NULL, FK to properties | Reviewed property                  |
| rating       | INT          | NOT NULL                   | Rating (1-5)                       |
| comment      | TEXT         | NULLABLE                   | Review text/comment                |
| date_created | TIMESTAMP    | NOT NULL                   | Date/time review was created       |

**Primary Key:** `review_id`
**Foreign Keys:** `user_id` → `users.user_id`, `property_id` → `properties.property_id`

---

## Table: notifications

| Column       | Type                     | Constraints                  | Description                                  |
|--------------|--------------------------|------------------------------|----------------------------------------------|
| notif_id     | BIGINT                   | PRIMARY KEY, AUTO INCREMENT  | Unique notification identifier               |
| notif_type   | notification_type (ENUM) | NULLABLE                     | Type of notification (see notification_type) |
| user_auth_id | UUID                     | NULLABLE, FK to users        | User receiving the notification              |
| created_at   | TIMESTAMP WITH TIME ZONE | NOT NULL DEFAULT NOW()       | When the notification was created            |

**Primary Key:** `notif_id`
**Foreign Keys:** `user_auth_id` → `users.auth_id`

**Notification Types:**
- `rental_application_rejected` - Application was rejected by owner
- `rental_application_cancelled` - Application was cancelled
- `rental_application_accepted` - Application was approved by owner
- `rental_application_completed` - Rental period completed
- `user_account_warned` - User account received a warning
- `user_account_verified` - User account was verified
- `rental_ended` - Rental period ended
- `new_rental_application` - New application received (for owners)
- `property_verified` - Property was verified by admin
- `new_review` - New review posted on property (for owners)
- `new_property_submission` - New property submitted (for admins)
- `new_report` - New report submitted (for admins)
- `new_registration` - New user registered (for admins)
- `user_reported` - User was reported

---