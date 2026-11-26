import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO } from '../hooks/useSEO.js'
import engagementTracker from '../utils/engagement-tracker.js'
import { trackEvent } from '../lib/posthog'
import { buildAffiliateUrl } from '../lib/utm-builder.js'
import topProducts from '../data/topProducts.json'
import '../styles/theme-modern.css'

/**
 * /dhm-dosage-calculator. A form, an instant result, and one next step: the
 * cheapest product in topProducts.json that delivers the dose. Laid out on the
 * blog post system ([data-blog="post"] in theme-modern.css), which also gives
 * the buy button its ink-on-orange label.
 *
 * The dose rule (5 mg/kg, 300 mg floor, adjustments, round to 50, 1,200 mg cap)
 * is unchanged; tests/restyle-calculator.spec.js guards it. The FAQ schema in
 * scripts/prerender-main-pages.js must match the FAQ text below.
 *
 * Affiliate clicks are tracked by the global listener
 * (src/hooks/useAffiliateTracking.js) from the data-* attributes; no onClick.
 */

const PUBMED = 'https://pubmed.ncbi.nlm.nih.gov/'

const TOLERANCE = [
  { value: 'low', label: 'Rarely drink', multiplier: 1.2 },
  { value: 'moderate', label: 'Socially', multiplier: 1.0 },
  { value: 'high', label: 'Regularly', multiplier: 0.8 },
]

const PURPOSE = [
  { value: 'prevention', label: 'Before drinking' },
  { value: 'recovery', label: 'After drinking' },
]

const FAQ = [
  {
    q: 'How much DHM should I take?',
    a: 'Most people take 300 to 600 mg. This calculator starts at 5 mg per kilogram of body weight with a 300 mg minimum, which puts a 150 lb person at 350 mg. No human trial has tested DHM doses, so treat any number, this one included, as a starting point.',
  },
  {
    q: 'When should I take it?',
    a: '30 to 60 minutes before your first drink, with water. The animal studies gave DHM around the time of drinking, and there is little evidence for taking it the morning after.',
  },
  {
    q: 'Is it safe?',
    a: 'The one small human trial (25 adults, 2024) reported no safety problems, which says little about regular use. Skip it, or ask a doctor first, if you are pregnant or breastfeeding, take prescription medication, or have liver disease. The 1,200 mg ceiling here is a cautious limit we chose, not a tested threshold.',
  },
  {
    q: 'Does DHM work?',
    a: 'The evidence is thin. DHM counteracted alcohol intoxication in rats and protected the liver in mice, both given by injection. The one controlled human trial we know of tested a drink made with raisin-tree extract, not DHM capsules. It found lower blood alcohol in the first half hour and milder stomach symptoms than placebo.',
  },
]

const money = (n) => `$${n.toFixed(2)}`

/** The cheapest catalog product that gets within -25%/+50% of the dose. */
function cheapestMatch(dose) {
  const options = topProducts.map((p) => {
    const mgPerServing = parseInt(p.dhm, 10)
    const servings = Math.max(1, Math.round(dose / mgPerServing))
    return {
      product: p,
      servings,
      mg: servings * mgPerServing,
      cost: servings * parseFloat(p.pricePerServing.slice(1)),
    }
  })
  const fits = options.filter((o) => o.mg >= dose * 0.75 && o.mg <= dose * 1.5)
  return (fits.length ? fits : options).sort((a, b) => a.cost - b.cost)[0]
}

