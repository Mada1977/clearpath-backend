const express = require('express');
const router = express.Router();

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy — Bravely Path</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 780px; margin: 40px auto; padding: 0 24px; color: #1a1a2e; line-height: 1.7; }
    h1 { color: #4F46E5; font-size: 2rem; margin-bottom: 4px; }
    h2 { color: #0C2A4A; font-size: 1.2rem; margin-top: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    p, li { color: #374151; }
    ul { padding-left: 1.4rem; }
    .subtitle { color: #6b7280; margin-top: 0; }
    .contact { background: #f0f4ff; border-left: 4px solid #4F46E5; padding: 12px 16px; border-radius: 4px; margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="subtitle">Bravely Path &mdash; Last updated: May 2026</p>

  <h2>1. Who We Are</h2>
  <p>Bravely Path is an addiction recovery support application. We are committed to protecting your personal information and your right to privacy.</p>

  <h2>2. Information We Collect</h2>
  <ul>
    <li><strong>Account information:</strong> name and email address when you register.</li>
    <li><strong>Recovery data:</strong> daily check-ins, mood logs, sobriety milestones, and journal entries you choose to enter.</li>
    <li><strong>Supporter connections:</strong> contacts you add as accountability supporters (their name and contact details as you provide them).</li>
    <li><strong>Usage data:</strong> anonymised logs to detect errors and improve performance.</li>
  </ul>

  <h2>3. How We Use Your Information</h2>
  <ul>
    <li>To provide and personalise your recovery experience.</li>
    <li>To generate AI-powered insights and motivational messages (powered by Claude AI by Anthropic).</li>
    <li>To send you optional check-in reminders.</li>
    <li>To allow supporters you invite to view progress you share with them.</li>
    <li>To maintain the security and reliability of the service.</li>
  </ul>

  <h2>4. AI Features</h2>
  <p>Bravely Path uses Claude AI (provided by Anthropic, Inc.) to generate personalised coaching messages. Content you share with the AI assistant may be processed by Anthropic's systems in accordance with their <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>. We do not use your data to train AI models.</p>

  <h2>5. Data Storage and Security</h2>
  <p>Your data is stored in a secure PostgreSQL database hosted on Render (render.com, United States). We use encryption in transit (HTTPS/TLS) and industry-standard security practices. Access to your data is strictly limited.</p>

  <h2>6. Data Sharing</h2>
  <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. Data is shared only:</p>
  <ul>
    <li>With Anthropic to process AI requests (see Section 4).</li>
    <li>With supporters you explicitly invite and grant access to.</li>
    <li>When required by law.</li>
  </ul>

  <h2>7. Your Rights</h2>
  <ul>
    <li><strong>Access:</strong> You can view all your data within the app.</li>
    <li><strong>Correction:</strong> You can update your profile at any time.</li>
    <li><strong>Deletion:</strong> You can delete your account and all associated data from the app settings. Deletion is permanent and takes effect within 30 days.</li>
    <li><strong>Data portability:</strong> Contact us to request an export of your data.</li>
  </ul>

  <h2>8. Children's Privacy</h2>
  <p>Bravely Path is not intended for users under 13 years of age. We do not knowingly collect personal information from children.</p>

  <h2>9. Changes to This Policy</h2>
  <p>We may update this policy from time to time. We will notify you of significant changes via the app or by email. Continued use of the app after changes constitutes acceptance.</p>

  <h2>10. Contact Us</h2>
  <div class="contact">
    <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:<br />
    <strong>Email:</strong> <a href="mailto:mada.fr@gmail.com">mada.fr@gmail.com</a></p>
  </div>
</body>
</html>`;

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML);
});

module.exports = router;
