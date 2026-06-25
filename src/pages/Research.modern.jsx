import React, { useState, useMemo, useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { researchStudies as studies } from '../data/research-studies.js'
import { formatAPA } from '../utils/citationFormatter.js'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
import { buildAffiliateUrl } from '../lib/utm-builder.js'
import topProductsData from '../data/topProducts.json'
import {
  Microscope,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  Beaker,
  Brain,
  Heart,
  Shield,
  BarChart3,
  Award,
  CheckCircle,
  Clock,
  Filter,
  Copy,
  Check,
  ShoppingCart,
} from 'lucide-react'
import '../styles/theme-modern.css'

/**
 * Research.modern — the "modern" arm of the /research A/B test
 * (flag key: "research-modern-v1"). A flag-gated restyle of the CONTROL page
 * (src/pages/Research.jsx), built on the approved 2026 design language
 * (docs/design-modernization-2026-06-25/recommendations/research.md): warm
 * paper palette, Fraunces display headings in SOLID ink (no gradient clip-text),
 * border-first cards, green demoted to mark+trust, and a single saturated orange
 * reserved exclusively for the conversion CTA.
 *
 * Reuse contract with CONTROL (src/pages/Research.jsx):
 *   - Same data sources (researchStudies, formatAPA) — no new data.
 *   - Same filter/timeline state + computed memos (category, year, showTimeline,
 *     humanTrialCount, yearsOfResearch, keyFindings, filteredStudies,
 *     timelineData) copied verbatim.
 *   - Same SEO: useSEO(generatePageSEO('research')).
 *   - All h1/h2 text + PubMed external links + internal /reviews & /guide links
 *     preserved for SEO/ranking parity (restyle only).
 *
 * Page-specific modernization moves applied (from the recommendation doc):
 *   1. Warm-paper foundation + solid ink editorial headings (kill green/blue
 *      wash + gradient clip-text).
 *   2. Constrain long-form study/RCT prose to a ~66ch reading measure
 *      (container-prose) while filters/stats stay at container width.
 *   3. ONE orange "Check Price on Amazon" body affiliate CTA inserted right
 *      after the Key Findings proof (closes the verified no-body-CTA gap;
 *      direct affiliate_link_click driver) — wired through the affiliate
 *      contract (data-experiment-key / data-variant / data-component-id, no
 *      onClick).
 *   5. Collapse the 4-hue accent system to green-mark + orange-CTA + neutral:
 *      purple timeline button → neutral/ghost, blue "significance" boxes →
 *      desaturated brand-soft, single green active state for BOTH filter rows.
 *   6. Key Findings cards: flat border-first surface (no green gradient, no
 *      uniform shadow-lg).
 *   7. Drop the per-card framer-motion entrance stagger entirely (it crawled on
 *      a 25-study list); cards render statically and lift on hover via the
 *      shared .card-raised tier — matching the Reviews.modern gold reference.
 *
 * Isolation contract: the ENTIRE page body is wrapped in
 * <div className="theme-modern"> and the scoped stylesheet
 * src/styles/theme-modern.css is imported here so the modern CSS is code-split
 * into this chunk — CONTROL users pay nothing. preloadModernFonts() runs on
 * mount (variant arm only).
 */

const EXPERIMENT_KEY = 'research-modern-v1'

/**
 * Copy-to-clipboard button rendered per study card. Local "Copied!" feedback
 * lasts ~2s before reverting. Restyled to the theme (neutral ghost button); the
 * data-copy-apa hook is preserved for parity with the control.
 */
function CopyAPAButton({ citation }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Clipboard write failed:', err)
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-secondary btn-sm btn-block"
      data-copy-apa="true"
    >
      {copied ? (
        <>
          <Check aria-hidden="true" /> Copied!
        </>
      ) : (
        <>
          <Copy aria-hidden="true" /> Copy APA Citation
        </>
      )}
    </button>
  )
}

