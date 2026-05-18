const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
        : ['warn', 'error'],
    });

    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        logger.debug(`Prisma query: ${e.query} (${e.duration}ms)`);
      });
    }
  }
  return prisma;
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

module.exports = { getPrisma, disconnectPrisma };
