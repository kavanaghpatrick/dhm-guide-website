import React, { useState } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import AmazonLink from '../components/modern/AmazonLink.jsx'
import topProductsData from '../data/topProducts.json'
import {
  NOTES,
  PRODUCTS_BY_ID,
  doseLabel,
  servingPrice,
  costPer1000,
  usd,
  ratingLabel,
  numberWord,
} from '../data/productNotes.js'
import '../styles/theme-modern.css'
import '../styles/money-pages.css'

/**
 * /reviews, modern arm (flag site-modern-v1, shipped to 100%).
 *
 * Layout follows the blog's editorial system (money-pages.css): one reading column,
 * eyebrow + H1 + standfirst + byline + disclosure, then the verdict. The editor's
 * pick card and its buy button sit in the first phone screen and a half, because
 * almost every Amazon click on this site happens in the top fifth of the page.
 *
 * Copy lives in src/data/productNotes.js; every number comes from topProducts.json.
 *
 * Affiliate links render through AmazonLink (plain <a>, data-* attributes, no
 * onClick). The global listener in useAffiliateTracking fires affiliate_link_click.
 */

const isPick = (p) => p?.badge === "Editor's Choice"

const SORTS = [
  { id: 'overall', label: 'Best overall', compare: (a, b) => b.score - a.score },
  { id: 'cost', label: 'Cost per 1,000 mg', compare: (a, b) => costPer1000(a) - costPer1000(b) },
  { id: 'serving', label: 'Price per serving', compare: (a, b) => servingPrice(a) - servingPrice(b) },
  { id: 'rating', label: 'Amazon rating', compare: (a, b) => b.rating - a.rating || b.reviews - a.reviews },
]

const P = PRODUCTS_BY_ID
const MATCHUPS = [
  { a: 1, b: 4, slug: 'no-days-wasted-vs-nusapure-dhm-comparison-2025',
    desc: () => `The same dose of DHM, at ${P[1].pricePerServing} and ${P[4].pricePerServing} a serving.` },
  { a: 2, b: 1, slug: 'double-wood-vs-no-days-wasted-dhm-comparison-2025',
    desc: () => 'Plain DHM against DHM with add-ins.' },
  { a: 6, b: 1, slug: 'flyby-vs-no-days-wasted-complete-comparison-2025',
    desc: () => `A ${P[6].servings}-serving trial pack against a ${P[1].servings}-serving box.` },
  { a: 2, b: 3, slug: 'double-wood-vs-toniiq-ease-dhm-comparison-2025',
    desc: () => `${doseLabel(P[2])} of plain DHM against ${doseLabel(P[3])} with reishi and milk thistle.` },
  { a: 6, b: 2, slug: 'flyby-vs-double-wood-complete-comparison-2025',
    desc: () => `${P[6].pricePerServing} against ${P[2].pricePerServing} a serving.` },
]

const BUYING_GUIDES = [
  { label: 'No Days Wasted review', slug: 'no-days-wasted-dhm-review-analysis' },
  { label: 'Best liver supplements', slug: 'best-liver-supplements' },
  { label: 'Best liver detox supplements', slug: 'best-liver-detox-supplements' },
  { label: 'Best fatty liver supplements', slug: 'best-fatty-liver-supplements' },
  { label: 'Best hangover recovery drinks', slug: 'best-hangover-recovery-drinks' },
]

