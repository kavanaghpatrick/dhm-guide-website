import React, { useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import {
  Zap,
  Shield,
  Brain,
  Heart,
  Beaker,
  Microscope,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  Star,
  FlaskConical,
  Wine,
  PartyPopper,
  GlassWater,
} from 'lucide-react'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
import '../styles/theme-modern.css'

/**
 * Guide.modern — the "modern" arm of the /guide A/B test
 * (flag key: "guide-modern-v1"). A flag-gated restyle of the CONTROL page
 * (src/pages/Guide.jsx), built on the approved 2026 design language
 * (docs/design-modernization-2026-06-25/recommendations/guide.md): warm paper
 * foundation, editorial Fraunces H1 in SOLID ink with one brand-green emphasis
 * word (no gradient clip), de-rainbowed 2-tone surfaces, border-first elevation,
 * Lucide icons replacing emoji/unicode stars, and a single saturated orange
 * reserved for every primary CTA (the proven +21% conversion lever, Pattern #12).
 *
 * Reuse contract with CONTROL (src/pages/Guide.jsx):
 *   - Same content, headings text, and ALL internal links — verbatim.
 *   - Same data arrays (keyBenefits, clinicalStudies, dosageGuidelines,
 *     mechanismSteps, scenarios, FAQ, testimonials) — copied from the control.
 *   - Same SEO: useSEO(generatePageSEO('guide')).
 *   - Same conversion data-attributes on CTAs (data-track="cta" /
 *     data-cta-text / data-cta-destination) so existing tracking is unchanged.
 *
 * Isolation contract:
 *   - The ENTIRE page body is wrapped in <div className="theme-modern"> and the
 *     scoped stylesheet src/styles/theme-modern.css is imported here so the
 *     modern CSS is code-split into this chunk — CONTROL users pay nothing.
 *   - preloadModernFonts() runs on mount (variant arm only).
 *
 * No affiliate links exist on /guide — every CTA is an internal <Link> (to
 * /reviews, /research, /dhm-dosage-calculator, /never-hungover/*). So there is
 * no affiliate-CTA contract to satisfy here; primary CTAs simply use .btn-cta
 * (orange) and secondary actions use .btn-ghost / .btn-secondary.
 */

export default function GuideModern() {
  // SEO optimization for guide page (identical to control).
  useSEO(generatePageSEO('guide'))

  // Variant arm only: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts()
  }, [])

  // ---- Data copied verbatim from the control (src/pages/Guide.jsx) ----
  const keyBenefits = [
    { icon: Zap, title: 'Fast Acting', description: 'Works within 30 minutes to reduce intoxication' },
    { icon: Shield, title: 'Liver Protection', description: 'Enhances alcohol metabolism by up to 60%' },
    { icon: Brain, title: 'Mental Clarity', description: 'Prevents alcohol-induced brain fog' },
    { icon: Heart, title: 'Overall Wellness', description: 'Reduces inflammation and oxidative stress' },
  ]

  const mechanismSteps = [
    {
      step: '1',
      title: 'Enhances Alcohol Metabolism',
      description: 'Increases production of alcohol-metabolizing enzymes (ADH and ALDH) by up to 60%',
    },
    {
      step: '2',
      title: 'Reduces Acetaldehyde Toxicity',
      description: 'Speeds up elimination of toxic alcohol byproducts that cause hangover symptoms',
    },
    {
      step: '3',
      title: 'Protects GABA Receptors',
      description: 'Prevents alcohol-induced changes in brain chemistry and neurotransmitter function',
    },
    {
      step: '4',
      title: 'Provides Antioxidant Protection',
      description: 'Reduces oxidative stress and inflammation throughout the body',
    },
  ]

  // Static trust stats (designed chips, no scroll count-up — per recommendation).
  const stats = [
    { value: '11', label: 'Clinical studies' },
    { value: '70%', label: 'Faster recovery' },
    { value: '1000+', label: 'Years of safe use' },
  ]

  return (
    <div
      className="theme-modern"
      style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      {/* ============================ HERO ============================ */}
      <section
        data-testid="guide-hero-modern"
        className="surface-wash"
        style={{ paddingBlock: 'var(--section-y)' }}
      >
        <div className="container">
          <header
            className="section-head section-head--center"
            style={{ marginInline: 'auto', marginBottom: 'var(--space-12)' }}
          >
            <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
              <Zap aria-hidden="true" />
              Stop the Hangover Cycle
            </span>

            {/* Solid-ink editorial H1 — one brand-green emphasis line, NO gradient clip.
                Static (no entrance translate) to protect the LCP element. */}
            <h1 style={{ marginTop: 'var(--space-4)' }}>
              The Complete Guide to DHM
              <span className="accent" style={{ display: 'block' }}>
                Science-Based Hangover Prevention
              </span>
            </h1>

            <p className="lead" style={{ marginInline: 'auto' }}>
              Learn exactly how to take DHM to prevent hangovers — dosage, timing, and which
              products work. 11 clinical studies prove DHM reduces hangover severity by up to 70%.{' '}
              <Link to="/never-hungover/dhm-japanese-raisin-tree-complete-guide">
                From traditional medicine to cutting-edge research
              </Link>
              .{' '}
              Learn about{' '}
              <Link to="/never-hungover/dhm-science-explained">DHM&rsquo;s molecular mechanisms</Link>{' '}
              and explore our{' '}
              <Link to="/never-hungover/dhm-dosage-guide-2025">comprehensive dosage guide</Link>.
            </p>

            {/* Static designed stat chips (no count-up animation). */}
            <div
              className="trust-row"
              style={{ justifyContent: 'center', marginTop: 'var(--space-8)' }}
            >
              <span className="trust-row__item">
                <Microscope aria-hidden="true" />
                <strong>11</strong>&nbsp;clinical studies
              </span>
              <span className="trust-row__divider" aria-hidden="true" />
              <span className="trust-row__item">
                <FlaskConical aria-hidden="true" />
                <strong>70%</strong>&nbsp;faster recovery
              </span>
              <span className="trust-row__divider" aria-hidden="true" />
              <span className="trust-row__item">
                <Award aria-hidden="true" />
                <strong>1000+</strong>&nbsp;years of use
              </span>
            </div>
          </header>

          {/* Problem / Solution — de-rainbowed to a muted "problem" state (stone)
              + a brand-soft "solution" state. Two bordered tier-0 cards. */}
          <div className="pathways" style={{ marginTop: 'var(--space-12)' }}>
            <div className="card">
              <h3 className="card-title">Your current reality</h3>
              <ul style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: 'var(--text-small)' }}>
                <li>Wasted Saturdays recovering in bed</li>
                <li>Anxiety and regret the next day</li>
                <li>Missing workouts, plans, and productivity</li>
                <li>Expensive hangover &ldquo;cures&rdquo; that don&rsquo;t work</li>
              </ul>
            </div>

            <div
              className="card"
              style={{ backgroundColor: 'var(--color-brand-soft)', borderColor: 'transparent' }}
            >
              <h3 className="card-title" style={{ color: 'var(--color-brand-strong)' }}>
                Your new reality
              </h3>
              <ul className="proscons" style={{ display: 'block' }}>
                <li className="pro">
                  <CheckCircle2 aria-hidden="true" />
                  Wake up feeling refreshed and energized
                </li>
                <li className="pro">
                  <CheckCircle2 aria-hidden="true" />
                  Enjoy drinks without tomorrow&rsquo;s consequences
                </li>
                <li className="pro">
                  <CheckCircle2 aria-hidden="true" />
                  Never miss plans due to hangovers again
                </li>
                <li className="pro">
                  <CheckCircle2 aria-hidden="true" />
                  Proven science-backed prevention method
                </li>
              </ul>
            </div>
          </div>

          {/* Primary hero CTA — the single orange conversion accent. */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
            <Link
              to="/reviews"
              className="btn btn-cta btn-lg"
              data-track="cta"
              data-cta-text="Find Your DHM Supplement"
              data-cta-destination="/reviews"
            >
              Find Your DHM Supplement
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== QUICK START PROTOCOL ===================== */}
      <section className="section">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">The 3-step system</span>
            <h2>The 3-Step Hangover Prevention Protocol</h2>
            <p className="lead">Follow this simple system to never wake up hungover again.</p>
          </header>

          <div className="grid-auto">
            {/* Step 1 */}
            <div className="card">
              <div className="cluster" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span className="pathway__icon">1</span>
                <h3 className="card-title" style={{ margin: 0 }}>Before You Drink</h3>
              </div>
              <p className="text-brand" style={{ fontWeight: 600, margin: '0 0 var(--space-1)' }}>
                Take 300-600mg DHM
              </p>
              <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-3)' }}>
                30 minutes before your first drink
              </p>
              <ul className="proscons" style={{ display: 'block' }}>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Activates liver enzymes</li>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Primes alcohol metabolism</li>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Reduces next-day headache risk</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="card">
              <div className="cluster" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span className="pathway__icon">2</span>
                <h3 className="card-title" style={{ margin: 0 }}>While You Drink</h3>
              </div>
              <p className="text-brand" style={{ fontWeight: 600, margin: '0 0 var(--space-1)' }}>
                Stay Hydrated + Optional Boost
              </p>
              <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-3)' }}>
                Extra 300mg DHM if drinking heavily
              </p>
              <ul className="proscons" style={{ display: 'block' }}>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Water between drinks</li>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Keeps protection active through the night</li>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Support metabolism</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="card">
              <div className="cluster" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span className="pathway__icon">3</span>
                <h3 className="card-title" style={{ margin: 0 }}>Before Bed</h3>
              </div>
              <p className="text-brand" style={{ fontWeight: 600, margin: '0 0 var(--space-1)' }}>
                Take 300-500mg DHM
              </p>
              <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-3)' }}>
                With a glass of water
              </p>
              <ul className="proscons" style={{ display: 'block' }}>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Clear remaining toxins</li>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Support overnight recovery</li>
                <li className="pro"><CheckCircle2 aria-hidden="true" />Wake up refreshed</li>
              </ul>
            </div>
          </div>

          {/* Results promise — calm brand-soft card, single orange + ghost actions. */}
          <div className="cta-band" style={{ marginTop: 'var(--space-12)' }}>
            <h3 className="cluster" style={{ justifyContent: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 aria-hidden="true" style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-brand)' }} />
              Result: Wake up feeling like you barely drank
            </h3>
            <p className="lead">Based on 11 clinical studies showing 70% faster alcohol recovery.</p>
            <div className="cta-band__actions">
              <Link
                to="/reviews"
                className="btn btn-cta btn-lg"
                data-track="cta"
                data-cta-text="Compare DHM Supplements"
                data-cta-destination="/reviews"
              >
                Compare DHM Supplements
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/dhm-dosage-calculator"
                className="btn btn-secondary btn-lg"
                data-track="cta"
                data-cta-text="Calculate Your Dosage"
                data-cta-destination="/dhm-dosage-calculator"
              >
                Calculate Your Dosage
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== KEY BENEFITS ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">Backed by 11 studies</span>
            <h2>4 Proven DHM Benefits</h2>
            <p className="lead">
              DHM offers comprehensive benefits backed by 11 clinical studies and 1,000+ years of
              traditional use. Discover the{' '}
              <Link to="/never-hungover/dhm-japanese-raisin-tree-complete-guide">
                fascinating traditional origins
              </Link>{' '}
              and explore our{' '}
              <Link to="/reviews">top supplement recommendations</Link>.
            </p>
          </header>

          <div className="grid-auto">
            {keyBenefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="card-raised">
                  <span className="pathway__icon" style={{ marginBottom: 'var(--space-3)' }}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3 className="card-title">{benefit.title}</h3>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===================== REAL-WORLD SCENARIOS ===================== */}
      <section id="real-scenarios" className="section">
        <div className="container">
          <header className="section-head">
            <span className="eyebrow">Put it into practice</span>
            <h2>Real-World DHM Scenarios</h2>
            <p className="lead">See exactly how to use DHM in common drinking situations.</p>
          </header>

          <div className="stack" style={{ '--stack-gap': 'var(--space-6)' }}>
            {/* Scenario 1 */}
            <div className="card">
              <h3 className="card-title cluster" style={{ gap: 'var(--space-2)' }}>
                <GlassWater aria-hidden="true" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)' }} />
                Scenario 1: Friday Night Out (4-6 drinks)
              </h3>
              <div className="grid-auto" style={{ gap: 'var(--space-4)' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>6:00 PM &mdash; Before</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>Take 300-600mg DHM with dinner</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>10:00 PM &mdash; During</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>
                    Extra 300mg if still drinking heavily (see our{' '}
                    <Link to="/never-hungover/when-to-take-dhm-timing-guide-2025">complete timing guide</Link>)
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>1:00 AM &mdash; Before Bed</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>500mg DHM + large glass of water</p>
                </div>
              </div>
              <p
                className="cluster"
                style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}
              >
                <CheckCircle2 aria-hidden="true" style={{ width: '1.05rem', height: '1.05rem' }} />
                Expected Result: Wake up at 8 AM feeling 80% normal
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="card">
              <h3 className="card-title cluster" style={{ gap: 'var(--space-2)' }}>
                <Wine aria-hidden="true" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)' }} />
                Scenario 2: Wine with Dinner (2-3 glasses)
              </h3>
              <div className="grid-auto" style={{ gap: 'var(--space-4)' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>Before Dinner</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>300-600mg DHM 30 minutes before first glass</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>Before Bed</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>300mg DHM (optional, but recommended)</p>
                </div>
              </div>
              <p
                className="cluster"
                style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}
              >
                <CheckCircle2 aria-hidden="true" style={{ width: '1.05rem', height: '1.05rem' }} />
                Expected Result: Zero hangover, perfect next morning
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="card">
              <h3 className="card-title cluster" style={{ gap: 'var(--space-2)' }}>
                <PartyPopper aria-hidden="true" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-brand)' }} />
                Scenario 3: Special Event (6+ drinks)
              </h3>
              <div className="grid-auto" style={{ gap: 'var(--space-4)' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>Pre-Event</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>300-600mg DHM before first drink (up to 1000mg for heavy drinking)</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>Mid-Event</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>500mg DHM after 3-4 drinks</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>End of Night</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>500mg DHM before bed</p>
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--text-small)', margin: '0 0 var(--space-1)' }}>Next Morning</h4>
                  <p className="text-soft" style={{ fontSize: 'var(--text-small)', margin: 0 }}>Optional 300mg if needed</p>
                </div>
              </div>
              <p
                className="cluster"
                style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)', color: 'var(--color-brand-strong)', fontWeight: 600, fontSize: 'var(--text-small)' }}
              >
                <CheckCircle2 aria-hidden="true" style={{ width: '1.05rem', height: '1.05rem' }} />
                Expected Result: Minimal hangover, functional by noon
              </p>
            </div>
          </div>

          <div className="cta-band" style={{ marginTop: 'var(--space-12)' }}>
            <h3>Ready to try your scenario?</h3>
            <p className="lead">Start with our top-rated DHM supplements.</p>
            <div className="cta-band__actions">
              <Link
                to="/reviews"
                className="btn btn-cta btn-lg"
                data-track="cta"
                data-cta-text="Find Your DHM Supplement"
                data-cta-destination="/reviews"
              >
                Find Your DHM Supplement
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW DHM WORKS ===================== */}
      <section id="how-it-works" className="section surface-brand">
        <div className="container-prose">
          <header className="section-head">
            <span className="eyebrow">The science</span>
            <h2>How DHM Works: The Science Behind the Benefits</h2>
            <p className="lead">
              DHM prevents hangovers through sophisticated molecular mechanisms that protect both
              your liver and brain. For an in-depth analysis of these pathways, see our detailed{' '}
              <Link to="/never-hungover/dhm-science-explained">DHM science guide</Link>.
            </p>
          </header>

          <div className="stack" style={{ '--stack-gap': 'var(--space-4)' }}>
            {mechanismSteps.map((step) => (
              <div
                key={step.step}
                className="card"
                style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}
              >
                <span className="pathway__icon" style={{ flex: '0 0 auto' }}>{step.step}</span>
                <div>
                  <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                  <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== QUICK FAQ ===================== */}
      <section id="faq" className="section">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">Quick answers</span>
            <h2>Quick Questions, Quick Answers</h2>
          </header>

          <div className="grid-auto">
            <div className="card">
              <h3 className="card-title">How fast does DHM work?</h3>
              <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                DHM starts working within 30 minutes. Peak effects occur 1-2 hours after taking it.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title">Can I take too much DHM?</h3>
              <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                DHM is very safe. Studies show no serious side effects at doses up to 1,200mg daily.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title">Does it work with all alcohol?</h3>
              <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                Yes &mdash; beer, wine, liquor, cocktails. DHM works by helping your liver process
                alcohol faster.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title">What if I forget to take it before?</h3>
              <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                Take it as soon as you remember, even while drinking. Late is better than never. For
                emergency situations, see our{' '}
                <Link to="/never-hungover/emergency-hangover-protocol-2025">emergency hangover protocol</Link>.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title">Is DHM expensive?</h3>
              <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                Quality DHM costs $20-35/month. Compare that to weekend hangover recovery costs.
              </p>
            </div>
            <div className="card">
              <h3 className="card-title">Where do I buy good DHM?</h3>
              <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                We&rsquo;ve tested 10+ brands. <Link to="/reviews">See our top picks &rarr;</Link> or
                read specific reviews like our{' '}
                <Link to="/never-hungover/flyby-recovery-review-2025">Flyby Recovery analysis</Link>.
              </p>
            </div>
          </div>

          <div className="cta-band" style={{ marginTop: 'var(--space-12)' }}>
            <h3>Still have questions?</h3>
            <p className="lead">Explore our comprehensive guides and research.</p>
            <div className="cta-band__actions">
              <Link
                to="/research"
                className="btn btn-cta btn-lg"
                data-track="cta"
                data-cta-text="See the Science Behind DHM"
                data-cta-destination="/research"
              >
                See the Science Behind DHM
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/never-hungover/how-to-get-rid-of-hangover-fast" className="btn btn-ghost btn-lg">
                Complete hangover cure guide
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SUCCESS STORIES ===================== */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">Real users</span>
            <h2>Real Results from DHM Users</h2>
          </header>

          <div className="quote-grid">
            {/* Purple testimonial card removed; all three unified to brand-soft + Lucide stars. */}
            <div className="card-raised quote">
              <div className="stars" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} aria-hidden="true" fill="currentColor" />
                ))}
              </div>
              <p className="quote__text">
                &ldquo;I used to write off entire Saturdays to hangovers. Now I take DHM before
                going out and wake up feeling normal. Game changer.&rdquo;
              </p>
              <div className="quote__foot">
                <span className="quote__avatar">M</span>
                <div>
                  <div className="quote__name">Mike</div>
                  <div className="quote__meta">Age 28</div>
                </div>
              </div>
            </div>

            <div className="card-raised quote">
              <div className="stars" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} aria-hidden="true" fill="currentColor" />
                ))}
              </div>
              <p className="quote__text">
                &ldquo;Finally something that actually works! No more anxiety and regret the next
                day. DHM is part of my routine now.&rdquo;
              </p>
              <div className="quote__foot">
                <span className="quote__avatar">S</span>
                <div>
                  <div className="quote__name">Sarah</div>
                  <div className="quote__meta">Age 31</div>
                </div>
              </div>
            </div>

            <div className="card-raised quote">
              <div className="stars" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} aria-hidden="true" fill="currentColor" />
                ))}
              </div>
              <p className="quote__text">
                &ldquo;I was skeptical but tried it for a work happy hour. Woke up ready for my 7 AM
                workout. This stuff is legit.&rdquo;
              </p>
              <div className="quote__foot">
                <span className="quote__avatar">J</span>
                <div>
                  <div className="quote__name">James</div>
                  <div className="quote__meta">
                    Age 35 ·{' '}
                    <Link to="/never-hungover/antioxidant-anti-aging-dhm-powerhouse-2025">
                      Anti-aging benefits
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cta-band" style={{ marginTop: 'var(--space-12)' }}>
            <h3>Join thousands who&rsquo;ve stopped waking up hungover</h3>
            <p className="lead">
              Based on 11 clinical studies and 1,000+ years of safe traditional use. Learn more
              about{' '}
              <Link to="/never-hungover/dhm-japanese-raisin-tree-complete-guide">
                DHM&rsquo;s traditional origins
              </Link>{' '}
              and{' '}
              <Link to="/never-hungover/mindful-drinking-wellness-warrior-dhm-2025">
                mindful drinking strategies
              </Link>
              .
            </p>
            <div className="cta-band__actions">
              <Link
                to="/reviews"
                className="btn btn-cta btn-lg"
                data-track="cta"
                data-cta-text="Find Your DHM Supplement"
                data-cta-destination="/reviews"
              >
                Find Your DHM Supplement
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Start tonight</span>
            <h2>Your Hangover-Free Life Starts Tonight</h2>
            <p className="lead">
              Don&rsquo;t spend another weekend recovering. Get DHM, follow the protocol, and never
              wake up hungover again. Whether you&rsquo;re a{' '}
              <Link to="/never-hungover/business-dinner-networking-dhm-guide-2025">
                business professional
              </Link>
              ,{' '}
              <Link to="/never-hungover/college-student-dhm-guide-2025">college student</Link>, or{' '}
              <Link to="/never-hungover/fitness-enthusiast-social-drinking-dhm-2025">
                fitness enthusiast
              </Link>
              , DHM can protect your performance.
            </p>

            <div className="trust-band__stats" style={{ marginBottom: 'var(--space-8)' }}>
              {stats.map((s) => (
                <div key={s.label} className="stat" style={{ alignItems: 'center', textAlign: 'center' }}>
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="cta-band__actions">
              <Link
                to="/reviews"
                className="btn btn-cta btn-lg"
                data-track="cta"
                data-cta-text="Find Your DHM Supplement"
                data-cta-destination="/reviews"
              >
                Find Your DHM Supplement
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <p className="cta-band__reassure">
              Free shipping · 30-day returns · Thousands of 5-star reviews
              <br />
              <Link to="/never-hungover/fitness-enthusiast-social-drinking-dhm-2025">
                Fitness enthusiasts guide
              </Link>{' '}
              ·{' '}
              <Link to="/never-hungover/organic-natural-hangover-prevention-clean-living-2025">
                Clean living approach
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Table-of-contents anchors preserved for in-page links (icons reused). */}
      <div className="visually-hidden" aria-hidden="true">
        <span id="what-is-dhm" />
        <span id="benefits-research" />
        <span id="dosing-guidelines" />
        <span id="timing-protocols" />
        <span id="product-selection" />
        <span id="safety-information" />
        <span id="clinical-studies" />
        <BookOpen aria-hidden="true" />
        <Clock aria-hidden="true" />
        <Beaker aria-hidden="true" />
      </div>
    </div>
  )
}
