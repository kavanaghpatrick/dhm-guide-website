import React from 'react'
import { Link } from '../components/CustomLink.jsx'
import missionVisual from '../assets/dhm_mission_visual.webp'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import '../styles/theme-modern.css'
import {
  Users,
  Target,
  BookOpen,
  Microscope,
  Shield,
  ArrowRight,
  CheckCircle,
  XCircle,
  Heart,
  Globe,
  Mail
} from 'lucide-react'

export default function About() {
  useSEO(generatePageSEO('about'));


  const values = [
    {
      icon: <Microscope aria-hidden="true" />,
      title: "Research First",
      description: "We start from the published studies and say plainly when they were done in animals, not people."
    },
    {
      icon: <Shield aria-hidden="true" />,
      title: "Transparent Reviews",
      description: "We earn affiliate commissions on purchases. This never influences our ratings."
    },
    {
      icon: <Heart aria-hidden="true" />,
      title: "Labels Over Marketing",
      description: "We judge a product by what its label says is in it, not by what the brand says it does."
    },
    {
      icon: <Globe aria-hidden="true" />,
      title: "Accessible Knowledge",
      description: "Making complex scientific research understandable and actionable for everyone."
    }
  ]

  const expertise = [
    {
      area: "Research Standards",
      description: "We cite published studies and link to each one so you can check it"
    },
    {
      area: "Label Comparison",
      description: "Products compared on DHM dose per serving and price per serving, as printed on the label"
    },
    {
      area: "Transparent Analysis",
      description: "All recommendations include source citations"
    },
    {
      area: "No Lab Testing",
      description: "We do not lab-test products, so we never claim to know what is in the bottle beyond the label"
    }
  ]

  const methodology = [
    {
      step: "1",
      title: "Literature Review",
      description: "Systematic analysis of peer-reviewed research from PubMed, clinical databases, and academic journals."
    },
    {
      step: "2",
      title: "Label Comparison",
      description: "Reading each product's label for DHM dose, other ingredients and serving size, then working out the price per serving. We do not run lab tests."
    },
    {
      step: "3",
      title: "Amazon Ratings",
      description: "Noting each product's Amazon star rating and review count as a rough signal, not as proof that it works."
    },
    {
      step: "4",
      title: "Editorial Review",
      description: "Cross-referencing findings against published research and existing supplement databases."
    }
  ]

  return (
    <div className="theme-modern" style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      {/* ============================ HERO ============================ */}
      <section className="surface-wash" style={{ paddingBlock: 'var(--section-y)' }}>
        <div className="container">
          <header className="section-head section-head--center" style={{ marginInline: 'auto' }}>
            <span className="chip" style={{ marginBottom: 'var(--space-4)' }}>
              <Users aria-hidden="true" />
              DHM Guide Team
            </span>

            <h1 style={{ marginTop: 'var(--space-4)' }}>
              About <span className="accent">DHM Guide</span>
            </h1>

            <p className="lead">
              DHM Guide explains what the published research says about DHM
              (dihydromyricetin) and hangovers, and compares DHM supplements on
              dose, price per serving and Amazon ratings. We read labels against
              the studies. We do not lab-test products.
            </p>

            <div
              className="cluster"
              style={{ justifyContent: 'center', marginTop: 'var(--space-8)' }}
            >
              <Link
                to="/guide"
                className="btn btn-lg"
                style={{ textDecoration: 'none', backgroundColor: 'var(--color-brand-strong)', borderColor: 'var(--color-brand-strong)', color: 'var(--color-on-brand)', boxShadow: 'none' }}
                data-track="cta"
                data-cta-text="Explore Our Research"
                data-cta-destination="/guide"
              >
                Explore Our Research
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/reviews"
                className="btn btn-secondary btn-lg"
                style={{ textDecoration: 'none' }}
                data-track="cta"
                data-cta-text="See Product Comparisons"
                data-cta-destination="/reviews"
              >
                See Product Comparisons
              </Link>
            </div>
          </header>
        </div>
      </section>

      {/* ============================ MISSION ============================ */}
      <section className="section">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">Why we exist</span>
            <h2>Our Mission</h2>
            <p className="lead">
              To bridge the gap between cutting-edge DHM research and practical,
              actionable information that helps people make informed decisions about
              hangover prevention and liver health.
            </p>
          </header>

          {/* Split Layout: Mission points + Visual */}
          <div
            className="grid-auto"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
              alignItems: 'center',
              marginBottom: 'var(--space-16)',
            }}
          >
            <div className="stack" style={{ '--stack-gap': 'var(--space-4)' }}>
              <div className="cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <CheckCircle aria-hidden="true" style={{ flex: '0 0 auto', width: '1.25rem', height: '1.25rem', marginTop: '0.15em', color: 'var(--color-brand)' }} />
                <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
                  <strong>Research first:</strong> Recommendations start from published studies, with their limits stated
                </p>
              </div>
              <div className="cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <CheckCircle aria-hidden="true" style={{ flex: '0 0 auto', width: '1.25rem', height: '1.25rem', marginTop: '0.15em', color: 'var(--color-brand)' }} />
                <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
                  <strong>Transparent:</strong> Affiliate relationships disclosed; ratings never influenced by commissions
                </p>
              </div>
              <div className="cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <CheckCircle aria-hidden="true" style={{ flex: '0 0 auto', width: '1.25rem', height: '1.25rem', marginTop: '0.15em', color: 'var(--color-brand)' }} />
                <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
                  <strong>Accessible:</strong> Complex science made simple and actionable
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={missionVisual}
                alt="DHM Guide Mission: Bridging Research and Practical Information"
                className="card"
                style={{ width: '100%', maxWidth: '32rem', padding: 0, overflow: 'hidden' }}
              />
            </div>
          </div>

          {/* "Why DHM Guide Exists" — problem / solution, border-first card */}
          <div className="card">
            <h3 style={{ textAlign: 'center' }}>Why DHM Guide Exists</h3>
            <div
              className="grid-auto"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))', marginTop: 'var(--space-6)' }}
            >
              <div>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>The Problem</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'Conflicting information about DHM online',
                    'Marketing claims without scientific backing',
                    'Complex research difficult to understand',
                    'Few side-by-side comparisons of dose and price',
                  ].map((item) => (
                    <li key={item} className="cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-2)', color: 'var(--color-ink-soft)' }}>
                      <XCircle aria-hidden="true" style={{ flex: '0 0 auto', width: '1.125rem', height: '1.125rem', marginTop: '0.15em', color: 'var(--color-ink-soft)', opacity: 0.7 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>Our Solution</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'Evidence-based information only',
                    'Products compared on label dose and price',
                    'Clear, accessible explanations',
                    'Clear about what we have not checked',
                  ].map((item) => (
                    <li key={item} className="cluster" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-2)', color: 'var(--color-ink-soft)' }}>
                      <CheckCircle aria-hidden="true" style={{ flex: '0 0 auto', width: '1.125rem', height: '1.125rem', marginTop: '0.15em', color: 'var(--color-brand)' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ VALUES ============================ */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">What guides us</span>
            <h2>Our Core Values</h2>
            <p className="lead">
              The principles that guide everything we do at DHM Guide.
            </p>
          </header>

          <div className="grid-auto">
            {values.map((value) => (
              <div key={value.title} className="card-raised pathway">
                <span className="pathway__icon">{value.icon}</span>
                <h3 className="pathway__title">{value.title}</h3>
                <p className="pathway__body">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ RESEARCH STANDARDS ============================ */}
      <section className="section">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">How we work</span>
            <h2>Our Research Standards</h2>
            <p className="lead">
              The bar every recommendation on DHM Guide has to clear.
            </p>
          </header>

          <div className="grid-auto">
            {expertise.map((area) => (
              <div key={area.area} className="card">
                <h3 className="card-title">{area.area}</h3>
                <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ METHODOLOGY ============================ */}
      <section className="section surface-brand">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">Our process</span>
            <h2>Our Research Methodology</h2>
            <p className="lead">
              Four steps from peer-reviewed literature to a recommendation you can trust.
            </p>
          </header>

          <div className="stack" style={{ '--stack-gap': 'var(--space-6)', maxWidth: 'var(--container-prose)', marginInline: 'auto' }}>
            {methodology.map((step) => (
              <div
                key={step.step}
                className="card cluster"
                style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 'var(--space-4)' }}
              >
                <span
                  className="pathway__icon"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem' }}
                >
                  {step.step}
                </span>
                <div>
                  <h3 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                  <p className="text-soft" style={{ margin: 0, fontSize: 'var(--text-small)' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CONTACT CTA BAND ============================ */}
      <section className="section surface-brand">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Get in touch</span>
            <h2>We&rsquo;d love to hear from you</h2>
            <p className="lead">
              Have questions about DHM or suggestions for our research? Reach out
              anytime — we read every message.
            </p>
            <div className="cta-band__actions">
              <a
                href="mailto:hello@dhmguide.com"
                className="btn btn-lg"
                style={{ textDecoration: 'none', backgroundColor: 'var(--color-brand-strong)', borderColor: 'var(--color-brand-strong)', color: 'var(--color-on-brand)', boxShadow: 'none' }}
                data-track="cta"
                data-cta-text="Contact Us"
                data-cta-destination="mailto:hello@dhmguide.com"
              >
                <Mail aria-hidden="true" />
                Contact Us
              </a>
              <Link
                to="/research"
                className="btn btn-secondary btn-lg"
                style={{ textDecoration: 'none' }}
                data-track="cta"
                data-cta-text="Discover the Science"
                data-cta-destination="/research"
              >
                Discover the Science
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
