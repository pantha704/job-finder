export function isFresher(exp: string): boolean | 'verify' {
  if (!exp) return 'verify';
  const raw = exp.toLowerCase();

  const numMatches = raw.match(/\d+/g);
  if (numMatches && numMatches.length > 0) {
    const maxYears = Math.max(...numMatches.map(n => parseInt(n, 10)));
    if (raw.includes("month")) return true;
    if (raw.includes("year") || raw.includes("yr")) {
       if (maxYears > 2) return false;
       return true;
    }
  }

  const fuzzy = ["fresher", "entry", "0-1 year", "new grad", "intern"];
  if (fuzzy.some(kw => raw.includes(kw))) return true;

  return 'verify';
}

export function getMatchScore(title: string, desc: string, techStack: string[] = []): { score: number, isHighMatch: boolean } {
  const text = `${title} ${desc} ${techStack.join(" ")}`.toLowerCase();
  const keywords = [
    /\brust\b/i,
    /\bsolana\b/i,
    /\btypescript\b/i,
    /\bnext\.?js\b/i,
    /\bweb3\b/i,
    /\banchor\b/i,
    /\bwasm\b/i
  ];
  
  let score = 0;
  for (const regex of keywords) {
    if (regex.test(text)) score++;
  }
  
  return { score, isHighMatch: score >= 1 };
}

export function checkLocation(loc: string): boolean | 'verify' {
  if (!loc) return 'verify';
  const raw = loc.toLowerCase();

  // Hard geo-locks that explicitly exclude India/Asia — drop these
  const blocklist = [
    "us only", "usa only", "united states only",
    "eu timezone", "europe only", "must be in eu",
    "must be in california", "must be in new york",
    "uk strictly", "uk only",
    "latam only", "latam-only",
    "no india", "not available in india",
    "north america only",
  ];

  // Confirmed India-accessible or remote-friendly signals
  const allowlist = [
    "remote", "work from home", "wfh",
    "india", "apac", "asia", "worldwide", "global",
    "anywhere", "international",
  ];

  if (blocklist.some(b => raw.includes(b))) return false;
  if (allowlist.some(a => raw.includes(a))) return true;

  // Unknown city (e.g. "mumbai", "london") — keep with verify flag
  // Better to have 10 extra jobs to manually filter than miss good ones
  return 'verify';
}
