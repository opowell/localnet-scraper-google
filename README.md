# Google scraper for Localnet

Reads `www.google.com/search` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, how the site is searched, and the file to run.
- `google.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `google.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-google`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.

## What it reads

**Google** (`www.google.com/search`, `?start=10` for page 2): each `<h3>` under `#rso` inside the link to its page, leaving out those in a "People also ask" answer (`.related-question-pair`); a link through Google's `/url?q=<url>` is read as its `q`. A browser that has not answered Google's cookie consent is sent to `consent.google.com` instead, which fails, saying to open Google and answer it. Google's own bot check (`/sorry/`) comes with a 429.

It reads a page of a search's results as a listing of what it found, as Localnet's search engine scrapers do (`searchResultsOf` in Localnet's `content-scripts/utils/dom.js`).
