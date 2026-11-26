/**
 * Editorial notes for /reviews and /compare, one entry per product in
 * topProducts.json (keyed by id).
 *
 * Every number in this copy is read from topProducts.json through the helpers
 * below, never typed by hand, so a price refresh in the JSON updates the prose
 * too. The comparative words ("the fewest", "the cheapest bottle") are still
 * editorial: re-read them when the data changes.
 *
 * Writing rules: the owner's writing standard (plain verdicts, specifics over
 * adjectives, limitations in the same breath, no invented numbers).
 */
import topProducts from './topProducts.json'

export const PRODUCTS_BY_ID = Object.fromEntries(topProducts.map((p) => [p.id, p]))

/** DHM per serving in mg, read from the "1000mg" style field. */
export const doseMg = (p) => parseInt(String(p?.dhm ?? '').replace(/[^\d]/g, ''), 10) || 0

/** "1,000 mg" */
export const doseLabel = (p) => `${doseMg(p).toLocaleString('en-US')} mg`

/** Price per serving as a number. */
export const servingPrice = (p) => parseFloat(String(p?.pricePerServing ?? '').replace(/[^\d.]/g, '')) || 0

/** What a 1,000 mg dose of DHM costs with this product, in dollars. */
export const costPer1000 = (p) => {
  const mg = doseMg(p)
  return mg ? servingPrice(p) / (mg / 1000) : Infinity
}

export const usd = (n) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : '—')

/** "4.3 on Amazon (359 ratings)" */
export const ratingLabel = (p) =>
  `${Number(p.rating).toFixed(1)} on Amazon (${Number(p.reviews).toLocaleString('en-US')} ratings)`

/** "eight" for small counts, digits otherwise. */
export const numberWord = (x) =>
  ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][x] ?? String(x)

const P = PRODUCTS_BY_ID
const n = (x) => Number(x).toLocaleString('en-US')

/**
 * short   name used in the /compare picker and in running prose
 * suits   one clause: who the product is for
 * verdict the case for and against, with numbers
 * skip    who should buy something else, and what
 */
export const NOTES = {
  1: {
    short: 'No Days Wasted',
    suits: 'One product for a night out, with the usual extras in the same serving',
    verdict: (p) =>
      `It is our editor’s pick because one serving holds a full ${doseLabel(p)} of DHM, 200 mg of L-cysteine and the other common add-ins, so you take one product instead of several. Nobody has shown that the add-ins make DHM work better, and you pay for them: ${p.pricePerServing} a serving, against ${P[2].pricePerServing} for the same dose of DHM from Double Wood.`,
    skip: (p) =>
      `Skip it if you drink often. ${p.servings} servings for ${p.price} goes quickly, and Double Wood gives you ${P[2].servings} for ${P[2].price}.`,
  },
  2: {
    short: 'Double Wood',
    suits: 'Plain DHM at a full dose, from a brand with a long Amazon record',
    verdict: (p) =>
      `The same ${doseLabel(p)} of DHM as No Days Wasted for ${p.pricePerServing} a serving, without the herbal add-ins. Of the two cheap 1,000 mg products it has the longer track record: ${n(p.reviews)} Amazon ratings averaging ${Number(p.rating).toFixed(1)}, against ${n(P[4].reviews)} for NusaPure.`,
    skip: () =>
      `Skip it if you want the lowest cost per dose. NusaPure is ${P[4].pricePerServing} for the same ${doseLabel(P[4])}.`,
  },
  3: {
    short: 'Toniiq Ease',
    suits: 'A lower dose of DHM taken with reishi and milk thistle',
    verdict: (p) =>
      `${doseLabel(p)} of DHM a serving, with reishi mushroom and milk thistle, and three capsules to a serving. The ${p.pricePerServing} price looks low until you scale it up: a 1,000 mg dose of DHM from Toniiq costs ${usd(costPer1000(p))}, against ${usd(costPer1000(P[1]))} from No Days Wasted.`,
    skip: () =>
      'Skip it if DHM is the only thing you want. Much of what you pay for here is the reishi and milk thistle.',
  },
  4: {
    short: 'NusaPure',
    suits: 'The lowest cost per milligram of DHM',
    verdict: (p) =>
      `${p.pricePerServing} for a ${doseLabel(p)} serving, with ${p.servings} servings in the bottle. Nothing else here gives you DHM for less per milligram. The catch is history: ${n(p.reviews)} Amazon ratings, the fewest of the eight, so there is less buyer experience to go on.`,
    skip: () =>
      `Skip it if you would pay a little more for a longer record. Double Wood is ${P[2].pricePerServing} a serving with ${n(P[2].reviews)} ratings.`,
  },
  5: {
    short: 'Cheers Restore',
    suits: 'A well-known combination formula, if the price does not bother you',
    verdict: (p) =>
      `The formula is close to No Days Wasted’s: DHM with L-cysteine, prickly pear and B vitamins, plus ginger. It has more Amazon ratings than anything else here (${n(p.reviews)}) and the lowest average, ${Number(p.rating).toFixed(1)}. At ${p.pricePerServing} a serving it is the most expensive of the four 1,000 mg products.`,
    skip: () =>
      `Skip it if you like the formula but not the price. No Days Wasted has much the same add-ins for ${P[1].pricePerServing} a serving.`,
  },
  6: {
    short: 'Flyby',
    suits: 'Trying DHM once before you commit to a full bottle',
    verdict: (p) =>
      `A ${p.servings}-serving pack for ${p.price}, which makes it a cheap way to find out whether DHM does anything for you. As a regular buy it costs the most here: ${doseLabel(p)} of DHM for ${p.pricePerServing}, or ${usd(costPer1000(p))} for a 1,000 mg dose. The formula adds milk thistle, B vitamins, amino acids, vitamin C and electrolytes.`,
    skip: () =>
      `Skip it if you already know DHM suits you. NusaPure gives you ${doseLabel(P[4])} for ${P[4].pricePerServing}.`,
  },
  9: {
    short: 'Fuller Health',
    suits: 'People set on this particular formula. On value, the 1,000 mg products beat it',
    verdict: (p) =>
      `${doseLabel(p)} of DHM a serving for ${p.pricePerServing}, which is ${usd(costPer1000(p))} per 1,000 mg. The only other component listed is "GABA support", with no ingredient or amount named, so it is hard to say what the extra money buys. At ${p.price} it is the most expensive bottle on the list, and the only one here without free shipping.`,
    skip: () =>
      `Skip it if you are buying on value. Double Wood gives you more DHM per serving for ${P[2].pricePerServing}.`,
  },
  10: {
    short: 'DHM Depot',
    suits: 'A small dose of plain DHM, from the cheapest bottle here',
    verdict: (p) =>
      `The highest Amazon average on the list, ${Number(p.rating).toFixed(1)} from ${n(p.reviews)} ratings, and the cheapest bottle at ${p.price}. It is sold under the Double Wood Supplements name. The dose is the catch: ${doseLabel(p)} a serving, so a 1,000 mg dose costs ${usd(costPer1000(p))}, against ${P[2].pricePerServing} for Double Wood’s own 1,000 mg product.`,
    skip: () => 'Skip it if you want a full 1,000 mg in a single serving. Double Wood sells that for less per milligram.',
  },
}

/** Name to show in tight spaces (the /compare picker, prose). */
export const shortName = (p) => NOTES[p.id]?.short ?? p.name
