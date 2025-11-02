# RoomSync: A Smart Boardmate Powered by AI

**A React Native mobile application for rental property listings in Dumaguete City and nearby municipalities.**

## Project Rationale

Finding safe, affordable, and convenient living spaces in Dumaguete City is challenging for students and employees relocating from other provinces or towns. Traditional word of mouth or basic listings on social media often lack updated information, honest reviews, or intelligent filtering.

RoomSync addresses this gap by providing a digital platform for apartment, room, and bed space listings tailored to user preferences. Features include location-based filtering, machine learning recommendations, and peer ratings to empower informed choices.

The project integrates data analytics to uncover trends in rental preferences and availability across Dumaguete City and nearby municipalities (Valencia, Sibulan, Bacong), with visualizations and statistics for data-driven insights.

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
- **React Native Maps** - Google Maps integration for property locations and distance visualization
- **Google Generative AI (Gemini)** - AI chatbot with function calling for property recommendations
- **Expo Image Picker** - Multi-photo upload functionality for properties and reports
- **Expo Location** - Geolocation services for distance calculations
- **React Native Chart Kit** - Bar charts and pie charts for admin analytics dashboard
- **Zod** - Schema validation for forms and data
- **React Native Gesture Handler** - Touch gestures and interactions
- **React Native Reanimated** - Smooth animations throughout the app 

## Project Objectives

- Provide an AI-powered mobile platform for bed space, room, and apartment searches in Dumaguete City
- Enable students and employees to find, evaluate, and apply for accommodations with intelligent filtering

### Specific Goals

- Implement full CRUD operations for managing property listings and rental applications
- Enable filtering and searching by location, budget, room type, and amenities
- Incorporate amenity-based recommendation system with priority filters (distance, price, room type)
- Integrate React Native Maps for geolocation, distance calculation, and visualization
- Allow users to submit rental applications and contact property owners via SMS
- Provide property owners with application management and review monitoring
- Provide administrators with analytics dashboard featuring charts and real-time metrics
- Implement AI chatbot assistant for conversational property discovery using Google Gemini

## Core Features

### For All Users
- **User Authentication:** Signup and login with email/password via Supabase Auth
- **Property Listings:** Browse apartments, rooms, and bed spaces with photos, rates, amenities, and policies
- **Advanced Search:** Filter by location (city, barangay), budget, room type, and amenities
- **Maps Integration:** View exact property locations with React Native Maps and calculate distances
- **Rating & Review System:** View and submit property ratings with detailed feedback
- **Direct Contact:** Contact property owners and renters via native SMS messaging
- **Notifications:** Stay updated on applications, property approvals, and system alerts
- **User Profiles:** Manage personal information, preferences, and profile pictures

### Renter Features
- **Property Discovery:** Browse feed with search, filters, and distance-based sorting
- **Rental Applications:** Submit applications directly to property owners with custom messages
- **Application Tracking:** Monitor application status (pending, approved, rejected, cancelled, completed)
- **AI Chatbot Assistant:** Get property recommendations through conversational AI powered by Google Gemini
- **ML-based Recommendations:** Personalized property suggestions based on amenity preferences and priorities (distance, price, or room type)

### Owner Features
- **Property Management:** Add, edit, and manage property listings with full details
- **Photo Uploads:** Upload multiple property photos via image picker
- **Application Management:** Receive, review, approve, or reject rental applications
- **Application Actions:** Mark applications as completed or end rentals
- **Review Monitoring:** View all feedback and ratings from renters on properties
- **Verification System:** Account and property verification by admin for trusted listings

### Admin Features
- **Dashboard Analytics:** View platform metrics with bar charts and pie charts showing trends over time
- **Statistics Overview:** Track total users (renters, owners, admins), properties (active, pending), and reports
- **Listing Moderation:** Approve or reject property submissions with verification system
- **User Management:** Verify property owners, warn or ban users, and manage all user accounts
- **Report Management:** Review and resolve user and property reports with proof images
- **Content Moderation:** Monitor all properties, reviews, and user-generated content
- **Direct Communication:** Contact users and property owners via SMS for quick resolution

### AI Components
- **ML Recommendation Engine:** Ranks properties using amenity-based scoring system aligned with user's preference ordering (top 3 must-haves weighted heavily)
- **Priority Filtering:** Users can filter recommendations by distance (2-5km from work/study), price range, or room type preference
- **AI Chatbot:** Conversational assistant powered by Google Gemini AI to help users find properties and answer questions
- **Function Calling:** AI can invoke tools to get recommendations, show next property, reject suggestions, and reset off-topic conversations
- **Context-Aware:** Chat maintains conversation history and user profile context for personalized assistance
- **Safeguards:** Automatic conversation reset for inappropriate content, with 30-message limit per user
  
## User Roles

### Renter (Student/Employee)
Primary users who search for rental properties.

