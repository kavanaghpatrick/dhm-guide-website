# E-E-A-T IMPLEMENTATION ROADMAP
**Step-by-Step Plan for Issues #60, #67, #68**

---

## DOCUMENT PURPOSE

This roadmap translates the comprehensive audit (E-E-A-T_AUDIT_AUGMENTATIONS.md) into actionable daily tasks with exact file locations, code snippets, and completion criteria.

**Use this when:** You're ready to start implementing and need clear next steps
**Use quick reference when:** You need fast answers to specific questions
**Use full audit when:** You need deep context or templates

---

## PHASE 1: WEEK 1 - E-E-A-T FOUNDATION (Issue #60)
**Goal:** Create foundational E-E-A-T elements that can be published immediately
**Time:** 4 hours
**Budget:** $0 (DIY)

---

### Day 1: Author Bio & Photo (1.5 hours)

**Task 1.1: Write Author Bio (30 minutes)**

**File to create:** `/src/pages/Author.jsx` (new file)

**Template to use:** See E-E-A-T_QUICK_REFERENCE.md, "Simplified Author Bio Template"

**Checklist:**
- [ ] Write bio in third person (3-6 sentences)
- [ ] Include real credentials (degree, institution)
- [ ] Mention years of experience (10+ years studying...)
- [ ] Add specific expertise (alcohol metabolism, DHM research)
- [ ] Add LinkedIn profile link (create if needed)
- [ ] NO generic language like "health enthusiast" or "passionate about wellness"

**Example output:**
```jsx
// /src/pages/Author.jsx
import React from 'react'
import { useSEO, generatePageSEO } from '../hooks/useSEO.js'

export default function Author() {
  useSEO(generatePageSEO('author'));

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Author Photo */}
          <img
            src="/author-photo.jpg"
            alt="Patrick Kavanagh"
            className="w-48 h-48 rounded-full object-cover"
          />

          {/* Author Bio */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Patrick Kavanagh</h1>
            <p className="text-xl text-gray-600 mb-4">Biochemistry Researcher & Founder</p>

            <div className="prose prose-lg">
              <p>
                Patrick Kavanagh is a biochemistry researcher with 10+ years of
                experience studying alcohol metabolism and hangover prevention compounds.
              </p>

              <p>
                He holds a degree in biochemistry from [University] and has extensively
                researched DHM's molecular mechanisms through analysis of 50+ peer-reviewed
                clinical studies.
              </p>

              <p>
                Patrick founded DHM Guide in 2023 to bridge the gap between complex
                scientific research and practical hangover prevention information for
                consumers. His work has been cited by health professionals and supplement
                researchers.
              </p>

              <p>
                He specializes in translating clinical research into actionable advice,
                with particular expertise in alcohol metabolism, liver health, and
                evidence-based supplement evaluation.
              </p>

              <p>
                <a href="https://linkedin.com/in/patrick-kavanagh"
                   className="text-blue-600 hover:underline">
                  Connect with Patrick on LinkedIn
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Task 1.2: Create Author Photo (30 minutes)**

**Options:**
1. Smartphone photo with good lighting (free)
2. Hire photographer on Upwork ($100-200)
3. Use AI headshot generator like ProfilePicture.ai ($0-30)

**Requirements:**
- Professional appearance (no selfies, no casual)
- Good lighting (natural light or ring light)
- Neutral background
- Square format (400x400px minimum)
- File: `/public/author-photo.jpg`

**Checklist:**
- [ ] Take/get photo (400x400px minimum)
- [ ] Crop to square
- [ ] Optimize for web (compress to <100KB)
- [ ] Save as `/public/author-photo.jpg`
- [ ] Test in Author.jsx component

**Task 1.3: Add Author Page to Routes (30 minutes)**

**File to edit:** `/src/App.jsx`

**Add route:**
```jsx
import Author from './pages/Author.jsx'

// In your routes:
<Route path="/author" element={<Author />} />
<Route path="/author/patrick-kavanagh" element={<Author />} />
```

**File to edit:** `/src/components/Footer.jsx` (or wherever footer is)

**Add link:**
```jsx
<Link to="/author" className="text-gray-600 hover:text-gray-900">
  Author
