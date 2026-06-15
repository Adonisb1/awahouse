import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@awahouse/db';
import { verifyNin } from '@/lib/dojah/client';
import { uploadFile, getSignedUrl } from '@/lib/r2/client';
import { notificationService } from './NotificationService';
import type { VerificationType } from '@awahouse/types';

const BCRYPT_COST = 12;

const PROFESSIONAL_BODIES: VerificationType[] = [
  'lasrera',
  'esvarbon',
  'niesv',
  'aean',
  'ercaan',
  'redan',
];

export class VerificationService {
  async submitNin(userId: string, nin: string) {
    const ninHash = await bcrypt.hash(nin, BCRYPT_COST);

    const existingVerification = await prisma.verification.findUnique({
      where: { userId_type: { userId, type: 'nin' } },
    });
    if (existingVerification && existingVerification.status === 'approved') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'NIN is already verified',
      });
    }

    const ninUser = await prisma.user.findUnique({ where: { ninHash } });
    if (ninUser && ninUser.id !== userId) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'This NIN is already linked to another account. One NIN can only be associated with one account.',
      });
    }

    let result;
    if (process.env.NODE_ENV === 'development' && nin === '00000000000') {
      console.log('🛡 [DEV ONLY] NIN Verification Bypassed for testing');
      result = { success: true, message: 'Developer Bypass', entity: { firstName: 'Test', lastName: 'User' } };
    } else {
      result = await verifyNin(nin);
    }

    const status = result.success ? 'approved' : 'pending';

    await prisma.user.update({
      where: { id: userId },
      data: { ninHash },
    });

    const verification = await prisma.verification.upsert({
      where: { userId_type: { userId, type: 'nin' } },
      update: {
        status,
        metadata: { dojahName: result.entity ? `${result.entity.firstName} ${result.entity.lastName}`.trim() : null, dojahMessage: result.message },
      },
      create: {
        userId,
        type: 'nin',
        status,
        metadata: { dojahName: result.entity ? `${result.entity.firstName} ${result.entity.lastName}`.trim() : null, dojahMessage: result.message },
      },
    });

    return verification;
  }

  async checkStatus(userId: string) {
    const verifications = await prisma.verification.findMany({
      where: { userId },
    });
    return verifications;
  }

  async uploadDocument(
    userId: string,
    type: VerificationType,
    fileName: string,
    fileType: string,
    fileBase64: string,
  ) {
    const ext = fileType.split('/')[1] ?? 'bin';
    const key = `verifications/${userId}/${type}/${Date.now()}.${ext}`;

    const buffer = Buffer.from(fileBase64, 'base64');
    await uploadFile(key, buffer, fileType);

    const signedUrl = await getSignedUrl(key);
    const documentUrl = signedUrl ?? key;

    const verification = await prisma.verification.upsert({
      where: { userId_type: { userId, type } },
      update: { documentUrl, status: 'pending' },
      create: {
        userId,
        type: type as VerificationType,
        status: 'pending',
        documentUrl,
        metadata: { fileName, fileType },
      },
    });

    return verification;
  }

  async adminReview(verificationId: string, status: 'approved' | 'rejected', reviewerId: string, reason?: string) {
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
    });
    if (!verification) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Verification not found' });
    }

    const updated = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewerId,
        reviewedAt: new Date(),
        metadata: {
          ...(verification.metadata as Record<string, unknown> ?? {}),
          reviewReason: reason,
          reviewedAt: new Date().toISOString(),
        },
      },
    });

    const isApproved = status === 'approved';
    await notificationService.sendInApp(
      verification.userId,
      isApproved ? 'Verification Approved' : 'Verification Rejected',
      isApproved
        ? `Your ${verification.type.replace(/_/g, ' ')} has been approved. You can now create listings.`
        : `Your ${verification.type.replace(/_/g, ' ')} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      isApproved ? '/explore' : '/verify-agent',
    );

    return updated;
  }

  async canAgentCreateListing(agentId: string): Promise<boolean> {
    const verifications = await prisma.verification.findMany({
      where: {
        userId: agentId,
        status: 'approved',
      },
    });

    const hasNin = verifications.some((v) => v.type === 'nin');
    const hasProfBody = verifications.some((v) =>
      (PROFESSIONAL_BODIES as string[]).includes(v.type),
    );

    return hasNin && hasProfBody;
  }

  async canUpgradeToLandlord(userId: string): Promise<{
    canUpgrade: boolean;
    missingRequirements: string[];
  }> {
    const verifications = await prisma.verification.findMany({
      where: { userId, status: 'approved' },
    });

    const missingRequirements: string[] = [];

    const hasNin = verifications.some((v) => v.type === 'nin');
    if (!hasNin) {
      missingRequirements.push('NIN verification');
    }

    const hasProfBody = verifications.some((v) =>
      (PROFESSIONAL_BODIES as string[]).includes(v.type),
    );
    if (!hasProfBody) {
      missingRequirements.push('Professional body verification (LASRERA, NIESV, ESVARBON, AEAN, ERCAAN, or REDAN)');
    }

    return {
      canUpgrade: missingRequirements.length === 0,
      missingRequirements,
    };
  }
}

export const verificationService = new VerificationService();
