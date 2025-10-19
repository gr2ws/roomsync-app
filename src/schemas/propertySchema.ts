import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(1, 'Property title is required'),
  description: z.string().optional(),
  category: z.enum(['apartment', 'room', 'bedspace'], {
    errorMap: () => ({ message: 'Please select a property category' }),
  }),
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.enum(['Dumaguete City', 'Valencia', 'Bacong', 'Sibulan'], {
    errorMap: () => ({ message: 'Please select a city' }),
  }),
  coordinates: z.string().min(1, 'Location is required'),
  rent: z.number().positive('Rent must be greater than 0'),
  max_renters: z.number().int().positive().min(1, 'At least 1 renter is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  has_internet: z.boolean(),
  allows_pets: z.boolean(),
  is_furnished: z.boolean(),
  has_ac: z.boolean(),
  is_secure: z.boolean(),
  has_parking: z.boolean(),
  amenities: z.array(z.string()).min(2, 'Bedrooms and bathrooms are required'),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
