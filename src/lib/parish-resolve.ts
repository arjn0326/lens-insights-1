import lensData from "../../public/data/lens.json";

export interface ParishRef {
  slug: string;
  name: string;
}

const PARISHES: ParishRef[] = (lensData as { parishes: { name: string; name_slug: string }[] }).parishes.map(
  (p) => ({ slug: p.name_slug, name: p.name }),
);

/** Normalize for fuzzy match: lowercase, strip "parish", punctuation */
function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/\bparish\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function getAllParishes(): ParishRef[] {
  return PARISHES;
}

/** Resolve a raw mention token (after @) to a parish slug */
export function resolveParishToken(token: string): { parish: ParishRef; corrected: boolean } | null {
  const q = norm(token);
  if (!q) return null;

  const exact = PARISHES.find((p) => norm(p.slug) === q || norm(p.name) === q);
  if (exact) return { parish: exact, corrected: false };

  let best: ParishRef | null = null;
  let bestDist = Infinity;
  for (const p of PARISHES) {
    const d1 = levenshtein(q, norm(p.slug));
    const d2 = levenshtein(q, norm(p.name));
    const d = Math.min(d1, d2);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  if (!best || bestDist > 3) return null;
  return { parish: best, corrected: bestDist > 0 };
}

/** Extract @mention from message text; returns slug and cleaned display name */
export function parseParishMention(text: string): {
  parish: ParishRef | null;
  corrected: boolean;
  queryUsed: string | null;
} {
  const match = text.match(/@([a-zA-Z][a-zA-Z\s.'-]{0,40})/);
  if (!match) return { parish: null, corrected: false, queryUsed: null };
  const raw = match[1].trim().split(/\s/)[0];
  const resolved = resolveParishToken(raw);
  if (!resolved) return { parish: null, corrected: false, queryUsed: raw };
  return { parish: resolved.parish, corrected: resolved.corrected, queryUsed: raw };
}

export function filterParishesForAutocomplete(query: string, limit = 8): ParishRef[] {
  const q = norm(query);
  if (!q) return PARISHES.slice(0, limit);
  return PARISHES.filter(
    (p) => norm(p.name).includes(q) || norm(p.slug).includes(q) || norm(p.name).startsWith(q),
  )
    .sort((a, b) => {
      const da = Math.min(levenshtein(q, norm(a.slug)), levenshtein(q, norm(a.name)));
      const db = Math.min(levenshtein(q, norm(b.slug)), levenshtein(q, norm(b.name)));
      return da - db;
    })
    .slice(0, limit);
}
