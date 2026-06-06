import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { Role } from '@awahouse/types';

export type Context = {
  userId: string | null;
  role: Role | null;
  req: Request;
};

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId, role: ctx.role } });
});

const requireRole = (allowedRoles: Role[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.role || !allowedRoles.includes(ctx.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    return next({ ctx: { ...ctx, role: ctx.role } });
  });

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await rateLimiter.limit(ip);
  if (!success) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
  }
  return next({ ctx });
});

export const publicProcedure = t.procedure.use(rateLimitMiddleware);
export const authedProcedure = t.procedure.use(authMiddleware);
export const tenantProcedure = t.procedure.use(authMiddleware).use(requireRole(['tenant']));
export const landlordProcedure = t.procedure.use(authMiddleware).use(requireRole(['landlord']));
export const agentProcedure = t.procedure.use(authMiddleware).use(requireRole(['agent']));
export const adminProcedure = t.procedure.use(authMiddleware).use(requireRole(['admin']));
export const listingCreatorProcedure = t.procedure.use(authMiddleware).use(requireRole(['landlord', 'agent']));

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
