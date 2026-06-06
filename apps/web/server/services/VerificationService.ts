import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@awahouse/db';
import { verifyNinWithFaceMatch } from '@/lib/youverify/client';
import type { VerificationType } from '@awahouse/types';

const BCRYPT_COST = 12;
const NIN_CONFIDENCE_THRESHOLD = 85;

const PROFESSIONAL_BODIES: VerificationType[] = [
  'lasrera',
  'esvarbon',
  'niesv',
  'aean',
  'ercaan',
  'redan',
];

export class VerificationService {
  async submitNin(userId: string, nin: string, faceImageBase64?: string) {
    const ninHash = await bcrypt.hash(nin, BCRYPT_COST);

    const existing = await prisma.verification.findUnique({
      where: { userId_type: { userId, type: 'nin' } },
    });
    if (existing && existing.status === 'approved') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'NIN is already verified',
      });
    }

    const result = await verifyNinWithFaceMatch(nin, faceImageBase64);

    const status = result.success && result.confidence >= NIN_CONFIDENCE_THRESHOLD
      ? 'approved'
      : 'pending';

    await prisma.user.update({
      where: { id: userId },
      data: { ninHash },
    });

    const verification = await prisma.verification.upsert({
      where: { userId_type: { userId, type: 'nin' } },
      update: {
        status,
        metadata: { youverifyConfidence: result.confidence, youverifyMessage: result.message },
      },
      create: {
        userId,
        type: 'nin',
        status,
        metadata: { youverifyConfidence: result.confidence, youverifyMessage: result.message },
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
    const documentUrl = `verifications/${userId}/${type}/${Date.now()}.${fileType.split('/')[1] ?? 'bin'}`;

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
}

export const verificationService = new VerificationService();
