// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * TDD HARNESS for the content roadmap (STRATEGY.md).
 *
 * Content is built test-first: add a new pillar/money post's slug to
 * NEW_CONTENT (or pass CONTENT_SLUGS=a,b), and these invariants define "done".
 * They are RED until the post exists and satisfies every SEO / depth / funnel /
 * health-content-compliance rule below — then the post ships GREEN.
 *
 *   CONTENT_SLUGS=how-to-prevent-a-hangover npx playwright test tests/content-quality.spec.js
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS = join(ROOT, 'src/newblog/data/posts');
const INDEX = join(ROOT, 'src/newblog/data/metadata/index.json');

const NEW_CONTENT = (process.env.CONTENT_SLUGS || 'how-to-prevent-a-hangover,best-liver-supplements,best-hangover-recovery-drinks,best-liver-detox-supplements,best-fatty-liver-supplements,tylenol-and-alcohol,pedialyte-vs-gatorade-hangover,pepto-bismol-and-alcohol,zbiotics-vs-cheers,nac-vs-dhm-which-antioxidant-better-liver-protection-2025,ibuprofen-and-alcohol,aleve-and-alcohol,dayquil-and-alcohol,dramamine-and-alcohol,creatine-and-alcohol,cheers-restore-review,zbiotics-review,do-hangover-patches-work,beer-before-liquor-myth,two-day-hangover,zofran-and-alcohol,zyrtec-and-alcohol,red-wine-headache,ashwagandha-and-alcohol,does-hair-of-the-dog-work,congeners-in-alcohol,hangover-kit-ideas,ginger-for-hangover,vitamins-for-hangover,sulfites-in-wine-headaches,least-hangover-alcohol-ranked,more-labs-morning-recovery-review,why-do-i-get-hangovers-so-easily,hangover-probiotics,liverite-liver-aid-review,excedrin-and-alcohol,what-to-take-before-drinking,why-hangovers-get-worse-with-age,glutathione-for-hangover,electrolytes-before-or-after-drinking,coconut-water-for-hangover,h-proof-review,afterdrink-review,korean-japanese-hangover-pills,how-to-speed-up-alcohol-metabolism,purple-tree-review,korean-pear-juice-hangover,beer-hangover,activate-dhm,l-cysteine-for-hangover,gin-hangover,soju-hangover,sake-hangover,no-days-wasted-vs-zbiotics,flyby-vs-zbiotics,advil-or-tylenol-for-hangover,alcohol-face-bloating,aspirin-and-alcohol,benadryl-for-hangover,best-soups-for-hangover,blowfish-hangover-review,body-aches-after-drinking,cant-sleep-after-drinking,cough-medicine-and-alcohol,diarrhea-after-drinking,do-hangover-pills-actually-work,does-exercise-help-a-hangover,drinking-on-an-empty-stomach,drunk-spins,eggs-for-hangover,hangover-shakes,heart-racing-after-drinking,heartburn-after-drinking,melatonin-and-alcohol,myrkl-review,stomach-pain-after-drinking,tudca-vs-milk-thistle,tums-and-alcohol,why-does-alcohol-make-you-hungry,zzzquil-and-alcohol,night-sweats-after-drinking,himalaya-partysmart-review,wine-drunk-vs-beer-drunk,electrolyte-drinks-for-hangover-compared,alcohol-and-hrv,mezcal-hangover,rum-hangover,brain-fog-after-drinking,nac-vs-milk-thistle,zbiotics-vs-morning-recovery,drinkwel-review,zbiotics-alternatives,espresso-martini-hangover,absinthe-hangover,jagermeister-hangover,mead-hangover,antibiotics-and-alcohol,doxycycline-and-alcohol,amoxicillin-and-alcohol,lexapro-and-alcohol,metronidazole-and-alcohol,prednisone-and-alcohol,zoloft-and-alcohol,nyquil-and-alcohol,blood-alcohol-calculator,wellbutrin-and-alcohol,cephalexin-and-alcohol,prozac-and-alcohol,gabapentin-and-alcohol,adderall-and-alcohol,azithromycin-and-alcohol,nitrofurantoin-and-alcohol,alka-seltzer-for-hangover,how-long-does-alcohol-stay-in-your-system,what-is-bac,alcohol-poisoning-signs,alcohol-content-by-drink,pedialyte-popsicles-hangover,borg-drink,best-dhm-supplements,best-foods-for-hangover,lowest-calorie-alcohol,hangover-symptoms,gatorade-for-hangover,how-long-does-alcohol-stay-in-urine,blackout-wednesday,what-does-proof-mean,does-non-alcoholic-beer-have-alcohol,how-much-alcohol-is-in-a-shot,hydroxyzine-and-alcohol,metformin-and-alcohol,trazodone-and-alcohol,propranolol-and-alcohol,best-medicine-for-hangover,fluconazole-and-alcohol,sudafed-and-alcohol,xanax-and-alcohol,liquid-iv-for-hangover,is-ethanol-the-same-as-alcohol,alcohol-intolerance,bananas-for-hangover,why-does-alcohol-make-you-sleepy,is-alcohol-a-depressant,korean-hangover-soup,best-hangover-pills,how-many-drinks-in-a-bottle-of-wine,magnesium-and-alcohol,best-hangover-breakfast,does-water-help-a-hangover,does-alcohol-raise-cholesterol,korean-hangover-drinks,sober-curious,gluten-free-alcohol,augmentin-and-alcohol,buspirone-and-alcohol,zepbound-and-alcohol,methylprednisolone-and-alcohol,mucinex-and-alcohol,antidepressants-and-alcohol,bactrim-and-alcohol,alcohol-free-cold-medicine,how-to-rehydrate-after-drinking,alcohol-allergy,best-hangover-shots,the-plug-drink-review,instant-hydration-vs-liquid-iv,greasy-food-hangover,famous-hangover-cures,pickle-juice-for-hangover,calories-in-alcohol,energy-drinks-and-alcohol,red-face-after-drinking,orange-juice-for-hangover,how-long-does-it-take-for-alcohol-to-kick-in,how-long-does-alcohol-stay-on-your-breath,does-alcohol-help-a-cold,how-much-alcohol-is-in-kombucha,milk-for-hangover,accutane-and-alcohol,best-hangover-prevention-drinks,best-tea-for-hangover,beta-blockers-and-alcohol,blackout-drunk,ciprofloxacin-and-alcohol,coffee-for-hangover,drinking-on-a-cruise,electrolit-vs-pedialyte,eliquis-and-alcohol,healthiest-alcohol,homemade-electrolyte-drink,how-alcohol-is-metabolized,how-many-drinks-to-get-drunk,l-theanine-and-alcohol,lmnt-vs-liquid-iv,meloxicam-and-alcohol,new-years-hangover,party-drinking-tips,soda-for-hangover,st-patricks-day-hangover,valacyclovir-and-alcohol,viagra-and-alcohol,vyvanse-and-alcohol,why-does-alcohol-make-you-pee,antihistamines-and-alcohol,cyclobenzaprine-and-alcohol,does-alcohol-make-antibiotics-less-effective,wegovy-and-alcohol,lamotrigine-and-alcohol,accidentally-drank-on-metronidazole,clindamycin-and-alcohol,pepcid-for-asian-flush,drip-drop-vs-liquid-iv,what-happens-to-your-body-when-you-drink-alcohol,milk-thistle-and-alcohol,caffeine-and-alcohol,hiccups-after-drinking,does-bread-soak-up-alcohol,home-remedies-for-hangover,watermelon-for-hangover,does-alcohol-cause-hair-loss,kava-and-alcohol,liquid-iv-vs-gatorade,hangover-gummies,hangover-smoothie-recipes,what-is-acetaldehyde,toast-and-crackers-for-hangover,hangover-cures-reddit,how-long-does-it-take-to-sober-up,antihistamines-for-alcohol-intolerance,cymbalta-and-alcohol,tamiflu-and-alcohol,ativan-and-alcohol,mounjaro-and-alcohol,muscle-relaxers-and-alcohol,cialis-and-alcohol,seroquel-and-alcohol,zbiotics-sugar-to-fiber-review,bytox-review,best-fruits-for-hangover,legal-alcohol-limit-to-drive,what-is-a-standard-drink,nac-and-alcohol,hangover-iv-drip,electrolytes-and-alcohol,panic-attack-after-drinking,alcohol-and-libido,vitamin-b12-and-alcohol,ru-21-review,biggest-drinking-days-of-the-year,berberine-and-alcohol,best-fast-food-for-hangover,gatorlyte-vs-pedialyte,alcohol-and-testosterone,alcohol-tolerance,chocolate-for-hangover,claritin-and-alcohol,does-alcohol-affect-your-period,does-alcohol-cause-acne,does-alcohol-dehydrate-you,does-cough-syrup-have-alcohol,does-pooping-help-a-hangover,does-sleep-help-a-hangover,drinking-before-blood-test,driving-hungover,effexor-and-alcohol,hangover-fever,hangover-patch-brands-compared,how-to-not-get-drunk,klonopin-and-alcohol,liquid-iv-vs-pedialyte-for-hangover,metoprolol-and-alcohol,omeprazole-and-alcohol,oxycodone-and-alcohol,sore-throat-after-drinking,steroids-and-alcohol,thiamine-and-alcohol,penicillin-and-alcohol,lisinopril-and-alcohol,methocarbamol-and-alcohol,ritalin-and-alcohol,atorvastatin-and-alcohol,statins-and-alcohol,blood-thinners-and-alcohol,lithium-and-alcohol,office-holiday-party-drinking,probiotics-and-alcohol,how-much-alcohol-is-too-much,yogurt-for-hangover,saltt-vs-lmnt,back-pain-after-drinking,throwing-up-bile-after-drinking,hydralyte-review,sugar-for-hangover,stuffy-nose-after-drinking,drinking-after-a-workout,pizza-for-hangover,spicy-food-hangover,chest-pain-after-drinking,protein-shake-for-hangover,hangover-pills-at-cvs-walgreens,amlodipine-and-alcohol,losartan-and-alcohol,meclizine-and-alcohol,plan-b-and-alcohol,pepcid-and-alcohol,spironolactone-and-alcohol,methotrexate-and-alcohol,abilify-and-alcohol,best-juice-for-hangover,does-alcohol-cause-kidney-stones,iron-and-alcohol,potassium-and-alcohol,vomiting-blood-after-drinking,nuun-vs-liquid-iv,electrolit-for-hangover,asian-flush-pills,histamine-intolerance-and-alcohol,why-does-alcohol-taste-bad,headache-after-one-drink,migraine-after-drinking,tingling-after-drinking,black-stool-after-drinking,apple-juice-for-hangover,liver-pain-after-drinking,cranberry-juice-for-hangover,unisom-and-alcohol,phentermine-and-alcohol,levofloxacin-and-alcohol,celexa-and-alcohol,allegra-and-alcohol,how-long-after-antibiotics-can-you-drink,keppra-and-alcohol,strattera-and-alcohol,lmnt-for-hangover,electrolit-vs-gatorade,kudzu-and-alcohol,where-to-buy-dhm,lemon-water-for-hangover,honey-for-hangover,liquid-iv-vs-propel,pre-workout-and-alcohol,severe-hangover-symptoms,hot-flashes-after-drinking,itchy-skin-after-drinking,poop-color-after-drinking,alcohol-and-depression,weight-loss-after-quitting-alcohol,vitamin-d-and-alcohol,alcohol-and-gaba,nsaids-and-alcohol,mirtazapine-and-alcohol,theraflu-and-alcohol,imodium-and-alcohol,uti-antibiotics-and-alcohol,gas-x-and-alcohol,midol-and-alcohol,topiramate-and-alcohol,coconut-water-vs-pedialyte,oatmeal-for-hangover,kidney-pain-after-drinking,energy-drink-for-hangover,jaw-pain-after-drinking,alcohol-and-rosacea,non-alcoholic-beer-hangover,does-alcohol-cause-bladder-infections,swollen-feet-after-drinking,pasta-for-hangover,day-drinking,b-complex-and-alcohol,vitamin-c-and-alcohol,does-a-straw-get-you-drunk-faster,salt-for-hangover,multivitamin-and-alcohol,alcohol-and-eczema,amitriptyline-and-alcohol,anxiety-medication-and-alcohol,adhd-medication-and-alcohol,metronidazole-gel-and-alcohol,laxatives-and-alcohol,baclofen-and-alcohol,colchicine-and-alcohol,valium-and-alcohol,beer-headache,sushi-for-hangover,vegas-hangover,can-alcohol-be-absorbed-through-skin,worst-cocktails-for-hangovers,alcohol-and-gout,how-long-after-drinking-can-you-drive,waterboy-vs-liquid-iv,chills-after-drinking,what-to-eat-after-throwing-up-from-drinking,kombucha-for-hangover,nicotine-and-alcohol,why-does-alcohol-make-you-emotional,kava-hangover,cbd-and-alcohol,functional-mushrooms-and-alcohol,leg-cramps-after-drinking,sleep-aids-and-alcohol,levothyroxine-and-alcohol,alcohol-and-medications,best-antacid-after-drinking,afrin-and-alcohol,acyclovir-and-alcohol,sumatriptan-and-alcohol,pantoprazole-and-alcohol,why-does-alcohol-make-you-feel-warm,nuun-vs-lmnt,prosecco-hangover,bachelorette-hangover-kit,turmeric-and-alcohol,is-drinking-every-day-bad,folic-acid-and-alcohol,valerian-root-and-alcohol,ultima-vs-liquid-iv,emergen-c-for-hangover,psyllium-husk-and-alcohol,hangover-or-food-poisoning,gas-after-drinking,how-not-to-get-drunk-at-a-wedding,tudca-and-alcohol,drinking-after-donating-blood,rice-for-hangover,minoxidil-and-alcohol,miralax-and-alcohol,jardiance-and-alcohol,flonase-and-alcohol,aspirin-vs-ibuprofen-for-hangover,do-cough-drops-have-alcohol,olanzapine-and-alcohol,latuda-and-alcohol,ringing-in-ears-after-drinking,sam-e-and-alcohol,ginseng-and-alcohol,best-tequila-for-no-hangover,ipa-hangover,draft-beer-headache,best-mixers-to-avoid-hangover,dotshot-review,zinc-and-alcohol,alcohol-and-sleep-apnea,mindful-drinking-apps,alcohol-and-running,5-htp-and-alcohol,cheap-vs-expensive-alcohol-hangover,alcohol-and-dopamine,low-alcohol-tolerance,nosebleed-after-drinking,hydrochlorothiazide-and-alcohol,xarelto-and-alcohol,xyzal-and-alcohol,tylenol-pm-and-alcohol,plavix-and-alcohol,carvedilol-and-alcohol,warfarin-and-alcohol,nurtec-and-alcohol,alcohol-and-cortisol,wines-that-dont-give-you-a-headache,avocado-for-hangover,starbucks-hangover-drink,niacin-and-alcohol,can-you-burn-fat-with-alcohol-in-your-system,high-blood-pressure-after-drinking,does-sex-help-a-hangover,massage-for-hangover,perimenopause-alcohol-intolerance,best-hangover-cocktails,does-carbonation-make-you-drunk-faster,white-wine-headache,still-drunk-the-next-morning,super-bowl-monday-hangover,rhodiola-and-alcohol,glycine-and-alcohol,advil-pm-and-alcohol,alcohol-and-estrogen,alcohol-and-serotonin,alcohol-metabolism-men-vs-women,allopurinol-and-alcohol,azo-and-alcohol,best-vodka-for-no-hangover,breath-smells-like-alcohol-without-drinking,collagen-and-alcohol,constipation-after-drinking,coughing-after-drinking,depakote-and-alcohol,dry-mouth-after-drinking,finasteride-and-alcohol,hangover-fatigue,iron-infusion-and-alcohol,l-glutamine-and-alcohol,lithium-orotate-and-alcohol,maca-and-alcohol,montelukast-and-alcohol,sauna-and-alcohol,tramadol-and-alcohol,twitching-after-drinking,vitamins-depleted-by-alcohol,zicam-and-alcohol,paxlovid-and-alcohol,tamsulosin-and-alcohol,valsartan-and-alcohol,advil-cold-and-sinus-and-alcohol,ambien-and-alcohol,gaviscon-and-alcohol,glipizide-and-alcohol,furosemide-and-alcohol,ginkgo-biloba-and-alcohol,best-hangover-products-amazon,does-alcohol-thin-your-blood,coq10-and-alcohol,left-side-pain-after-drinking,vodka-vs-tequila-hangover,shortness-of-breath-after-drinking,inky-cap-mushroom-and-alcohol,beer-vs-liquor-hangover,guinness-hangover,flavored-malt-beverage-hangover,shilajit-and-alcohol,bcaa-and-alcohol,does-alcohol-help-a-headache,low-blood-sugar-after-drinking,asparagus-for-hangover,over-ez-review,farxiga-and-alcohol,tylenol-cold-and-flu-and-alcohol,coricidin-and-alcohol,monistat-and-alcohol,bc-powder-and-alcohol,lactaid-and-alcohol,alka-seltzer-plus-and-alcohol,rybelsus-and-alcohol,sobur-review,calcium-and-alcohol,st-johns-wort-and-alcohol,black-seed-oil-and-alcohol,spirulina-and-alcohol,fish-oil-and-alcohol,potatoes-for-hangover,wedding-hangover-kit,sweet-wine-headache,do-wine-filters-work,drinking-on-a-boat,best-beer-for-no-hangover,vitamin-b6-and-alcohol,taurine-and-alcohol,alpha-lipoic-acid-and-alcohol,l-carnitine-and-alcohol,swollen-lymph-nodes-after-drinking,aperol-spritz-hangover,artichoke-extract-for-hangover,biotin-and-alcohol,brandy-cognac-hangover,cefdinir-and-alcohol,clarithromycin-and-alcohol,dhm-price-per-mg-compared,does-diet-soda-get-you-drunk-faster,does-mixing-drinks-make-hangover-worse,echinacea-and-alcohol,erythromycin-and-alcohol,everclear-hangover,fireball-hangover,hard-cider-hangover,liqueur-hangover,margarita-hangover,minocycline-and-alcohol,quercetin-and-alcohol,rose-wine-hangover,safety-shot-review,terbinafine-and-alcohol,tinidazole-and-alcohol,victoza-and-alcohol,why-do-i-get-drunk-faster-now,why-wine-in-europe-no-headache,paxil-and-alcohol,trintellix-and-alcohol,risperidone-and-alcohol,vraylar-and-alcohol,guanfacine-and-alcohol,modafinil-and-alcohol,blood-pressure-medication-and-alcohol,mimosa-hangover,sangria-hangover,hard-kombucha-hangover,makgeolli-hangover,fortified-wine-hangover,long-island-iced-tea-hangover,shochu-hangover,yellow-eyes-after-drinking,metallic-taste-after-drinking,how-to-get-rid-of-alcohol-breath,damp-drinking,drinking-two-days-in-a-row,all-inclusive-resort-drinking,drinking-while-camping,jet-lag-and-alcohol,parenting-with-a-hangover,21st-birthday-hangover-kit,baijiu-hangover,alcohol-and-dreams,atenolol-and-alcohol,beer-belly,best-liquor-for-no-hangover,best-whiskey-for-no-hangover,celebrex-and-alcohol,chantix-and-alcohol,clonidine-and-alcohol,dexamethasone-and-alcohol,diclofenac-and-alcohol,drinking-after-tattoo,dry-january,fioricet-and-alcohol,hydrocodone-and-alcohol,is-moderate-drinking-healthy,is-red-wine-good-for-you,januvia-and-alcohol,lyrica-and-alcohol,mardi-gras-survival,prazosin-and-alcohol,promethazine-and-alcohol,supplements-and-alcohol,tailgate-drinking-guide,tizanidine-and-alcohol,trulicity-and-alcohol,wine-tasting-hangover,dhm-dosage-guide-2025,emergency-hangover-protocol-2025,hangover-supplements-complete-guide-what-actually-works-2025')
  .split(',').map((s) => s.trim()).filter(Boolean);

