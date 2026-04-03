export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export async function retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, backoffMs: number = 3000): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      if (error && typeof error.message === 'string' && error.message.toLowerCase().includes("captcha")) {
        throw error; // skip retry for captchas
      }
      if (attempt >= maxAttempts) {
        throw error;
      }
      await delay(backoffMs * attempt);
      attempt++;
    }
  }
}

export function parseRelativeDate(str: string): Date {
  const normalized = str.toLowerCase().trim();
  const now = new Date();
  
  if (normalized === 'today') return now;
  if (normalized === 'yesterday') return new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const match = normalized.match(/(\d+)\s*(m|min|mins|h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks)\s*ago/);
  if (match) {
    const amount = parseInt(match[1]!, 10);
    const unit = match[2]!;
    let msToSubtract = 0;
    
    if (unit.startsWith('m')) msToSubtract = amount * 60 * 1000;
    if (unit.startsWith('h')) msToSubtract = amount * 60 * 60 * 1000;
    if (unit.startsWith('d')) msToSubtract = amount * 24 * 60 * 60 * 1000;
    if (unit.startsWith('w')) msToSubtract = amount * 7 * 24 * 60 * 60 * 1000;
    
    return new Date(now.getTime() - msToSubtract);
  }
  
  return now;
}

export function normalizeCompany(name: string): string {
  return name.toLowerCase().replace(/inc\.?|ltd\.?|llc\.?|[^a-z0-9]/g, '').trim();
}

export async function checkRobotstxt(domain: string, path: string = '/'): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}/robots.txt`, {
      headers: { 'User-Agent': getRandomUserAgent() },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return true; // if no robots.txt, allow

    const text = await res.text();
    const lines = text.split('\n').map(l => l.trim());

    let inRelevantBlock = false;
    let disallowedPaths: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith('user-agent:')) {
        const agent = (line.split(':')[1] ?? '').trim();
        inRelevantBlock = agent === '*';
        if (inRelevantBlock) disallowedPaths = []; // reset for this block
      } else if (inRelevantBlock && line.toLowerCase().startsWith('disallow:')) {
        const disPath = (line.split(':')[1] ?? '').trim();
        if (disPath) disallowedPaths.push(disPath);
      }
    }

    // Check if any disallowed path is a prefix of our path
    for (const dp of disallowedPaths) {
      if (dp === '/' || path.startsWith(dp)) return false;
    }
    return true;
  } catch (error) {
    return true; // default allow on error
  }
}

const userAgents = [
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
];

export function getRandomUserAgent(): string {
  const index = Math.floor(Math.random() * userAgents.length);
  return userAgents[index] ?? userAgents[0]!;
}
