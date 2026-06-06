import { router } from '../trpc';
import { authRouter } from './auth';
import { verificationRouter } from './verification';
import { propertiesRouter } from './properties';
import { reviewsRouter } from './reviews';

export const appRouter = router({
  auth: authRouter,
  verification: verificationRouter,
  properties: propertiesRouter,
  reviews: reviewsRouter,
});

export type AppRouter = typeof appRouter;
