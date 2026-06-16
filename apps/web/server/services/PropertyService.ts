import { TRPCError } from '@trpc/server';
import { Prisma, prisma } from '@awahouse/db';
import crypto from 'crypto';
import type { CreatePropertyInput, UpdatePropertyInput, PropertySearchInput } from '../schemas/properties';
import { verificationService } from './VerificationService';
import { uploadFile, getImageUrl } from '@/lib/cloudinary/client';

export class PropertyService {
  async create(userId: string, input: CreatePropertyInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const isLandlord = user.roles.includes('landlord');
    const isAgent = user.roles.includes('agent');
    const canCreate = isLandlord
      ? true
      : await verificationService.canAgentCreateListing(userId);
    if (!canCreate && isAgent) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Agents must verify NIN and a professional body before creating listings',
      });
    }

    const property = await prisma.property.create({
      data: {
        ownerId: userId,
        title: input.title,
        description: input.description,
        address: input.address,
        lga: input.lga,
        type: input.type,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        priceKobo: input.priceKobo,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });

    return property;
  }

  async update(userId: string, propertyId: string, input: UpdatePropertyInput) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }
    if (property.ownerId !== userId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own properties' });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: input,
    });

    return updated;
  }

  async delete(userId: string, propertyId: string) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }
    if (property.ownerId !== userId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own properties' });
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { isDeleted: true },
    });

    return { success: true };
  }

  async getById(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, roles: true, activeRole: true } },
      },
    });

    if (!property || property.isDeleted) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }

    return { ...property, images: property.images };
  }

  async search(input: PropertySearchInput) {
    const where: Record<string, unknown> = {
      isAvailable: true,
      isDeleted: false,
      verificationBadge: { not: 'pending' },
    };

    if (input.lga) where.lga = input.lga;
    if (input.type) where.type = input.type;
    if (input.bedrooms !== undefined) where.bedrooms = input.bedrooms;
    if (input.minPriceKobo !== undefined || input.maxPriceKobo !== undefined) {
      where.priceKobo = {};
      if (input.minPriceKobo !== undefined) {
        (where.priceKobo as Record<string, unknown>).gte = input.minPriceKobo;
      }
      if (input.maxPriceKobo !== undefined) {
        (where.priceKobo as Record<string, unknown>).lte = input.maxPriceKobo;
      }
    }

    if (input.query) {
      where.OR = [
        { title: { contains: input.query, mode: 'insensitive' } },
        { description: { contains: input.query, mode: 'insensitive' } },
        { address: { contains: input.query, mode: 'insensitive' } },
        { lga: { contains: input.query, mode: 'insensitive' } },
      ];
    }

    const latitude = input.latitude;
    const longitude = input.longitude;
    const radiusKm = input.radiusKm ?? 5;

    let geoFilteredIds: string[] | null = null;
    if (latitude !== undefined && longitude !== undefined) {
      const nearby = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM public.properties
        WHERE is_available = true
          AND is_deleted = false
          AND verification_badge != 'pending'
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusKm * 1000}
          )
      `;
      geoFilteredIds = nearby.map((r) => r.id);
      if (geoFilteredIds.length === 0) {
        return { properties: [], total: 0, page: input.page, limit: input.limit };
      }
    }

    const skip = (input.page - 1) * input.limit;
    const take = input.limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: geoFilteredIds ? { id: { in: geoFilteredIds }, ...where } : (where as Prisma.PropertyWhereInput),
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          owner: { select: { id: true, firstName: true, lastName: true, roles: true, activeRole: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.property.count({
        where: geoFilteredIds ? { id: { in: geoFilteredIds }, ...where } : (where as Prisma.PropertyWhereInput),
      }),
    ]);

    return { properties, total, page: input.page, limit: input.limit };
  }

  async listMyProperties(userId: string) {
    const properties = await prisma.property.findMany({
      where: { ownerId: userId, isDeleted: false },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { properties };
  }

  async uploadImages(userId: string, propertyId: string, images: Array<{ fileName: string; fileType: string; fileBase64: string }>) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }
    if (property.ownerId !== userId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only upload images to your own properties' });
    }

    const uploaded = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i]!;
      const imageId = crypto.randomUUID();

      const { url, publicId } = await uploadFile(img.fileBase64, {
        folder: `awahouse/properties/${propertyId}`,
        publicId: imageId,
        type: 'upload',
        eager: [
          { width: 1920, height: 1080, crop: 'limit', format: 'webp' },
          { width: 400, height: 300, crop: 'fill', format: 'webp' },
        ],
      });

      const dbImage = await prisma.propertyImage.create({
        data: {
          propertyId,
          url,
          thumbnail: getImageUrl(publicId, 'w_400,h_300,c_fill,f_webp'),
          alt: img.fileName,
          sortOrder: i,
        },
      });

      uploaded.push({
        id: dbImage.id,
        url,
        thumbnail: getImageUrl(publicId, 'w_400,h_300,c_fill,f_webp'),
      });
    }

    return { success: true, images: uploaded };
  }

  async saveProperty(userId: string, propertyId: string, save: boolean) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId, isDeleted: false },
    });
    if (!property) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }

    if (save) {
      await prisma.savedProperty.upsert({
        where: { userId_propertyId: { userId, propertyId } },
        create: { userId, propertyId },
        update: {},
      });
    } else {
      await prisma.savedProperty
        .delete({ where: { userId_propertyId: { userId, propertyId } } })
        .catch(() => {});
    }

    return { success: true };
  }

  async getSavedProperties(userId: string) {
    const saved = await prisma.savedProperty.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { properties: saved.map((s) => s.property) };
  }
}

export const propertyService = new PropertyService();