</Link>
```

**Verification:**
- [ ] Visit http://localhost:3000/author (local dev)
- [ ] Bio displays correctly
- [ ] Photo loads
- [ ] LinkedIn link works
- [ ] Footer link to /author works

---

### Day 2: Medical Disclaimer & Upwork Post (1.5 hours)

**Task 2.1: Add Medical Disclaimer to Footer (45 minutes)**

**File to edit:** `/src/components/Footer.jsx`

**Add disclaimer section:**
```jsx
<div className="border-t border-gray-200 mt-8 pt-8">
  <div className="text-sm text-gray-600 space-y-2">
    <p className="font-semibold">Medical Disclaimer</p>
    <p>
      The information provided on DHM Guide is for educational and informational
      purposes only and is not intended as medical advice. DHM Guide does not
      provide medical advice, diagnosis, or treatment.
    </p>
    <p>
      Always consult with a qualified healthcare provider before starting any
      supplement regimen, especially if you have underlying health conditions,
      are taking medications, or are pregnant or nursing.
    </p>
    <p>
      The statements on this site have not been evaluated by the Food and Drug
      Administration. DHM supplements are not intended to diagnose, treat, cure,
      or prevent any disease.
    </p>
    <p>
      Individual results may vary. The effectiveness of DHM varies based on
      individual physiology, alcohol consumption levels, and other factors.
    </p>
    <p className="text-xs text-gray-500">
      Last updated: November 2025
    </p>
  </div>
</div>
```

**Verification:**
- [ ] Disclaimer appears on all pages (check 3-5 different pages)
- [ ] Text is readable (not too small)
- [ ] Properly styled (gray text, clear separation from other footer content)

**Task 2.2: Create Upwork Job Post (45 minutes)**

**Action:** Copy template from E-E-A-T_QUICK_REFERENCE.md, "Upwork Job Post"

**Checklist:**
- [ ] Go to Upwork.com → Post a Job
- [ ] Copy job description template
- [ ] Set budget: $200-500 (fixed price project)
- [ ] Add skills: PharmD, Medical Review, Health Content, Dietary Supplements
- [ ] Set location: United States (easier credential verification)
- [ ] Post job
- [ ] Save job URL in notes

**Expected:** 5-15 applications within 48 hours

---

### Day 3: About Us Page Draft (1 hour)

**Task 3.1: Create About Us Page Structure (1 hour)**

**File to edit:** `/src/pages/About.jsx` (already exists - update it)

**Current state:** About.jsx already has mission, values, expertise, methodology

**Changes needed:**
1. Add "Medical Review Process" section (NEW)
2. Add "Contact Information" section (NEW)
3. Update "Our Expertise" with specific numbers (50+ studies analyzed)

**Add Medical Review section (after Methodology section, before Contact):**

```jsx
{/* Medical Review Process Section - NEW */}
<section className="py-16 px-4 bg-white">
  <div className="container mx-auto max-w-4xl">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 text-center">
        Medical Review Standards
      </h2>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed">
          Every health-related article on DHM Guide undergoes medical review by
          licensed healthcare professionals before publication.
        </p>

        <div className="bg-green-50 p-6 rounded-lg my-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Our Medical Reviewers</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Licensed pharmacists (PharmD) with expertise in dietary supplements</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Registered dietitians (RD) specializing in nutrition and liver health</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Board-certified professionals with 5+ years clinical experience</span>
            </li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Process</h3>
        <ol className="space-y-2 text-gray-700">
          <li>1. Content reviewed for medical accuracy against current research</li>
          <li>2. Clinical claims verified against peer-reviewed studies</li>
          <li>3. Safety information validated for dosage, interactions, contraindications</li>
          <li>4. Citations checked for accuracy and credibility</li>
        </ol>

        <p className="text-gray-700 mt-6">
          All reviewed content displays "Medically Reviewed by [Name], [Credentials]"
          with review date.
        </p>
      </div>
    </motion.div>
  </div>
</section>
```

**Update Contact section in existing About.jsx:**

Find the existing Contact section (bottom of file) and update it:

```jsx
{/* Contact Section */}
<section className="py-16 px-4 bg-gradient-to-r from-green-700 to-green-800 text-white">
  <div className="container mx-auto text-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        Get in Touch
      </h2>

      <div className="max-w-2xl mx-auto text-left bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
        <div className="space-y-4 text-white/90">
          <div>
            <p className="font-semibold text-white">General Inquiries</p>
            <p>Email: contact@dhmguide.com</p>
            <p className="text-sm">Response time: 2-3 business days</p>
          </div>

          <div>
            <p className="font-semibold text-white">Medical Review Questions</p>
            <p>Email: medical@dhmguide.com</p>
          </div>

          <div>
            <p className="font-semibold text-white">Press & Media</p>
            <p>Email: press@dhmguide.com</p>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="font-semibold text-white mb-2">Connect With Us</p>
            <div className="flex gap-4">
              <a href="https://linkedin.com/company/dhmguide"
                 className="hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="https://twitter.com/DHMGuide"
                 className="hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-white/80 max-w-2xl mx-auto">
        Note: We cannot provide personal medical advice via email. Please consult
        a qualified healthcare provider for medical questions about your specific situation.
      </p>
    </motion.div>
  </div>
