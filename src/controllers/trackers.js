const { getPrisma } = require('../models/prisma');

const VALID_CATEGORIES = [
  'smoking','alcohol','drugs','gambling',
  'pornography','gaming','social_media','shopping',
];

// GET /v1/trackers
async function list(req, res, next) {
  try {
    const prisma = getPrisma();
    const trackers = await prisma.addictionTracker.findMany({
      where: { userId: req.user.id, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ trackers: trackers.map(t => withDaysSober(t)) });
  } catch (err) { next(err); }
}

// POST /v1/trackers
async function create(req, res, next) {
  try {
    const { category, name, startDate, notes } = req.body;
    const prisma = getPrisma();
    const tracker = await prisma.addictionTracker.create({
      data: {
        userId:    req.user.id,
        category,
        name:      name || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        notes:     notes || null,
      },
    });
    res.status(201).json(withDaysSober(tracker));
  } catch (err) { next(err); }
}

// PATCH /v1/trackers/:id
async function update(req, res, next) {
  try {
    const prisma = getPrisma();
    const existing = await prisma.addictionTracker.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Tracker not found' });

    const { name, notes, startDate, isPaused } = req.body;
    const data = {};
    if (name      !== undefined) data.name      = name;
    if (notes     !== undefined) data.notes     = notes;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (isPaused  !== undefined) {
      data.isPaused = isPaused;
      data.pausedAt = isPaused ? new Date() : null;
    }

    const tracker = await prisma.addictionTracker.update({
      where: { id: req.params.id },
      data,
    });
    res.json(withDaysSober(tracker));
  } catch (err) { next(err); }
}

// DELETE /v1/trackers/:id — soft delete (archive)
async function remove(req, res, next) {
  try {
    const prisma = getPrisma();
    const existing = await prisma.addictionTracker.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Tracker not found' });

    await prisma.addictionTracker.update({
      where: { id: req.params.id },
      data:  { isActive: false },
    });
    res.status(204).end();
  } catch (err) { next(err); }
}

function withDaysSober(tracker) {
  const start = new Date(tracker.startDate);
  const now   = tracker.isPaused && tracker.pausedAt
    ? new Date(tracker.pausedAt)
    : new Date();
  const daysSober = Math.max(0, Math.floor((now - start) / 86400000));
  return { ...tracker, daysSober };
}

module.exports = { list, create, update, remove };