// Strict-safety do-not-combine pages must not carry supplement links:
// these slugs skip ONLY the ">=1 affiliate CTA" assertion.
const AFFILIATE_EXEMPT = new Set(['xanax-and-alcohol', 'eliquis-and-alcohol', 'blackout-drunk', 'kava-and-alcohol', 'ativan-and-alcohol', 'seroquel-and-alcohol', 'muscle-relaxers-and-alcohol', 'klonopin-and-alcohol', 'oxycodone-and-alcohol', 'chest-pain-after-drinking', 'lithium-and-alcohol', 'vomiting-blood-after-drinking', 'black-stool-after-drinking', 'liver-pain-after-drinking', 'methotrexate-and-alcohol', 'abilify-and-alcohol', 'keppra-and-alcohol', 'alcohol-and-depression', 'severe-hangover-symptoms', 'topiramate-and-alcohol', 'valium-and-alcohol', 'anxiety-medication-and-alcohol', 'baclofen-and-alcohol', 'sleep-aids-and-alcohol', 'is-drinking-every-day-bad', 'olanzapine-and-alcohol', 'latuda-and-alcohol', 'warfarin-and-alcohol', 'xarelto-and-alcohol', 'plavix-and-alcohol', 'tramadol-and-alcohol', 'depakote-and-alcohol', 'breath-smells-like-alcohol-without-drinking', 'ambien-and-alcohol', 'shortness-of-breath-after-drinking', 'left-side-pain-after-drinking', 'st-johns-wort-and-alcohol', 'swollen-lymph-nodes-after-drinking', 'yellow-eyes-after-drinking', 'risperidone-and-alcohol', 'vraylar-and-alcohol', 'hydrocodone-and-alcohol', 'fioricet-and-alcohol']);

