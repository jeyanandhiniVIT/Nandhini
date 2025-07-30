// backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client'; // We only need the client
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'ADMIN', // <-- Use the string directly
      firstName: 'Admin',
      lastName: 'User',
      joinDate: new Date(),
    },
  });

  console.log(`Created admin user: ${admin.email} with password: password123`);
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });