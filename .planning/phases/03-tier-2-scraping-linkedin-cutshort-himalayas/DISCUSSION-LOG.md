# Phase 3 Discussion Log
**Mode:** Auto (User requested "do whats best")

- Q: "How should we handle LinkedIn's aggressive rate limiting?"
  -> Selected: Skip and warn if blocked (Recommended default for ethical scraping pipeline).
- Q: "How should we extract data from Cutshort?"
  -> Selected: Fetch first, fallback to Playwright XHR intercept (Recommended for dynamic sites).
- Q: "What's the best strategy for Himalayas?"
  -> Selected: Cheerio static parsing + extracting explicit tags for HIGH MATCH feature.
