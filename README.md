# RoomSync: A Smart Boardmate Powered by AI

**A React Native mobile application for rental property listings in Dumaguete City and nearby municipalities.**

## Project Rationale

Finding safe, affordable, and convenient living spaces in Dumaguete City is challenging for students and employees relocating from other provinces or towns. Traditional word of mouth or basic listings on social media often lack updated information, honest reviews, or intelligent filtering.

RoomSync addresses this gap by providing a digital platform for apartment, room, and bed space listings tailored to user preferences. Features include location-based filtering, machine learning recommendations, and peer ratings to empower informed choices.

The project integrates data analytics to uncover trends in rental preferences and availability across Dumaguete City and nearby municipalities (Valencia, Sibulan, Bacong), with visualizations like heatmaps and charts for data-driven insights.

By combining essential functionalities, modern design, AI features, and APIs (Recommendation Systems, Google Maps), RoomSync offers a user-centered solution to real-world housing problems.

## Tech Stack

### Core Framework
- **React Native** (0.81.4) - Mobile app framework
- **Expo** (54.0.13) - Development platform
- **TypeScript** (5.9.2) - Type safety

### Backend & Data
- **Supabase** - Backend-as-a-Service (authentication, PostgreSQL database, storage)
- **Zustand** - State management
- **AsyncStorage** - Local storage

### UI & Styling
- **NativeWind** - Tailwind CSS for React Native
- **Lucide React Native** - Icon library
- **React Native Reanimated** - Animations

### Navigation
- **React Navigation** - Navigation library with stack, bottom tabs, and material top tabs

### Key Features & Integrations
- **React Native Maps** - Google Maps integration for property locations
- **Google Generative AI** - AI chatbot functionality
- **Expo Image Picker** - Photo upload functionality
- **Expo Location** - Geolocation services
- **React Native Chart Kit** - Data visualization for analytics
- **Zod** - Schema validation
- **Zustand** - State management 

## Project Objectives

- Provide an AI-powered platform for bed space, room, and apartment searches.
- Enable students and employees to find, evaluate, and apply for accommodations in Dumaguete City and nearby areas.

### Specific Goals

- Implement operations for managing property listings and user interactions.
- Enable filtering and searching by location, budget, and amenities.
- Incorporate feedback-based recommendation systems using machine learning.
- Integrate Native Maps API for geolocation and distance visualization.
- Allow users to submit rental applications and contact property owners.
- Provide rental business owners with insights via data analytics.

## Core Features

### For All Users
- **User Authentication:** Signup and login with email/password
- **Property Listings:** Browse apartments, rooms, and bed spaces with photos, rates, amenities, and policies
- **Advanced Search:** Filter by location (city, barangay), budget, room type, and amenities
- **Maps Integration:** View exact property locations and distance
- **Rating & Review System:** View and submit property ratings with detailed feedback
- **Chat Functionality:** Real-time messaging between renters and property owners
- **Notifications:** Stay updated on applications, messages, and system alerts
- **User Profiles:** Manage personal information and preferences

### Renter Features
- **Property Discovery:** Browse feed with personalized recommendations
- **Rental Applications:** Submit applications directly to property owners
- **Application Tracking:** Monitor application status (pending, approved, rejected)
- **AI Recommendations:** ML-based property suggestions based on filters and preferences

### Owner Features
- **Property Management:** Add and manage property listings
- **Photo Uploads:** Upload multiple property photos
- **Application Management:** Receive and review rental applications
- **Review Monitoring:** View feedback and ratings from renters
- **Verification System:** Account verification for trusted listings

### Admin Features
- **Dashboard Analytics:** View platform metrics, charts, and data visualizations
- **Listing Moderation:** Approve or reject property submissions
- **User Management:** Verify property owners, handle reports, manage user accounts
- **Content Moderation:** Monitor and moderate reviews and user-generated content
- **Platform Analytics:** Access detailed insights on rental trends and user behavior

### AI Components
- **ML Recommendation Engine:** Personalized property suggestions based on user preferences
- **AI Chatbot:** Assist users with questions and general inquiries about properties using Google Generative AI
- **LLM Tools:** get recommendations, view next recommendations, reset conversation (safeguard) and reject recommendations
  
## User Roles

