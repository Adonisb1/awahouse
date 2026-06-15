import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase env vars not set — skipping Supabase Auth user creation');
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function main() {
  const adminEmail = 'admin@awahouse.ng';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        role: 'admin',
        firstName: 'Awa',
        lastName: 'Admin',
        rentScore: 500,
      },
    });

    const supabase = createSupabaseAdmin();
    if (supabase) {
      const password = crypto.randomUUID().slice(0, 12) + '!';
      const { error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password,
        email_confirm: true,
      });
      if (error) {
        console.error('Failed to create Supabase Auth admin:', error.message);
      } else {
        console.log('Supabase Auth admin user created');
        console.log('──────────────────────────────────────');
        console.log(`  Email:    ${adminEmail}`);
        console.log(`  Password: ${password}`);
        console.log('──────────────────────────────────────');
      }
    }

    console.log('Admin user created: admin@awahouse.ng');
  } else {
    console.log('Admin user already exists');
  }

  const users = await prisma.user.findMany({ take: 1 });
  if (users[0]) {
    const existingVerifications = await prisma.verification.count({
      where: { userId: users[0].id },
    });
    if (existingVerifications === 0) {
      await prisma.verification.create({
        data: {
          userId: users[0].id,
          type: 'nin',
          status: 'approved',
          metadata: { note: 'Seed data — admin auto-approved' },
        },
      });
      console.log('Admin NIN verification created');
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
