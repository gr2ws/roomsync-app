export type RootStackParamList = {
  Introduction: { fromAuth?: boolean } | undefined;
  RoleSelection: undefined;
  Auth: undefined;
  Register: undefined;
  Home: undefined;
  Welcome: undefined;
  Details: undefined;
  Preferences: { fromProfile?: boolean } | undefined;
  PropertyDetails: { propertyId: number };
};

export type RootTabParamList = {
  Feed: undefined;
  Applications: undefined;
  Chat: undefined;
  AddProperty: undefined;
  EditProperty: { propertyId: number };
  ManageProperties: undefined;
  ApplicationsList: { propertyId: number };
  ViewReviews: { propertyId?: number } | undefined;
  Profile: undefined;
  Notifications: undefined;
  Admin: undefined;
  AdminDashboard: undefined;
  AdminAnalytics: undefined;
  AdminUsers: undefined;
  AdminProfile: undefined;
};

// Add new screens here as you create them
// Example:
// Settings: undefined;
// UserDetails: { userId: string };
// EditProfile: { name: string; email: string };
