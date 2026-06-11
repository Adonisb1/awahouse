import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { Role } from '@awahouse/types';

export type Context = {
  userId: string | null;
  roles: Role[];
  activeRole: Role | null;
  req: Request;
};

function createRateLimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('[rate-limit] UPSTASH_REDIS_REST_URL not set — rate limiting disabled');
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  });
}

const rateLimiter = createRateLimiter();

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId, roles: ctx.roles, activeRole: ctx.activeRole } });
});

const requireActiveRole = (allowedRoles: Role[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.activeRole || !allowedRoles.includes(ctx.activeRole)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    return next({ ctx: { ...ctx, activeRole: ctx.activeRole } });
  });

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  if (rateLimiter) {
    const ip = ctx.req.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await rateLimiter.limit(ip);
    if (!success) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
    }
  }
  return next({ ctx });
});

export const publicProcedure = t.procedure.use(rateLimitMiddleware);
export const authedProcedure = t.procedure.use(authMiddleware);
export const tenantProcedure = t.procedure.use(authMiddleware).use(requireActiveRole(['tenant']));
export const landlordProcedure = t.procedure.use(authMiddleware).use(requireActiveRole(['landlord']));
export const agentProcedure = t.procedure.use(authMiddleware).use(requireActiveRole(['agent']));
export const adminProcedure = t.procedure.use(authMiddleware).use(requireActiveRole(['admin']));
export const listingCreatorProcedure = t.procedure.use(authMiddleware).use(requireActiveRole(['landlord', 'agent']));

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