**Capabilities:**
- Register and login with email/password through onboarding flow
- Create and manage user profile with preferences (budget, room type, location, amenity priorities)
- Browse property feed with search, category filters, and distance-based sorting
- View detailed property information with image gallery, maps, amenities, and reviews
- View distance from work/study location with map visualization
- Submit rental applications with custom messages
- Track application status and receive notifications
- Contact property owners via native SMS messaging
- Leave reviews and ratings for rented properties
- Receive notifications about applications, property approvals, and account status
- Chat with AI assistant for personalized property recommendations
- Reject unwanted recommendations to refine results
- Report users or properties with proof images

### Owner (Property Owner)
Users who list their properties for rent.

**Capabilities:**
- Register as property owner through role selection
- Add new property listings with title, description, category, location coordinates, photos, amenities, and pricing
- Edit existing property listings with background upload system
- Manage property availability status
- View all rental applications for their properties
- Approve or reject applications with notification system
- Mark applications as completed or end rentals
- Contact potential renters via native SMS messaging
- Monitor all reviews and ratings on their properties
- Receive notifications about new applications, reviews, and property verification
- Report problematic users with proof images
- Note: All listings require admin approval and verification before going live

### Admin (Administrator)
System administrators with full platform access.

**Capabilities:**
- Access comprehensive dashboard with real-time metrics and analytics
- View bar charts for monthly applications and property registrations
- View pie charts for property categories and application status distribution
- Track user statistics (total renters, owners, admins)
- Track property statistics (total, active, pending approval)
- Track report statistics (pending, under investigation, resolved, dismissed)
- Approve or reject property listings with verification badges
- Verify property owner accounts
- Warn or ban user accounts with notification triggers
- Review and manage all user reports with proof images
- Resolve or dismiss reports with status tracking
- Contact users and owners via SMS for direct communication
- Monitor all platform activity, properties, and user-generated content
- Receive notifications for new registrations, property submissions, and reports

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
- **users** - User accounts with profiles, preferences, amenity priorities, and role information (renter, owner, admin)
- **properties** - Property listings with details (title, description, category, location with coordinates, amenities, pricing, verification status)
- **applications** - Rental applications linking renters and properties with status tracking (pending, approved, rejected, cancelled, completed)
- **reviews** - Property reviews and ratings (1-5 stars) with comments from users
- **reports** - User and property reports for moderation with proof images and status tracking
- **notifications** - System notifications for users triggered by various events (applications, verifications, warnings, etc.)

### Key Relationships
- Users can own multiple properties (one-to-many)
- Users can have one active rented property (one-to-one via rented_property field)
- Applications link renters, owners, and properties (many-to-many with status tracking)
- Reviews and ratings are tied to users and properties (with automatic rating calculations)
- Reports can target users or properties with proof images
- Notifications are triggered automatically via database triggers for key events

For detailed schema information, see `database/DATABASE.md` and the SQL migration files in the `database/` directory.

## Project Structure

```
roomsync-app/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx, Input.tsx, Dropdown.tsx, Checkbox.tsx
│   │   ├── PropertyCard.tsx, ReviewCard.tsx, NotificationCard.tsx
│   │   ├── ImageSkeleton.tsx, PropertyCardSkeleton.tsx
│   │   ├── LocationPicker.tsx, MultiImagePicker.tsx
│   │   └── layout/        # Layout components (MainScaffold, etc.)
│   ├── screens/           # Screen components organized by feature
│   │   ├── auth/          # Authentication & onboarding screens
│   │   ├── renter/        # Renter-specific screens (Feed, Applications, Chat, PropertyDetails)
│   │   ├── owner/         # Owner-specific screens (AddProperty, ManageProperties, ViewReviews, ApplicationsList)
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── AdminReportsScreen.tsx
│   │   ├── AdminUserManagementScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ReportScreen.tsx
│   ├── store/             # Zustand state management
│   │   ├── useLoggedIn.ts # User authentication state
│   │   ├── useAdminData.ts # Admin metrics and data
│   │   ├── usePropertyUpload.ts # Background property upload
│   │   ├── usePropertyEdit.ts # Property editing state
│   │   ├── useRejectedRecommendations.ts # AI recommendation state
│   │   └── useNotificationCount.ts # Notification badge state
│   ├── services/          # Business logic and API services
│   │   ├── authService.ts # Authentication with Supabase
│   │   ├── recommendations.ts # ML-based recommendation engine
│   │   ├── backgroundPropertyUpload.ts
│   │   └── backgroundPropertyEdit.ts
│   ├── utils/             # Utility functions
│   │   ├── supabase.ts    # Supabase client configuration
│   │   ├── navigation.ts  # Navigation type definitions
│   │   ├── distance.ts    # Distance calculation utilities
│   │   ├── gemini.ts      # Google Gemini AI integration
│   │   └── tools.ts       # AI function calling tools
│   ├── types/             # TypeScript type definitions
│   │   ├── property.ts    # Property, Application, Review types
│   │   └── notifications.ts # Notification types
│   └── style/             # Global styles
│       └── global.css     # Tailwind CSS styles
├── database/              # Database schema and migrations
│   ├── DATABASE.md        # Schema documentation
│   └── *.sql              # SQL migration files
├── assets/                # Images, fonts, and static assets
├── App.tsx                # Root application component
├── app.json               # Expo configuration
├── tailwind.config.js     # Tailwind/NativeWind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
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
