import { create } from 'zustand';

export type AdminUserRole = 'renter' | 'owner';

export interface AdminUser {
  id: number;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phoneNumber: string;
  role: AdminUserRole;
  profile_picture: string;
  birthdate?: string;
  isWarned: boolean;
  isBanned: boolean;
  isVerified: boolean;
  propertiesListed: number;
  applications: number;
  last_login_date: string;
}

export interface AdminMetrics {
  userActivity: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number; // percentage
  };
  listingMetrics: {
    totalListings: number;
    activeListings: number;
    pendingApprovals: number;
    viewsThisMonth: number;
  };
  revenueMetrics: {
    monthlyRevenue: number;
    totalRevenue: number;
    averageListingPrice: number;
    revenueGrowthRate: number; // percentage
  };
  platformPerformance: {
    averageResponseTime: number; // ms
    uptime: number; // percentage
    errorRate: number; // percentage
    activeSessions: number;
  };
}

interface AdminDataState {
  users: AdminUser[];
  metrics: AdminMetrics;
  verifyUser: (userId: number) => void;
}

const initialUsers: AdminUser[] = [
  // {
  //   id: 1,
  //   first_name: 'Maria',
  //   last_name: 'Santos',
  //   email: 'maria.santos@email.com',
  //   phoneNumber: '+639171234567',
  //   role: 'property_owner',
  //   isVerified: true,
  //   propertiesListed: 3,
  //   applications: 0,
  //   lastActive: '2 hours ago',
  //   avatarUrl:
  //     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  // },
  // {
  //   id: 2,
  //   first_name: 'John Dela Cruz',
  //   last_name: '',
  //   email: 'john.delacruz@email.com',
  //   phoneNumber: '+639181112223',
  //   role: 'renter',
  //   isVerified: false,
  //   propertiesListed: 0,
  //   applications: 5,
  //   lastActive: '1 day ago',
  //   avatarUrl:
  //     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  // },
  // {
  //   id: 3,
  //   first_name: 'Ana Rodriguez',
  //   last_name: '',
  //   email: 'ana.rodriguez@email.com',
  //   phoneNumber: '+639221234567',
  //   role: 'property_owner',
  //   isVerified: true,
  //   propertiesListed: 2,
  //   applications: 3,
  //   lastActive: '30 minutes ago',
  //   avatarUrl:
  //     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  // },
  // {
  //   id: 4,
  //   first_name: 'Carlos Mendoza',
  //   last_name: '',
  //   email: 'carlos.mendoza@email.com',
  //   phoneNumber: '+639231234567',
  //   role: 'property_owner',
  //   isVerified: false,
  //   propertiesListed: 1,
  //   applications: 0,
  //   lastActive: '3 days ago',
  //   avatarUrl:
  //     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  // },
  // {
  //   id: 5,
  //   first_name: 'Sarah Johnson',
  //   last_name: '',
  //   email: 'sarah.johnson@email.com',
  //   phoneNumber: '+639271234567',
  //   role: 'renter',
  //   isVerified: false,
  //   propertiesListed: 0,
  //   applications: 8,
  //   lastActive: '1 hour ago',
  //   avatarUrl:
  //     'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  // },
  // {
  //   id: 6,
  //   first_name: 'Michael Chen',
  //   last_name: '',
  //   email: 'michael.chen@email.com',
  //   phoneNumber: '+639301234567',
  //   role: 'property_owner',
  //   isVerified: false,
  //   propertiesListed: 4,
  //   applications: 0,
  //   lastActive: '4 hours ago',
  //   avatarUrl:
  //     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  // },
];

const initialMetrics: AdminMetrics = {
  userActivity: {
    totalUsers: initialUsers.length,
    activeUsers: 8,
    newUsersThisMonth: 2,
    userGrowthRate: 12.5,
  },
  listingMetrics: {
    totalListings: 89,
    activeListings: 76,
    pendingApprovals: 12,
    viewsThisMonth: 2456,
  },
  revenueMetrics: {
    monthlyRevenue: 125000,
    totalRevenue: 1450000,
    averageListingPrice: 8500,
    revenueGrowthRate: 8.3,
  },
  platformPerformance: {
    averageResponseTime: 245,
    uptime: 99.8,
    errorRate: 0.02,
    activeSessions: 1234,
  },
};

export const useAdminData = create<AdminDataState>((set, get) => ({
  users: initialUsers,
  metrics: initialMetrics,
  verifyUser: (userId: number) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, isVerified: true } : u)),
    }));
  },
}));
