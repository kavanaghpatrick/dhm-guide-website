import React from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from '../components/CustomLink.jsx'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'
import topProducts from '../data/topProducts.json'
import '../styles/theme-modern.css'

/**
 * /guide (modern). Laid out as an editorial article on the blog post system
 * ([data-blog="post"] in theme-modern.css): head block, a quick answer, then
 * sections that go deeper. The page sells nothing directly; its job is to send
 * readers who decide to try DHM to /reviews, which it does twice, at the two
 * points where a reader makes that decision (after the quick answer and after
 * "What to buy").
 *
 * Prices are read from topProducts.json so the prose never drifts from /reviews.
 * The FAQ and HowTo schema for this page live in scripts/prerender-main-pages.js
 * and must match the visible text below.
 *
 * Studies cited (checked against PubMed abstracts, Nov 2026):
 *   Shen et al. 2012, J Neurosci, PMID 22219299 (rats, 1 mg/kg i.p.)
 *   Silva et al. 2020, Alcohol Clin Exp Res, PMID 32267550 (mice, 5-10 mg/kg i.p.)
 *   Lee et al. 2024, Foods, PMID 39766963 (25 adults, Hovenia dulcis combination drinks)
 */

const byId = Object.fromEntries(topProducts.map((p) => [p.id, p]))
const price = (id) => byId[id]?.pricePerServing
/** Cents per 100 mg of DHM, from the per-serving price and mg per serving. */
const centsPer100mg = (id) => {
  const p = byId[id]
  const mg = parseInt(p.dhm, 10)
  return Math.round((parseFloat(p.pricePerServing.slice(1)) / (mg / 100)) * 100)
}

const PUBMED = 'https://pubmed.ncbi.nlm.nih.gov/'

