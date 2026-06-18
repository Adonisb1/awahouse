import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@awahouse/db';
import { TRPCError } from '@trpc/server';
import { calculateFees } from '@/server/services/EscrowService';

const TEST_UID = '00000000-0000-0000-0000-000000000001';
const TEST_PID = '00000000-0000-0000-0000-000000000002';
const TEST_LID = '00000000-0000-0000-0000-000000000003';
const TEST_AID = '00000000-0000-0000-0000-000000000004';

async function createTestUser(id: string, role: string) {
  return prisma.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      email: `${role}@test.awahouse.com`,
      phone: `+234800000000${id.slice(-1)}`,
      firstName: 'Test',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      roles: [role],
      activeRole: role,
    },
  });
}

async function createTestProperty() {
  return prisma.property.upsert({
    where: { id: TEST_PID },
    update: {},
    create: {
      id: TEST_PID,
      ownerId: TEST_LID,
      title: 'Test Property',
      type: 'apartment',
      priceKobo: 100000000n,
      lga: 'Ikeja',
      isAvailable: true,
    },
  });
}

async function createTestEscrow(
  status: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.escrowTransaction.create({
    data: {
      propertyId: TEST_PID,
      tenantId: TEST_UID,
      landlordId: TEST_LID,
      status,
      amountKobo: 250000000n,
      platformFeeKobo: 500000n,
      landlordPayoutKobo: 249500000n,
      paymentProvider: 'monnify',
      paymentReference: `TEST-${crypto.randomUUID().slice(0, 8)}`,
      ...overrides,
    },
  });
}

const crypto = require('crypto');

let escrowService: any;

describe('Escrow state machine — valid transitions', () => {
  beforeAll(async () => {
    const mod = await import('@/server/services/EscrowService');
    escrowService = mod.escrowService;
    await createTestUser(TEST_UID, 'tenant');
    await createTestUser(TEST_LID, 'landlord');
    await createTestUser(TEST_AID, 'admin');
    await createTestProperty();
  });

  afterAll(async () => {
    await prisma.transactionLog.deleteMany({
      where: { escrow: { propertyId: TEST_PID } },
    });
    await prisma.escrowTransaction.deleteMany({
      where: { propertyId: TEST_PID },
    });
    await prisma.property.deleteMany({ where: { id: TEST_PID } });
    await prisma.user.deleteMany({
      where: { id: { in: [TEST_UID, TEST_LID, TEST_AID] } },
    });
  });

  it('pending_payment → funds_held via handlePaymentSuccess', async () => {
    const escrow = await createTestEscrow('pending_payment');
    const result = await escrowService.handlePaymentSuccess(escrow.paymentReference);
    expect(result.status).toBe('funds_held');
    expect(result.id).toBe(escrow.id);
  });

  it('funds_held → docs_verified via markDocsVerified', async () => {
    const escrow = await createTestEscrow('funds_held');
    const result = await escrowService.markDocsVerified(escrow.id, TEST_AID);
    expect(result.status).toBe('docs_verified');
  });

  it('docs_verified → key_handover_pending via markHandoverPending', async () => {
    const escrow = await createTestEscrow('docs_verified');
    const result = await escrowService.markHandoverPending(escrow.id, TEST_AID);
    expect(result.status).toBe('key_handover_pending');
  });

  it('key_handover_pending → completed via confirmHandover by tenant', async () => {
    const escrow = await createTestEscrow('key_handover_pending');
    const result = await escrowService.confirmHandover(escrow.id, TEST_UID);
    expect(result.status).toBe('completed');
  });

  it('key_handover_pending → disputed via raiseDispute', async () => {
    const escrow = await createTestEscrow('key_handover_pending');
    const result = await escrowService.raiseDispute(escrow.id, TEST_UID, 'Property condition not as described in the listing');
    expect(result.status).toBe('disputed');
    const updated = await prisma.escrowTransaction.findUnique({ where: { id: escrow.id } });
    expect(updated?.disputeReason).toBe('Property condition not as described in the listing');
    expect(updated?.disputedAt).toBeTruthy();
  });

  it('docs_verified → disputed via raiseDispute', async () => {
    const escrow = await createTestEscrow('docs_verified');
    const result = await escrowService.raiseDispute(escrow.id, TEST_UID, 'Documents do not match what was promised');
    expect(result.status).toBe('disputed');
  });

  it('pending_payment → cancelled via cancel', async () => {
    const escrow = await createTestEscrow('pending_payment');
    const result = await escrowService.cancel(escrow.id, TEST_UID);
    expect(result.status).toBe('cancelled');
  });

  it('funds_held → refunded via adminRefund', async () => {
    const escrow = await createTestEscrow('funds_held');
    const result = await escrowService.adminRefund(escrow.id, TEST_AID);
    expect(result.status).toBe('refunded');
  });

  it('disputed → completed via adminRelease from disputed', async () => {
    const escrow = await createTestEscrow('disputed');
    const result = await escrowService.adminRelease(escrow.id, TEST_AID);
    expect(result.status).toBe('completed');
  });

  it('disputed → refunded via adminRefund from disputed', async () => {
    const escrow = await createTestEscrow('disputed');
    const result = await escrowService.adminRefund(escrow.id, TEST_AID);
    expect(result.status).toBe('refunded');
  });
});

