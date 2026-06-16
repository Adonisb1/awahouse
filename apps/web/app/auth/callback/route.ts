import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@awahouse/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = (searchParams.get('role') ?? 'tenant') as 'tenant' | 'landlord' | 'agent';

  if (!code) {
    return NextResponse.redirect(`${origin}/role?error=no_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/signup?error=supabase_not_configured`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      setAll() {},
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/signup?error=auth_failed`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(`${origin}/signup?error=no_email`);
  }

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.given_name as string | undefined,
        lastName: user.user_metadata?.family_name as string | undefined,
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
        roles: [role],
        activeRole: role,
      },
    });
  }

  return NextResponse.redirect(`${origin}/auth/complete`);
}
