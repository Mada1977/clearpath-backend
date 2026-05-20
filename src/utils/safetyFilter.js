// Safety filter for the AI coach.
//
// Catches messages where the user is seeking instructions to ENABLE harmful
// behaviour (obtaining substances, dosage guidance, hiding use, evading drug
// tests) rather than asking for recovery support. Checked before Claude is
// called so we never pay API cost for a blocked query and the response is
// always consistent.
//
// Design intent: high-precision, not high-recall. Better to miss an edge
// case and let Claude's own safety rules handle it than to over-block
// legitimate recovery questions like "I'm craving alcohol, help me resist."

// ─── Regex patterns (English) ────────────────────────────────────────────────
const HARMFUL_PATTERNS = [
  // Acquiring / obtaining substances
  /\b(how (do i|to|can i)|where (do i|can i|to))\b.{0,60}\b(get|buy|find|score|purchase|obtain|acquire)\b.{0,50}\b(drugs?|weed|cannabis|meth|heroin|cocaine|coke|fentanyl|mdma|ecstasy|opioids?|pills?|alcohol|booze|cigarettes?|tobacco|crack)\b/i,
  /\b(buy|score|get|find|purchase)\b.{0,30}\b(drugs?|weed|cocaine|heroin|meth|crack|fentanyl|alcohol)\b.{0,30}\b(online|near me|locally|cheaply|cheap)\b/i,
  /\bwhere (is|are|can i find).{0,20}\b(drug dealer|dealer|plug)\b/i,

  // Dosage / how to use substances
  /\bhow (much|many)\b.{0,50}\b(drug|alcohol|weed|meth|heroin|cocaine|pill|dose|tab|shot|drink)\b.{0,30}\b(take|drink|use|do|safe|okay)\b/i,
  /\bwhat (dose|dosage|amount)\b.{0,40}\b(drug|alcohol|substance|pill|weed|heroin|meth|cocaine)\b/i,
  /\bhow (to|do (i|you))\b.{0,10}\b(inject|snort|smoke|freebase|shoot up)\b.{0,30}\b(heroin|meth|cocaine|crack|drug)\b/i,

  // Hiding use / evading detection
  /\bhow (to|do (i|you))\b.{0,10}\b(pass|beat|cheat|fool|trick|fake|bypass|avoid)\b.{0,30}\b(drug test|urine test|hair test|blood test)\b/i,
  /\bhow (to|do (i|you))\b.{0,10}\b(hide|conceal|mask|cover up)\b.{0,40}\b(drug use|addiction|drinking|using|from (partner|family|spouse|employer|work|boss))\b/i,
];

// ─── Exact-phrase matches (multilingual) ─────────────────────────────────────
const HARMFUL_PHRASES = [
  // French
  'comment acheter de la drogue', 'où acheter de la drogue', 'comment se procurer de la drogue',
  'comment obtenir de la drogue', 'comment passer un test de drogue', 'comment cacher ma consommation',
  'où trouver de la drogue',
  // Spanish
  'cómo conseguir drogas', 'dónde comprar drogas', 'cómo comprar drogas',
  'cómo pasar el test de drogas', 'cómo esconder el consumo', 'cómo usar drogas',
  'cuánto tomar de droga',
  // German
  'wie bekomme ich drogen', 'wo kaufe ich drogen', 'drogentest bestehen',
  'wie nehme ich drogen', 'wie viel drogen nehmen', 'drogen verstecken',
  // Portuguese
  'como conseguir drogas', 'onde comprar drogas', 'como obter drogas',
  'como passar no teste de drogas', 'como esconder o uso', 'como usar drogas',
  // Italian
  'come ottenere droga', 'dove comprare droga', 'come superare il test antidroga',
  'quanto prendere di droga', 'come usare droga',
  // Turkish
  'uyuşturucu nasıl alınır', 'nereden uyuşturucu satın', 'ilaç testi nasıl geçilir',
  'ne kadar uyuşturucu alınır', 'uyuşturucu nasıl kullanılır',
  // Romanian
  'cum să cumpăr droguri', 'unde să cumpăr droguri', 'cum să trec testul de droguri',
  'cât să iau din', 'cum să ascund consumul',
  // Korean
  '마약 어디서 살', '마약 어떻게 구하', '약물 검사 속이는 법', '마약 얼마나 먹어야',
  '마약 어떻게 사용',
  // Arabic
  'كيف أحصل على مخدرات', 'أين أشتري المخدرات', 'كيف أتجاوز اختبار المخدرات',
  'كيف أخفي تعاطي المخدرات', 'كيف أستخدم المخدرات',
];

/**
 * Returns true if the message is requesting harmful information rather than
 * recovery support. Intentionally conservative to avoid false positives.
 */
function detectHarmfulQuery(text) {
  if (!text || text.length < 10) return false;
  const lower = text.toLowerCase();
  if (HARMFUL_PHRASES.some(p => lower.includes(p.toLowerCase()))) return true;
  return HARMFUL_PATTERNS.some(re => re.test(text));
}

// Streamed as a normal SSE response — client sees no difference.
// Warm and non-shaming; redirects toward recovery tools.
const REDIRECT_RESPONSE =
  "I can hear that you're in a difficult moment, and I genuinely want to help you through it. " +
  "That's not something I'm able to assist with — but what I can do is stay right here with you. " +
  "Can you tell me what's going on today? What's driving this feeling? " +
  "If things feel urgent right now, please tap the SOS button for immediate coping steps, " +
  "or reach out to a crisis line — they're there 24/7 and they understand. " +
  "You reached out to this app for a reason. Let's work through this together. 💙";

module.exports = { detectHarmfulQuery, REDIRECT_RESPONSE };
