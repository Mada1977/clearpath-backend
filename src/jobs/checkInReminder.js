const { getPrisma } = require('../models/prisma');
const logger = require('../utils/logger');
const emailSvc = require('../utils/email');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const MESSAGES = {
  en: { title: 'How are you doing today? 💙', body: 'Your recovery journey matters. Open Bravely Path to check in.' },
  fr: { title: 'Comment allez-vous aujourd\'hui ? 💙', body: 'Votre parcours de rétablissement compte. Ouvrez Bravely Path.' },
  es: { title: '¿Cómo estás hoy? 💙', body: 'Tu camino de recuperación importa. Abre Bravely Path para registrarte.' },
  de: { title: 'Wie geht es dir heute? 💙', body: 'Dein Genesungsweg ist wichtig. Öffne Bravely Path.' },
  it: { title: 'Come stai oggi? 💙', body: 'Il tuo percorso di recupero è importante. Apri Bravely Path.' },
  pt: { title: 'Como você está hoje? 💙', body: 'Sua jornada de recuperação importa. Abra o Bravely Path.' },
  ro: { title: 'Cum te simți azi? 💙', body: 'Parcursul tău de recuperare contează. Deschide Bravely Path.' },
  ar: { title: 'كيف حالك اليوم؟ 💙', body: 'رحلة تعافيك مهمة. افتح Bravely Path للتسجيل.' },
  ko: { title: '오늘 어떠세요? 💙', body: '회복 여정이 중요합니다. Bravely Path를 열어 확인하세요.' },
  tr: { title: 'Bugün nasılsın? 💙', body: 'İyileşme yolculuğun önemli. Bravely Path\'i aç.' },
};

function getMessage(locale) {
  const lang = (locale || 'en').slice(0, 2).toLowerCase();
  return MESSAGES[lang] ?? MESSAGES['en'];
}

function isQuietHours() {
  const hour = new Date().getUTCHours();
  return hour >= 22 || hour < 8;
}

async function sendPushBatch(notifications) {
  if (!notifications.length) return;
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(notifications),
    });
    const json = await res.json();
    logger.info(`Push batch sent: ${notifications.length} notifications`, json.data?.length);
  } catch (err) {
    logger.error('Push batch error:', err);
  }
}

async function runCheckInReminder() {
  if (isQuietHours()) return;

  const prisma = getPrisma();
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000);
  const utcHour = new Date().getUTCHours();

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { expoPushToken: { not: null } },
          { emailReminderEnabled: true },
        ],
        AND: [
          {
            OR: [
              { lastActiveAt: null },
              { lastActiveAt: { lt: cutoff } },
            ],
          },
        ],
      },
      select: { id: true, email: true, expoPushToken: true, name: true, locale: true, emailReminderEnabled: true },
    });

    // Push notifications — send whenever not in quiet hours
    const pushUsers = users.filter(u => u.expoPushToken);
    const notifications = pushUsers.map(u => {
      const msg = getMessage(u.locale);
      return { to: u.expoPushToken, title: msg.title, body: msg.body, sound: 'default' };
    });
    await sendPushBatch(notifications);

    // Emails — only at 9am UTC
    if (utcHour === 9) {
      const emailUsers = users.filter(u => u.emailReminderEnabled);
      for (const u of emailUsers) {
        emailSvc.sendDailyCheckIn(u.email, u.name, u.id, u.locale).catch(err =>
          logger.error(`Check-in email failed for ${u.id}:`, err)
        );
      }
      if (emailUsers.length) logger.info(`Daily check-in emails queued for ${emailUsers.length} users`);
    }

    if (users.length) logger.info(`Check-in reminders processed for ${users.length} users`);
  } catch (err) {
    logger.error('checkInReminder error:', err);
  }
}

function startCheckInReminderJob() {
  logger.info('Check-in reminder job started (runs every hour)');
  setInterval(runCheckInReminder, 60 * 60 * 1000);
}

module.exports = { startCheckInReminderJob };
