import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
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
    console.log('Admin user created: admin@awahouse.ng');
  } else {
    console.log('Admin user already exists');
  }

  // Seed verification entries for reference
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