// Unambiguous medical OVERCLAIMS that must never appear (health-content policy).
// Deliberately tight so honest discussion ("you can't truly cure a hangover")
// does NOT trip it — only guarantees / absolutes do.
const OVERCLAIMS = [
  // "guaranteed to prevent/cure a hangover" — but NOT honest hedges like
  // "the only guaranteed WAY to prevent…" or "not a guaranteed FIX".
  /guaranteed\s+(to\s+)?(prevent|cure|stop|avoid|eliminate|beat)\s+(a\s+|your\s+|the\s+|all\s+)?hangover/i,
  /guaranteed\s+hangover[-\s]?free/i,
  /100\s*%\s*(prevent|effective|proven|cure)/i,
  /\beliminates?\s+(your\s+)?hangovers?\b/i,
  /\bmiracle\s+(cure|hangover|remedy|pill)\b/i,
  /\bproven\s+to\s+(cure|prevent)\s+(all\s+)?hangovers?\b/i,
  /\bcompletely\s+prevents?\s+hangovers?\b/i,
];

function readJSON(p) { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; }

// Overclaim policy applies to EVERY post, not just the listed slugs (older posts
// predate the full gate and can't all meet its depth/CTA rules yet).
test('health-content compliance: no overclaiming language in ANY post', () => {
  const offenders = readdirSync(POSTS).filter((f) => f.endsWith('.json')).filter((f) => {
    const p = readJSON(join(POSTS, f));
    const c = `${p.content || ''} ${p.title || ''} ${p.metaDescription || ''}`;
    return OVERCLAIMS.some((re) => re.test(c));
  });
  expect(offenders, 'posts with overclaim phrases').toEqual([]);
});

