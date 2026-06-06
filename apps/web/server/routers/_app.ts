import { router } from '../trpc';
import { authRouter } from './auth';
import { verificationRouter } from './verification';

export const appRouter = router({
  auth: authRouter,
  verification: verificationRouter,
});

export type AppRouter = typeof appRouter;