export default function ResearchModern() {
  useSEO(generatePageSEO('research'))

  // Variant arm only: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts()
  }, [])

  // ----- State + logic copied VERBATIM from the control (src/pages/Research.jsx) -----
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [showTimeline, setShowTimeline] = useState(false)

  const researchCategories = useMemo(() => [
    { id: 'all', label: 'All Studies', count: studies.length },
    { id: 'metabolism', label: 'Alcohol Metabolism', count: studies.filter(s => s.category === 'metabolism').length },
    { id: 'liver', label: 'Liver Protection', count: studies.filter(s => s.category === 'liver').length },
    { id: 'neuroprotection', label: 'Neuroprotection', count: studies.filter(s => s.category === 'neuroprotection').length }
  ], [])

  const humanTrialCount = useMemo(
    () => studies.filter(s => s.type === 'Human Clinical Trial').length,
    []
  )
  const yearsOfResearch = useMemo(() => {
    const years = studies.map(s => s.year)
    return Math.max(...years) - Math.min(...years)
  }, [])

  const yearFilters = [
    { id: 'all', label: 'All Years' },
    { id: '2026', label: '2026' },
    { id: '2025', label: '2025' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' },
    { id: '2022', label: '2022' },
    { id: '2021', label: '2021' },
    { id: '2020', label: '2020' },
    { id: 'pre2020', label: 'Before 2020' }
  ]

  const keyFindings = [
    {
      icon: <TrendingUp aria-hidden="true" />,
      title: '70% Faster',
      subtitle: 'alcohol clearance from system',
      study: 'UCLA 2012'
    },
    {
      icon: <Shield aria-hidden="true" />,
      title: '45% Reduction',
      subtitle: 'in liver enzyme damage markers',
      study: 'USC 2020'
    },
    {
      icon: <Brain aria-hidden="true" />,
      title: '50% Less Fibrosis',
      subtitle: 'in liver scarring markers',
      study: 'Army Medical University 2021'
    },
    {
      icon: <Heart aria-hidden="true" />,
      title: '60% Reduction',
      subtitle: 'in liver toxicity markers',
      study: 'Jilin University 2022'
    }
  ]

  const filteredStudies = useMemo(() => {
    let filtered = studies

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(study => study.category === selectedCategory)
    }

    if (selectedYear !== 'all') {
      if (selectedYear === 'pre2020') {
        filtered = filtered.filter(study => study.year < 2020)
      } else {
        filtered = filtered.filter(study => study.year === parseInt(selectedYear))
      }
    }

    return filtered
  }, [selectedCategory, selectedYear])

  const timelineData = useMemo(() => {
    return studies
      .sort((a, b) => b.year - a.year)
      .map(study => ({
        year: study.year,
        title: study.title,
        type: study.type,
        category: study.category,
        institution: study.institution,
        keyFinding: study.keyResults[0],
        id: study.id
      }))
  }, [])

  // ----- Modern theme presentation -----

  // Study-type badge classes mapped to the calm theme palette. The control used
  // 4 different hues (green/blue/purple/orange) per type; here every type chip is
  // a neutral theme badge so the lone orange CTA stays the only saturated accent.
  const typeBadgeClass = (type) => {
    if (type === 'Human Clinical Trial') return 'badge badge-brand'
    return 'badge'
  }

  // Body affiliate CTA target — the site's #1 reviewed product. Single source of
  // truth shared with /reviews (src/data/topProducts.json).
  const winnerProduct = topProductsData?.[0]
  const ctaComponentId = 'research-modern-proof-cta'

  return (
    <div
      className="theme-modern"
      style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      {/* ============================ HERO ============================ */}
      <section
        data-testid="research-hero-modern"
        className="surface-wash"
        style={{ paddingBlock: 'var(--section-y)' }}
      >
        <div className="container">
          <div
            className="section-head section-head--center"
            style={{ marginInline: 'auto', marginBottom: 0 }}
          >
            <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
              <Microscope aria-hidden="true" />
              Randomized Controlled Trial Database 2026
            </span>

            {/* H1 — solid ink with a single green accent word; no gradient clip-text. */}
            <h1 style={{ marginTop: 'var(--space-4)' }}>
              Dihydromyricetin <span className="accent">Randomized Controlled Trial</span> Results: DHM for Hangovers
            </h1>

            <p className="lead" style={{ marginInline: 'auto' }}>
              Latest <strong>2026 randomized controlled trials</strong> prove dihydromyricetin (DHM)
              prevents hangovers. Review peer-reviewed <strong>clinical studies and RCT data</strong> on
              DHM for hangover prevention.
            </p>

            {/* Research stats — flat brand-strong numbers on paper, no card chrome. */}
            <div
              className="grid-auto"
              style={{ marginTop: 'var(--space-12)', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', maxWidth: '60rem', marginInline: 'auto' }}
            >
              <div className="stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-value">{studies.length}</span>
                <span className="stat-label">Key Studies Reviewed</span>
              </div>
              <div className="stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-value">{humanTrialCount}</span>
                <span className="stat-label">Human Clinical Trials</span>
              </div>
              <div className="stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-value">600+</span>
                <span className="stat-label">Trial Participants</span>
              </div>
              <div className="stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="stat-value">{yearsOfResearch}</span>
                <span className="stat-label">Years of Research</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== RCT HIGHLIGHT SECTION ===================== */}
      <section className="section surface-brand">
        <div className="container-prose">
          <div
            className="section-head section-head--center"
            style={{ marginInline: 'auto' }}
          >
            <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
              <Award aria-hidden="true" />
              Latest Research 2026
            </span>

            <h2>
              Dihydromyricetin Randomized Controlled Trial Hangover Studies 2023-2026
            </h2>

            <p className="lead" style={{ marginInline: 'auto' }}>
              Recent <strong>randomized controlled trials</strong> provide the highest level of
              scientific evidence for DHM&rsquo;s effectiveness in hangover prevention. These studies
              follow rigorous protocols with control groups and placebo comparisons.
            </p>
          </div>

          <div className="grid-auto" style={{ marginTop: 'var(--space-8)' }}>
            <article className="card">
              <h3 className="card-title cluster" style={{ gap: 'var(--space-2)' }}>
                <Beaker aria-hidden="true" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)' }} />
                2026 RCT Results
              </h3>
              <ul style={{ margin: 0 }}>
                <li><strong>{humanTrialCount} human clinical trials</strong> completed</li>
                <li><strong>600+ participants</strong> across studies</li>
                <li><strong>Randomized, double-blind design</strong></li>
                <li><strong>Placebo-controlled protocols</strong></li>
              </ul>
            </article>

            <article className="card">
              <h3 className="card-title cluster" style={{ gap: 'var(--space-2)' }}>
                <BarChart3 aria-hidden="true" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)' }} />
                Key RCT Findings
              </h3>
              <ul style={{ margin: 0 }}>
                <li><strong>70% faster</strong> alcohol processing</li>
                <li><strong>45% faster</strong> alcohol metabolism</li>
                <li><strong>Significant liver protection</strong> markers</li>
                <li><strong>No adverse effects</strong> reported</li>
              </ul>
            </article>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-8)' }}>
            <h3 className="card-title">
              Why Randomized Controlled Trials Matter for DHM Research
            </h3>
            <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
              <strong>Randomized controlled trials (RCTs)</strong> represent the gold standard for
              testing dihydromyricetin&rsquo;s effectiveness against hangovers. Unlike observational
              studies, RCTs eliminate bias through random assignment, control groups, and blinded
              protocols, providing definitive proof that <strong>DHM for hangovers</strong> works through
              direct causal mechanisms rather than correlation.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== KEY FINDINGS SECTION ===================== */}
      <section className="section">
        <div className="container">
          <div
            className="section-head section-head--center"
            style={{ marginInline: 'auto' }}
          >
            <span className="eyebrow">Proven results</span>
            <h2>Proven Clinical Results</h2>
            <p className="lead" style={{ marginInline: 'auto' }}>
              Evidence-based benefits from randomized controlled trials and peer-reviewed studies.
            </p>
          </div>

          {/* Flat border-first stat cards (no green gradient, no uniform shadow-lg). */}
          <div className="grid-auto">
            {keyFindings.map((finding) => (
              <article
                key={finding.title}
                className="card-raised"
                style={{ textAlign: 'center', height: '100%' }}
              >
                <span className="pathway__icon" style={{ marginInline: 'auto', marginBottom: 'var(--space-3)' }}>
                  {finding.icon}
                </span>
                <h3 className="card-title" style={{ color: 'var(--color-brand-strong)' }}>{finding.title}</h3>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-4)' }}>
                  {finding.subtitle}
                </p>
                <span className="badge badge-brand">{finding.study}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BODY AFFILIATE CTA (move #4 — peak-conviction conversion path) ===== */}
      {winnerProduct?.affiliateLink && (
        <section className="section">
          <div className="container">
            <div
              className="cta-band card"
              style={{ minHeight: '14rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}
            >
              <span className="eyebrow">Ready to put the research to work?</span>
              <h2 style={{ marginBottom: 'var(--space-3)' }}>
                Try the DHM Supplement Behind These Results
              </h2>
              <p className="lead" style={{ marginInline: 'auto' }}>
                Our top-rated pick, <strong>{winnerProduct.name}</strong>, delivers a clinically-studied
                DHM dose — the same compound shown to clear alcohol up to 70% faster.
              </p>
              <div className="cta-band__actions">
                <a
                  className="btn btn-cta btn-lg"
                  href={buildAffiliateUrl(winnerProduct.affiliateLink, {
                    componentId: ctaComponentId,
                    experimentKey: EXPERIMENT_KEY,
                    variant: 'modern',
                  })}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  data-experiment-key={EXPERIMENT_KEY}
                  data-variant="modern"
                  data-component-id={ctaComponentId}
                  data-placement="research_proof_cta"
                  data-product-name={winnerProduct.name}
                >
                  <ShoppingCart aria-hidden="true" />
                  Check Price on Amazon
                </a>
              </div>
              <p className="cta-band__reassure">
                As an Amazon Associate I earn from qualifying purchases.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===================== INTERACTIVE TIMELINE SECTION ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <div
            className="section-head section-head--center"
            style={{ marginInline: 'auto' }}
          >
            <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
              <Clock aria-hidden="true" />
              Interactive Research Timeline
            </span>

            <h2>DHM Clinical Trials Timeline 2012-2026</h2>

            <p className="lead" style={{ marginInline: 'auto' }}>
              Explore the progression of DHM research from initial discoveries to latest clinical trials.
            </p>

            {/* Purple gradient button → calm neutral secondary button (hue collapse). */}
            <button
              type="button"
              onClick={() => setShowTimeline(!showTimeline)}
              className="btn btn-secondary btn-lg"
            >
              <Clock aria-hidden="true" />
              {showTimeline ? 'Hide Timeline' : 'View Interactive Timeline'}
            </button>
          </div>

          {showTimeline && (
            <div style={{ marginTop: 'var(--space-12)' }}>
              <div className="grid-auto">
                {timelineData.map((item) => (
                  <article
                    key={item.id}
                    className="card-raised"
                    style={{ height: '100%' }}
                  >
                    <div className="cluster" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <span className="badge badge-brand">{item.year}</span>
                      <span className={typeBadgeClass(item.type)}>{item.type}</span>
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-3)' }}>
                      {item.institution}
                    </p>
                    <p style={{ margin: 0, fontSize: 'var(--text-small)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                      <CheckCircle aria-hidden="true" style={{ width: '1rem', height: '1rem', color: 'var(--color-brand)', flex: '0 0 auto', marginTop: '0.15rem' }} />
                      <span>{item.keyFinding}</span>
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================== FILTERS ===================== */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center" style={{ marginInline: 'auto', marginBottom: 'var(--space-6)' }}>
            <span className="cluster" style={{ justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--color-ink-soft)', fontWeight: 600 }}>
              <Filter aria-hidden="true" style={{ width: '1.125rem', height: '1.125rem' }} />
              Filter Studies
            </span>
          </div>

          {/* Category filters — single GREEN active state (was green vs blue split). */}
          <div className="cluster" style={{ justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            {researchCategories.map((category) => {
              const active = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  aria-pressed={active}
                  data-filter-id={category.id}
                  className="btn btn-sm"
                  style={active ? {
                    backgroundColor: 'var(--color-brand)',
                    borderColor: 'var(--color-brand)',
                    color: 'var(--color-on-brand)',
                  } : undefined}
                >
                  {category.label} ({category.count})
                </button>
              )
            })}
          </div>

          {/* Year filters — same single GREEN active state (was blue in control). */}
          <div className="cluster" style={{ justifyContent: 'center' }}>
            {yearFilters.map((year) => {
              const active = selectedYear === year.id
              return (
                <button
                  key={year.id}
                  type="button"
                  onClick={() => setSelectedYear(year.id)}
                  aria-pressed={active}
                  data-year-id={year.id}
                  className="btn btn-sm"
                  style={active ? {
                    backgroundColor: 'var(--color-brand)',
                    borderColor: 'var(--color-brand)',
                    color: 'var(--color-on-brand)',
                  } : undefined}
                >
                  {year.label}
                </button>
              )
            })}
          </div>

          {(selectedCategory !== 'all' || selectedYear !== 'all') && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <span className="badge">
                Showing {filteredStudies.length} of {studies.length} studies
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ===================== STUDIES SECTION ===================== */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-prose">
          <div className="stack" style={{ '--stack-gap': 'var(--space-8)' }}>
            {filteredStudies.map((study) => (
              <article
                key={study.id}
                className="card-raised"
              >
                <div className="cluster" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span className={typeBadgeClass(study.type)}>{study.type}</span>
                  <span className="badge">{study.year}</span>
                </div>

                <h3 className="card-title">{study.title}</h3>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>
                  {study.authors}
                </p>
                <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-4)' }}>
                  {study.journal} · {study.institution}
                </p>

                <div className="cluster" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                  <span className="stat">
                    <span className="stat-label">Participants</span>
                    <strong>{study.participants}</strong>
                  </span>
                  <span className="stat">
                    <span className="stat-label">Duration</span>
                    <strong>{study.duration}</strong>
                  </span>
                </div>

                <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', margin: '0 0 var(--space-2)' }}>Key Findings</h4>
                <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-ink-soft)' }}>{study.findings}</p>

                <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
                  <div>
                    <h5 style={{ fontWeight: 600, margin: '0 0 var(--space-2)' }}>Results:</h5>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {study.keyResults.map((result, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-small)' }}>
                          <CheckCircle aria-hidden="true" style={{ width: '1rem', height: '1rem', color: 'var(--color-brand)', flex: '0 0 auto', marginTop: '0.15rem' }} />
                          <span>{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 style={{ fontWeight: 600, margin: '0 0 var(--space-2)' }}>Study Details:</h5>
                    <div className="stack" style={{ '--stack-gap': 'var(--space-2)', fontSize: 'var(--text-small)' }}>
                      <div>
                        <span className="text-soft">Methodology:</span>
                        <p style={{ margin: 0 }}>{study.methodology}</p>
                      </div>
                      <div>
                        <span className="text-soft">Dosage:</span>
                        <p style={{ margin: 0 }}>{study.dosage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Significance — desaturated brand-soft callout (was saturated blue). */}
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-brand-soft)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', margin: '0 0 var(--space-2)' }}>Significance</h4>
                  <p style={{ margin: 0, fontSize: 'var(--text-small)', color: 'var(--color-brand-strong)' }}>{study.significance}</p>
                </div>

                <div className="cluster" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <a
                    href={study.pubmedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink aria-hidden="true" />
                    View Full PubMed Study
                  </a>
                  <CopyAPAButton citation={formatAPA(study)} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FOOTER CTA BAND (internal links preserved) ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Put it into practice</span>
            <h2>Skip Your Next Hangover</h2>
            <p className="lead">
              With proven clinical results showing up to 70% faster alcohol recovery, DHM supplements
              can help you wake up feeling amazing.
            </p>
            <div className="cta-band__actions">
              <Link
                to="/reviews"
                className="btn btn-secondary btn-lg"
                data-track="cta"
                data-cta-text="Find Your Perfect Supplement"
                data-cta-destination="/reviews"
              >
                Find Your Perfect Supplement
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/guide"
                className="btn btn-ghost btn-lg"
                data-track="cta"
                data-cta-text="Get Started Today"
                data-cta-destination="/guide"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
