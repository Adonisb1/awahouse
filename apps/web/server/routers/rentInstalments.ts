import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@awahouse/db';
import { authedProcedure, tenantProcedure, landlordProcedure, router } from '../trpc';
import { listInstalmentsInput, payInstalmentInput } from '../schemas/rent';
import { rentScoreService } from '../services/RentScoreService';
import { notificationService } from '../services/NotificationService';

export const rentInstalmentsRouter = router({
  list: authedProcedure.input(listInstalmentsInput).query(async ({ ctx, input }) => {
    return rentScoreService.getInstalments(
      ctx.userId!,
      input.escrowId,
      input.status,
      input.page,
      input.limit,
    );
  }),

  pay: tenantProcedure.input(payInstalmentInput).mutation(async ({ ctx, input }) => {
    return rentScoreService.payInstalment(input.instalmentId, ctx.userId!);
  }),

  getSchedule: authedProcedure
    .input(z.object({ escrowId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return rentScoreService.getSchedule(input.escrowId);
    }),

  sendInstalmentReminders: landlordProcedure
    .input(z.object({ escrowId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const escrow = await prisma.escrowTransaction.findUnique({
        where: { id: input.escrowId },
      });
      if (!escrow) throw new TRPCError({ code: 'NOT_FOUND' });
      if (escrow.landlordId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' });

      const overdue = await prisma.rentInstalment.findMany({
        where: { escrowId: input.escrowId, status: 'overdue' },
      });

      for (const inst of overdue) {
        await notificationService.sendInApp(
          escrow.tenantId,
          'Payment Reminder',
          `Your instalment #${inst.instalmentNumber} of ₦${(Number(inst.amountKobo) / 100).toLocaleString()} is overdue. Please pay to avoid penalties.`,
          '/rent-instalments',
        );
      }

      return { success: true, remindersSent: overdue.length };
    }),
});
