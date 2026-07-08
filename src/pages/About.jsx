import React, { useEffect } from 'react'
import { Link } from '../components/CustomLink.jsx'
import missionVisual from '../assets/dhm_mission_visual.webp'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import { preloadModernFonts } from '../lib/preloadModernFonts.js'
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

  // Variant/modern surface: preload the body font once, on mount.
  useEffect(() => {
    preloadModernFonts()
  }, [])

  const values = [
    {
      icon: <Microscope aria-hidden="true" />,
      title: "Science-Based",
      description: "Every recommendation is backed by peer-reviewed research and clinical studies."
    },
    {
      icon: <Shield aria-hidden="true" />,
      title: "Transparent Reviews",
      description: "We earn affiliate commissions on purchases. This never influences our ratings."
    },
    {
      icon: <Heart aria-hidden="true" />,
      title: "User-Focused",
      description: "Prioritizing real user experiences and practical effectiveness over marketing claims."
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
      description: "We only cite peer-reviewed studies indexed in PubMed"
    },
    {
      area: "Supplement Testing",
      description: "Products evaluated for purity, dosage accuracy, and value"
    },
    {
      area: "Transparent Analysis",
      description: "All recommendations include source citations"
    },
    {
      area: "User Experience",
      description: "Real-world feedback collected and analyzed systematically"
    }
  ]

  const achievements = [
    {
      value: "50+",
      title: "Studies Analyzed",
      description: "Comprehensive review of all major DHM research"
    },
    {
      value: "20+",
      title: "Brands Tested",
      description: "Independent testing of leading DHM supplements"
    },
    {
      value: "11",
      title: "Clinical Studies Reviewed",
      description: "In-depth analysis of peer-reviewed DHM trials"
    },
    {
      value: "100%",
      title: "Transparent Methodology",
      description: "Clear criteria for all product evaluations"
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
      title: "Product Testing",
      description: "Independent laboratory analysis of DHM supplements for purity, potency, and quality."
    },
    {
      step: "3",
      title: "User Feedback",
      description: "Collection and analysis of real user experiences and effectiveness reports."
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
              Your Trusted <span className="accent">DHM Research</span> Resource
            </h1>

            <p className="lead">
              Dedicated to helping you{' '}
              <strong className="text-brand">never wake up hungover again</strong>{' '}
              through science-backed research, independent testing, and proven
              hangover prevention strategies.
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
                data-cta-text="See Tested Products"
                data-cta-destination="/reviews"
              >
                See Tested Products
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
                  <strong>Evidence-Based:</strong> Every recommendation backed by peer-reviewed research
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
                    'No comprehensive product comparisons',
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
                    'Independent product testing',
                    'Clear, accessible explanations',
                    'Comprehensive product database',
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

      {/* ============================ IMPACT (stats) ============================ */}
      <section className="section">
        <div className="container">
          <header className="section-head section-head--center">
            <span className="eyebrow">By the numbers</span>
            <h2>Our Impact</h2>
            <p className="lead">
              Measurable contributions to DHM knowledge and user education.
            </p>
          </header>

          <div className="grid-auto">
            {achievements.map((achievement) => (
              <div key={achievement.title} className="card" style={{ textAlign: 'center' }}>
                <div className="stat" style={{ alignItems: 'center' }}>
                  <span className="stat-value">{achievement.value}</span>
                  <span className="stat-label" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                    {achievement.title}
                  </span>
                </div>
                <p className="text-soft" style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--text-small)' }}>
                  {achievement.description}
                </p>
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
