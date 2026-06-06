import { router } from '../trpc';
import { authRouter } from './auth';
import { verificationRouter } from './verification';
import { propertiesRouter } from './properties';
import { reviewsRouter } from './reviews';
import { escrowRouter } from './escrow';
import { adminRouter } from './admin';
import { notificationRouter } from './notifications';

export const appRouter = router({
  auth: authRouter,
  verification: verificationRouter,
  properties: propertiesRouter,
  reviews: reviewsRouter,
  escrow: escrowRouter,
  admin: adminRouter,
  notifications: notificationRouter,
});

export type AppRouter = typeof appRouter;