// Badge claims are false or unverifiable for this site (we read labels against
// published research; there is no lab). Banned in every SERP-visible field sitewide.
// tests/money-pages.spec.js bans the same set on the money pages.
const BADGE_CLAIMS = [
  /\bscience[- ]backed\b/i,
  /\bclinically[- ]proven\b/i,
  /\blab[- ]tested\b/i,
  /\bindependent(ly)?[- ]test(ed|ing)\b/i,
  /\b\d[\d,]*\+?\s+brands\s+tested\b/i,
  /\b\d[\d,]*\+?\s+(customer\s+|amazon\s+|user\s+)?reviews\s+analy[sz]ed\b/i,
];

test('trust: no badge claims in any post or index title / meta / excerpt', () => {
  const offenders = [];
  const check = (where, rec) => {
    for (const k of ['title', 'metaDescription', 'excerpt', 'description']) {
      const v = rec[k];
      if (typeof v === 'string' && BADGE_CLAIMS.some((re) => re.test(v))) offenders.push(`${where} [${k}]: ${v.slice(0, 90)}`);
    }
  };
  for (const f of readdirSync(POSTS).filter((f) => f.endsWith('.json'))) check(f, readJSON(join(POSTS, f)));
  for (const e of readJSON(INDEX) || []) check(`index:${e.slug}`, e);
  expect(offenders, 'badge claims in SERP-visible fields').toEqual([]);
});

