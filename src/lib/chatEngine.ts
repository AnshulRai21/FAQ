import { FAQ, Settings, DEFAULT_FAQS, DEFAULT_SETTINGS } from './faqData';

// Backend integration point: Replace localStorage calls with API calls
// GET /api/faqs → returns FAQ[]
// GET /api/settings → returns Settings
// POST /api/faqs → creates FAQ
// PUT /api/faqs/:id → updates FAQ
// DELETE /api/faqs/:id → deletes FAQ

export function loadFAQs(): FAQ[] {
  if (typeof window === 'undefined') return DEFAULT_FAQS;
  try {
    const stored = localStorage.getItem('gitam_faqs');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through
  }
  localStorage.setItem('gitam_faqs', JSON.stringify(DEFAULT_FAQS));
  return DEFAULT_FAQS;
}

export function saveFAQs(faqs: FAQ[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gitam_faqs', JSON.stringify(faqs));
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem('gitam_settings');
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // fall through
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gitam_settings', JSON.stringify(settings));
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const wordsA = new Set(na.split(' ').filter(w => w.length > 2));
  const wordsB = nb.split(' ').filter(w => w.length > 2);
  if (wordsA.size === 0 || wordsB.length === 0) return 0;

  let matches = 0;
  for (const w of wordsB) {
    if (wordsA.has(w)) matches++;
    else {
      for (const wa of wordsA) {
        if (wa.includes(w) || w.includes(wa)) { matches += 0.7; break; }
      }
    }
  }
  return matches / Math.max(wordsA.size, wordsB.length);
}

export interface MatchResult {
  type: 'exact' | 'partial' | 'none';
  faq?: FAQ;
  suggestions?: FAQ[];
  score?: number;
}

export function matchFAQ(input: string, faqs: FAQ[]): MatchResult {
  const normalized = normalize(input);
  if (!normalized || normalized.length < 2) {
    return { type: 'none', suggestions: faqs.slice(0, 5) };
  }

  let bestScore = 0;
  let bestFaq: FAQ | undefined;
  const partialMatches: Array<{ faq: FAQ; score: number }> = [];

  for (const faq of faqs) {
    let score = 0;

    // Check question
    const qScore = similarity(normalized, faq.question);
    score = Math.max(score, qScore);

    // Check keywords
    for (const kw of faq.keywords) {
      const kScore = similarity(normalized, kw);
      score = Math.max(score, kScore);
      if (normalized.includes(normalize(kw)) || normalize(kw).includes(normalized)) {
        score = Math.max(score, 0.9);
      }
    }

    // Check category
    if (normalized.includes(faq.category)) score = Math.max(score, 0.5);

    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
    if (score > 0.35) {
      partialMatches.push({ faq, score });
    }
  }

  partialMatches.sort((a, b) => b.score - a.score);

  if (bestScore >= 0.75 && bestFaq) {
    return { type: 'exact', faq: bestFaq, score: bestScore };
  }

  if (partialMatches.length > 0) {
    return {
      type: 'partial',
      suggestions: partialMatches.slice(0, 4).map(m => m.faq),
      score: bestScore,
    };
  }

  // Fallback: return diverse suggestions
  const fallback = faqs.slice(0, 5);
  return { type: 'none', suggestions: fallback };
}

export function getSuggestions(input: string, faqs: FAQ[]): FAQ[] {
  const normalized = normalize(input);
  if (!normalized || normalized.length < 2) return [];

  const scored: Array<{ faq: FAQ; score: number }> = [];

  for (const faq of faqs) {
    let score = 0;
    const qScore = similarity(normalized, faq.question);
    score = Math.max(score, qScore);
    for (const kw of faq.keywords) {
      const kScore = similarity(normalized, kw);
      score = Math.max(score, kScore);
    }
    if (score > 0.2) scored.push({ faq, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(s => s.faq);
}

export function formatAnswer(raw: string): string {
  // Convert markdown-style bold to HTML and newlines to <br>
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export function isEmergencyQuery(input: string): boolean {
  const triggers = ['emergency', 'urgent', 'immediate help', 'crisis', 'accident', 'medical emergency'];
  const n = normalize(input);
  return triggers.some(t => n.includes(t));
}

export function isFeesQuery(input: string): boolean {
  const triggers = ['fees', 'fee payment', 'pay fee', 'fee portal', 'onlinepay'];
  const n = normalize(input);
  return triggers.some(t => n.includes(t));
}

export function isComplaintUnresolved(input: string): boolean {
  const triggers = ['complaint unresolved', 'not resolved', 'escalate', 'no response', 'still not fixed'];
  const n = normalize(input);
  return triggers.some(t => n.includes(t));
}
