import { z } from 'zod';
import { LGA_LIST } from '@awahouse/types';

export const propertyTypeEnum = z.enum(['apartment', 'duplex', 'bungalow', 'studio', 'commercial']);

export const createPropertyInput = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional(),
  address: z.string().max(500).optional(),
  lga: z.enum(LGA_LIST).optional(),
  type: propertyTypeEnum,
  bedrooms: z.number().int().min(0).max(50).default(1),
  bathrooms: z.number().int().min(0).max(50).default(1),
  priceKobo: z.bigint().positive('Price must be positive'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updatePropertyInput = createPropertyInput.partial().extend({
  isAvailable: z.boolean().optional(),
});

export const propertySearchInput = z.object({
  query: z.string().max(200).optional(),
  lga: z.enum(LGA_LIST).optional(),
  type: propertyTypeEnum.optional(),
  minPriceKobo: z.bigint().optional(),
  maxPriceKobo: z.bigint().optional(),
  bedrooms: z.number().int().min(0).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().positive().max(100).default(5),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const propertyIdInput = z.object({
  id: z.string().uuid('Invalid property ID'),
});

export const uploadImagesInput = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  images: z.array(z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileBase64: z.string().min(1),
  })).min(1, 'At least one image required').max(10, 'Maximum 10 images'),
});

export const savePropertyInput = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  save: z.boolean().default(true),
});

export type CreatePropertyInput = z.infer<typeof createPropertyInput>;
export type UpdatePropertyInput = z.infer<typeof updatePropertyInput>;
export type PropertySearchInput = z.infer<typeof propertySearchInput>;
export type UploadImagesInput = z.infer<typeof uploadImagesInput>;