// A bare efficacy number ("70% reduction", "cuts X by 60%", "3x faster") in a
// SERP-visible field must say where it comes from in the same sentence.
// ABV / BAC / purity / "100% agave" numbers are not efficacy claims and pass.
const EFFICACY_PCT = /\d+(\.\d+)?\s*%\s*(symptom\s+)?(reduction|less|fewer|faster|better|improvement|more effective|effective(ness)?|success|higher|lower)\b|\b(reduc|cut|lower|improv|boost|decreas|increas|restor|speed)\w*\b[^.%]{0,40}?\bby\s+(up\s+to\s+|about\s+)?\d+(\.\d+)?\s*%|\b\d+(\.\d+)?\s*x\s+(faster|better|more|stronger|higher)\b/i;
const EFFICACY_QUALIFIER = /\b(stud(y|ies)|trial|rats?|mice|animal|small)\b/i;

test('trust: no unsourced efficacy percentages in any post or index title / meta / excerpt', () => {
  const offenders = [];
  const check = (where, rec) => {
    for (const k of ['title', 'metaDescription', 'excerpt', 'description', 'quickAnswer']) {
      const v = rec[k];
      if (typeof v !== 'string') continue;
      for (const sentence of v.split(/(?<=[.!?])\s+/)) {
        if (EFFICACY_PCT.test(sentence) && !EFFICACY_QUALIFIER.test(sentence)) offenders.push(`${where} [${k}]: ${sentence.slice(0, 90)}`);
      }
    }
  };
  for (const f of readdirSync(POSTS).filter((f) => f.endsWith('.json'))) check(f, readJSON(join(POSTS, f)));
  for (const e of readJSON(INDEX) || []) check(`index:${e.slug}`, e);
  expect(offenders, 'efficacy percentages without a named source in SERP-visible fields').toEqual([]);
});

