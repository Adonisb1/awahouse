import { TRPCError } from '@trpc/server';
import type { Role } from '@awahouse/types';

export type GuardContext = {
  userId: string | null;
  roles: Role[];
  activeRole: Role | null;
};

export function requireAuth(ctx: GuardContext): asserts ctx is GuardContext & { userId: string } {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
}

export function requireActiveRole(ctx: GuardContext, role: Role): asserts ctx is GuardContext & { activeRole: Role } {
  requireAuth(ctx);
  if (ctx.activeRole !== role) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You need the "${role}" role to perform this action`,
    });
  }
}

export function requireAdmin(ctx: GuardContext): void {
  requireActiveRole(ctx, 'admin');
}

export function requireAnyRole(ctx: GuardContext, roles: Role[]): asserts ctx is GuardContext & { activeRole: Role } {
  requireAuth(ctx);
  if (!ctx.activeRole || !roles.includes(ctx.activeRole)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You need one of these roles: ${roles.join(', ')}`,
    });
  }
}