</section>
```

**Verification:**
- [ ] Visit /about page
- [ ] New "Medical Review Standards" section appears
- [ ] Contact information updated with emails
- [ ] All sections render correctly
- [ ] No console errors

---

### Day 4: Citation Style Documentation (30 minutes)

**Task 4.1: Document AMA Citation Style (30 minutes)**

**File to create:** `/docs/CITATION_STYLE_GUIDE.md`

**Content:**
```markdown
# DHM Guide Citation Style Guide

## Standard: AMA (American Medical Association)

### Why AMA?
- Used by Healthline, WebMD, major medical journals
- Clean visual presentation (numbered superscripts)
- Doesn't interrupt reading flow
- Industry standard for health content

### In-Text Citations

**Format:** Superscript number after claim

**Example:**
```
DHM reduces acetaldehyde levels by 70% in clinical trials.¹
```

**Markdown:**
```markdown
DHM reduces acetaldehyde levels by 70% in clinical trials.<sup>1</sup>
```

**HTML:**
```html
DHM reduces acetaldehyde levels by 70% in clinical trials.<sup>1</sup>
```

### Reference List

**Format:** Numbered list at bottom of article under "## References" heading

**Peer-Reviewed Journal Article:**
```
1. Shen Y, Lindemeyer AK, Gonzalez C, et al. Dihydromyricetin as a novel
   anti-alcohol intoxication medication. J Neurosci. 2012;32(1):390-401.
   doi:10.1523/JNEUROSCI.4639-11.2012
```

**Format Rules:**
- Authors: Last name, First Initial. (max 6, then "et al.")
- Journal: NLM standard abbreviation
- Year;Volume(Issue):Pages
- DOI if available

**Website/Online Source:**
```
2. National Institutes of Health. Alcohol metabolism and hangover. NIH Office
   of Dietary Supplements. Updated June 2024. Accessed November 9, 2025.
   https://ods.od.nih.gov/factsheets/Alcohol-HealthProfessional/
```

### Implementation

**In blog posts (JSON files):**
Add references array to post metadata

**In article components:**
Render references at bottom using AMA format

**Example:**
```jsx
<section className="mt-12 pt-8 border-t border-gray-200">
  <h2 className="text-2xl font-bold mb-4">References</h2>
  <ol className="space-y-2 text-sm text-gray-700">
    {post.references.map((ref, index) => (
      <li key={index} className="pl-4" style={{ textIndent: '-1em', marginLeft: '1em' }}>
        {index + 1}. {ref}
      </li>
    ))}
  </ol>
</section>
```
```

**Checklist:**
- [ ] Create `/docs/CITATION_STYLE_GUIDE.md`
- [ ] Document AMA format with examples
- [ ] Add implementation notes for developers
- [ ] Commit to git

---

### Week 1 Deliverables

**Completed by end of Week 1:**
- ✅ Author bio page (/author)
- ✅ Author photo (400x400px)
- ✅ Medical disclaimer in footer (all pages)
- ✅ Upwork job posted for PharmD reviewer
- ✅ About Us page updated (Medical Review + Contact sections)
- ✅ Citation style guide documented

**Verification:**
- [ ] All pages have medical disclaimer in footer
- [ ] /about page has 8 required sections
- [ ] /author page displays correctly
- [ ] Upwork job is live and receiving applications
- [ ] No broken links or console errors

**Time spent:** 4 hours
**Budget spent:** $0 (Upwork posting is free)

---

## PHASE 2: MONTHS 2-3 - HIRE MEDICAL REVIEWER (Issue #67)
**Goal:** Hire, vet, and onboard licensed PharmD for medical review
**Time:** 5 hours (your time) + 1-2 weeks (reviewer time)
**Budget:** $200-500 (setup)

---

### Week 2-3: Review Upwork Applications (2 hours)

**Task 1: Screen Applications (1 hour)**

**Checklist for each applicant:**
- [ ] Has PharmD or RD license (stated clearly)
- [ ] Provides state and license number
- [ ] 3+ years relevant experience
- [ ] Prior medical review or health writing experience (preferred)
- [ ] Professional Upwork profile (verified payment, good reviews)

**Red flags - AUTO-REJECT:**
❌ No license number provided
❌ Refuses to share credentials for verification
❌ "I'm basically a pharmacist" (not licensed)
❌ Degree from non-accredited institution
❌ Only affiliate marketing experience (no clinical)

**Task 2: Verify Top 2-3 Candidates (1 hour)**

**For each candidate, verify:**

**Step 1: State Pharmacy Board Lookup**
- Go to state pharmacy board website (see E-E-A-T_QUICK_REFERENCE.md)
- Search license number
- Screenshot results showing:
  - Active license status
  - No disciplinary actions
  - License type (PharmD, RPh)
  - Expiration date

**Step 2: ACPE Verification (Education)**
- Visit https://www.acpe-accredit.org/
- Search pharmacy school
- Confirm institution is accredited

**Step 3: LinkedIn Verification**
- Find LinkedIn profile
- Confirm employment history matches resume
- Check for pharmaceutical/clinical connections
- Look for endorsements in relevant skills

**Save all screenshots** in `/docs/medical-reviewer-verification/[name]/`

**Task 3: Interview Top Candidate (30 minutes)**

**Questions to ask:**
1. What's your experience reviewing consumer health content?
2. How familiar are you with dietary supplements and FDA regulations?
3. What's your process for verifying clinical claims?
4. Any conflicts of interest with supplement manufacturers?
5. Timeline - can you review 3-5 articles in next 2 weeks?

**Decision criteria:**
- Clear communication
- Understands supplement space
- Available within timeline
- No conflicts of interest
- Professional demeanor

---

### Week 3-4: Contract & Setup (1 hour)

**Task 1: Send Contract (30 minutes)**

**File to create:** `/docs/contracts/medical-reviewer-agreement-[name].md`

**Use template:** E-E-A-T_AUDIT_AUGMENTATIONS.md, Issue #67, Augmentation #2

**Fill in:**
- Reviewer name
- License number and state
- Compensation ($200-500 setup, $50-100 per review)
- Payment method (Upwork, PayPal, wire)
- Review timeline (7-14 days)

**Send for signature:**
- Use DocuSign, HelloSign, or PDF signature
- Keep signed copy in `/docs/contracts/`

**Task 2: Request Professional Bio (30 minutes)**

**Email to reviewer:**
```
Hi [Name],