// Owner ban (2026-11-27): the reusable hedge "animal research is promising and the
// human evidence is thin" became a sitewide tic. Hedge with the actual evidence instead.
const HEDGE_FORMULA = [
  /evidence (is|are) thin/i,
  /\b(animal|lab|rodent) (research|studies|data|work) (is|are|look|looks) (promising|encouraging)/i,
  /research is encouraging/i,
];

test('trust: no reusable hedge formula in any post, index entry or page', () => {
  const offenders = [];
  const check = (where, text) => { for (const re of HEDGE_FORMULA) if (re.test(text)) offenders.push(`${where}: ${re.source}`); };
  for (const f of readdirSync(POSTS).filter((f) => f.endsWith('.json'))) {
    const p = readJSON(join(POSTS, f));
    check(f, [p.content, p.title, p.metaDescription, p.excerpt, p.quickAnswer, ...(p.faq || []).map((q) => `${q.question} ${q.answer}`)].join(' '));
  }
  for (const e of readJSON(INDEX) || []) check(`index:${e.slug}`, `${e.title} ${e.excerpt} ${e.metaDescription || ''}`);
  const PAGES = join(ROOT, 'src/pages');
  for (const f of readdirSync(PAGES).filter((f) => f.endsWith('.jsx'))) check(`page:${f}`, readFileSync(join(PAGES, f), 'utf8').replace(/\s+/g, ' '));
  for (const f of ['index.html', 'scripts/prerender-main-pages.js']) check(f, readFileSync(join(ROOT, f), 'utf8').replace(/\s+/g, ' '));
  expect(offenders, 'hedge-formula phrases').toEqual([]);
});