describe('Escrow state machine — invalid transitions', () => {
  beforeAll(async () => {
    if (!escrowService) {
      const mod = await import('@/server/services/EscrowService');
      escrowService = mod.escrowService;
    }
    await createTestUser(TEST_UID, 'tenant');
    await createTestUser(TEST_LID, 'landlord');
    await createTestUser(TEST_AID, 'admin');
    await createTestProperty();
  });

  afterAll(async () => {
    await prisma.transactionLog.deleteMany({
      where: { escrow: { propertyId: TEST_PID } },
    });
    await prisma.escrowTransaction.deleteMany({
      where: { propertyId: TEST_PID },
    });
  });

  it('should reject pending_payment → completed', async () => {
    const escrow = await createTestEscrow('pending_payment');
    await expect(escrowService.confirmHandover(escrow.id, TEST_UID)).rejects.toThrow(TRPCError);
  });

  it('should reject pending_payment → docs_verified', async () => {
    const escrow = await createTestEscrow('pending_payment');
    await expect(escrowService.markDocsVerified(escrow.id, TEST_AID)).rejects.toThrow(TRPCError);
  });

  it('should reject funds_held → completed', async () => {
    const escrow = await createTestEscrow('funds_held');
    await expect(escrowService.confirmHandover(escrow.id, TEST_UID)).rejects.toThrow(TRPCError);
  });

  it('should reject funds_held → disputed', async () => {
    const escrow = await createTestEscrow('funds_held');
    await expect(
      escrowService.raiseDispute(escrow.id, TEST_UID, 'Cannot dispute before docs verified'),
    ).rejects.toThrow(TRPCError);
  });

  it('should reject completed → any other state', async () => {
    const escrow = await createTestEscrow('completed');
    await expect(escrowService.markDocsVerified(escrow.id, TEST_AID)).rejects.toThrow(TRPCError);
    await expect(escrowService.markHandoverPending(escrow.id, TEST_AID)).rejects.toThrow(TRPCError);
    await expect(escrowService.adminRefund(escrow.id, TEST_AID)).rejects.toThrow(TRPCError);
  });

  it('should handle idempotent handlePaymentSuccess', async () => {
    const escrow = await createTestEscrow('funds_held');
    const result = await escrowService.handlePaymentSuccess(escrow.paymentReference!);
    expect(result.status).toBe('funds_held');
  });
});

