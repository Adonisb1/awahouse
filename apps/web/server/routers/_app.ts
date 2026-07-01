import { router } from '../trpc';
import { authRouter } from './auth';
import { verificationRouter } from './verification';
import { propertiesRouter } from './properties';
import { reviewsRouter } from './reviews';
import { escrowRouter } from './escrow';
import { adminRouter } from './admin';
import { notificationRouter } from './notifications';
import { rentInstalmentsRouter } from './rentInstalments';
import { rentScoreRouter } from './rentScore';
import { agentRouter } from './agent';
import { paymentsRouter } from './payments';

export const appRouter = router({
  auth: authRouter,
  verification: verificationRouter,
  properties: propertiesRouter,
  reviews: reviewsRouter,
  escrow: escrowRouter,
  admin: adminRouter,
  agent: agentRouter,
  notifications: notificationRouter,
  rentInstalments: rentInstalmentsRouter,
  rentScore: rentScoreRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