for (const slug of NEW_CONTENT) {
  test.describe(`content quality — ${slug}`, () => {
    const post = readJSON(join(POSTS, `${slug}.json`));

    test('post JSON exists, valid, registered once in the metadata index', () => {
      expect(post, `${slug}.json must exist and be valid JSON`).toBeTruthy();
      const idx = readJSON(INDEX) || [];
      expect(idx.filter((e) => e.slug === slug).length, `index must contain ${slug} exactly once`).toBe(1);
    });

    test('SEO: title (<=70), meta description (50-165, keyword), matching slug', () => {
      test.skip(!post, 'post missing');
      expect(post.title?.length, 'title present').toBeGreaterThan(10);
      expect(post.title.length, 'title <= 70 chars').toBeLessThanOrEqual(70);
      expect(post.metaDescription?.length, 'meta present').toBeGreaterThan(50);
      expect(post.metaDescription.length, 'meta <= 165 chars').toBeLessThanOrEqual(165);
      expect(post.slug).toBe(slug);
    });

    test('depth + structure: >=2000 words, >=4 H2 sections', () => {
      test.skip(!post, 'post missing');
      const c = post.content || '';
      expect(c.split(/\s+/).filter(Boolean).length, 'body >= 2000 words (not thin)').toBeGreaterThanOrEqual(2000);
      expect((c.match(/^##\s/gm) || []).length, '>= 4 H2 sections').toBeGreaterThanOrEqual(4);
    });

    test('FAQPage schema: >=5 well-formed faq items', () => {
      test.skip(!post, 'post missing');
      expect(Array.isArray(post.faq), 'faq is an array').toBe(true);
      expect(post.faq.length, '>= 5 FAQ items').toBeGreaterThanOrEqual(5);
      for (const f of post.faq) expect(!!(f.question && f.answer), 'each faq has question+answer').toBe(true);
    });

    test('funnels to money: >=1 affiliate CTA + >=2 internal links', () => {
      test.skip(!post, 'post missing');
      const c = post.content || '';
      if (!AFFILIATE_EXEMPT.has(slug)) {
        expect(/amzn\.to\/|amazon\.[a-z.]+\/dp\//i.test(c), 'has >=1 affiliate CTA (amzn.to or amazon.com/dp)').toBe(true);
      }
      const internal = (c.match(/\]\(\/(reviews|guide|compare|research|dhm-dosage-calculator|never-hungover)[^)]*\)/g) || []).length;
      expect(internal, '>= 2 internal links to money pages / posts').toBeGreaterThanOrEqual(2);
    });

    test('health-content compliance: no overclaiming language', () => {
      test.skip(!post, 'post missing');
      const c = `${post.content || ''} ${post.title || ''} ${post.metaDescription || ''}`;
      const hits = OVERCLAIMS.filter((re) => re.test(c)).map((re) => re.source);
      expect(hits, `overclaim phrase(s) present: ${hits.join(' | ')}`).toEqual([]);
    });

    test('affiliate links: rel="nofollow sponsored" + amazon product links carry the tag', async ({ page }) => {
      test.skip(!post, 'post missing');
      await page.goto(`/never-hungover/${slug}?exp_site-modern-v1=modern`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const links = page.locator('main a[href*="amazon."], main a[href*="amzn.to"]');
      const n = await links.count();
      test.skip(n === 0, 'no affiliate links on this post');
      for (let i = 0; i < n; i++) {
        const a = links.nth(i);
        const rel = ((await a.getAttribute('rel')) || '').toLowerCase();
        const href = (await a.getAttribute('href')) || '';
        expect(rel, `affiliate link #${i} (${href}) must be rel="nofollow"`).toContain('nofollow');
        expect(rel, `affiliate link #${i} (${href}) must be rel="sponsored"`).toContain('sponsored');
        // Raw amazon.com product links must carry the Associates tag (attribution).
        if (/amazon\.[a-z.]+\/dp\//i.test(href)) {
          expect(href, `amazon product link #${i} must carry tag=dhmguide-20`).toContain('tag=dhmguide-20');
        }
      }
    });

    test('renders at its route: single h1, JSON-LD, no console errors', async ({ page }) => {
      const errs = [];
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) errs.push(m.text()); });
      const resp = await page.goto(`/never-hungover/${slug}?exp_site-modern-v1=modern`, { waitUntil: 'domcontentloaded' }).catch(() => null);
      expect(resp, 'route responds').toBeTruthy();
      await page.waitForTimeout(1500);
      await expect(page.locator('main h1')).toHaveCount(1);
      expect(await page.locator('script[type="application/ld+json"]').count(), 'JSON-LD present').toBeGreaterThan(0);
      expect(errs, `console errors:\n${errs.join('\n')}`).toEqual([]);
    });
  });
}
