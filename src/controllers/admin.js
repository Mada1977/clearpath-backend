const { getPrisma } = require('../models/prisma');

async function listUsers(req, res, next) {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        lastActiveAt: true,
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers };
