const { t } = require('./i18n');

const VALID_ADDICTIONS = [
  'smoking', 'alcohol', 'drugs', 'gambling',
  'pornography', 'gaming', 'social_media', 'shopping',
];

/**
 * Returns the 5-step SOS plan for a given addiction, localised to the user's locale.
 */
function getSosSteps(addiction, locale) {
  const key = VALID_ADDICTIONS.includes(addiction) ? addiction : 'smoking';
  const steps = t(locale, `sos.${key}`, { returnObjects: true });
  return Array.isArray(steps) ? steps : [];
}

module.exports = { getSosSteps, VALID_ADDICTIONS };