export default function DosageCalculatorEnhanced() {
  useSEO({
    title: 'DHM Dosage Calculator: How Much DHM Should I Take?',
    description: 'Enter your weight and how much you plan to drink to get a starting DHM dose, when to take it, and the cheapest product that delivers it.',
    keywords: 'DHM dosage calculator, how much DHM should I take, dihydromyricetin dosage, DHM dosage by weight',
    canonicalUrl: 'https://www.dhmguide.com/dhm-dosage-calculator',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'DHM Dosage Calculator',
        applicationCategory: 'HealthApplication',
        description: 'Gives a starting DHM dose from body weight, number of drinks, drinking time and tolerance.',
        url: 'https://www.dhmguide.com/dhm-dosage-calculator',
        operatingSystem: 'Web Browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        creator: { '@type': 'Organization', name: 'DHM Guide', url: 'https://www.dhmguide.com' },
        // First commit of this page: f824efd, 2025-07-05.
        datePublished: '2025-07-05',
        dateModified: '2026-11-27',
      },
    ],
  })

  const [weight, setWeight] = useState(150)
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [drinks, setDrinks] = useState(4)
  const [drinkingDuration, setDrinkingDuration] = useState(3)
  const [tolerance, setTolerance] = useState('moderate')
  const [purpose, setPurpose] = useState('prevention')
  const [showResults, setShowResults] = useState(false)
  const resultsRef = useRef(null)

  useEffect(() => {
    engagementTracker.trackEvent('calculator_page_view', { referrer: document.referrer })
  }, [])

  const weightInKg = useMemo(
    () => (weightUnit === 'lbs' ? weight * 0.453592 : weight),
    [weight, weightUnit]
  )

  // The dose rule, unchanged from the previous version of this page: rawDose is
  // everything before rounding, calculateDosage rounds to 50 mg and caps at 1,200.
  const rawDose = useMemo(() => {
    let dose = Math.max(300, weightInKg * 5)
    if (drinks > 4) dose += (drinks - 4) * 50
    if (drinkingDuration > 4) dose += (drinkingDuration - 4) * 25
    dose *= TOLERANCE.find((t) => t.value === tolerance).multiplier
    if (purpose === 'recovery') dose *= 1.3
    return dose
  }, [weightInKg, drinks, drinkingDuration, tolerance, purpose])
  const calculateDosage = Math.min(Math.round(rawDose / 50) * 50, 1200)

  // Only the steps that changed the number, each with its real effect.
  const steps = useMemo(() => {
    const kg = Number(weightInKg.toFixed(1))
    const byWeight = weightInKg * 5
    const out = [
      byWeight < 300
        ? `${kg} kg × 5 mg per kg comes to under 300 mg, so we start at the 300 mg minimum`
        : `${kg} kg × 5 mg per kg = ${Math.round(byWeight)} mg`,
    ]
    if (drinks > 4) out.push(`+${(drinks - 4) * 50} mg for ${drinks} drinks (50 mg for each drink past four)`)
    if (drinkingDuration > 4) out.push(`+${(drinkingDuration - 4) * 25} mg for ${drinkingDuration} hours (25 mg for each hour past four)`)
    if (tolerance === 'low') out.push('20% more because you rarely drink')
    if (tolerance === 'high') out.push('20% less because you drink regularly')
    if (purpose === 'recovery') out.push('30% more for taking it after drinking')
    if (Math.round(rawDose / 50) * 50 > 1200) out.push('Capped at 1,200 mg')
    else if (Math.round(rawDose) !== calculateDosage) out.push(`Rounded from ${Math.round(rawDose)} mg to the nearest 50 mg`)
    return out
  }, [weightInKg, drinks, drinkingDuration, tolerance, purpose, rawDose, calculateDosage])

  const match = useMemo(() => cheapestMatch(calculateDosage), [calculateDosage])

  const handleCalculate = () => {
    trackEvent('calculator_form_submitted', {
      weight,
      weight_unit: weightUnit,
      drinks_planned: drinks,
      drinking_duration: drinkingDuration,
      tolerance,
      purpose,
      page_path: window.location.pathname,
    })
    engagementTracker.trackCalculatorStart()
    setShowResults(true)
    try {
      localStorage.setItem('dhm_last_dosage', String(calculateDosage))
    } catch {
      // Storage blocked (private mode); the result still shows.
    }
    engagementTracker.trackCalculatorCompletion(calculateDosage)
    trackEvent('calculator_results_viewed', {
      recommended_dose: calculateDosage,
      weight,
      weight_unit: weightUnit,
      drinks,
      purpose,
      matched_product: match.product.name,
      page_path: window.location.pathname,
    })
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const minW = weightUnit === 'lbs' ? 90 : 40
  const maxW = weightUnit === 'lbs' ? 350 : 160
  const segBtn = { minHeight: 44, paddingInline: '1rem' }
  const group = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }

  return (
    <div className="theme-modern" data-blog="post">
      <div className="post-shell">
        <div className="post-head">
          <p className="post-eyebrow t-label">Tool</p>
          <h1 className="post-title">DHM dosage calculator</h1>
          <p className="post-lead">
            Enter your weight and what you plan to drink. You get a starting dose, when to take it,
            and the cheapest product we track that delivers it.
          </p>
          <hr className="post-rule" />
        </div>

        <form
          id="calculator"
          onSubmit={(e) => { e.preventDefault(); handleCalculate() }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)', marginTop: 'var(--s1)', maxWidth: '36rem' }}
        >
          <div style={group}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              <label className="label" htmlFor="calc-weight">Body weight</label>
              <div className="segmented" role="group" aria-label="Weight unit">
                {['lbs', 'kg'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    className="segmented__btn"
                    style={segBtn}
                    aria-pressed={weightUnit === u}
                    onClick={() => {
                      if (u === weightUnit) return
                      setWeightUnit(u)
                      setWeight(Math.round(u === 'kg' ? weight * 0.453592 : weight * 2.20462))
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-affix">
              <input
                id="calc-weight"
                type="number"
                inputMode="numeric"
                value={weight}
                // Clamp on blur, not per keystroke: clamping on change snapped the
                // first typed digit ("1" of "180") to the minimum.
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                onBlur={() => setWeight(Math.max(minW, Math.min(maxW, weight)))}
                className="input input-num"
                style={{ width: '6rem' }}
              />
              <span className="input__unit">{weightUnit}</span>
            </div>
            <input
              className="range"
              type="range"
              aria-label="Body weight slider"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value, 10))}
              min={minW}
              max={maxW}
              step={1}
            />
          </div>

          <div style={group}>
            <label className="label" htmlFor="calc-drinks">Drinks</label>
            <div className="input-affix">
              <input
                id="calc-drinks"
                type="number"
                inputMode="numeric"
                value={drinks}
                onChange={(e) => setDrinks(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                className="input input-num"
                style={{ width: '5rem' }}
              />
              <span className="input__unit">drinks</span>
            </div>
            <input
              className="range"
              type="range"
              aria-label="Number of drinks slider"
              value={drinks}
              onChange={(e) => setDrinks(parseInt(e.target.value, 10))}
              min={1}
              max={12}
              step={1}
            />
            <p style={{ margin: 0, fontSize: 'var(--text-small)', color: 'var(--color-ink-soft)' }}>
              One drink is a 12 oz beer, 5 oz of wine or a 1.5 oz shot.
            </p>
          </div>

          <div style={group}>
            <label className="label" htmlFor="calc-duration">Over how many hours</label>
            <div className="input-affix">
              <input
                id="calc-duration"
                type="number"
                inputMode="decimal"
                value={drinkingDuration}
                onChange={(e) => setDrinkingDuration(Math.max(1, Math.min(8, parseFloat(e.target.value) || 1)))}
                step="0.5"
                className="input input-num"
                style={{ width: '5rem' }}
              />
              <span className="input__unit">hours</span>
            </div>
            <input
              className="range"
              type="range"
              aria-label="Drinking duration slider"
              value={drinkingDuration}
              onChange={(e) => setDrinkingDuration(parseFloat(e.target.value))}
              min={1}
              max={8}
              step={0.5}
            />
          </div>

          <div style={group}>
            <span className="label" id="calc-tolerance-label">How often you drink</span>
            <div className="segmented" role="radiogroup" aria-labelledby="calc-tolerance-label" style={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}>
              {TOLERANCE.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={tolerance === t.value}
                  className="segmented__btn"
                  style={segBtn}
                  onClick={() => setTolerance(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={group}>
            <span className="label" id="calc-purpose-label">When you&rsquo;ll take it</span>
            <div className="segmented" role="radiogroup" aria-labelledby="calc-purpose-label" style={{ alignSelf: 'flex-start' }}>
              {PURPOSE.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={purpose === p.value}
                  className="segmented__btn"
                  style={segBtn}
                  onClick={() => setPurpose(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-lg btn-block"
            style={{ backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)', color: 'var(--color-on-brand)' }}
          >
            Calculate my personalized dosage
          </button>
        </form>

        {showResults && (
          <section
            id="results"
            ref={resultsRef}
            aria-live="polite"
            className="post-answer"
            style={{ maxWidth: '36rem', marginTop: 'var(--s2)', scrollMarginTop: 'calc(var(--header-height, 80px) + 1rem)' }}
          >
            <h2 className="post-block-label">Your starting dose</h2>
            <p style={{ margin: 0, fontSize: 'clamp(3rem, 2.4rem + 3vw, 4.5rem)', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {calculateDosage} mg
            </p>
            <p style={{ margin: 'var(--space-3) 0 0' }}>
              {purpose === 'prevention'
                ? 'Take it 30 to 60 minutes before your first drink, with a glass of water.'
                : 'Take it after your last drink, with water. This is the least-studied way to use DHM.'}
            </p>

            <ul style={{ margin: 'var(--space-4) 0 0', paddingLeft: '1.25em', fontSize: 'var(--text-small)', color: 'var(--color-ink-soft)' }}>
              {steps.map((s) => <li key={s}>{s}</li>)}
            </ul>

            <p style={{ margin: 'var(--space-4) 0 0', fontSize: 'var(--text-small)' }}>
              A starting point, not medical advice. No human trial has tested DHM doses, so the rule
              above is ours.
            </p>

            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-rule)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-subheading)', fontWeight: 600, lineHeight: 1.3 }}>
                Cheapest way to get it
              </h3>
              <p style={{ margin: 'var(--space-2) 0 0' }}>
                {match.servings === 1 ? 'One serving' : `${match.servings} servings`} of{' '}
                {match.product.name} gives {match.mg.toLocaleString()} mg for about {money(match.cost)}.
              </p>
              <p style={{ margin: 'var(--space-2) 0 var(--space-4)', fontSize: 'var(--text-small)', color: 'var(--color-ink-soft)' }}>
                We earn a commission if you buy through this link, at no cost to you.
              </p>
              <a
                className="btn btn-cta btn-block"
                href={buildAffiliateUrl(match.product.affiliateLink, { componentId: 'calculator-result-cta' })}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                data-component-id="calculator-result-cta"
                data-placement="calculator_result"
                data-product-name={match.product.name}
                style={{ boxShadow: 'none' }}
              >
                Check price on Amazon
              </a>
              <p style={{ margin: 'var(--space-4) 0 0', fontSize: 'var(--text-small)' }}>
                <Link to="/reviews" style={{ color: 'var(--color-accent)' }}>
                  Or compare all eight products we track
                  <ChevronRight aria-hidden="true" style={{ display: 'inline', width: '1em', height: '1em', verticalAlign: '-0.15em' }} />
                </Link>
              </p>
            </div>
          </section>
        )}

        <div className="article-body" style={{ marginTop: 'var(--s3)' }}>
          <h2 id="faq">Questions</h2>
          {FAQ.map((f) => (
            <React.Fragment key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </React.Fragment>
          ))}
          <p>
            The <Link to="/guide">DHM guide</Link> covers the studies in more detail.
          </p>

          <h2>Sources</h2>
          <ul>
            <li>
              Shen et al., 2012, <em>Journal of Neuroscience</em>. Rats, DHM by injection.{' '}
              <a href={`${PUBMED}22219299/`} target="_blank" rel="noopener noreferrer">PubMed</a>
            </li>
            <li>
              Silva et al., 2020, <em>Alcoholism: Clinical and Experimental Research</em>. Mice, DHM by injection.{' '}
              <a href={`${PUBMED}32267550/`} target="_blank" rel="noopener noreferrer">PubMed</a>
            </li>
            <li>
              Lee et al., 2024, <em>Foods</em>. 25 adults, raisin-tree extract drinks against placebo.{' '}
              <a href={`${PUBMED}39766963/`} target="_blank" rel="noopener noreferrer">PubMed</a>
            </li>
          </ul>
          <p>
            More studies on our <Link to="/research">research page</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
