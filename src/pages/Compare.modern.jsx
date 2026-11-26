import React, { useState, useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import AmazonLink from '../components/modern/AmazonLink.jsx'
import topProductsData from '@/data/topProducts.json'
import {
  NOTES,
  PRODUCTS_BY_ID,
  doseLabel,
  servingPrice,
  costPer1000,
  usd,
  shortName,
  numberWord,
} from '../data/productNotes.js'
import '../styles/theme-modern.css'
import '../styles/money-pages.css'

/**
 * /compare, modern arm (flag site-modern-v1, shipped to 100%).
 *
 * A picker (up to four products) above one table: products as columns, measures as
 * rows, a buy link under each product name so it is reachable in the first phone
 * screen and a half. On phones the table scrolls sideways inside a signposted box
 * with the row labels pinned.
 *
 * Every value is read or computed from topProducts.json. Nothing is scored by hand:
 * the shaded "best" cells and the picked-products cards are arithmetic on price,
 * dose and Amazon ratings, and they only judge the products the reader picked.
 *
 * The ?products= query is read on mount and written back on every change, so a
 * shared link shows what the sender saw.
 *
 * Affiliate links render through AmazonLink (plain <a>, data-* attributes, no
 * onClick); the global listener fires affiliate_link_click.
 */

const MAX_PICKED = 4

// Default selection: the top three of the /reviews ranking.
const DEFAULT_IDS = [...topProductsData].sort((a, b) => b.score - a.score).slice(0, 3).map((p) => p.id)

/** Ingredients other than DHM, as listed in the data. */
const addIns = (p) =>
  (p.ingredients ?? [])
    .filter((x) => !/^DHM\b|dihydromyricetin|vine tea/i.test(x))
    .map((x) => x.replace(/\s*\(.*\)$/, ''))

const MATCHUPS = [
  { title: 'No Days Wasted vs NusaPure', slug: 'no-days-wasted-vs-nusapure-dhm-comparison-2025' },
  { title: 'Double Wood vs No Days Wasted', slug: 'double-wood-vs-no-days-wasted-dhm-comparison-2025' },
  { title: 'Flyby vs Double Wood', slug: 'flyby-vs-double-wood-complete-comparison-2025' },
  { title: 'No Days Wasted vs Toniiq Ease', slug: 'no-days-wasted-vs-toniiq-ease-dhm-comparison-2025' },
  { title: 'Double Wood vs Cheers Restore', slug: 'double-wood-vs-cheers-restore-dhm-comparison-2025' },
  { title: 'Flyby vs No Days Wasted', slug: 'flyby-vs-no-days-wasted-complete-comparison-2025' },
  { title: 'No Days Wasted vs DHM Depot', slug: 'no-days-wasted-vs-dhm-depot-comparison-2025' },
  { title: 'Double Wood vs Fuller Health', slug: 'double-wood-vs-fuller-health-after-party-comparison-2025' },
]

function writeSelectionToUrl(ids) {
  try {
    const url = new URL(window.location.href)
    if (ids.length) url.searchParams.set('products', ids.join(','))
    else url.searchParams.delete('products')
    window.history.replaceState(window.history.state, '', url)
  } catch {
    /* history unavailable; the selection still works on the page */
  }
}

export default function CompareModern() {
  useSEO(generatePageSEO('compare'))

  const [selected, setSelected] = useState(DEFAULT_IDS)

  // One-time read of ?products= (browser only).
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('products')
    if (!raw) return
    const ids = raw
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter((id, i, all) => PRODUCTS_BY_ID[id] && all.indexOf(id) === i)
      .slice(0, MAX_PICKED)
    // One-time sync from the browser URL (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ids.length) setSelected(ids)
  }, [])

  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : selected.length < MAX_PICKED
        ? [...selected, id]
        : selected
    setSelected(next)
    writeSelectionToUrl(next)
  }

  const picked = selected.map((id) => PRODUCTS_BY_ID[id]).filter(Boolean)
  const full = picked.length >= MAX_PICKED

  // Arithmetic winners among the picked products only.
  const lowest = (f) => Math.min(...picked.map(f))
  const highest = (f) => Math.max(...picked.map(f))
  const bestOf = (f, dir) => {
    const target = dir === 'min' ? lowest(f) : highest(f)
    return picked.find((p) => f(p) === target)
  }
  const isBest = (f, dir, p) => picked.length > 1 && f(p) === (dir === 'min' ? lowest(f) : highest(f))

  const rating = (p) => Number(p.rating)
  const reviewCount = (p) => Number(p.reviews)

  const rows = [
    { label: 'DHM per serving', cell: (p) => doseLabel(p) },
    { label: 'Price per serving', cell: (p) => p.pricePerServing, best: [servingPrice, 'min'] },
    { label: 'Cost per 1,000 mg', cell: (p) => usd(costPer1000(p)), best: [costPer1000, 'min'] },
    { label: 'Bottle price', cell: (p) => p.price },
    { label: 'Servings', cell: (p) => p.servings },
    {
      label: 'Amazon rating',
      cell: (p) => (
        <>
          {rating(p).toFixed(1)}
          <span className="m-soft"> ({reviewCount(p).toLocaleString('en-US')} ratings)</span>
        </>
      ),
      best: [rating, 'max'],
    },
    {
      label: 'Other ingredients',
      text: true,
      cell: (p) => (addIns(p).length ? addIns(p).join(', ') : 'None, DHM only'),
    },
    { label: 'Who it suits', text: true, cell: (p) => NOTES[p.id]?.suits ?? '' },
  ]

  const value = picked.length > 1 ? bestOf(costPer1000, 'min') : null
  const rated = picked.length > 1 ? bestOf(rating, 'max') : null
  const popular = picked.length > 1 ? bestOf(reviewCount, 'max') : null

  return (
    <div className="theme-modern" data-money="compare">
      <div className="m-shell m-shell--wide">
        <div className="m-head" data-testid="compare-hero-modern">
          <p className="m-eyebrow t-label">Comparison tool</p>
          <h1 className="m-title">Compare DHM supplements side by side</h1>
          <p className="m-lead">
            Pick up to four products. The table lines them up on dose, price, the cost of a
            1,000 mg dose and Amazon ratings.
          </p>
          <p className="m-meta">
            Prices from the Amazon listings · Updated November 2026
          </p>
          <p className="m-disclosure">
            We earn a commission if you buy through our Amazon links. It does not change
            the price you pay.
          </p>
        </div>
        <hr className="m-rule" />

        {/* ===================== PICKER ===================== */}
        <section className="m-section m-section--tight" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="m-sr">Choose products</h2>
          <ul className="m-picker" aria-label="Products to compare">
            {topProductsData.map((p, index) => {
              const on = selected.includes(p.id)
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    aria-pressed={on}
                    disabled={!on && full}
                    onClick={() => toggle(p.id)}
                    data-track="product"
                    data-product-name={p.name}
                    data-product-position={index + 1}
                  >
                    {shortName(p)}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="m-small m-picker-note" aria-live="polite">
            {picked.length === 0
              ? 'Pick at least one product to see the table.'
              : full
                ? 'Four is the most the table shows. Remove one to add another.'
                : picked.length === 1
                  ? 'Pick another product to compare it with.'
                  : `${numberWord(picked.length)[0].toUpperCase()}${numberWord(picked.length).slice(1)} picked. You can add ${numberWord(MAX_PICKED - picked.length)} more.`}
          </p>
        </section>

        {/* ===================== TABLE ===================== */}
        {picked.length > 0 && (
          <section className="m-section m-section--tight" aria-labelledby="table-heading">
            <h2 id="table-heading" className="m-sr">Comparison</h2>
            {picked.length > 1 && (
              <p className="m-small m-scroll-hint">Swipe the table sideways to see every product.</p>
            )}
            <div
              className="m-scroll"
              tabIndex={0}
              role="region"
              aria-label="Product comparison table (scrolls sideways on small screens)"
            >
              <table className="m-ctable">
                <thead>
                  <tr>
                    <th scope="col"><span className="m-sr">Measure</span></th>
                    {picked.map((p, i) => (
                      <th key={p.id} scope="col">
                        <span className="m-colname">{p.name}</span>
                        <AmazonLink
                          product={p}
                          componentId={`compare-table-cta-${p.id}`}
                          placement="compare_table"
                          position={i}
                          className="btn btn-cta btn-sm"
                        >
                          Check price
                        </AmazonLink>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {picked.map((p) => (
                        <td
                          key={p.id}
                          className={[
                            row.text ? 'm-text' : '',
                            row.best && isBest(row.best[0], row.best[1], p) ? 'is-best' : '',
                          ].join(' ').trim() || undefined}
                        >
                          {row.cell(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {picked.length > 1 && (
              <p className="m-small">
                Shaded cells mark the lowest price and the highest rating among the products
                you picked. Prices come from the Amazon listings and change often.
              </p>
            )}
          </section>
        )}

        {/* ===================== PICKED-PRODUCT WINNERS ===================== */}
        {picked.length > 1 && (
          <section className="m-section" aria-labelledby="winners-heading">
            <h2 id="winners-heading">Of the products you picked</h2>
            <div className="m-cards">
              {[
                {
                  title: 'Best Value',
                  p: value,
                  why: (p) => `${usd(costPer1000(p))} for 1,000 mg of DHM, the least of your picks.`,
                  id: 'compare-winner-value',
                },
                {
                  title: 'Highest Rated',
                  p: rated,
                  why: (p) => `${rating(p).toFixed(1)} on Amazon, from ${reviewCount(p).toLocaleString('en-US')} ratings.`,
                  id: 'compare-winner-rated',
                },
                {
                  title: 'Most Ratings',
                  p: popular,
                  why: (p) => `${reviewCount(p).toLocaleString('en-US')} Amazon ratings, so the most buyer history to go on.`,
                  id: 'compare-winner-popular',
                },
              ]
                // When one product wins two cards, show it once.
                .filter((card, i, all) => all.findIndex((c) => c.p.id === card.p.id) === i)
                .map(({ title, p, why, id }) => (
                <div key={title} className="m-card">
                  <h3>{title}</h3>
                  <p className="m-card__name">{p.name}</p>
                  <p className="m-card__why">{why(p)}</p>
                  <AmazonLink product={p} componentId={id} placement="compare_winner" className="m-textlink">
                    Check price on Amazon
                  </AmazonLink>
                </div>
              ))}
            </div>
            <p className="m-small">
              These only judge the products you picked. For our pick across all eight and
              the reasoning behind it, read the <Link to="/reviews">DHM supplement reviews</Link>.
            </p>
          </section>
        )}

        {/* ===================== HOW TO READ IT ===================== */}
        <section className="m-section" aria-labelledby="notes-heading">
          <h2 id="notes-heading">How to read the table</h2>
          <p>
            Cost per 1,000 mg is the price per serving divided by the DHM dose, scaled to
            1,000 mg. It is the fairest way to compare a 300 mg product with a 1,000 mg one:
            at {PRODUCTS_BY_ID[3].pricePerServing} a serving, Toniiq Ease looks cheaper than
            No Days Wasted, but a full 1,000 mg of DHM costs {usd(costPer1000(PRODUCTS_BY_ID[3]))}{' '}
            from Toniiq and {usd(costPer1000(PRODUCTS_BY_ID[1]))} from No Days Wasted.
          </p>
          <p>
            Ratings are Amazon&rsquo;s, shown with how many people left one. Read the count
            before the score: a high average from a few dozen buyers is weaker evidence than
            a slightly lower one from thousands.
          </p>
          <p>
            We did not run lab tests on these products, and we do not score them on
            effectiveness.
            Human research on DHM is thin, and none of it shows that one brand works better
            than another. For dose and timing, see the <Link to="/guide">DHM guide</Link>.
          </p>
        </section>

        {/* ===================== MATCHUPS ===================== */}
        <section className="m-section" aria-labelledby="matchups-heading">
          <h2 id="matchups-heading">Head-to-head comparisons</h2>
          <ul className="m-links">
            {MATCHUPS.map((m) => (
              <li key={m.slug}>
                <Link to={`/never-hungover/${m.slug}`}>{m.title}</Link>
              </li>
            ))}
          </ul>
          <p>
            <Link to="/never-hungover?tag=comparison">All comparison articles</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
