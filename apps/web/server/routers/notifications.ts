import { z } from 'zod';
import { authedProcedure, router } from '../trpc';
import { notificationService } from '../services/NotificationService';

export const notificationRouter = router({
  list: authedProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      return notificationService.listNotifications(ctx.userId!, input.page, input.limit);
    }),

  markRead: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await notificationService.markRead(input.id, ctx.userId!);
      return { success: true };
    }),

  markAllRead: authedProcedure.mutation(async ({ ctx }) => {
    await notificationService.markAllRead(ctx.userId!);
    return { success: true };
  }),

  unreadCount: authedProcedure.query(async ({ ctx }) => {
    const count = await notificationService.getUnreadCount(ctx.userId!);
    return { count };
  }),
});
