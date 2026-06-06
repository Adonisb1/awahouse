import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createServerClient } from '@supabase/ssr';
import type { Context } from './trpc';

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<Context> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { userId: null, role: null, req: opts.req };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookieHeader = opts.req.headers.get('cookie') ?? '';
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const role = (user?.user_metadata?.role as Context['role']) ?? null;

  return { userId, role, req: opts.req };
}
