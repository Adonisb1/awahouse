import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createServerClient } from '@supabase/ssr';
import { type Context } from './trpc';

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<Context> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const role = (user?.user_metadata?.role as Context['role']) ?? null;

  return {
    userId,
    role,
    req: opts.req,
  };
}
