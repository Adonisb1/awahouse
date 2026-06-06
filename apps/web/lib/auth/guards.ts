import { TRPCError } from '@trpc/server';
import type { Role } from '@awahouse/types';

export type GuardContext = {
  userId: string | null;
  role: Role | null;
};

export function requireAuth(ctx: GuardContext): asserts ctx is GuardContext & { userId: string } {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
}

export function requireRole(ctx: GuardContext, role: Role): asserts ctx is GuardContext & { role: Role } {
  requireAuth(ctx);
  if (ctx.role !== role) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You need the "${role}" role to perform this action`,
    });
  }
}

export function requireAdmin(ctx: GuardContext): void {
  requireRole(ctx, 'admin');
}

export function requireAnyRole(ctx: GuardContext, roles: Role[]): asserts ctx is GuardContext & { role: Role } {
  requireAuth(ctx);
  if (!ctx.role || !roles.includes(ctx.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You need one of these roles: ${roles.join(', ')}`,
    });
  }
}
