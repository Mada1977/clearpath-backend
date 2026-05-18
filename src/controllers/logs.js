const { getPrisma } = require('../models/prisma');
const { getSosSteps } = require('../utils/sos');

// ── POST /v1/logs ────────────────────────────────────────────
async function createLog(req, res, next) {
  try {
    const { type, addiction, trigger, intensity, mood, outcome, notes, loggedAt } = req.body;
    const prisma = getPrisma();

    const log = await prisma.log.create({
      data: {
        userId:    req.user.id,
        type,
        addiction: addiction || (req.user.addictions[0] || 'smoking'),
        trigger:   trigger || 'unknown',
        intensity: intensity ? parseInt(intensity) : null,
        mood:      mood || null,
        outcome:   outcome || null,
        notes:     notes || null,
        loggedAt:  loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    const response = { log };
    if (type === 'craving_sos') {
      response.sos = getSosSteps(log.addiction, req.user.locale);
    }
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// ── GET /v1/logs ─────────────────────────────────────────────
async function getLogs(req, res, next) {
  try {
    const { from, to, type, addiction, limit = '50', offset = '0' } = req.query;
    const prisma = getPrisma();

    const where = { userId: req.user.id };
    if (from || to) {
      where.loggedAt = {};
      if (from) where.loggedAt.gte = new Date(from);
      if (to)   where.loggedAt.lte = new Date(to);
    }
    if (type)      where.type = type;
    if (addiction) where.addiction = addiction;

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        take: Math.min(parseInt(limit), 200),
        skip: parseInt(offset),
      }),
      prisma.log.count({ where }),
    ]);

    res.json({ logs, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    next(err);
  }
}

// ── GET /v1/logs/today ───────────────────────────────────────
async function getTodayLogs(req, res, next) {
  try {
    const prisma = getPrisma();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const logs = await prisma.log.findMany({
      where: { userId: req.user.id, loggedAt: { gte: start, lte: end } },
      orderBy: { loggedAt: 'desc' },
    });

    const resisted = logs.filter(l => l.outcome === 'resisted').length;
    const gaveIn   = logs.filter(l => l.outcome === 'gave_in').length;

    res.json({ logs, summary: { resisted, gaveIn, total: logs.length } });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /v1/logs/:id ──────────────────────────────────────
async function deleteLog(req, res, next) {
  try {
    const prisma = getPrisma();
    const log = await prisma.log.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!log) return res.status(404).json({ error: 'Log not found' });

    await prisma.log.delete({ where: { id: req.params.id } });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createLog, getLogs, getTodayLogs, deleteLog };
