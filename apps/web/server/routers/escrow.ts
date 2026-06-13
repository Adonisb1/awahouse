import { authedProcedure, tenantProcedure, landlordProcedure, adminProcedure, router } from '../trpc';
import {
  initiateEscrowInput,
  escrowIdInput,
  confirmHandoverInput,
  raiseDisputeInput,
  listEscrowsInput,
  adminReleaseInput,
  adminRefundInput,
  adminResolveDisputeInput,
} from '../schemas/escrow';
import { prisma } from '@awahouse/db';
import { escrowService } from '../services/EscrowService';
import { rentScoreService } from '../services/RentScoreService';
import { notificationService } from '../services/NotificationService';
import { notifyHandoverConfirmed, notifyDisputeRaised, notifyEscrowInitiated } from '../services/PaymentNotifications';

export const escrowRouter = router({
  initiate: tenantProcedure.input(initiateEscrowInput).mutation(async ({ ctx, input }) => {
    const result = await escrowService.initiate(
      ctx.userId!,
      input.propertyId,
      input.amountKobo,
      input.rentMonthly,
      input.callbackUrl,
    );

    await notifyEscrowInitiated(result.escrow.id);

    return {
      success: true,
      escrowId: result.escrow.id,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    };
  }),

  getById: authedProcedure.input(escrowIdInput).query(async ({ ctx, input }) => {
    return escrowService.getById(input.id, ctx.userId!);
  }),

  list: authedProcedure.input(listEscrowsInput).query(async ({ ctx, input }) => {
    return escrowService.list(ctx.userId!, input.status, input.page, input.limit);
  }),

  confirmHandover: tenantProcedure.input(confirmHandoverInput).mutation(async ({ ctx, input }) => {
    const escrow = await escrowService.confirmHandover(input.escrowId, ctx.userId!);

    await rentScoreService.recordEvent(ctx.userId!, 'escrow_completed', input.escrowId);

    await notifyHandoverConfirmed(input.escrowId);

    if (escrow.rentMonthly) {
      await rentScoreService.scheduleInstalments(input.escrowId, new Date(), escrow.amountKobo);
      await notificationService.sendInApp(
        ctx.userId!,
        'Instalment Plan Created',
        'Your 12-month instalment plan is ready. First payment due in 30 days.',
        '/rent-instalments',
      );
    }

    return {
      success: true,
      showReviewPrompt: true,
      propertyId: escrow.propertyId,
      landlordId: escrow.landlordId,
    };
  }),

  raiseDispute: tenantProcedure.input(raiseDisputeInput).mutation(async ({ ctx, input }) => {
    await escrowService.raiseDispute(input.escrowId, ctx.userId!, input.reason);
    await rentScoreService.recordEvent(ctx.userId!, 'dispute_raised', input.escrowId);
    await notifyDisputeRaised(input.escrowId, input.reason);
    return { success: true };
  }),

  cancel: authedProcedure.input(escrowIdInput).mutation(async ({ ctx, input }) => {
    await escrowService.cancel(input.id, ctx.userId!);
    return { success: true };
  }),

  getLandlordTenants: landlordProcedure.query(async ({ ctx }) => {
    const escrows = await prisma.escrowTransaction.findMany({
      where: { landlordId: ctx.userId!, isDeleted: false },
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tenantMap = new Map<string, {
      tenant: typeof escrows[0]['tenant'];
      properties: { id: string; title: string; escrowId: string; status: string }[];
      lastActivity: Date;
    }>();

    for (const e of escrows) {
      const existing = tenantMap.get(e.tenantId);
      if (existing) {
        existing.properties.push({ id: e.property.id, title: e.property.title, escrowId: e.id, status: e.status });
        if (e.createdAt > existing.lastActivity) existing.lastActivity = e.createdAt;
      } else {
        tenantMap.set(e.tenantId, {
          tenant: e.tenant,
          properties: [{ id: e.property.id, title: e.property.title, escrowId: e.id, status: e.status }],
          lastActivity: e.createdAt,
        });
      }
    }

    return Array.from(tenantMap.values()).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }),

  adminRelease: adminProcedure.input(adminReleaseInput).mutation(async ({ ctx, input }) => {
    await escrowService.adminRelease(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  adminRefund: adminProcedure.input(adminRefundInput).mutation(async ({ ctx, input }) => {
    await escrowService.adminRefund(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  adminResolveDispute: adminProcedure.input(adminResolveDisputeInput).mutation(async ({ ctx, input }) => {
    if (input.outcome === 'completed') {
      await escrowService.adminRelease(input.escrowId, ctx.userId!);
    } else {
      await escrowService.adminRefund(input.escrowId, ctx.userId!);
    }
    return { success: true, outcome: input.outcome };
  }),
});
