import csv
import random
from datetime import datetime

# Read the source data
input_file = r'C:\Users\HP\Desktop\roomsync-app\database\room_rental_data_template_with_links.csv'
properties_output = r'C:\Users\HP\Desktop\roomsync-app\database\properties_import.csv'
owners_output = r'C:\Users\HP\Desktop\roomsync-app\database\owners_import.csv'

# Map property types to database categories
type_mapping = {
    'Boarding house': 'room',
    'Apartment': 'apartment',
    'Bed space': 'bedspace',
    'House for Rent': 'apartment',  # Treating houses as apartments
}

# Parse boolean fields
def parse_bool(value):
    if value in ['Yes', 'yes', 'Y', 'y']:
        return 'true'
    elif value in ['No', 'no', 'N', 'n']:
        return 'false'
    else:
        return 'NULL'

# Clean rent values (remove commas, handle ranges by taking lower value)
def clean_rent(rent_str):
    if not rent_str or rent_str == 'N/A':
        return '0'
    # Remove commas
    rent_str = rent_str.replace(',', '')
    # If it's a range like "9,000-10,000", take the lower value
    if '-' in rent_str:
        return rent_str.split('-')[0].strip()
    return rent_str

# Generate unique owners
owners = {}
owner_id_counter = 1

properties = []

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    for row in reader:
        # Skip empty rows
        if not row['Name of Unit'] or not row['Name of Unit'].strip():
            continue

        # Create a unique owner key based on coordinates (assume same location = same owner)
        coords = row['Coordinates'].strip()
        if coords not in owners:
            # Generate owner data
            owner_first_names = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Sofia',
                               'Ricardo', 'Carmen', 'Antonio', 'Isabel', 'Fernando', 'Teresa', 'Luis', 'Patricia']
            owner_last_names = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez',
                              'Gonzales', 'Hernandez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Rivera', 'Gomez']

            first_name = random.choice(owner_first_names)
            last_name = random.choice(owner_last_names)
            email = f"{first_name.lower()}.{last_name.lower()}{owner_id_counter}@example.com"
            phone = f"09{random.randint(100000000, 999999999)}"

            owners[coords] = {
                'owner_id': owner_id_counter,
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'phone_number': phone,
                'user_type': 'owner',
                'is_verified': 'true'
            }
            owner_id_counter += 1

        owner_id = owners[coords]['owner_id']

        # Map fields to database schema
        title = row['Name of Unit'].strip()

        # Build improved description
        description_parts = []

        # Add notes if available
        if row['Notes']:
            description_parts.append(row['Notes'].strip())

        # Add occupancy restriction info
        if row['Occupancy Restriction'] and row['Occupancy Restriction'] != 'Co-ed':
            description_parts.append(f"Occupancy: {row['Occupancy Restriction']} only.")

        # Add payment policy
        if row['Payment Policy'] and row['Payment Policy'] != 'N/A':
            description_parts.append(f"Payment: {row['Payment Policy']}.")

        # Add lease info
        if row['Lease / Contract'] and row['Lease / Contract'] not in ['N/A', '']:
            lease_term = row['Lease / Contract']
            if lease_term != '12 months':  # Don't add if it's just standard
                description_parts.append(f"Lease term: {lease_term}.")

        # Add accessibility info
        if row['Accessible'] == 'Yes':
            description_parts.append("Accessible location.")

        description = ' '.join(description_parts) if description_parts else 'Property available for rent.'

        category = type_mapping.get(row['Type of Unit'], 'room')

        # Parse location
        location_parts = row['Location'].strip().split(',') if row['Location'] else ['', '']
        city = location_parts[0].strip() if len(location_parts) > 0 else 'Dumaguete'
        barangay = row['Barangay'].strip() if row['Barangay'] and row['Barangay'] != 'N/A' else ''
        street = ''  # Not in source data

        coordinates = coords

        # Random image from the 5 available
        image_num = random.randint(1, 5)
        image_url = f'{{"https://ynuhfllvtxwyloncwvys.supabase.co/storage/v1/object/public/room-pics/room{image_num}.jpg"}}'

        rent = clean_rent(row['Monthly Rental'])

        # Parse boolean amenities
        has_internet = parse_bool(row['Internet Availability'])
        allows_pets = parse_bool(row['Pet-Friendly'])
        is_furnished = parse_bool(row['Furnished'])
        has_ac = parse_bool(row['Air Conditioning'])
        is_secure = parse_bool(row['Secure Location (Gated/CCTV)'])
        has_parking = parse_bool(row['Parking'])

        # Default values
        is_available = 'true'
        is_verified = random.choice(['true', 'false'])  # Randomly verify some properties
        max_renters = random.randint(1, 4)
        rating = 'NULL'  # No ratings initially
        number_reviews = 0

        property_data = {
            'owner_id': owner_id,
            'title': title,
            'description': description,
            'category': category,
            'street': street,
            'barangay': barangay,
            'city': city,
            'coordinates': coordinates,
            'image_url': image_url,
            'rent': rent,
            'amenities': '{}',  # Empty array
            'rating': rating,
            'max_renters': max_renters,
            'is_available': is_available,
            'is_verified': is_verified,
            'has_internet': has_internet,
            'allows_pets': allows_pets,
            'is_furnished': is_furnished,
            'has_ac': has_ac,
            'is_secure': is_secure,
            'has_parking': has_parking,
            'number_reviews': number_reviews
        }

        properties.append(property_data)

# Write properties CSV
with open(properties_output, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['owner_id', 'title', 'description', 'category', 'street', 'barangay', 'city',
                  'coordinates', 'image_url', 'rent', 'amenities', 'rating', 'max_renters',
                  'is_available', 'is_verified', 'has_internet', 'allows_pets', 'is_furnished',
                  'has_ac', 'is_secure', 'has_parking', 'number_reviews']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(properties)

# Write owners CSV
with open(owners_output, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['owner_id', 'first_name', 'last_name', 'email', 'phone_number', 'user_type', 'is_verified']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for owner in owners.values():
        writer.writerow(owner)

print(f"Generated {len(properties)} properties")
print(f"Generated {len(owners)} unique owners")
print(f"\nFiles created:")
print(f"  - {properties_output}")
print(f"  - {owners_output}")
