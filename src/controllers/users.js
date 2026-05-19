const { getPrisma } = require('../models/prisma');
const logger = require('../utils/logger');

// ── GET /v1/users/me ─────────────────────────────────────────
async function getMe(req, res) {
  const prisma = getPrisma();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const aiMessagesUsedToday = await prisma.aiMessage.count({
    where: { userId: req.user.id, role: 'user', createdAt: { gte: start } },
  });
  res.json({ user: { ...req.user, aiMessagesUsedToday } });
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

// ── GET /v1/users/me/stability-score ────────────────────────
async function getStabilityScore(req, res, next) {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;

    const now   = new Date();
    const h24   = new Date(now - 86400000);

    const [recentLogs, allLogs] = await Promise.all([
      prisma.log.findMany({
        where: { userId, loggedAt: { gte: h24 } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.log.findMany({
        where: { userId },
        select: { outcome: true, loggedAt: true },
      }),
    ]);

    let score = 100;

    // Deductions for missing check-ins
    const streak = calculateStreak(allLogs);
    if (recentLogs.length === 0) {
      score -= 20;
      // Extra -10 per consecutive silent day, capped at -30 total deduction
      const daysSinceLastLog = allLogs.length
        ? Math.floor((now - new Date(allLogs[0].loggedAt)) / 86400000)
        : 7;
      score -= Math.min((daysSinceLastLog - 1) * 10, 10);
    }

    // Mood deductions — map 'rough' to "low mood"
    const moodLogs = recentLogs.filter(l => l.outcome !== null);
    const lastTwo  = moodLogs.slice(0, 2);
    const roughCount = lastTwo.filter(l => l.outcome === 'gave_in').length;
    if (roughCount >= 2) score -= 15;
    else if (roughCount >= 1) score -= 10;

    // Streak bonuses
    if (streak > 30) score += 10;
    else if (streak > 7) score += 5;

    score = Math.max(0, Math.min(100, score));

    const label =
      score >= 70 ? "You're doing well"
      : score >= 40 ? 'Stay mindful today'
      : 'High risk — reach out';

    res.json({ score, streak, label });
  } catch (err) { next(err); }
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

// ── PATCH /v1/users/me/push-token ───────────────────────────
async function updatePushToken(req, res, next) {
  try {
    const { expoPushToken } = req.body;
    const prisma = getPrisma();
    await prisma.user.update({
      where: { id: req.user.id },
      data: { expoPushToken: expoPushToken || null },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ── PATCH /v1/users/me/active ────────────────────────────────
async function updateActive(req, res, next) {
  try {
    const prisma = getPrisma();
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastActiveAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ── POST /v1/users/me/start-trial ───────────────────────────
async function startTrial(req, res, next) {
  try {
    if (req.user.isPremium) {
      return res.status(400).json({ error: 'Already premium.' });
    }
    if (req.user.trialStartedAt) {
      return res.status(400).json({ error: 'Free trial already used.' });
    }
    const prisma = getPrisma();
    const trialEnd = new Date(Date.now() + 7 * 86400000);
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isPremium: true,
        premiumPlan: 'trial',
        trialStartedAt: new Date(),
        premiumExpiresAt: trialEnd,
      },
      select: { isPremium: true, premiumPlan: true, premiumExpiresAt: true, trialStartedAt: true },
    });
    res.json({ message: '7-day free trial started!', ...updated });
  } catch (err) { next(err); }
}

// ── POST /v1/users/me/upgrade ───────────────────────────────
async function upgrade(req, res, next) {
  try {
    const { plan } = req.body;
    if (!['weekly', 'monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Use: weekly, monthly, yearly.' });
    }
    const durations = { weekly: 7, monthly: 30, yearly: 365 };
    const days = durations[plan];
    const now = new Date();
    // Extend from current expiry if already premium, otherwise from now
    const base = req.user.isPremium && req.user.premiumExpiresAt && new Date(req.user.premiumExpiresAt) > now
      ? new Date(req.user.premiumExpiresAt)
      : now;
    const expiresAt = new Date(base.getTime() + days * 86400000);

    const prisma = getPrisma();
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { isPremium: true, premiumPlan: plan, premiumExpiresAt: expiresAt },
      select: { isPremium: true, premiumPlan: true, premiumExpiresAt: true },
    });
    res.json({ message: `Upgraded to ${plan} plan!`, ...updated });
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, verifyAge, deleteMe, getStats, getStabilityScore, updatePushToken, updateActive, exportData, startTrial, upgrade };
