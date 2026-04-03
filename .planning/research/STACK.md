# STACK.md — Remote Job Aggregator

## Runtime & Language
- **Bun** (required by user rule) — zero-config TypeScript, native `fetch`, fast startup
- **TypeScript** — strict mode, interfaces for job data, type safety across scrapers

## HTTP / Scraping Layer
| Approach | When to Use | Confidence |
|----------|------------|------------|
| `fetch` (native Bun) | Static HTML pages, simple JSON APIs | HIGH |
| `cheerio@1.x` | HTML parsing with jQuery selectors | HIGH |
| Playwright via Camoufox | JS-rendered pages (LinkedIn, Wellfound) | HIGH |

## Browser Automation
- **Camoufox** — Firefox-based anti-detect browser, NOT Chrome CDP
  - Uses **Juggler protocol** (not CDP) — connects via **Playwright API**
  - Auto-detection: check if process running (port 9377 for health endpoint)
  - Fallback: launch Camoufox programmatically via `playwright` package
- **@playwright/test** or `playwright` package — use `firefox` browserType

> ⚠️ KEY FINDING: Camoufox uses Juggler (Firefox protocol), not Chrome CDP. The user's prompt says CDP port 9377 but Camoufox exposes a Firefox/Juggler endpoint. Connect using `playwright.connect()` or launch directly.

## Deduplication
- Simple hash: `crypto.createHash('sha256').update(company + title + applyUrl).digest('hex')`
- Store seen hashes in a `Set<string>` during scraping run
- No fuzzy matching needed for this one-shot script

## Output
- Markdown file (`job_opportunities.md`) — standard Node `fs.writeFile`
- Append mode per source, final sort + de-dupe at write time

## Dev Dependencies
```json
{
  "dependencies": {
    "playwright": "^1.44.0",
    "cheerio": "^1.0.0"
  }
}
```

## What NOT to Use
- ❌ Python/Scrapy — user uses Bun
- ❌ Puppeteer — Camoufox is Firefox-based, use Playwright
- ❌ External CAPTCHA APIs — ethical constraint
- ❌ Selenium — slower, heavier, less maintainable
