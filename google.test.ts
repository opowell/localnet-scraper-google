import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('search engines', () => {
  it.each([
    ['google.js', 'parseGoogle', 'https://www.google.com/search?q=rust', `
      <div id="tads"><a href="https://ad.example/"><h3>An ad</h3></a></div>
      <div id="rso">
        <div><a href="https://one.example/a#part"><br><h3>One</h3><cite>one.example</cite></a></div>
        <div><span role="heading">People also ask</span>
          <div class="related-question-pair"><a href="https://answer.example/"><h3>An answer</h3></a></div></div>
        <div><a href="/url?q=https://two.example/b&amp;sa=U"><h3>Two</h3></a></div>
        <div><a href="https://one.example/a"><h3>One again</h3></a></div>
        <div><a href="/search?q=rust+async"><h3>rust async</h3></a></div>
      </div>`],
  ])('%s reads %s\'s page as a listing of its results, in order, leaving out its ads and its own pages', async (file, parser, url, body) => {
    visit(url, body)
    expect(await load(file, [parser])[parser]()).toEqual({
      listing: true,
      content: [],
      links: [
        { url: 'https://one.example/a', title: 'One', score: 1 },
        { url: 'https://two.example/b', title: 'Two', score: 1 / 1.1 },
      ],
    })
  })

  it.each([
    ['google.js', 'parseGoogle', 'https://www.google.com/search?q=rust&start=10', '<div id="rso"><a href="https://one.example/"><h3>One</h3></a></div>'],
  ])('%s ranks a later page\'s results after those of the pages before it', async (file, parser, url, body) => {
    visit(url, body)
    expect((await load(file, [parser])[parser]()).links).toEqual([{ url: 'https://one.example/', title: 'One', score: 0.5 }])
  })

  it.each([
    ['google.js', 'parseGoogle', 'https://www.google.com/search?q=rust', '<div id="rso"></div>', 'Google listed no results on this page'],
  ])('%s fails a page with no results, saying so', async (file, parser, url, body, failed) => {
    visit(url, body)
    expect(await load(file, [parser])[parser]()).toEqual({ listing: true, content: [], failed })
  })

  it('fails Google\'s cookie consent, saying what to do', () => {
    visit('https://consent.google.com/m?continue=https://www.google.com/search?q%3Drust', '<form></form>')
    expect(load('google.js', ['parseGoogle']).parseGoogle().failed).toContain('consent')
  })

  it.each([
    ['google.js', 'parseGoogle', 'https://www.google.com/maps'],
  ])('%s leaves a page that is no search to the default parse', async (file, parser, url) => {
    visit(url, '<p>Text</p>')
    expect(await load(file, [parser])[parser]()).toBeNull()
  })
})
