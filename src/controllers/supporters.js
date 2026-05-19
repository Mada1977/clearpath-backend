const crypto = require('crypto');
const { getPrisma } = require('../models/prisma');
const logger = require('../utils/logger');

function generateCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// POST /v1/supporters/invite
async function invite(req, res, next) {
  try {
    const { supporterEmail, shareStreak = true, shareMood = false } = req.body;
    if (!supporterEmail) {
      return res.status(400).json({ error: 'supporterEmail is required.' });
    }

    const prisma = getPrisma();

    // Revoke any existing pending/active link for this email
    await prisma.supporterLink.updateMany({
      where: { userId: req.user.id, supporterEmail, status: { in: ['pending', 'active'] } },
      data: { status: 'revoked' },
    });

    const inviteCode = generateCode();
    const link = await prisma.supporterLink.create({
      data: { userId: req.user.id, supporterEmail, inviteCode, shareStreak, shareMood },
    });

    logger.info(`Supporter invite created: ${inviteCode} for user ${req.user.id}`);
    res.status(201).json({ inviteCode: link.inviteCode, supporterEmail });
  } catch (err) {
    next(err);
  }
}

// GET /v1/supporters/mine
async function listMine(req, res, next) {
  try {
    const prisma = getPrisma();
    const supporters = await prisma.supporterLink.findMany({
      where: { userId: req.user.id, status: { not: 'revoked' } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ supporters });
  } catch (err) {
    next(err);
  }
}

// PATCH /v1/supporters/:id — update shareStreak / shareMood toggles
async function updateLink(req, res, next) {
  try {
    const prisma = getPrisma();
    const link = await prisma.supporterLink.findUnique({ where: { id: req.params.id } });
    if (!link || link.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found.' });
    }
    const { shareStreak, shareMood } = req.body;
    const updated = await prisma.supporterLink.update({
      where: { id: req.params.id },
      data: {
        ...(shareStreak !== undefined && { shareStreak }),
        ...(shareMood   !== undefined && { shareMood }),
      },
    });
    res.json({ supporter: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /v1/supporters/:id — revoke
async function revoke(req, res, next) {
  try {
    const prisma = getPrisma();
    const link = await prisma.supporterLink.findUnique({ where: { id: req.params.id } });
    if (!link || link.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found.' });
    }
    await prisma.supporterLink.update({ where: { id: req.params.id }, data: { status: 'revoked' } });
    res.json({ message: 'Access revoked.' });
  } catch (err) {
    next(err);
  }
}

// GET /v1/supporters/accept/:code — no auth required
async function acceptInvite(req, res, next) {
  try {
    const prisma = getPrisma();
    const link = await prisma.supporterLink.findUnique({ where: { inviteCode: req.params.code } });
    if (!link || link.status === 'revoked') {
      return res.status(404).json({ error: 'Invite code not found or expired.' });
    }
    if (link.status === 'active') {
      return res.json({ message: 'Already active.', inviteCode: link.inviteCode });
    }
    await prisma.supporterLink.update({ where: { id: link.id }, data: { status: 'active' } });
    res.json({ message: 'Invite accepted.', inviteCode: link.inviteCode });
  } catch (err) {
    next(err);
  }
}

// GET /v1/supporters/dashboard/:code — no auth required, code-based access
async function dashboard(req, res, next) {
  try {
    const prisma = getPrisma();
    const link = await prisma.supporterLink.findUnique({
      where: { inviteCode: req.params.code },
      include: { user: { select: { id: true, name: true, locale: true } } },
    });

    if (!link || link.status !== 'active') {
      return res.status(403).json({ error: 'Invalid or inactive invite code.' });
    }

    const userId = link.userId;
    const now = new Date();
    const h24 = new Date(now - 86400000);
    const weekAgo = new Date(now - 7 * 86400000);

    const allLogs = await prisma.log.findMany({
      where: { userId },
      select: { outcome: true, mood: true, loggedAt: true },
      orderBy: { loggedAt: 'desc' },
    });

    const streak = calculateStreak(allLogs);

    // Last mood entry
    const lastMoodLog = allLogs.find(l => l.mood !== null);
    const mood = lastMoodLog?.mood ?? null;

    const data = {
      name: link.user.name,
      ...(link.shareStreak && { streak }),
      ...(link.shareMood   && { mood }),
    };

    res.json({ data, shareStreak: link.shareStreak, shareMood: link.shareMood });
  } catch (err) {
    next(err);
  }
}

function calculateStreak(logs) {
  if (!logs.length) return 0;
  const days = {};
  logs.forEach(l => {
    const day = new Date(l.loggedAt).toDateString();
    if (!days[day]) days[day] = { resisted: 0 };
    if (l.outcome === 'resisted') days[day].resisted++;
  });
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    if (days[key]?.resisted > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

module.exports = { invite, listMine, updateLink, revoke, acceptInvite, dashboard };
