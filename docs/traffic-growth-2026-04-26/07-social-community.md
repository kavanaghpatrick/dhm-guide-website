# 07 — Social Media, Reddit & Niche Communities

**Author:** Agent 7 of 10
**Date:** 2026-04-26
**Focus:** Diversifying away from Google by building community/social presence
**Current state:** 0% measurable social referral traffic per PostHog

---

## TL;DR

DHM Guide has zero meaningful social presence. The good news: the niche is **active, underserved, and concentrated** in ~6 high-relevance subreddits totalling ~2.5M subscribers. The bad news: bulk-posting links is forbidden in every quality community, so this is a 3-6 month karma/credibility play, not a campaign.

**Single biggest opportunity:** Reddit + a "We Tested DHM on 100 People" survey-driven content piece. **Single most under-built channel:** Email/newsletter — the calculator already captures emails (DosageCalculatorEnhanced.jsx) but **does nothing with them** (Issue #180 is open with TODO comment). That's a leaking bucket; fix it before any social work.

---

## 1. Reddit — Primary Channel

### 1A. Audience sizing (subscriber data pulled live 2026-04-26)

| Subreddit | Subscribers | DHM relevance | Hostility to brands | Priority |
|---|---:|---|---|---|
| **r/Supplements** | **551,258** | Direct hits — DHM threads exist with 300+ upvotes | Medium (allows discussion if non-promotional) | **#1** |
| **r/Biohackers** | **802,399** | High — recent DHM threads with 76–292 comments | Medium-low | **#2** |
| **r/StopDrinking** | 666,754 | Indirect/sensitive — DHM threads exist (2 from r/science x-posts) | **HIGH — recovery space, do NOT promote** | Avoid promo, monitor only |
| **r/HubermanLab** | 240,201 | High — alcohol/protocols actively discussed (Huberman has covered DHM-adjacent topics) | Medium | **#3** |
| r/Nootropics | 442,080 | Low-medium — DHM is off-topic but supplement-stack discussions overlap | Medium-high (strict mods) | Tier 2 |
| r/AsianBeauty | 3,701,050 | Tangential — Asian flush angle | High | Tier 3 (organic only) |
| r/AsianAmerican | 116,937 | Direct — Asian flush remedy threads exist | Low-medium | Tier 2 — Asian flush angle |
| r/cocktails | 421,262 | Tangential — drinking culture | Medium-high | Tier 3 |
| r/college | 2,920,658 | Indirect — drinking demographic | Medium | Tier 3 (post-AMA only) |
| r/NootropicsDepot | 41,159 | Direct — supplement vendor sub | Low (vendor-tolerant) | Tier 2 |
| r/Hangover | 876 | Direct, tiny | Low | Skip — too small |
| r/Hangovercures | 588 | Direct, tiny | Low | Skip — too small |

### 1B. What gets traction on r/Supplements (top monthly posts, n=15)

```
1784 ups | 158 comments | "Magnesium in your 30s"             (life-stage personal)
 934 ups | 374 comments | "Your vitamin D is probably doing nothing"  (myth-busting)
 511 ups | 119 comments | "Psyllium husk... FDA-approved health claim" (under-rated supplement)
 444 ups | 194 comments | "Megadose Vitamin C solved my problem!"     (n=1 success)
 269 ups |  99 comments | "Berberine is my GOAT supplement"           (passionate POV)
 222 ups | 147 comments | "Fish oil oxidation papers... data is bleak" (research deep-dive)
 220 ups |  73 comments | "Audited 14 supplements against bloodwork"   (data-driven)
```

**Pattern:** Top posts are (1) myth-busting, (2) personal n=1 stories, (3) data-driven audits, (4) passionate single-supplement advocacy. **NOT** product reviews, not "Top 10" lists, not affiliate-laced content.

### 1C. DHM-specific Reddit footprint (top all-time on r/Supplements)

| Upvotes | Comments | Title |
|---:|---:|---|
| **301** | 128 | Hangover Preventative Formula - costs about 70 cents to make yourself |
| 45 | 168 | Taking salt the next morning after drinking? |
| 34 | 62 | Which is better: Alcohol Defense or Cheers Restore |
| 29 | 21 | Dihydromyricetin- the anti alcohol supplement? |
| 14 | 133 | Rate my stack |
| 11 | 38 | Beta-cyclodextrin Dihydromyricetin (DHM) complex |
| 7 | 9 | Cheers and other DHM hangover supplements |

**Insight:** DHM has organic discussion but no canonical resource thread. The "70 cents to make yourself" thread (301 upvotes, 128 comments) is the de-facto reference. **There is room for a definitive, evidence-based DHM thread that becomes the canonical resource — this is the single highest-leverage Reddit play.**

### 1D. r/Biohackers DHM footprint

| Upvotes | Comments | Title |
|---:|---:|---|
| 76 | **292** | What causes racing heart morning after drinking? |
| 34 | 41 | Glutathione Prevents Hangovers?? |
| 18 | 49 | N=6, Hangover cure potential |
| 9 | 33 | Most effective supplement for drinking? (DHM, Liquid IV, pedialyte...) |

**Insight:** 292 comments on a hangover-adjacent thread = high engagement potential. r/Biohackers is more vendor-tolerant than r/Supplements.

### 1E. Reddit engagement playbook (90-day plan)

**Phase 1 — Karma & credibility (Days 1–30, ~3 hrs/week)**
- Create dedicated account: `u/dhmguide_team` or pseudonym (e.g., `u/hovenia_research`)
- **Goal:** 500+ comment karma before linking to anything
- Comment substantively on 3–5 threads/week across r/Supplements, r/Biohackers, r/HubermanLab
- Cite primary research (PubMed) — the user's site already references 11 studies
- Never link to dhmguide.com in this phase — answer fully in-thread
- Track every comment with a spreadsheet (subreddit, thread, response, upvotes)

**Phase 2 — Authoritative thread + occasional links (Days 30–60)**
- Post the canonical DHM thread on r/Supplements: title pattern matching what works there:
  - **"I audited 11 DHM studies — here's what we actually know"** (data-driven, like the bloodwork audit hit)
  - or **"DHM vs the placebo studies: the contradiction nobody talks about"** (myth-busting, like the vitamin D hit)
- Format: long Reddit text post with study citations, NO link to dhmguide.com initially
- After post gains traction (2–3 days), edit-in: "Full breakdown with data tables on [link]"
- Cross-post to r/Biohackers and r/HubermanLab with subreddit-tailored framing

**Phase 3 — AMA + sidebar/wiki inclusion (Days 60–90)**
- Pitch r/Supplements mods for an AMA: "I've spent 18 months reviewing every DHM study — happy to AMA"
  - Provide credentials (the site exists, has research citations, no MLM/scam vibe)
  - r/Supplements has hosted brand AMAs before (NootropicsDepot, etc.)
- Submit dhmguide.com to subreddit wikis on hangover/recovery resources
- **Wiki inclusion = 5-figure annual referrer over time** (compounds for years)

**Anti-spam rules (non-negotiable):**
1. Never post a link in the first 24h after joining a thread
2. Never DM users to "check out my site"
3. Never use multiple accounts (Reddit shadowbans these immediately)
4. Disclose affiliation in any link comment ("I run dhmguide.com — fwiw, link below")
5. Engage substantively even when the OP picks a competing product

---

## 2. YouTube — Underserved Long-Term Play

### Current landscape

YouTube search "DHM supplement" reveals **a thin field**:
- Only ~5–10 dedicated DHM review videos with >10k views
- No channel "owns" the DHM niche the way some channels own creatine, magnesium, etc.
- Huberman's alcohol episode (`YnMCXQKYyXk`) has millions of views but is alcohol-general
- Brand channels (Cheers, Flyby, ZBiotics, NoDaysWasted) post product-marketing content with low engagement

**Implication:** The niche is **completely uncontested by an editorial/independent voice.** Even modest production quality could rank top-3 within months.

### Recommended content slate (quarterly)

| Video | Format | Estimated effort | Estimated 12-mo views |
|---|---|---|---|
| "I tried DHM for 30 days — here's the data" | Personal experiment + bloodwork | ~10 hrs | 25–100k |
| "DHM dosage explained (300mg vs 600mg vs 1000mg)" | Whiteboard/explainer | ~4 hrs | 15–50k |
| "Cheers vs Flyby vs Toniiq — head-to-head test" | Brand comparison | ~8 hrs | 30–80k |
| "Why DHM didn't work in the 2020 placebo study" | Research breakdown | ~6 hrs | 10–40k |

**Embedding YouTube in dhmguide.com posts** has dual SEO/AEO benefit:
- Increases dwell time (Google ranking signal)
- AI engines (Perplexity, ChatGPT Search, Google AIO) heavily weight video presence as a quality signal in 2026

---

## 3. Twitter / X — Low Effort, Ongoing

### Strategy: "Reply guy" + occasional threads

**Big accounts to monitor & reply to** (when they post about alcohol/health):
- @hubermanlab (~1.8M followers) — has tweeted "Alcohol, Hangovers & How to Cure a Hangover" (high engagement)
- @foundmyfitness (Rhonda Patrick) — covers alcohol research; recent r/HubermanLab thread shows she released a 3-hour alcohol episode
- @PeterAttiaMD — discusses alcohol/longevity
- @hubermanphd_fan, @hubermanlab_clips, @pkasprzyk — secondary Huberman accounts
- Supplement-stack accounts: @PaulSaladinoMD, @RealLizParrish, @drmarkhyman

**Tactical pattern:**
- Reply with research-backed, non-promotional answer
- Include a chart/screenshot if possible (3x reply engagement on X)
- Include link only if 90%+ relevant
- Aim: 3–5 replies/week, 1 original thread/month

### Original thread template (high share-potential)

> "I read 50 DHM studies. Most are wrong about hangovers. (thread)
> 1/ DHM was discovered in 2012 by USC researchers...
> 2/ The 'magic bullet' claim came from rats given parenteral DHM..."

This format consistently performs well for science/research accounts. Realistic baseline: 1–5k impressions per thread for a new account; 10–50k for one that picks up.

---

## 4. TikTok / Reels — Gen-Z + Drinking Culture

### Validated trend signal

DHM **already trended on TikTok** in 2025 per W Magazine reporting:
- "DHM trended earlier this year on TikTok, with hordes of self-described holistic health experts and competitive drinkers... boast about the supplement's seemingly magical healing properties." ([W Magazine](https://www.wmagazine.com/beauty/tish-weinstock-wellness-gone-wild-dhm-hangover))

This mirrors the **berberine TikTok pattern** (2023): natural compound → fitness/biohacking creators → 100M+ views → mass-market awareness → supplement sales spike.

### Underserved formats

| Format | Effort | Potential reach |
|---|---|---|
| "What I take before going out" voiceover | Low (15s) | 10k–500k per post |
| "Asian flush trick" demonstration | Medium (30s) | 50k–1M (taps existing trend) |
| Bartender/college-life DHM reveal | Medium | 20k–200k |
| Day-after recovery diary (Sunday morning content) | Low | 30k–300k |

### Influencer partnerships (highest ROI per dollar)

- **Liquor-store TikTokers**: 50k–500k followers, niche-perfect, accept $50–500 product seeding
- **College lifestyle creators**: high engagement, target 21+ demos
- **Asian-American creators**: Asian flush angle is genuine pain point + identity-resonant content
- **"Soft girl wellness"** creators: DHM fits aesthetic-wellness niche

**Budget rec:** $2–5k seeding + 5–10 micro-creators ($100–500 each) > one big-name partnership.

---

## 5. Discord, Forums, Facebook — Lower Priority

### Discord servers (limited DHM-direct discussion)

- **The Biohacker Lounge** (Josh Universe) — broad biohacking, ~10k members. Useful for soft outreach but no DHM channel
- **Nootropics & Cognitive Enhancement** — supplement-focused but DHM is off-topic
- **r/Transhumanism Discord** — too niche

**Action:** Join 2–3 servers, participate ambiently, link only when explicitly asked. Don't expect material traffic.

### Forums

- **ImmInst / LongeCity** — small but high-quality longevity audience; existing supplement threads
- **Bluelight** — drug/alcohol harm-reduction forum; highly skeptical of brand promotion but DHM has been discussed organically

### Facebook Groups

Google `site:facebook.com/groups DHM` returns only **2 indexed posts** — Facebook is essentially closed/non-indexed. Not worth significant effort. If user has personal FB presence, share into existing supplement/wellness groups they're already in. Otherwise skip.

---

## 6. Newsletter — THE Most Important Recommendation

### Audit findings

The site **already has email capture infrastructure**:
- `src/pages/DosageCalculatorEnhanced.jsx:730` — `handleEmailCapture` function
- `src/pages/DosageCalculatorEnhanced.jsx:566` — exit-intent trigger (already wired up)
- `src/utils/engagement-tracker.js:169` — `trackEmailCapture(source)` analytics

**But:** Line 747 has `// TODO: Integrate with Formspree or ConvertKit (Issue #180)` — **emails are being collected but not sent anywhere**. The capture form likely just sets a state flag, then the data is lost. This is a **critical leaking bucket.**

### Recommendation: Fix this before any other social work

**Phase 1 — Wire up the existing infrastructure (1–2 days)**
1. Sign up ConvertKit or Buttondown ($0–29/mo)
2. Replace TODO with API call (4 lines of code)
3. Set up a 5-email onboarding sequence (covered below)

**Phase 2 — Lead magnet expansion (1 week)**
- "DHM Quick-Reference Card" PDF (1-page printable)
- Triggered: dosage calculator completion, exit-intent on top 5 posts, scroll-90% on review pages
- Promised value: "We'll email it + send weekly hangover-science updates"

**Phase 3 — 5-email onboarding sequence**
1. Day 0: Quick-reference PDF + "what to expect"
2. Day 2: "The 11 studies behind DHM" (links to top research post)
3. Day 5: "DHM brand comparison: which to actually buy" (affiliate-driving)
4. Day 9: "5 DHM mistakes most people make"
5. Day 14: "Subscribe to weekly digest? (1-click)"

### Why newsletter is THE priority

| Channel | Algorithm dependency | Owned audience | Conversion rate |
|---|---|---|---|
| Google search | Total | None | 1–3% |
| Reddit | High | None | 2–5% (when allowed) |
| TikTok/IG | Total | Followers ≠ reach | 0.5–2% |
| **Newsletter** | **None** | **100% owned** | **5–15%** |

A 5,000-subscriber list at 30% open / 5% click = **75 visits per send**. Send weekly = 3,900/year = a meaningful and **algorithm-proof** floor.

---

## 7. Viral-Worthy Content Angle (Pick One)

**Recommendation: "We Tested DHM on 100 People — Here's What Happened"**

Format:
- Recruit 100 readers via newsletter + Reddit (free participants get free DHM bottle from a partner brand)
- Distribute standardized 30-day protocol (300/500/600/1000mg by body weight)
- Pre/post survey: hangover severity (0–10), Asian flush, sleep, mood
- Aggregate results in a definitive content piece

**Why this works:**
- It's the data-driven format Reddit r/Supplements rewards (the bloodwork-audit thread proves it)
- Generates a research-grade headline that media will cite (W Magazine, Healthline, etc. will link to it for its data)
- Becomes the **canonical Reddit thread** (Phase 2 of the Reddit playbook)
- Repurposable: 1 anchor post + 1 YouTube video + 5 TikToks + 1 X thread + 1 newsletter sequence
- Real n=100 first-party data is **AI-engine catnip** in 2026 (ChatGPT, Perplexity, Google AIO heavily preference original data)

**Cost:** ~$2k (DHM stock from partner) + ~40 hrs labor over 8 weeks. **Expected referrers:** 5–15 high-DA backlinks from health publications citing your data.

---

## 8. 6-Month Realistic Traffic Estimate

Health content rarely goes viral, but it compounds well. Realistic numbers if user executes 70% of the plan:

| Channel | Month 1 | Month 3 | Month 6 | Month 12 |
|---|---:|---:|---:|---:|
| Reddit (organic karma + 1-2 hits) | 50 | 400 | 1,500 | 4,000 |
| Reddit (canonical thread + AMA) | — | — | 2,000 (one-time spike) | 800/mo decay |
| Reddit wiki/sidebar inclusion | — | — | 200 | 800 |
| YouTube (4 videos) | — | 200 | 800 | 3,500 |
| Twitter/X (replies + 1 thread/mo) | 20 | 100 | 300 | 800 |
| TikTok (10 posts + 5 micro-creators) | 30 | 300 | 1,000 | 3,000 |
| Newsletter (sends to growing list) | 40 | 250 | 800 | 2,500 |
| **Total monthly social/community** | **140** | **1,250** | **6,600** | **15,400** |
| **Total cumulative** | **140** | **2,500** | **20,000** | **80,000** |

**Compared to current state (0% social):** This is a meaningful diversification — month-12 social = ~10–15% of total traffic, providing a real algorithm-buffer.

**The asymmetric upside scenarios** (not in baseline):
- One viral TikTok: +50–500k visits
- DHM thread hits r/all: +20–80k visits
- Huberman or similar mentions dhmguide.com: +10–50k visits

---

## 9. Files Referenced

- `/Users/patrickkavanagh/dhm-guide-website/src/pages/DosageCalculatorEnhanced.jsx` — existing email capture (line 730, 747 TODO, 566 exit-intent)
- `/Users/patrickkavanagh/dhm-guide-website/src/utils/engagement-tracker.js` — `trackEmailCapture` (line 169)
- `/Users/patrickkavanagh/dhm-guide-website/src/pages/DosageCalculator.jsx:169` — older capture flow

## Sources

- [r/Supplements top monthly posts (live, 2026-04-26)](https://www.reddit.com/r/Supplements/top/?t=month)
- [r/Biohackers DHM threads (live, 2026-04-26)](https://www.reddit.com/r/Biohackers/search/?q=DHM)
- [r/HubermanLab alcohol discussions (live, 2026-04-26)](https://www.reddit.com/r/HubermanLab/search/?q=alcohol)
- [W Magazine: DHM TikTok trend coverage](https://www.wmagazine.com/beauty/tish-weinstock-wellness-gone-wild-dhm-hangover)
- [Andrew Huberman X — Alcohol & Hangovers](https://x.com/hubermanlab/status/1586739346790498304)
- [Reddit r/asianamerican: Asian flush remedies thread](https://www.reddit.com/r/asianamerican/)
- [Discord Biohacker Lounge](https://discord.com/invite/the-biohacker-lounge-biohacking-community-by-josh-985888960653963264)