Congrats on being selected! We're excited to work with you.

To complete setup, please provide:

1. Professional bio (50-100 words) for our About page, including:
   - Your credentials (PharmD, specialization)
   - Years of experience
   - Areas of expertise (dietary supplements, clinical pharmacy, etc.)
   - Current role (optional)

2. Professional headshot (optional but preferred)
   - 400x400px minimum
   - High quality, professional appearance

Example format:
"Dr. Jane Doe, PharmD, BCPS is a board-certified pharmacotherapy specialist
with 12 years of experience in clinical pharmacy and dietary supplement safety.
She holds a PharmD from University of California, San Francisco and specializes
in supplement-drug interactions and dosage safety."

Timeline: Please send by [date, 3-5 days from now]

Thanks!
[Your name]
```

---

### Week 4-5: Submit Articles for Review (2 hours)

**Task 1: Select 3-5 Cornerstone Articles (15 minutes)**

**Recommended articles for initial review:**
1. DHM Dosage Guide (highest traffic)
2. Best DHM Supplements (comparison post)
3. DHM Safety Guide (if created)
4. DHM vs NAC (comparison)
5. When to Take DHM (timing guide)

**Criteria:**
- Highest traffic (check Google Search Console)
- Most health claims (dosage, safety, interactions)
- Longest content (5,000+ words)
- Most need for credibility (YMYL content)

**Task 2: Prepare Articles for Review (45 minutes)**

**For each article:**

1. Export to Google Doc
   - Copy full article text (including references)
   - Paste into Google Doc
   - Name: "[Article Title] - Medical Review"
   - Share with reviewer (editing permissions)

2. Add review instructions at top of doc:
```
REVIEW INSTRUCTIONS

Please review this content for:

✅ Medical Accuracy
- Verify all clinical claims against current research
- Check dosage recommendations align with studies
- Confirm safety information is complete

✅ Citations
- Verify citations support claims
- Check for missing citations
- Confirm citation format accuracy

✅ Safety & Legal
- Identify statements that could be medical advice
- Check for contraindications/interaction warnings
- Verify disclaimers are appropriate

FEEDBACK METHOD:
- Use "Suggesting" mode for corrections
- Use Comments for questions
- Mark "CRITICAL" for safety issues

TIMELINE: Please complete within 7-14 days
QUESTIONS: Email medical@dhmguide.com
```

**Task 3: Send Articles to Reviewer (30 minutes)**

**Email:**
```
Hi [Name],

Here are the first 3-5 articles for medical review:

1. [Article Title] - [Google Doc Link]
2. [Article Title] - [Google Doc Link]
3. [Article Title] - [Google Doc Link]

Instructions are at the top of each doc. Please review for medical accuracy,
citations, and safety information.

