const CRISIS_KEYWORDS = [
  // English
  'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal',
  'self-harm', 'self harm', 'cut myself', 'hurt myself', 'overdose',
  'not worth living', 'no reason to live', 'better off dead',
  'losing control', 'cant stop', "can't stop", 'emergency', 'help me now',
  'in danger', 'unsafe', 'going to use', 'about to relapse',
  // French
  'me tuer', 'mourir', 'me faire du mal', 'je veux mourir', 'automutilation',
  // Korean
  '죽고 싶다', '자살', '자해', '살고 싶지 않아', '살기 싫어',
  '죽어버리고 싶다', '자해하고 싶다', '끊을 수가 없어', '위험해요',
  // Spanish
  'matarme', 'quiero morir', 'hacerme daño', 'quitarme la vida', 'no puedo más',
  // German
  'mich umbringen', 'sterben möchte', 'selbstmord', 'mir schaden', 'suizid',
  // Italian
  'uccidermi', 'voglio morire', 'farmi del male', 'togliermi la vita',
  // Turkish
  'kendimi öldürmek', 'intihar', 'ölmek istiyorum', 'kendime zarar',
  // Romanian
  'să mă sinucid', 'sinucidere', 'vreau să mor', 'să mă rănesc',
  // Arabic
  'أريد الانتحار', 'أريد الموت', 'إيذاء نفسي', 'انتحار', 'لا أريد العيش',
  // Portuguese
  'me matar', 'suicídio', 'quero morrer', 'me machucar', 'não aguentar mais',
];

