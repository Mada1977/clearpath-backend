// prisma/seed.js — creates a test user for development
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@clearpath.app' },
    update: {},
    create: {
      email:      'test@clearpath.app',
      password:   hash,
      name:       'Test User',
      role:       'self',
      addictions: ['smoking', 'alcohol'],
      stage:      'cutting',
      dailyGoal:  5,
      locale:     'fr-FR',
    },
  });

  console.log('Seed user created:', user.email, '/ password: password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