Timeline: Please complete within [7-14 days, specific date]

Let me know if you have any questions!

Payment ($[amount]) will be submitted after final approval.

Thanks!
[Your name]
```

**Task 4: Track Review Progress (ongoing, 30 minutes total)**

**Create tracking spreadsheet:**

| Article | Submitted | Reviewer | Status | Completed | Payment |
|---------|-----------|----------|--------|-----------|---------|
| DHM Dosage Guide | Nov 15 | Jane Doe | In Review | - | - |
| Best DHM Supplements | Nov 15 | Jane Doe | Not Started | - | - |

**Check-in schedule:**
- Day 7: Check progress, answer questions
- Day 10: Reminder if not started
- Day 14: Deadline, request completion

---

### Week 5-6: Implement Feedback & Publish (1 hour)

**Task 1: Review Feedback (30 minutes)**

**For each article:**
- Read all reviewer comments
- Categorize: CRITICAL (must fix) vs OPTIONAL (nice to have)
- Discuss any disagreements with reviewer

**Task 2: Implement Changes (varies by article, budget 2-4 hours total)**

**For each suggested change:**
- Update article content (JSON files or components)
- Fix citations if needed
- Add missing safety information
- Verify changes with reviewer

**Task 3: Add Medical Review Badge (30 minutes)**

**File to edit:** Article component (e.g., `/src/components/BlogPost.jsx`)

**Add badge component:**
```jsx
{post.medicalReview && (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
    <div className="flex items-start">
      <CheckCircle className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-blue-900">
          Medically reviewed by {post.medicalReview.reviewerName}, {post.medicalReview.credentials}
        </p>
        <p className="text-sm text-blue-700">
          {post.medicalReview.reviewerTitle}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Reviewed: {post.medicalReview.reviewDate}
        </p>
      </div>
    </div>
  </div>
)}
```

**Add to article JSON:**
```json
{
  "title": "DHM Dosage Guide",
  "medicalReview": {
    "reviewerName": "Jane Doe",
    "credentials": "PharmD, BCPS",
    "reviewerTitle": "Board-Certified Pharmacotherapy Specialist",
    "reviewDate": "November 2025"
  }
}
```

**Task 4: Add Reviewer to About Page (30 minutes)**

**File to edit:** `/src/pages/About.jsx`

**Add reviewer bio to Medical Review section:**
```jsx
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Medical Reviewers</h3>

  <div className="flex items-start space-x-4">
    <img
      src="/reviewer-jane-doe.jpg"
      alt="Dr. Jane Doe, PharmD"
      className="w-24 h-24 rounded-full object-cover"
    />
    <div>
      <p className="font-semibold text-gray-900">Dr. Jane Doe, PharmD, BCPS</p>
      <p className="text-sm text-gray-600 mb-2">Board-Certified Pharmacotherapy Specialist</p>
      <p className="text-gray-700 text-sm">
        Dr. Doe is a licensed pharmacist with 12 years of experience in clinical
        pharmacy and dietary supplement safety. She holds a PharmD from University
        of California, San Francisco and is board-certified by the Board of Pharmacy
        Specialties.
      </p>
      <p className="text-sm text-gray-600 mt-2">
        <strong>Expertise:</strong> Supplement-drug interactions, dosage safety, liver health
      </p>
      <p className="text-xs text-gray-500 mt-1">
        License: Active in California (verified November 2025)
      </p>
    </div>
  </div>
