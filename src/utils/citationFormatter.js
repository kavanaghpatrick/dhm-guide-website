/**
 * APA-7-style citation formatter for DHM clinical studies.
 *
 * Pure function — accepts a study object, returns a citation string.
 * Usable from Node (prerender) and the browser (Research.jsx Copy-APA button).
 * No `window`, no React, no DOM dependencies.
 *
 * Author truncation: first 3 + "et al." for lists >3.
 * NOTE: This is a pragmatic deviation from strict APA-7 (20+1 rule).
 * Chosen for uniform short citations across compact UI cards;
 * DHM studies have 3-8 authors so the strict 20+1 rule never triggers anyway.
 * Citation tools (Zotero / Mendeley) accept this format.
 *
 * Optional fields (volume, issue, pages, doi) gracefully omit when absent.
 * Bracketed parts never emit empty: ", ," / "()" / " . ." never appear.
 */

export function formatAPA(study) {
  const authors = formatAuthors(study.authors);
  const year = study.year ? ` (${study.year}).` : '';
  const title = study.title ? ` ${study.title}.` : '';
  const journal = study.journal ? ` ${study.journal}` : '';
  const volPart = study.volume
    ? `, ${study.volume}${study.issue ? `(${study.issue})` : ''}`
    : '';
  const pages = study.pages ? `, ${study.pages}` : '';
  const url = study.doi
    ? ` https://doi.org/${study.doi}`
    : study.pmid
      ? ` Retrieved from https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`
      : '';
  return `${authors}${year}${title}${journal}${volPart}${pages}.${url}`
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Accepts string ("Chen, S., Zhao, X., et al.") or array (["Chen, S.", ...]).
 * Returns first 3 joined by ", " plus ", et al." when length > 3.
 * If the source already terminates with "et al.", trust it as-is.
 */
function formatAuthors(authors) {
  if (!authors) return '';
  const list = Array.isArray(authors)
    ? authors.map((s) => String(s).trim()).filter(Boolean)
    : authors.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.some((a) => /et al\.?$/i.test(a))) {
    return list.join(', ').replace(/,\s*$/, '');
  }
  if (list.length <= 3) return list.join(', ');
  return `${list.slice(0, 3).join(', ')}, et al.`;
}
