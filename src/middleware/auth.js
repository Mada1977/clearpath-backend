const { verifyAccess } = require('../utils/jwt');
const { getPrisma } = require('../models/prisma');
const { getLocaleInfo } = require('../utils/i18n');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const payload = verifyAccess(token);

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        addictions: true,
        stage: true,
        dailyGoal: true,
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
        trialStartedAt: true,
        ageVerified: true,
        locale: true,
      },
    });

    // Auto-expire premium/trial
    if (user && user.isPremium && user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: false, premiumPlan: null },
      });
      user.isPremium = false;
      user.premiumPlan = null;
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // notificationPrivacy instructs the frontend to use generic push notification
    // titles (no addiction name) when the user is recovering from pornography.
    const { rtl } = getLocaleInfo(user.locale);
    const trialDaysLeft = user.trialStartedAt
      ? Math.max(0, 3 - Math.floor((Date.now() - new Date(user.trialStartedAt).getTime()) / 86400000))
      : null;

    req.user = {
      ...user,
      notificationPrivacy: user.addictions.includes('pornography'),
      rtl,
      trialDaysLeft,
      isOnTrial: !!user.trialStartedAt && trialDaysLeft > 0 && user.isPremium,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
