// A Google search's page of results (/search?q=…, start=10 for the second page), read as a listing of what it found
// (see searchResultsOf): each result is a heading (<h3>) inside the link to its page, under #rso. The ads (#tads,
// #bottomads) are outside it, and the headings of its other boxes ("People also ask", "Images") are in no link. A
// result Google sends through its own redirect (/url?q=<url>) is read as where it leads, and links to Google's own
// searches ("People also search for") are left out. A browser that has not yet answered Google's cookie consent is shown
// that (consent.google.com) instead: it is not a results page.
function parseGoogle() {
  if (location.hostname === 'consent.google.com') {
    return {
      listing: true,
      content: [],
      failed: 'Google asked for consent to its cookies before showing its results: open Google in this browser and answer it',
    }
  }
  if (!/^www\.google\.[a-z.]+$/.test(location.hostname) || location.pathname !== '/search') {
    return null
  }
  const results = []
  for (const heading of document.querySelectorAll('#rso h3')) {
    const a = heading.closest('a[href]')
    if (a && !heading.closest('.related-question-pair')) {
      results.push({ url: googleTarget(a.href), title: heading.textContent })
    }
  }
  return searchResultsOf('Google', results, queryNumber('start'))
}

// Where a result's link leads: the link itself, unless it is to Google, where only its redirect (/url) leads elsewhere.
function googleTarget(href) {
  const url = new URL(href)
  if (!/^www\.google\./.test(url.hostname)) {
    return href
  }
  return url.pathname === '/url' ? url.searchParams.get('q') || url.searchParams.get('url') : null
}

// The parser a scrape calls.
registerParser(parseGoogle)