export default function GuideModern() {
  useSEO(generatePageSEO('guide'))

  return (
    <div className="theme-modern" data-blog="post">
      <div className="post-shell">
        <article className="post">
          <div className="post-head" data-testid="guide-hero-modern">
            <p className="post-eyebrow t-label">Guide</p>
            <h1 className="post-title">The complete guide to DHM</h1>
            <p className="post-lead">
              DHM is a plant compound sold as a hangover supplement. This guide covers what the
              studies found, how much people take and when, and what to buy if you want to try it.
            </p>
            <p className="post-meta">Updated November 2026</p>
            <hr className="post-rule" />
          </div>

          <div className="post-main">
            <div className="post-answer">
              <p className="post-block-label">Quick answer</p>
              <p className="post-answer__text">
                Take 300 to 600 mg about 30 to 60 minutes before your first drink. Expect less than
                the labels promise: the strong results come from rats and mice, and the one
                controlled human trial we know of tested a drink made with raisin-tree extract, not a
                DHM capsule. A DHM-only product costs {price(10)} to {price(4)} a serving.
              </p>
            </div>

            <div className="article-body">
              <div className="post-offer">
                <p className="post-offer__title">Already decided to try it?</p>
                <p className="post-offer__text">
                  We compare eight DHM products on dose, price per serving and Amazon ratings.
                </p>
                <Link to="/reviews" className="btn btn-secondary" data-track="cta" data-cta-destination="/reviews">
                  See the comparison
                  <ChevronRight aria-hidden="true" />
                </Link>
              </div>

              <h2 id="what-is-dhm">What DHM is</h2>
              <p>
                Dihydromyricetin, or DHM, is a flavonoid found in the Japanese raisin tree (
                <em>Hovenia dulcis</em>) and a few other plants. Raisin-tree extracts have a long
                history in Chinese and Korean folk medicine as a remedy for heavy drinking, and that
                is where the supplement idea comes from.
              </p>
              <p>
                In a supplement, DHM is a purified powder in a capsule. Some products sell it alone.
                Others mix it with L-cysteine, milk thistle, B vitamins or electrolytes, which raises
                the price and makes it harder to tell which ingredient is doing what. For the
                chemistry, see <Link to="/never-hungover/dhm-science-explained">how DHM works</Link>.
              </p>

              <h2 id="benefits-research">What the research shows</h2>
              <p>Three studies carry most of the weight in DHM marketing. Here is what each one tested.</p>

              <h3 id="clinical-studies">Rats given DHM by injection (UCLA, 2012)</h3>
              <p>
                Researchers at UCLA injected rats with DHM (1 mg per kilogram of body weight) and
                found it counteracted alcohol intoxication. The rats also showed fewer withdrawal
                signs and drank much less when alcohol was freely available. The team traced the
                effect to GABA-A receptors, the brain receptors alcohol acts on (
                <a href={`${PUBMED}22219299/`} target="_blank" rel="noopener noreferrer">
                  Shen et al., <em>Journal of Neuroscience</em>
                </a>
                ).
              </p>

              <h3>Mice on a long-term alcohol diet (USC, 2020)</h3>
              <p>
                A team at USC gave mice alcohol over a long period and injected some of them with DHM
                (5 or 10 mg per kilogram). The treated mice had less fat in the liver, lower markers
                of liver injury and more of the enzymes that break alcohol down. Their levels of
                alcohol and acetaldehyde, the by-product blamed for much of a hangover, were lower too
                (
                <a href={`${PUBMED}32267550/`} target="_blank" rel="noopener noreferrer">
                  Silva et al., <em>Alcoholism: Clinical and Experimental Research</em>
                </a>
                ).
              </p>

              <h3>25 adults and a hangover drink (Korea, 2024)</h3>
              <p>
                The one placebo-controlled human trial we know of tested drinks, not capsules:
                raisin-tree extract combined with either kudzu root extract or a glutathione yeast
                extract. Each of 25 adults aged 19 to 40 tried the drinks and a placebo on separate
                occasions. Blood alcohol was lower than with placebo at 15 and 30 minutes, and
                stomach-related hangover symptoms were milder. Six of the authors work for Kwangdong
                Pharmaceutical, a Korean drug company (
                <a href={`${PUBMED}39766963/`} target="_blank" rel="noopener noreferrer">
                  Lee et al., <em>Foods</em>
                </a>
                ).
              </p>

              <p>
                Taken together, that is a plausible mechanism in animals and one small,
                industry-affiliated trial of a related product. We haven&rsquo;t found a published
                trial that gave people a DHM capsule and measured their hangover the next morning.
                That is reason enough to try it on a big night if the cost doesn&rsquo;t bother you,
                and not enough to call it proven. Our <Link to="/research">research page</Link> lists
                these and other studies.
              </p>

              <h2 id="dosing-guidelines">How much to take</h2>
              <p>
                No one has run a dose-finding trial of DHM in people, so every number in this
                section, ours included, is an informed guess. Labels give 300 mg or 1,000 mg per
                serving, and most people take 300 to 600 mg.
              </p>
              <p>
                Our <Link to="/dhm-dosage-calculator">dosage calculator</Link> starts from 5 mg per
                kilogram of body weight, never goes below 300 mg, and adds a little for long or heavy
                nights. For up to four drinks over up to four hours it gives:
              </p>
              <div className="table-scroll" tabIndex={0} role="region" aria-label="Starting dose by body weight (scrolls sideways on small screens)">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Body weight</th>
                      <th scope="col">Starting dose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>120 lb (54 kg)</td><td>300 mg</td></tr>
                    <tr><td>150 lb (68 kg)</td><td>350 mg</td></tr>
                    <tr><td>180 lb (82 kg)</td><td>400 mg</td></tr>
                    <tr><td>220 lb (100 kg)</td><td>500 mg</td></tr>
                  </tbody>
                </table>
              </div>
              <p>
                The calculator never suggests more than 1,200 mg. That ceiling is a cautious limit we
                chose, not a tested safety threshold. The{' '}
                <Link to="/never-hungover/dhm-dosage-guide-2025">DHM dosage guide</Link> goes through
                dose by weight and drink count in more detail.
              </p>

              <h2 id="timing-protocols">When to take it</h2>
              <ol>
                <li>Take your dose 30 to 60 minutes before your first drink, with a glass of water.</li>
                <li>On a long night, some people take a second dose before bed. No study has tested this either way.</li>
                <li>Drink water between drinks. It slows you down, which does more for the morning than any supplement.</li>
              </ol>
              <p>
                A dose the morning after has the least support. The animal studies gave DHM around
                the time of drinking, and we found nothing that tests it once a hangover has started.
                There is more on this in our{' '}
                <Link to="/never-hungover/when-to-take-dhm-timing-guide-2025">timing guide</Link>.
              </p>

              <h2 id="safety-information">Who should skip it</h2>
              <p>
                The 2024 trial reported no safety problems, but 25 people over a few sessions tells
                you little. Skip DHM, or ask a doctor first, if any of these apply:
              </p>
              <ul>
                <li>You are pregnant or breastfeeding. There is no safety data at all.</li>
                <li>You take prescription medication. Interactions haven&rsquo;t been studied in people, and a pharmacist can check yours.</li>
                <li>You have liver disease. The liver results above come from mice and don&rsquo;t make DHM a treatment.</li>
              </ul>
              <p>
                DHM is no reason to drive or to drink more. In the 2024 trial, blood alcohol was
                lower only in the first half hour.
              </p>

              <h2 id="product-selection">What to buy</h2>
              <p>
                Buy DHM on its own unless you want the extras. Among the products we track, DHM-only
                capsules cost {price(10)} a serving (DHM Depot, 300 mg) to {price(4)} (NusaPure,
                1,000 mg). Per milligram, NusaPure is far cheaper: about {centsPer100mg(4)} cents per
                100 mg, against {centsPer100mg(10)} cents for DHM Depot.
              </p>
              <p>
                Blends add milk thistle, L-cysteine, B vitamins or electrolytes and charge for them,
                from {price(3)} a serving (Toniiq Ease) to {price(6)} (Flyby Recovery). None of the
                studies above tested those combinations. Whatever you buy, read the milligrams per
                serving rather than per capsule, because some brands split a serving across two
                capsules.
              </p>
              <div className="post-offer">
                <p className="post-offer__title">Compare the eight products we track</p>
                <p className="post-offer__text">
                  Dose, price per serving and Amazon ratings side by side, and the one we would pick.
                </p>
                <Link to="/reviews" className="btn btn-secondary" data-track="cta" data-cta-destination="/reviews">
                  See the comparison
                  <ChevronRight aria-hidden="true" />
                </Link>
              </div>

              <h2 id="faq">Common questions</h2>
              <h3>Does it matter what I drink?</h3>
              <p>
                Not to DHM. Its proposed effects are on alcohol itself, so a beer and a shot are the
                same to it. Dark drinks such as bourbon and red wine tend to cause worse hangovers
                than clear ones for other reasons, and DHM does nothing about those.
              </p>
              <h3>What if I forgot to take it before drinking?</h3>
              <p>
                Take it when you remember. No study has tested a late dose, so expect less from it.
                If you have already woken up hungover, our{' '}
                <Link to="/never-hungover/emergency-hangover-protocol-2025">emergency hangover protocol</Link>{' '}
                covers what helps.
              </p>
              <h3>Can I take DHM every day?</h3>
              <p>
                It is sold for nights out, not daily use, and no study has followed people taking it
                daily for months. We wouldn&rsquo;t.
              </p>
              <h3>How is DHM different from ZBiotics?</h3>
              <p>
                ZBiotics is a probiotic drink engineered to make an enzyme that breaks down
                acetaldehyde in the gut. DHM is a plant compound you swallow as a capsule. They work
                in different ways, and neither has strong human evidence. We set them side by side in{' '}
                <Link to="/never-hungover/dhm-vs-zbiotics">DHM vs ZBiotics</Link>.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
