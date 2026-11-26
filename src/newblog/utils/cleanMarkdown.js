// Defensive cleanup of authoring residue in post markdown, shared by the live
// renderer (NewBlogPost.jsx) and the crawler prerender script. Without it,
// react-markdown prints HTML comments and `{#anchor}` heading suffixes as
// visible text (and the suffix leaks into TOC labels).
// Inline-comparison-table comment markers are kept: the renderer consumes them.
export const cleanMarkdown = (md = '') =>
  md
    .replace(/\\n/g, '\n')
    .replace(/<!--(?!\s*inline-comparison-table:)[\s\S]*?-->/g, '')
    .replace(/^(#{1,6}[ \t].*?)[ \t]*\{#[\w-]+\}[ \t]*$/gm, '$1');
