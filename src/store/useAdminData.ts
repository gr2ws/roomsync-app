import { create } from 'zustand';

export type AdminUserRole = 'renter' | 'property_owner';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: AdminUserRole;
  isVerified: boolean;
  propertiesListed: number;
  applications: number;
  lastActive: string;
  avatarUrl: string;
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
  {
    id: 1,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phoneNumber: '+639171234567',
    role: 'property_owner',
    isVerified: true,
    propertiesListed: 3,
    applications: 0,
    lastActive: '2 hours ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'John Dela Cruz',
    email: 'john.delacruz@email.com',
    phoneNumber: '+639181112223',
    role: 'renter',
    isVerified: false,
    propertiesListed: 0,
    applications: 5,
    lastActive: '1 day ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Ana Rodriguez',
    email: 'ana.rodriguez@email.com',
    phoneNumber: '+639221234567',
    role: 'property_owner',
    isVerified: true,
    propertiesListed: 2,
    applications: 3,
    lastActive: '30 minutes ago',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phoneNumber: '+639231234567',
    role: 'property_owner',
    isVerified: false,
    propertiesListed: 1,
    applications: 0,
    lastActive: '3 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 5,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phoneNumber: '+639271234567',
    role: 'renter',
    isVerified: false,
    propertiesListed: 0,
    applications: 8,
    lastActive: '1 hour ago',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 6,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phoneNumber: '+639301234567',
    role: 'property_owner',
    isVerified: false,
    propertiesListed: 4,
    applications: 0,
    lastActive: '4 hours ago',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
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


