const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getPrisma } = require('../models/prisma');
const { tokenPair, verifyRefresh } = require('../utils/jwt');
const logger = require('../utils/logger');
const mailer = require('../utils/email');

// ── POST /v1/auth/register ───────────────────────────────────
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const prisma = getPrisma();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, name },
      select: { id: true, email: true, name: true, role: true, addictions: true, stage: true, dailyGoal: true, isPremium: true, locale: true },
    });

    const tokens = tokenPair(user.id);
    logger.info(`New user registered: ${user.id}`);
    mailer.sendWelcome(user.email, user.name, user.locale).catch(err => logger.error('Welcome email failed:', err));
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

// ── POST /v1/auth/login ──────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _pw, resetToken: _rt, resetExpiry: _re, ...safeUser } = user;
    const tokens = tokenPair(user.id);
    res.json({ user: safeUser, ...tokens });
  } catch (err) {
    next(err);
  }
}

// ── POST /v1/auth/refresh ────────────────────────────────────
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const payload = verifyRefresh(refreshToken);
    const tokens = tokenPair(payload.sub);
    res.json(tokens);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

// ── POST /v1/auth/logout ─────────────────────────────────────
async function logout(req, res) {
  // Client deletes tokens from secure storage.
  // In a future version, maintain a token blocklist in Redis.
  res.json({ message: 'Logged out successfully' });
}

// ── POST /v1/auth/forgot-password ───────────────────────────
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return 200 to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpiry: expiry },
    });

    mailer.sendPasswordReset(user.email, token, user.locale).catch(err => logger.error('Reset email failed:', err));
    logger.info(`Password reset requested for user ${user.id}`);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// ── POST /v1/auth/reset-password ────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const prisma = getPrisma();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, resetToken: null, resetExpiry: null },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

// ── GET /v1/auth/unsubscribe?id=UUID&token=HMAC ──────────────
async function unsubscribe(req, res, next) {
  try {
    const { id, token } = req.query;
    if (!id || !token || !mailer.verifyUnsubToken(id, token)) {
      return res.status(400).send('<p>Invalid or expired unsubscribe link.</p>');
    }
    const prisma = getPrisma();
    await prisma.user.update({
      where: { id },
      data: { emailReminderEnabled: false },
    });
    res.send('<p style="font-family:sans-serif;padding:32px">You have been unsubscribed from daily check-in emails. You can re-enable them in the app under Profile → Settings.</p>');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, unsubscribe };