function detectCrisis(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

// ─── International numbers — prepended to EVERY response ────────────────────
// 112 works in 190+ countries; shown first so it is never missed.
const INTERNATIONAL = [
  { name: '🚨 112 — Universal emergency', number: '112',               available: '24/7 · 190+ countries (Europe, Asia, Africa)' },
  { name: '911 (USA / Canada)',            number: '911',               available: '24/7' },
  { name: '999 (UK)',                      number: '999',               available: '24/7' },
  { name: '000 (Australia)',               number: '000',               available: '24/7' },
  { name: 'Befrienders Worldwide',         number: 'befrienders.org',   available: '24/7 · Global' },
  { name: 'Crisis Text Line',              number: 'Text HOME to 741741', available: 'USA / UK / Canada / Ireland' },
  { name: 'IASP Crisis Centres',           number: 'iasp.info/resources/Crisis_Centres', available: '24/7 · Global directory' },
];

function getHelplines(locale = 'en') {
  const country = (locale.split('-')[1] || '').toUpperCase();
  const lang    = locale.split('-')[0].toLowerCase();

  const lines = {
    // France
    FR: [
      { name: '3114 — Numéro national prévention suicide', number: '3114',           available: '24h/24' },
      { name: 'Alcool Info Service',                       number: '0 980 980 930',   available: '7j/7'   },
      { name: 'Drogues Info Service',                      number: '0 800 23 13 13',  available: '7j/7'   },
      { name: 'Joueurs Info Service',                      number: '09 74 75 13 13',  available: 'Lun–Ven' },
    ],
    // Belgium
    BE: [
      { name: 'Centre de Prévention du Suicide', number: '0800 32 123', available: '24/7' },
      { name: 'Télé-Accueil',                    number: '107',         available: '24/7' },
    ],
    // Germany
    DE: [
      { name: 'Telefonseelsorge',          number: '0800 111 0 111', available: '24/7' },
      { name: 'Suchthotline',              number: '01806 313031',   available: '24/7' },
      { name: 'BZgA Glücksspielsucht',     number: '0800 040 0140',  available: '24/7' },
    ],
    // Austria (German-speaking)
    AT: [
      { name: 'Telefonseelsorge Österreich', number: '142',           available: '24/7' },
      { name: 'Sucht & Drogenhotline',       number: '01 513 44 33',  available: '24/7' },
    ],
    // Switzerland (German-speaking)
    CH: [
      { name: 'Dargebotene Hand',    number: '143',          available: '24/7' },
      { name: 'Suchtberatung',       number: '0800 040 080', available: '24/7' },
    ],
    // UK
    GB: [
      { name: 'Samaritans',          number: '116 123',        available: '24/7' },
      { name: 'Frank Drug Helpline', number: '0300 123 6600',  available: '24/7' },
      { name: 'GamCare',             number: '0808 8020 133',  available: '24/7' },
    ],
    // Spain
    ES: [
      { name: 'Teléfono de la Esperanza',              number: '717 003 717',  available: '24/7' },
      { name: 'Cruz Roja',                             number: '900 100 036',  available: '24/7' },
      { name: 'Línea de Atención a Drogodependencias', number: '900 200 514',  available: '24/7' },
      { name: 'Jugadores Anónimos España',             number: '91 447 34 68', available: 'Lun–Vie' },
    ],
    // Romania
    RO: [
      { name: 'Telefonul Speranței',          number: '0800 801 200', available: '24/7'    },
      { name: 'ALIAT — Dependențe',           number: '021 316 00 00', available: 'Lun–Vin' },
      { name: 'Linia Națională Antisuicid',   number: '0800 801 200', available: '24/7'    },
    ],
    // Portugal
    PT: [
      { name: 'SOS Voz Amiga',           number: '213 544 545',  available: '24/7'    },
      { name: 'SICAD — Apoio Dependências', number: '800 202 013', available: '24/7'   },
      { name: 'Linha Vida',              number: '1414',          available: '24/7'    },
    ],
    // Brazil (Portuguese)
    BR: [
      { name: 'CVV — Centro de Valorização da Vida', number: '188',           available: '24/7' },
      { name: 'CAPS AD — Álcool e Drogas',           number: '156',           available: '24/7' },
    ],
    // Korea
    KR: [
      { name: '자살예방상담전화',         number: '1393',        available: '24/7'  },
      { name: '정신건강 위기상담 전화',   number: '1577-0199',   available: '24/7'  },
      { name: '한국마약퇴치운동본부',     number: '1899-0893',   available: '월–금' },
      { name: '한국도박문제관리센터',     number: '1336',        available: '24/7'  },
    ],
    // Italy
    IT: [
      { name: 'Telefono Amico',           number: '02 2327 2327', available: '24/7'    },
      { name: 'Telefono Azzurro',         number: '19696',        available: '24/7'    },
      { name: 'Gioco Responsabile',       number: '800 558 822',  available: '24/7'    },
      { name: 'SerD — Ser.T Dipendenze',  number: '800 274 274',  available: 'Lun–Ven' },
    ],
    // Turkey
    TR: [
      { name: 'İntihar Önleme Hattı (ALO 182)', number: '182',           available: '24/7' },
      { name: 'ALO 191 — Uyuşturucu',           number: '191',           available: '24/7' },
      { name: 'Yeşilay Danışma Hattı',          number: '0850 455 0 455', available: '24/7' },
    ],
    // Saudi Arabia
    SA: [
      { name: 'خط مساعدة الصحة النفسية',  number: '920033360', available: '24/7'   },
      { name: 'مركز الأمل للصحة النفسية', number: '920000258', available: 'Sun–Thu' },
    ],
    // Egypt
    EG: [
      { name: 'خط نجدة الصحة النفسية',    number: '08008880700', available: '24/7' },
      { name: 'مستشفى العباسية للصحة النفسية', number: '02 24825600', available: '24/7' },
    ],
    // UAE
    AE: [
      { name: 'خط مساعدة الصحة النفسية (SEHA)', number: '800-4673', available: '24/7' },
      { name: 'مركز الرعاية الأسرية',            number: '800-2673', available: '24/7' },
    ],
    // Morocco
    MA: [
      { name: 'خط الاستغاثة النفسية', number: '0801 00 3030', available: '24/7' },
    ],
    // Default / international
    DEFAULT: [
      { name: 'Emergency services',          number: '112',              available: '24/7' },
      { name: 'Find A Helpline (global)',     number: 'findahelpline.com', available: '24/7' },
    ],
  };

  // Resolve the country/language-specific list
  const local = lines[country] ?? (lang === 'ar' ? [] : lines.DEFAULT);

  // International numbers always appear first so no user ever misses 112
  return [...INTERNATIONAL, ...local];
}

module.exports = { detectCrisis, getHelplines };
