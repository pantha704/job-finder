import { firefox, type Browser } from 'playwright';

// ─── Camoufox REST API client ──────────────────────────────────────────────
// The Camoufox server (port 9377) exposes a REST API, not a Playwright WS endpoint.
// We wrap it here so scrapers can call fetchWithCamoufox(url) directly.

const CAMOUFOX_PORT = 9377;
let _camoufoxAvailable: boolean | null = null;
const SESSION_USER_ID = "job_scraper_session";

async function checkCamoufox(): Promise<boolean> {
  if (_camoufoxAvailable !== null) return _camoufoxAvailable;
  try {
    const res = await fetch(`http://127.0.0.1:${CAMOUFOX_PORT}/health`, { signal: AbortSignal.timeout(2000) });
    const json = await res.json() as Record<string, unknown>;
    // According to Camoufox API: ok: true, browserRunning: true
    _camoufoxAvailable = !!(json.ok && json.browserRunning);
  } catch {
    _camoufoxAvailable = false;
  }
  if (_camoufoxAvailable) {
    console.log(`✓ Camoufox detected on port ${CAMOUFOX_PORT}`);
  } else {
    console.log(`ℹ Camoufox not available (port ${CAMOUFOX_PORT}) — will use fetch fallback`);
  }
  return _camoufoxAvailable;
}

/**
 * Fetches a URL via:
 *   1. Camoufox REST API (anti-detect Firefox) — if server is reachable on port 9377
 *   2. Local headless Playwright Firefox — if installed
 *   3. Plain fetch with browser-like headers — always available
 *
 * Returns { html, method } so callers know which path was taken.
 */
export async function fetchRendered(url: string): Promise<{ html: string; method: 'camoufox' | 'playwright' | 'fetch' }> {
  // ── 1. Camoufox REST API ──────────────────────────────────────────────────
  if (await checkCamoufox()) {
    try {
      // Step 1: Open a tab
      const openRes = await fetch(`http://127.0.0.1:${CAMOUFOX_PORT}/tabs/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: SESSION_USER_ID, url, waitFor: 5000 }),
        signal: AbortSignal.timeout(30000),
      });

      if (openRes.ok) {
        const tabData = await openRes.json() as Record<string, unknown>;
        const tabId = tabData.tabId || tabData.targetId;
        
        if (tabId) {
          // Wait briefly to allow dynamic content (like React) to mount after DOM ready
          await new Promise(r => setTimeout(r, 4000));
          
          // Step 2: Use /evaluate to extract raw outerHTML
          const evalRes = await fetch(`http://127.0.0.1:${CAMOUFOX_PORT}/tabs/${tabId}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: SESSION_USER_ID, expression: "document.documentElement.outerHTML" }),
            signal: AbortSignal.timeout(10000),
          });

          if (evalRes.ok) {
            const evalData = await evalRes.json() as Record<string, unknown>;
            const html = (evalData.result ?? '') as string;

            // Step 3: Close the tab immediately
            fetch(`http://127.0.0.1:${CAMOUFOX_PORT}/tabs/${tabId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: SESSION_USER_ID })
            }).catch(() => {});

            if (html.length > 500) return { html, method: 'camoufox' };
          }
        }
      }
    } catch (e: any) {
      console.warn(`[Camoufox] Session operation failed for ${url}: ${e.message}`);
    }
  }

  // ── 2. Local Playwright Firefox ───────────────────────────────────────────
  try {
    const browser = await firefox.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const html = await page.content();
    await browser.close();
    if (html.length > 500) return { html, method: 'playwright' };
  } catch {
    // Playwright not available or page failed — fall through to fetch
  }

  // ── 3. Plain fetch (always works for non-Cloudflare sites) ───────────────
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), method: 'fetch' };
}

// ─── Legacy Playwright Browser factory (for scrapers that drive pages directly) ──

export async function getBrowser(): Promise<Browser | 'fetch-only'> {
  // Camoufox is a REST API server, not a WS browser — use fetchRendered() above for it.
  // This function provides a raw Playwright Browser for scrapers that need page.evaluate().
  try {
    const browser = await firefox.launch({ headless: true });
    return browser;
  } catch {
    return 'fetch-only';
  }
}
