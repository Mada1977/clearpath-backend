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
        ageVerified: true,
        locale: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // notificationPrivacy instructs the frontend to use generic push notification
    // titles (no addiction name) when the user is recovering from pornography.
    const { rtl } = getLocaleInfo(user.locale);
    req.user = {
      ...user,
      notificationPrivacy: user.addictions.includes('pornography'),
      rtl,
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
