# Database Schema

## Table: applications

| Column         | Type         | Constraints                        | Description                                 |
|----------------|--------------|------------------------------------|---------------------------------------------|
| application_id | SERIAL/INT   | PRIMARY KEY                        | Unique application identifier               |
| property_id    | INT          | NOT NULL, FK to properties         | Property being applied for                  |
| renter_id      | INT          | NOT NULL, FK to users              | Renter submitting the application           |
| owner_id       | INT          | NOT NULL, FK to users              | Owner of the property                       |
| status         | application_status (ENUM) | NOT NULL DEFAULT 'pending'         | 'pending', 'approved', 'rejected'           |
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
| reason         | TEXT         | NOT NULL                           | Reason for the report                       |
| description    | TEXT         | NULLABLE                           | Additional details provided by reporter     |
| status         | report_status (ENUM) | NOT NULL DEFAULT 'pending'         | 'pending', 'reviewed', 'resolved', etc.     |
| reviewed_by    | INT          | NULLABLE, FK to users (admin)      | Admin who reviewed/resolved the report      |
| date_created   | TIMESTAMP    | NOT NULL                           | Date/time report was created                |
| date_resolved  | TIMESTAMP    | NULLABLE                           | Date/time report was resolved               |

**Primary Key:** `report_id`  
**Foreign Keys:** `reported_by` → `users.user_id`, `reported_user` → `users.user_id`, `property_id` → `properties.property_id`, `reviewed_by` → `users.user_id`

---

## Table: properties

| Column        | Type         | Constraints                | Description                        |
|---------------|-------------|----------------------------|------------------------------------|
| property_id   | SERIAL/INT   | PRIMARY KEY                | Unique property identifier         |
| owner_id      | INT          | NOT NULL, FK to users      | Owner of the property              |
| title         | TEXT         | NOT NULL                   | Title/name of the property         |
| description   | TEXT         | NULLABLE                   | Description of the property        |
| category      | property_category (ENUM) | NOT NULL                   | 'rooms', 'apartments', 'bedspace'  |
| street        | TEXT         | NULLABLE                   | Street address                     |
| barangay      | TEXT         | NULLABLE                   | Barangay                           |
| city          | TEXT         | NULLABLE                   | City                               |
| coordinates   | TEXT         | NULLABLE                   | GPS coordinates (lat,long)         |
| image_url     | TEXT[]       | NULLABLE                   | Array of image URLs/paths          |
| rent          | NUMERIC      | NOT NULL                   | Monthly rent price                 |
| amenities     | TEXT[]       | NULLABLE                   | List of amenities                  |
| rating        | DOUBLE PRECISION | NULLABLE                | Average rating                     |
| max_renters   | INT          | NOT NULL                   | Maximum number of renters allowed  |
| is_available  | BOOLEAN      | NOT NULL                   | Availability status                |
| landmarks     | TEXT[]       | NULLABLE                   | List of nearby landmarks           |
| is_verified   | BOOLEAN      | NOT NULL DEFAULT FALSE     | Property is verified               |

**Primary Key:** `property_id`  
**Foreign Keys:** `owner_id` → `users.user_id`

---

## Table: reviews

| Column       | Type         | Constraints                | Description                        |
|--------------|-------------|----------------------------|------------------------------------|
| review_id    | SERIAL/INT   | PRIMARY KEY                | Unique review identifier           |
| user_id      | INT          | NOT NULL, FK to users      | Reviewer (must be renter)          |
| property_id  | INT          | NOT NULL, FK to properties | Reviewed property                  |
| rating       | INT          | NOT NULL                   | Rating (1-5)                       |
| comment      | TEXT         | NULLABLE                   | Review text/comment                |
| upvotes      | INT          | NOT NULL DEFAULT 0         | Number of upvotes                  |
| downvotes    | INT          | NOT NULL DEFAULT 0         | Number of downvotes                |
| date_created | TIMESTAMP    | NOT NULL                   | Date/time review was created       |

**Primary Key:** `review_id`  
**Foreign Keys:** `user_id` → `users.user_id`, `property_id` → `properties.property_id`

---