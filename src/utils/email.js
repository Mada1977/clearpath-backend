const crypto = require('crypto');
const logger = require('./logger');

const FROM = 'Bravely Path <noreply@blackctrans.com>';
const APP_URL = 'https://bravely-path.onrender.com';
const BACKEND_URL = 'https://clearpath-backend-marl.onrender.com/v1';

async function send({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn(`RESEND_API_KEY not set — skipping email to ${to}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.error(`Resend ${res.status} sending to ${to}: ${text}`);
    }
  } catch (err) {
    logger.error(`Resend network error sending to ${to}:`, err);
  }
}

function makeUnsubToken(userId) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'fallback')
    .update(userId)
    .digest('hex');
}

function verifyUnsubToken(userId, token) {
  return token === makeUnsubToken(userId);
}

async function sendPasswordReset(to, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await send({
    to,
    subject: 'Reset your Bravely Path password',
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#4F46E5;margin-top:0">Reset your password</h2>
  <p style="color:#374151">We received a request to reset your Bravely Path password. Click the button below to choose a new one.</p>
  <a href="${resetUrl}" style="display:inline-block;margin:24px 0;background:#4F46E5;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
    Reset password
  </a>
  <p style="color:#6B7280;font-size:13px">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:28px 0">
  <p style="color:#9CA3AF;font-size:12px;margin:0">Bravely Path &mdash; Your recovery companion</p>
</div>`,
  });
}

async function sendWelcome(to, name) {
  await send({
    to,
    subject: 'Welcome to Bravely Path 💙',
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#4F46E5;margin-top:0">Welcome to Bravely Path 💙</h2>
  <p style="color:#374151">Hi ${name || 'there'},</p>
  <p style="color:#374151">We're so glad you're here. Starting a recovery journey takes real courage, and Bravely Path is here to walk alongside you every step of the way.</p>
  <h3 style="color:#374151;margin-top:28px">Getting started</h3>
  <ul style="color:#374151;line-height:2;padding-left:20px">
    <li><strong>Log cravings</strong> — track what triggers them and celebrate every resistance</li>
    <li><strong>AI Coach</strong> — chat 24/7 with your personal recovery coach</li>
    <li><strong>Track streaks</strong> — watch your sobriety streak grow day by day</li>
    <li><strong>Progress reports</strong> — see patterns in your recovery journey</li>
  </ul>
  <div style="background:#FEF3C7;border-radius:10px;padding:16px 20px;margin:24px 0">
    <strong style="color:#92400E">🆘 In crisis?</strong>
    <p style="margin:8px 0 0;color:#92400E;font-size:14px">The SOS button in the app connects you instantly to crisis helplines in your language — available 24/7.</p>
  </div>
  <p style="color:#374151">Take it one day at a time. You've got this. 💪</p>
  <p style="color:#6B7280">With care,<br>The Bravely Path team</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:28px 0">
  <p style="color:#9CA3AF;font-size:12px;margin:0">Bravely Path &mdash; Your recovery companion</p>
</div>`,
  });
}

async function sendDailyCheckIn(to, name, userId) {
  const token = makeUnsubToken(userId);
  const unsubUrl = `${BACKEND_URL}/auth/unsubscribe?id=${userId}&token=${token}`;
  await send({
    to,
    subject: 'How are you doing today? 💪',
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
  <h2 style="color:#4F46E5;margin-top:0">How are you doing today? 💪</h2>
  <p style="color:#374151">Hi ${name || 'there'},</p>
  <p style="color:#374151">Your recovery journey matters. Take a moment today to check in with yourself &mdash; log a craving, celebrate a win, or just open the app and breathe.</p>
  <a href="${APP_URL}" style="display:inline-block;margin:24px 0;background:#4F46E5;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
    Open Bravely Path
  </a>
  <p style="color:#6B7280;font-size:13px">Remember: every day you show up is a victory. 💙</p>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:28px 0">
  <p style="color:#9CA3AF;font-size:11px;margin:0">
    You're receiving this because you opted in to daily check-in reminders in Bravely Path.<br>
    <a href="${unsubUrl}" style="color:#9CA3AF">Unsubscribe</a>
  </p>
</div>`,
  });
}

module.exports = { sendPasswordReset, sendWelcome, sendDailyCheckIn, makeUnsubToken, verifyUnsubToken };