</div>
```

**Task 5: Submit Payment (15 minutes)**

**Via Upwork:**
- Submit payment ($200-500 as agreed)
- Leave review for reviewer
- Mark contract complete

**Via PayPal/Wire:**
- Send payment with invoice reference
- Request receipt
- File in `/docs/invoices/`

---

### Phase 2 Deliverables

**Completed by end of Months 2-3:**
- ✅ PharmD reviewer hired and vetted
- ✅ Credentials verified (license active, no disciplinary actions)
- ✅ Contract signed and stored
- ✅ 3-5 cornerstone articles medically reviewed
- ✅ Medical review badges added to reviewed articles
- ✅ Reviewer bio added to About page
- ✅ Payment submitted ($200-500)

**Verification:**
- [ ] Reviewed articles show "Medically Reviewed by" badge
- [ ] Reviewer bio appears on /about page
- [ ] All reviewer feedback implemented
- [ ] Contract signed and stored in /docs/contracts/
- [ ] Payment completed

**Time spent:** 5 hours (your time) + 1-2 weeks (reviewer time)
**Budget spent:** $200-500

---

## PHASE 3: MONTHS 2-3 - PUBLISH ABOUT US & AUTHOR PAGES (Issue #68)
**Goal:** Finalize and publish all E-E-A-T trust signals
**Time:** 4 hours
**Budget:** $0

---

### Week 6-7: Finalize About Us Page (2 hours)

**Task 1: Add Schema Markup (1 hour)**

**File to create:** `/src/components/SchemaMarkup.jsx`

**Content:**
```jsx
import React from 'react'

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DHM Guide",
    "url": "https://dhmguide.com",
    "logo": "https://dhmguide.com/logo.png",
    "description": "Science-backed hangover prevention and DHM supplement research",
    "foundingDate": "2023",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "contact@dhmguide.com",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://linkedin.com/company/dhmguide",
      "https://twitter.com/DHMGuide"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function AuthorSchema({ name, jobTitle, description, url, linkedIn }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": jobTitle,
    "description": description,
    "url": url,
    "sameAs": [linkedIn]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**File to edit:** `/src/pages/About.jsx`

**Add at top of component:**
```jsx
import { OrganizationSchema } from '../components/SchemaMarkup'

export default function About() {
  return (
    <>
      <OrganizationSchema />

      {/* Rest of About page content */}
    </>
  )
}
```

**File to edit:** `/src/pages/Author.jsx`

**Add at top of component:**
```jsx
import { AuthorSchema } from '../components/SchemaMarkup'

export default function Author() {
  return (
    <>
      <AuthorSchema
        name="Patrick Kavanagh"
        jobTitle="Biochemistry Researcher & Founder"
        description="Biochemistry researcher with 10+ years studying alcohol metabolism"
        url="https://dhmguide.com/author/patrick-kavanagh"
        linkedIn="https://linkedin.com/in/patrick-kavanagh"
      />

      {/* Rest of Author page content */}
    </>
  )
}
```

**Verification:**
- [ ] View page source on /about (Cmd+U or Ctrl+U)
- [ ] Search for "application/ld+json"
- [ ] Verify JSON schema is present
- [ ] Test with Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] No schema errors

**Task 2: Quality Check About Page (1 hour)**

**Checklist - About page must have:**
- [ ] Mission Statement (100-150 words)
- [ ] Our Values (4 pillars with icons)
- [ ] Expertise section (years of experience, studies analyzed)
- [ ] Research Methodology (4-step process)
- [ ] Medical Review Standards (NEW - added in Week 1)
- [ ] Editorial Standards (Independence, Accuracy, Transparency, Accessibility)
- [ ] Contact Information (emails, mailing address, social links)
- [ ] Trust Signals (50+ studies, 100K+ users, medical review)
- [ ] Medical Reviewer bio (added in Phase 2)
- [ ] Organization schema markup (added this week)

**Visual check:**
- [ ] All sections render correctly
- [ ] Icons display (CheckCircle, Microscope, etc.)
- [ ] Images load (mission visual, reviewer photo if applicable)
- [ ] Responsive on mobile (test on phone or browser dev tools)
- [ ] No broken links
- [ ] No console errors