export default function ReviewsModern() {
  useSEO(generatePageSEO('reviews'))
  const [sortId, setSortId] = useState('overall')

  const ranked = [...topProductsData].sort(SORTS[0].compare)
  const tableRows = [...topProductsData].sort(SORTS.find((s) => s.id === sortId).compare)
  const pick = topProductsData.find(isPick) ?? ranked[0]
  const nusa = PRODUCTS_BY_ID[4]
  const doubleWood = PRODUCTS_BY_ID[2]
  const count = numberWord(topProductsData.length)

  return (
    <div className="theme-modern" data-money="reviews">
      <div className="m-shell m-shell--wide">
        <div className="m-head" data-testid="reviews-hero-modern">
          <p className="m-eyebrow t-label">Buying guide</p>
          {/* H1 carries the year only, never a month-year stamp (it goes stale). */}
          <h1 className="m-title">Best DHM Supplements of 2026</h1>
          <p className="m-lead">
            We compared {count} DHM supplements on dose, price per serving and Amazon
            ratings. This is what we would buy, and what we would skip.
          </p>
          <p className="m-meta" data-testid="reviews-byline">
            Written by the DHM Guide editors · Updated November 2026
          </p>
          <p className="m-disclosure">
            We earn a commission if you buy through our Amazon links. It does not change
            the price you pay.
          </p>
        </div>
        <hr className="m-rule" />

        {/* ===================== THE VERDICT ===================== */}
        <section className="m-verdict" aria-labelledby="pick-name">
          <div className="m-winner" data-testid="reviews-winner-card" data-product-name={pick.name}>
            <div className="m-winner__head">
              <p className="m-label">Editor&rsquo;s pick</p>
              <h2 id="pick-name" className="m-winner__name">{pick.name}</h2>
            </div>
            <p className="m-winner__why">
              Buy {NOTES[pick.id].short} if you want one product for a night out. Each
              serving has {doseLabel(pick)} of DHM plus L-cysteine, milk thistle, prickly
              pear, B vitamins and electrolytes. You pay for that convenience:{' '}
              {pick.pricePerServing} a serving, and {pick.servings} servings to a pack.
            </p>
            <dl className="m-facts">
              <div><dt>DHM</dt><dd>{doseLabel(pick)}</dd></div>
              <div><dt>Per serving</dt><dd>{pick.pricePerServing}</dd></div>
              <div><dt>Servings</dt><dd>{pick.servings}</dd></div>
              <div><dt>Rating</dt><dd>{ratingLabel(pick)}</dd></div>
            </dl>
            <AmazonLink
              product={pick}
              componentId="reviews-pick-cta"
              placement="reviews_pick"
              position={0}
              className="btn btn-cta m-buy"
            >
              Check price on Amazon
            </AmazonLink>
          </div>

          <p className="m-alt">
            If you only want DHM,{' '}
            <AmazonLink product={nusa} componentId="reviews-alt-nusapure" placement="reviews_verdict_text" position={1}>
              NusaPure
            </AmazonLink>{' '}
            and{' '}
            <AmazonLink product={doubleWood} componentId="reviews-alt-doublewood" placement="reviews_verdict_text" position={2}>
              Double Wood
            </AmazonLink>{' '}
            give you the same {doseLabel(nusa)} for {nusa.pricePerServing} and{' '}
            {doubleWood.pricePerServing} a serving. NusaPure is cheaper. Double Wood has
            more buyer history: {doubleWood.reviews.toLocaleString('en-US')} Amazon ratings
            to NusaPure&rsquo;s {nusa.reviews}.
          </p>
        </section>

        {/* ===================== COMPARISON TABLE ===================== */}
        <section className="m-section" aria-labelledby="table-heading">
          <h2 id="table-heading">How the {count} compare</h2>
          <p>
            Cost per 1,000 mg is what you would spend for a full 1,000 mg dose of DHM. It
            is the fairest way to compare a 300 mg product with a 1,000 mg one.
          </p>

          <div className="m-sort" role="group" aria-label="Order the table by">
            <span className="m-sort__label">Order by</span>
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="btn btn-sm"
                aria-pressed={sortId === s.id}
                onClick={() => setSortId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div id="comparison-table">
            <div
              className="m-scroll"
              tabIndex={0}
              role="region"
              aria-label="DHM supplement comparison table (scrolls sideways on small screens)"
            >
              <table className="m-table">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">DHM per serving</th>
                    <th scope="col">Price per serving</th>
                    <th scope="col">Cost per 1,000 mg</th>
                    <th scope="col">Servings</th>
                    <th scope="col">Amazon rating</th>
                    <th scope="col"><span className="m-sr">Buy</span></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((p, i) => (
                    <tr
                      key={p.id}
                      className={isPick(p) ? 'is-pick' : undefined}
                      data-testid={isPick(p) ? 'comparison-winner-row' : undefined}
                    >
                      <th scope="row" className="m-cell-name">
                        {p.name}
                        {isPick(p) && <span className="m-label m-label--row">Editor&rsquo;s pick</span>}
                      </th>
                      <td data-label="DHM">{doseLabel(p)}</td>
                      <td data-label="Per serving">{p.pricePerServing}</td>
                      <td data-label="Per 1,000 mg">{usd(costPer1000(p))}</td>
                      <td data-label="Servings">{p.servings}</td>
                      <td data-label="Rating">
                        {Number(p.rating).toFixed(1)}
                        <span className="m-soft"> ({p.reviews.toLocaleString('en-US')})</span>
                      </td>
                      <td className="m-cell-buy">
                        <AmazonLink
                          product={p}
                          componentId={`reviews-table-cta-${p.id}`}
                          placement="comparison_table"
                          position={i}
                          className="m-textlink"
                        >
                          Check price
                        </AmazonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="m-small">
            Ratings are Amazon&rsquo;s, with the number of ratings in brackets. Prices come
            from the Amazon listings and change often; the links show today&rsquo;s price.
          </p>
        </section>

        {/* ===================== ONE NOTE PER PRODUCT ===================== */}
        <section className="m-section" aria-labelledby="notes-heading">
          <h2 id="notes-heading">Notes on all {count}</h2>
          <ol className="m-products">
            {ranked.map((p, i) => {
              const note = NOTES[p.id]
              return (
                <li key={p.id}>
                  <article
                    className="m-product"
                    data-track="product"
                    data-product-position={i + 1}
                    data-product-name={p.name}
                  >
                    <h3 className="m-product__name">
                      <span className="m-product__rank">{i + 1}.</span> {p.name}
                    </h3>
                    <p className="m-product__facts">
                      {doseLabel(p)} of DHM · {p.pricePerServing} a serving · {p.servings} servings ·{' '}
                      {ratingLabel(p)}
                    </p>
                    {note && (
                      <>
                        <p className="m-product__suits">
                          <span className="m-label">Who it suits</span> {note.suits}
                        </p>
                        <p>{note.verdict(p)}</p>
                        <p>{note.skip(p)}</p>
                      </>
                    )}
                    <AmazonLink
                      product={p}
                      componentId={`reviews-note-cta-${p.id}`}
                      placement="product_card"
                      position={i}
                      className="btn btn-cta m-buy m-buy--note"
                    >
                      Check price on Amazon
                    </AmazonLink>
                  </article>
                </li>
              )
            })}
          </ol>
        </section>

        {/* ===================== METHOD AND EVIDENCE ===================== */}
        <section className="m-section" aria-labelledby="method-heading">
          <h2 id="method-heading">How we chose</h2>
          <p>
            We did not run lab tests. For each product we read the label and the Amazon
            listing, noted the DHM per serving, the price and the number of servings, and
            worked out what a 1,000 mg dose costs. Ratings are shown with their count,
            because a {Number(nusa.rating).toFixed(1)} from {nusa.reviews} people tells you
            less than a {Number(PRODUCTS_BY_ID[6].rating).toFixed(1)} from{' '}
            {PRODUCTS_BY_ID[6].reviews.toLocaleString('en-US')}.
          </p>
          <p>
            The editor&rsquo;s pick is the product we would suggest for an occasional night
            out. The plain DHM products rank next because they give the same dose for less.
            Formulas that charge more per milligram for add-ins with little evidence behind
            them rank lower.
          </p>

          <h2 id="evidence-heading" className="m-h2-follow">What to expect from DHM</h2>
          <p>
            Keep expectations modest. The study most often cited, from UCLA in 2012, was
            done in rats. Human trials are few and small, and none shows that a supplement
            reliably prevents hangovers. No supplement makes it safe to drive after
            drinking.
          </p>
          <p>
            Ask a doctor or pharmacist before taking DHM if you take prescription medicine,
            are pregnant or breastfeeding, or have liver or kidney disease. For dose and
            timing, see the <Link to="/guide">DHM guide</Link>.
          </p>
        </section>

        {/* ===================== FURTHER READING ===================== */}
        <section className="m-section" aria-labelledby="more-heading">
          <h2 id="more-heading">Head-to-head comparisons</h2>
          <ul className="m-links">
            {MATCHUPS.map(({ a, b, slug, desc }) => (
              <li key={slug}>
                <Link to={`/never-hungover/${slug}`}>
                  {NOTES[a].short} vs {NOTES[b].short}
                </Link>
                <span className="m-soft"> {desc()}</span>
              </li>
            ))}
          </ul>
          <p>
            To put up to four products side by side, use the{' '}
            <Link to="/compare">comparison tool</Link>.
          </p>
          {/* Mirrored in the /reviews prerender stub (scripts/prerender-main-pages.js). */}
          <p className="m-small">
            More buying guides:{' '}
            {BUYING_GUIDES.map((g, i) => (
              <span key={g.slug}>
                {i > 0 && ' · '}
                <Link to={`/never-hungover/${g.slug}`}>{g.label}</Link>
              </span>
            ))}
          </p>
        </section>
      </div>
    </div>
  )
}
