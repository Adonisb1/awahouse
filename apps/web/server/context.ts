import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@awahouse/db';
import type { Context } from './trpc';
import type { Role } from '@awahouse/types';

async function resolveFromSupabase(req: Request): Promise<{ userId: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieHeader = req.headers.get('cookie') ?? '';
        return cookieHeader.split(';').reduce<{ name: string; value: string }[]>((acc, pair) => {
          const [name, ...rest] = pair.trim().split('=');
          if (name && rest.length) {
            acc.push({ name, value: rest.join('=') });
          }
          return acc;
        }, []);
      },
      setAll() {},
    },
  });

  const { data } = await supabase.auth.getUser();
  return data.user?.id ? { userId: data.user.id } : null;
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<Context> {
  const headers = opts.req.headers;

  // 1. Try Supabase session cookie (production)
  const supabaseResult = await resolveFromSupabase(opts.req);
  if (supabaseResult?.userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: supabaseResult.userId },
      select: { roles: true, activeRole: true },
    });
    return {
      userId: supabaseResult.userId,
      roles: dbUser?.roles ?? [],
      activeRole: dbUser?.activeRole ?? null,
      req: opts.req,
    };
  }

  // 2. Fallback: custom headers from localStorage (dev)
  const headerUserId = headers.get('x-user-id');
  if (headerUserId) {
    const headerRoles = headers.get('x-user-roles');
    const headerActiveRole = headers.get('x-user-active-role');
    const roles: Role[] = headerRoles
      ? (headerRoles.split(',').filter(Boolean) as Role[])
      : [];
    const activeRole = (headerActiveRole as Role) ?? (roles[0] as Role) ?? null;
    return { userId: headerUserId, roles, activeRole, req: opts.req };
  }

  return { userId: null, roles: [], activeRole: null, req: opts.req };
}