### Renter (Student/Employee)
Primary users who search for rental properties.

**Capabilities:**
- Register and login with email/password
- Create and manage user profile with preferences (budget, room type, location)
- Browse property feed with search and filter options
- View detailed property information with photos, amenities, and location
- Submit rental applications (requires admin verification)
- Track application status
- Contact property owners with native SMS platform
- Leave reviews and ratings for properties
- Receive notifications about applications and other events

### Owner (Property Owner)
Users who list their properties for rent.

**Capabilities:**
- Register as property owner
- Add new property listings with photos, amenities, pricing, and location (requires admin verification)
- Manage existing property listings
- View and respond to rental applications
- Get in contact with potential renters via native SMS messaging platform
- Monitor reviews and ratings on their properties
- Receive notifications about applications and messages
- Note: All listings require admin approval before going live

### Admin (Administrator)
System administrators with full platform access.

**Capabilities:**
- Access comprehensive admin dashboard with analytics
- Approve or reject property listings
- Verify property owner accounts
- Manage user accounts (warn, ban users)
- Handle user reports and content moderation
- View platform analytics with data visualizations (charts, statistics)
- Monitor system activity and user behavior
- Oversee all platform operations

## Stakeholders

- Students/Employees
- Property Owners

## Location Coverage

- Dumaguete City
- Valencia
- Bacong
- Sibulan

## Database Schema

RoomSync uses **Supabase** (PostgreSQL) for backend services. Key tables include:

### Main Tables
- **users** - User accounts with profiles, preferences, and role information (renter, owner, admin)
- **properties** - Property listings with details (title, description, category, location, amenities, pricing)
- **applications** - Rental applications linking renters and properties with status tracking
- **reviews** - Property reviews and ratings from users
- **reports** - User and property reports for moderation
- **notifications** - System notifications for users

### Key Relationships
- Users can own multiple properties (one-to-many)
- Users can have one active rented property (one-to-one)
- Applications link renters, owners, and properties (many-to-many)
- Reviews and ratings are tied to users and properties

For detailed schema information, see the database migration files or CLAUDE.md.

## Project Structure

```
roomsync-app/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── layout/
│   ├── screens/          # Screen components organized by feature
│   │   ├── auth/         # Authentication screens
│   │   ├── renter/       # Renter-specific screens
│   │   └── owner/         # Owner-specific screens
│   ├── store/            # Zustand state management
│   ├── utils/            # Utility functions and navigation types
│   ├── style/            # Global styles (global.css)
│   └── services/         # API services and Supabase client
├── assets/               # Images, fonts, and other static assets
├── app.json             # Expo configuration
├── tailwind.config.js   # Tailwind/NativeWind configuration
└── tsconfig.json        # TypeScript configuration
```

## Setup & Running Instructions

This project uses **Expo** for development and testing. You can run the app on Android/iOS emulators or physical devices.

### Prerequisites

- **Node.js** (v18 or newer recommended)
- **npm** or **yarn**
- **Expo Go** app on your mobile device (for testing on physical devices)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator, macOS only)
- **Supabase account** (for backend services)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd roomsync-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

### Running the App

#### Development Server (Expo Go)
Start the Expo development server with tunnel mode:
```bash
npm start
```
Then scan the QR code with:
- **iOS:** Camera app
- **Android:** Expo Go app

#### Platform-Specific Builds

**Android (Emulator or Device):**
```bash
npm run android
```

**iOS (Simulator, macOS only):**
```bash
npm run ios
```

**Web (Browser):**
```bash
npm run web
```

### Development Commands

```bash
# Start development server with tunnel
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device (macOS only)
npm run ios

# Run on web browser
npm run web

# Generate native project files
npm run prebuild

# Lint code (ESLint + Prettier)
npm run lint

# Format code (auto-fix linting and formatting)
npm run format
```

### Troubleshooting

- **Metro bundler issues:** Clear cache with `npx expo start -c`
- **Dependency issues:** Delete `node_modules` and reinstall with `npm install`
- **Android build issues:** Run `npm run prebuild` to regenerate native projects
- **Network issues:** Ensure your device and computer are on the same network, or use tunnel mode

### Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [NativeWind Documentation](https://www.nativewind.dev/)
