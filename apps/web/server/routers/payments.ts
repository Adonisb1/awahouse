import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, authedProcedure } from '../trpc';
import { prisma } from '@awahouse/db';

export const paymentsRouter = router({
  listCards: authedProcedure.query(async ({ ctx }) => {
    return prisma.savedCard.findMany({
      where: { userId: ctx.userId! },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }),

  addCard: authedProcedure
    .input(z.object({
      authorizationCode: z.string(),
      last4: z.string().length(4),
      expMonth: z.number().int().min(1).max(12),
      expYear: z.number().int().min(2024),
      brand: z.string(),
      bank: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.savedCard.findUnique({
        where: {
          userId_authorizationCode: {
            userId: ctx.userId!,
            authorizationCode: input.authorizationCode,
          },
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'This card is already saved.' });
      }

      const cardCount = await prisma.savedCard.count({ where: { userId: ctx.userId! } });

      const card = await prisma.savedCard.create({
        data: {
          userId: ctx.userId!,
          authorizationCode: input.authorizationCode,
          last4: input.last4,
          expMonth: input.expMonth,
          expYear: input.expYear,
          brand: input.brand,
          bank: input.bank,
          isDefault: cardCount === 0,
        },
      });

      return { success: true, card };
    }),

  removeCard: authedProcedure
    .input(z.object({ cardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const card = await prisma.savedCard.findFirst({
        where: { id: input.cardId, userId: ctx.userId! },
      });

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' });
      }

      await prisma.savedCard.delete({ where: { id: input.cardId } });

      if (card.isDefault) {
        const nextCard = await prisma.savedCard.findFirst({
          where: { userId: ctx.userId! },
          orderBy: { createdAt: 'desc' },
        });
        if (nextCard) {
          await prisma.savedCard.update({
            where: { id: nextCard.id },
            data: { isDefault: true },
          });
        }
      }

      return { success: true };
    }),

  setDefault: authedProcedure
    .input(z.object({ cardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const card = await prisma.savedCard.findFirst({
        where: { id: input.cardId, userId: ctx.userId! },
      });

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' });
      }

      await prisma.savedCard.updateMany({
        where: { userId: ctx.userId! },
        data: { isDefault: false },
      });

      await prisma.savedCard.update({
        where: { id: input.cardId },
        data: { isDefault: true },
      });

      return { success: true };
    }),
});