describe('Escrow auth guards', () => {
  beforeAll(async () => {
    if (!escrowService) {
      const mod = await import('@/server/services/EscrowService');
      escrowService = mod.escrowService;
    }
    await createTestUser(TEST_UID, 'tenant');
    await createTestUser(TEST_LID, 'landlord');
    await createTestProperty();
  });

  afterAll(async () => {
    await prisma.transactionLog.deleteMany({
      where: { escrow: { propertyId: TEST_PID } },
    });
    await prisma.escrowTransaction.deleteMany({
      where: { propertyId: TEST_PID },
    });
  });

  it('should reject confirmHandover by non-tenant', async () => {
    const escrow = await createTestEscrow('key_handover_pending');
    await expect(escrowService.confirmHandover(escrow.id, TEST_LID)).rejects.toThrow('Only the tenant');
  });

  it('should reject cancel by non-tenant', async () => {
    const escrow = await createTestEscrow('pending_payment');
    await expect(escrowService.cancel(escrow.id, TEST_LID)).rejects.toThrow('Only the tenant');
  });

  it('should reject raiseDispute by non-tenant', async () => {
    const escrow = await createTestEscrow('docs_verified');
    await expect(
      escrowService.raiseDispute(escrow.id, TEST_LID, 'Not my dispute'),
    ).rejects.toThrow('Only the tenant');
  });

  it('should reject operations on non-existent escrow', async () => {
    await expect(
      escrowService.cancel('00000000-0000-0000-0000-000000009999', TEST_UID),
    ).rejects.toThrow(TRPCError);
  });

  it('should reject operations on deleted escrow', async () => {
    const escrow = await createTestEscrow('pending_payment', { isDeleted: true });
    await expect(escrowService.cancel(escrow.id, TEST_UID)).rejects.toThrow(TRPCError);
  });
});

describe('Escrow fee calculation', () => {
  it('should enforce minimum fee of NGN 5,000', () => {
    const { platformFeeKobo, landlordPayoutKobo } = calculateFees(10000000n);
    expect(platformFeeKobo).toBe(500000n);
    expect(landlordPayoutKobo).toBe(9500000n);
  });

  it('should calculate 1.5% when above minimum', () => {
    const { platformFeeKobo, landlordPayoutKobo } = calculateFees(5000000000n);
    expect(platformFeeKobo).toBe(75000000n);
    expect(landlordPayoutKobo).toBe(4925000000n);
  });

  it('should handle amounts below minimum fee', () => {
    const { platformFeeKobo } = calculateFees(100000n);
    expect(platformFeeKobo).toBe(500000n);
  });

  it('should handle very large amounts', () => {
    const { platformFeeKobo, landlordPayoutKobo } = calculateFees(10000000000n);
    expect(platformFeeKobo).toBe(150000000n);
    expect(landlordPayoutKobo).toBe(9850000000n);
  });
});

describe('Admin escrow operations from disputed state', () => {
  beforeAll(async () => {
    if (!escrowService) {
      const mod = await import('@/server/services/EscrowService');
      escrowService = mod.escrowService;
    }
    await createTestUser(TEST_UID, 'tenant');
    await createTestUser(TEST_LID, 'landlord');
    await createTestUser(TEST_AID, 'admin');
    await createTestProperty();
  });

  afterAll(async () => {
    await prisma.transactionLog.deleteMany({
      where: { escrow: { propertyId: TEST_PID } },
    });
    await prisma.escrowTransaction.deleteMany({
      where: { propertyId: TEST_PID },
    });
  });

  it('should release from disputed state via adminRelease', async () => {
    const escrow = await createTestEscrow('disputed');
    const result = await escrowService.adminRelease(escrow.id, TEST_AID);
    expect(result.status).toBe('completed');
  });

  it('should refund from disputed state via adminRefund', async () => {
    const escrow = await createTestEscrow('disputed');
    const result = await escrowService.adminRefund(escrow.id, TEST_AID);
    expect(result.status).toBe('refunded');
  });

  it('should reject adminRelease from invalid state', async () => {
    const escrow = await createTestEscrow('pending_payment');
    await expect(escrowService.adminRelease(escrow.id, TEST_AID)).rejects.toThrow(TRPCError);
  });
});

describe('Schema validation', () => {
  it('should validate initiate escrow input', async () => {
    const { initiateEscrowInput } = await import('@/server/schemas/escrow');
    const result = initiateEscrowInput.safeParse({
      propertyId: '00000000-0000-0000-0000-000000000001',
      amountKobo: 250000000n,
      rentMonthly: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', async () => {
    const { initiateEscrowInput } = await import('@/server/schemas/escrow');
    const result = initiateEscrowInput.safeParse({
      propertyId: '00000000-0000-0000-0000-000000000001',
      amountKobo: -100n,
    });
    expect(result.success).toBe(false);
  });

  it('should validate dispute reason length', async () => {
    const { raiseDisputeInput } = await import('@/server/schemas/escrow');
    const result = raiseDisputeInput.safeParse({
      escrowId: '00000000-0000-0000-0000-000000000001',
      reason: 'Short',
    });
    expect(result.success).toBe(false);
  });
});
