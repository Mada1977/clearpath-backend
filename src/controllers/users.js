const { getPrisma } = require('../models/prisma');
const logger = require('../utils/logger');

// ── GET /v1/users/me ─────────────────────────────────────────
async function getMe(req, res) {
  res.json({ user: req.user });
}

// ── PATCH /v1/users/me ───────────────────────────────────────
async function updateMe(req, res, next) {
  try {
    const { name, addictions, stage, dailyGoal, locale, role } = req.body;
    const prisma = getPrisma();

    // Pornography requires age verification before it can be added
    if (addictions && addictions.includes('pornography') && !req.user.ageVerified) {
      return res.status(403).json({
        error: 'Age verification required to add this addiction type.',
        code: 'AGE_VERIFICATION_REQUIRED',
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name        !== undefined && { name }),
        ...(addictions  !== undefined && { addictions }),
        ...(stage       !== undefined && { stage }),
        ...(dailyGoal   !== undefined && { dailyGoal }),
        ...(locale      !== undefined && { locale }),
        ...(role        !== undefined && { role }),
      },
      select: { id: true, email: true, name: true, role: true, addictions: true, stage: true, dailyGoal: true, isPremium: true, ageVerified: true, locale: true },
    });

    res.json({
      user: {
        ...updated,
        notificationPrivacy: updated.addictions.includes('pornography'),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /v1/users/me/verify-age ─────────────────────────────
async function verifyAge(req, res, next) {
  try {
    const { confirmed } = req.body;
    if (!confirmed) {
      return res.status(400).json({ error: 'You must confirm you are 18 or older.' });
    }

    const prisma = getPrisma();
    await prisma.user.update({
      where: { id: req.user.id },
      data: { ageVerified: true },
    });

    res.json({ message: 'Age verified. You can now add sensitive addiction types.' });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /v1/users/me ──────────────────────────────────────
async function deleteMe(req, res, next) {
  try {
    const prisma = getPrisma();
    // Cascades to logs and ai_messages via Prisma schema
    await prisma.user.delete({ where: { id: req.user.id } });
    logger.info(`User deleted (GDPR erasure): ${req.user.id}`);
    res.json({ message: 'Account and all associated data deleted permanently.' });
  } catch (err) {
    next(err);
  }
}

// ── GET /v1/users/me/stats ───────────────────────────────────
async function getStats(req, res, next) {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;

    // Today boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // This week boundaries
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [todayLogs, allLogs, recentLogs] = await Promise.all([
      prisma.log.findMany({
        where: { userId, loggedAt: { gte: todayStart, lte: todayEnd } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.log.findMany({ where: { userId }, select: { outcome: true, trigger: true, loggedAt: true } }),
      prisma.log.findMany({
        where: { userId, loggedAt: { gte: weekStart } },
        orderBy: { loggedAt: 'desc' },
      }),
    ]);

    // Streak calculation
    const streak = calculateStreak(allLogs);

    // Trigger breakdown
    const triggerCounts = {};
    allLogs.forEach(l => {
      if (l.trigger) triggerCounts[l.trigger] = (triggerCounts[l.trigger] || 0) + 1;
    });

    // Today summary
    const todayResisted = todayLogs.filter(l => l.outcome === 'resisted').length;
    const todayGaveIn   = todayLogs.filter(l => l.outcome === 'gave_in').length;

    // All-time totals
    const totalResisted = allLogs.filter(l => l.outcome === 'resisted').length;
    const totalGaveIn   = allLogs.filter(l => l.outcome === 'gave_in').length;

    res.json({
      streak,
      today: { resisted: todayResisted, gaveIn: todayGaveIn, logs: todayLogs },
      week: recentLogs,
      allTime: { resisted: totalResisted, gaveIn: totalGaveIn },
      triggerBreakdown: triggerCounts,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /v1/users/me/export ──────────────────────────────────
async function exportData(req, res, next) {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;

    const [user, logs, messages] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, addictions: true, stage: true, createdAt: true },
      }),
      prisma.log.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
      prisma.aiMessage.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      gdprNote: 'This export contains all personal data held about you under GDPR Article 20.',
      user,
      logs,
      aiMessages: messages,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function calculateStreak(logs) {
  if (!logs.length) return 0;

  // Group by calendar day — a day counts if at least one craving was resisted
  const days = {};
  logs.forEach(l => {
    const day = new Date(l.loggedAt).toDateString();
    if (!days[day]) days[day] = { resisted: 0, gaveIn: 0 };
    if (l.outcome === 'resisted') days[day].resisted++;
    if (l.outcome === 'gave_in')  days[day].gaveIn++;
  });

  // Count consecutive days back from today where resisted > 0
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    if (days[key] && days[key].resisted > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

module.exports = { getMe, updateMe, verifyAge, deleteMe, getStats, exportData };