**Content check:**
- [ ] No typos or grammatical errors
- [ ] Tone is professional but accessible
- [ ] Claims are accurate (50+ studies - count them, don't estimate)
- [ ] Contact emails are real/working
- [ ] LinkedIn/social links work

---

### Week 7-8: Author Page Polish & Footer Links (2 hours)

**Task 1: Author Page Final Polish (1 hour)**

**File to edit:** `/src/pages/Author.jsx`

**Ensure page has:**
- [ ] Author photo (circular, 400x400px minimum)
- [ ] Full name and credentials (H1)
- [ ] Job title (subtitle)
- [ ] Full bio (3-6 paragraphs, third person)
- [ ] LinkedIn link (working)
- [ ] Author schema markup
- [ ] Responsive design (mobile-friendly)

**Optional enhancements:**
- [ ] List of published articles by author
- [ ] Areas of expertise (bullet list)
- [ ] Publications or research mentions

**Example addition - Article list:**
```jsx
<section className="mt-12 pt-8 border-t border-gray-200">
  <h2 className="text-2xl font-bold mb-6">Articles by Patrick</h2>
  <div className="grid gap-4">
    {posts
      .filter(post => post.author === 'Patrick Kavanagh')
      .map(post => (
        <Link
          key={post.id}
          to={`/blog/${post.slug}`}
          className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">{post.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
          <p className="text-xs text-gray-500 mt-2">
            {post.medicalReview && (
              <span className="inline-flex items-center">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-1" />
                Medically Reviewed
              </span>
            )}
          </p>
        </Link>
      ))
    }
  </div>
</section>
```

**Task 2: Add Footer Links (1 hour)**

**File to edit:** `/src/components/Footer.jsx`

**Ensure footer has:**

**Section 1: About Links**
- [ ] About Us → /about
- [ ] Author → /author
- [ ] Contact → /about#contact (anchor to contact section)

**Section 2: Content Links**
- [ ] Research → /research
- [ ] Reviews → /reviews
- [ ] Blog → /blog

**Section 3: Legal Links**
- [ ] Privacy Policy → /privacy (create if needed)
- [ ] Terms of Use → /terms (create if needed)
- [ ] Medical Disclaimer (already in footer, keep it)

**Example footer structure:**
```jsx
<footer className="bg-gray-900 text-white py-12">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* About Links */}
      <div>
        <h3 className="font-semibold mb-4">About</h3>
        <ul className="space-y-2">
          <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
          <li><Link to="/author" className="text-gray-300 hover:text-white">Author</Link></li>
          <li><Link to="/about#contact" className="text-gray-300 hover:text-white">Contact</Link></li>
        </ul>
      </div>

      {/* Content Links */}
      <div>
        <h3 className="font-semibold mb-4">Content</h3>
        <ul className="space-y-2">
          <li><Link to="/research" className="text-gray-300 hover:text-white">Research</Link></li>
          <li><Link to="/reviews" className="text-gray-300 hover:text-white">Reviews</Link></li>
          <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
        </ul>
      </div>

      {/* Legal Links */}
      <div>
        <h3 className="font-semibold mb-4">Legal</h3>
        <ul className="space-y-2">
          <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
          <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Use</Link></li>
        </ul>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="font-semibold mb-4">Connect</h3>
        <div className="flex gap-4">
          <a href="https://linkedin.com/company/dhmguide"
             className="text-gray-300 hover:text-white">
            LinkedIn
          </a>
          <a href="https://twitter.com/DHMGuide"
             className="text-gray-300 hover:text-white">
            Twitter
          </a>
        </div>
      </div>
    </div>

    {/* Medical Disclaimer - keep existing */}
    <div className="border-t border-gray-700 mt-8 pt-8">
      {/* Existing disclaimer content */}
    </div>

    {/* Copyright */}
    <div className="text-center mt-8 text-gray-400 text-sm">
      © 2025 DHM Guide. All rights reserved.
    </div>
  </div>
</footer>
```

**Verification:**
- [ ] All footer links work (click each one)
- [ ] Footer appears on all pages
- [ ] Responsive on mobile
- [ ] Medical disclaimer still present
- [ ] No broken links

---

### Phase 3 Deliverables

**Completed by end of Months 2-3:**
- ✅ About Us page finalized with all 8 sections
- ✅ Medical reviewer bio added to About page
- ✅ Organization schema markup on About page
- ✅ Author page finalized with full bio
- ✅ Author schema markup on Author page
- ✅ Footer links to About/Author pages (all pages)
- ✅ Contact information published
- ✅ Editorial standards documented

**Verification:**
- [ ] Visit /about - all sections present
- [ ] Visit /author - full bio displays
- [ ] View page source - schema markup present on both pages
- [ ] Test schema with Google Rich Results Test
- [ ] Footer links work from any page
- [ ] No broken links or console errors
- [ ] Mobile responsive (test on phone)

**Time spent:** 4 hours
**Budget spent:** $0

---

## FINAL VERIFICATION CHECKLIST

**After completing all 3 phases, verify:**

### E-E-A-T Elements Present:

**Experience:**
- [ ] Author bio shows real experience (10+ years studying...)
- [ ] Specific expertise mentioned (alcohol metabolism, DHM research)
- [ ] Personal connection to topic (founded DHM Guide to...)

**Expertise:**
- [ ] Real credentials (degree in biochemistry from [University])
- [ ] Medical reviewer credentials (PharmD, BCPS)
- [ ] Studies analyzed (50+ clinical studies)
- [ ] Professional affiliations (if applicable)

**Authoritativeness:**
- [ ] "Medically Reviewed by" badges on 3-5 cornerstone articles
- [ ] Medical reviewer bio on About page with credentials
- [ ] AMA citations on all health claims
- [ ] Trust signals (100K+ users helped, 20+ brands tested)

**Trustworthiness:**
- [ ] Transparent About Us page with mission, values, methodology
- [ ] Contact information (email, mailing address)
- [ ] Medical disclaimer on all pages
- [ ] Editorial standards documented
- [ ] Schema markup for organization and author

### Technical SEO:

- [ ] Organization schema on /about page
- [ ] Author schema on /author page
- [ ] Medical review badges display correctly
- [ ] AMA citations properly formatted
- [ ] Footer links work from all pages
- [ ] No broken links
- [ ] No console errors
- [ ] Mobile responsive

### Legal Protection:

- [ ] Medical disclaimer on every page (footer)
- [ ] "Not medical advice" statement clear
- [ ] FDA disclaimer for supplements
- [ ] Medical review disclaimer explaining reviewer role
- [ ] Reviewer contract signed and stored

---

## SUCCESS METRICS (Track Monthly)

**Month 1 (After Phase 1):**
- Baseline: Google Search Console impressions/clicks
- About page published
- Medical disclaimer on all pages
- Upwork job posted

**Month 2-3 (After Phases 2-3):**
- 3-5 articles with medical review badges
- Medical reviewer bio on About page
- Author page published
- Schema markup implemented

**Month 4-6 (Post-Implementation):**
- Track GSC impressions (should increase 10-20%)
- Track time on page (should increase with trust signals)
- Track bounce rate (should decrease)
- Track featured snippets (should increase)
- Monitor algorithm updates (should have no negative impact)

**Target KPIs:**
- 100% of health articles medically reviewed within 6 months
- 20%+ increase in organic traffic from E-E-A-T signals
- Zero algorithm penalties
- Featured snippets on 10+ queries

---

## ONGOING MAINTENANCE

**Monthly:**
- [ ] Review new content with medical reviewer ($50-100 per guide)
- [ ] Update "Last reviewed" dates on key articles (annually minimum)
- [ ] Check reviewer license status (annually)

**Quarterly:**
- [ ] Update trust signals on About page (users helped, studies analyzed)
- [ ] Review and update medical disclaimer if needed
- [ ] Check for broken links on About/Author pages

**Annually:**
- [ ] Renew medical reviewer contract
- [ ] Review and update all cornerstone articles
- [ ] Update schema markup with new achievements
- [ ] Verify reviewer credentials (license still active)

---

## TROUBLESHOOTING

### Issue: Can't find qualified PharmD on Upwork
**Solution:**
- Expand search to RD (Registered Dietitian)
- Increase budget to $300-600
- Post on LinkedIn, Indeed, or pharmacy job boards
- Try remote vs. in-person

### Issue: Medical reviewer feedback conflicts with current content
**Solution:**
- Discuss with reviewer to understand rationale
- Provide sources for current claims
- If reviewer insists, defer to their expertise (legal protection)
- Document disagreement and resolution

### Issue: Schema markup not validating
**Solution:**
- Use Google Rich Results Test to identify errors
- Check JSON syntax (common errors: missing commas, quotes)
- Verify required fields (name, url for Organization)
- Test with Schema.org validator

### Issue: About page too long
**Solution:**
- Keep current structure (all 8 sections required for E-E-A-T)
- Add "jump to section" navigation at top
- Make sections collapsible on mobile
- Use visual hierarchy (headings, whitespace)

---

## COST SUMMARY

**One-Time Costs:**
| Item | Cost |
|------|------|
| Medical reviewer setup | $200-500 |
| Author photo | $0-200 |
| **Total One-Time** | **$200-700** |

**Ongoing Costs (Monthly):**
| Item | Cost |
|------|------|
| Medical review (2 guides/month) | $100-200 |
| License verification | $0 (DIY) |
| Content updates | $0 (your time) |
| **Total Monthly** | **$100-200** |

**Annual Cost:** $1,200-2,400

**ROI Calculation:**
- Traffic increase: 20% (conservative)
- Current traffic: 174 clicks/month → 209 clicks/month
- Value per click: $0.50-2.00 (affiliate/ads)
- Additional monthly revenue: $17-70
- Annual additional revenue: $204-840
- ROI: -$400 to -$1,600 (Year 1 is investment in protection)

**Real ROI:** Protection from algorithm penalties (priceless)
- One health algorithm update could wipe 100% of traffic
- E-E-A-T is insurance, not revenue generator

---

## NEXT STEPS

1. **Read this roadmap** ✓
2. **Start Phase 1, Day 1** (write author bio)
3. **Follow checklist daily** (4 hours over 1 week)
4. **Post Upwork job by Day 2** (start vetting PharmD candidates)
5. **Complete Phase 1 by end of Week 1**
6. **Move to Phase 2 once reviewer hired**

**Questions?** See E-E-A-T_QUICK_REFERENCE.md for fast answers or E-E-A-T_AUDIT_AUGMENTATIONS.md for deep dives.

---

**Document Version:** 1.0
**Created:** November 9, 2025
**Last Updated:** November 9, 2025
**Estimated Total Time:** 13 hours (across 2-3 months)
**Estimated Total Budget:** $200-700 (one-time) + $100-200/month (ongoing)
