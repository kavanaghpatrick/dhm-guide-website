# Research — Issue #293: Hero img dims + Picture.jsx adoption

## Current state

### Hero `<img>` at NewBlogPost.jsx:921
```jsx
{post.image && (
  <div className="w-full">
    <img
      src={post.image}
      alt={`${post.title} - DHM Guide`}
      className="w-full aspect-video object-cover"
      loading="eager"
    />
  </div>
)}
```
- No `width`/`height` attrs → browser cannot reserve layout box on first paint → CLS.
- `aspect-video` Tailwind class = `aspect-ratio: 16/9` (this wins via CSS), and `object-cover` crops the source to fit.
- `loading="eager"` already correct for above-fold hero.

### Picture.jsx at src/components/Picture.jsx
- Exists but is NEVER imported anywhere in `src/`.
- Logic: takes `src` (e.g. `/images/foo.png`), strips ext, emits a `<picture>` with:
  - `<source srcSet="{base}.webp" type="image/webp">`
  - `<source srcSet="{base}{originalExt}" type="image/{ext}">`
  - `<img src="{base}{originalExt}">`
- Loading: `priority=true` → `loading="eager"`, `decoding="sync"`. Else lazy + async.
- **Bug for our use case**: when `src` ends in `.webp`, `originalExt` falls through to `.png`. Result: `<img src="/images/foo.png">` — the PNG file does NOT exist on disk for our 141 `.webp` heroes. Modern browsers will pick the webp `<source>` so the user sees the right image, but the `<img>` fallback is wrong (would 404 if user disabled webp).
- **Does not accept `width`/`height` as named props**, but `...props` spread allows them through to the `<img>`.

### Image data shape across 189 posts
- `"image": "<string url>"`: 142 posts (139 webp, 2 jpg, no png)
- `"image": null`: 46 posts (Issue #38 fix)
- `"image": <object>`: 0 (was 8, fixed in Issue #38)
- All hero images live in `/public/images/`.

### Hero image dimensions (ON DISK)
- 1536x1024: 247 files (most common, 3:2 aspect)
- 1200x672, 1232x928, 1200x630, 1000x667: <30 files combined
- All rendered into a 16:9 box via `aspect-video` + `object-cover`.

### Other `<img>` in NewBlogPost.jsx
- Line 1461: related-posts thumbnails (`h-32 object-cover`, lazy). Out of scope for hero CLS fix; can adopt Picture in a follow-up.

## Key decisions

1. **Width/height attrs**: Use `1600x900` (16:9) to match the `aspect-video` rendered box. Browser applies `aspect-ratio: auto 1600 / 900` to the `<img>` if no other CSS overrides it. Tailwind `aspect-video` sets `aspect-ratio: 16/9` which is identical → no conflict, no CLS.

2. **Picture.jsx adoption strategy**: Since 99% of our hero images are already `.webp` (no PNG/JPG fallback file exists), wrapping them in a `<picture>` element that emits a phantom `.png` source is actively harmful. Two options:
   - **(A) Patch Picture.jsx** to detect `.webp` input and emit only a single `<source>` + `<img src={originalWebp}>`.
   - **(B) Skip Picture.jsx**, just add `width`/`height`/`fetchpriority="high"` to the existing `<img>`.
   - **Decision: A** — preserves the spec goal of adopting Picture.jsx, fixes the latent bug, and keeps the spec tightly scoped (~10 lines of Picture.jsx).

3. **Null image handling**: Wrapped in `{post.image && (...)}` — Picture is only rendered when `post.image` is truthy. Inside Picture, `src` is always a string. Safe.

4. **Priority/eager**: Hero is above-fold LCP candidate → pass `priority={true}` → eager loading + sync decoding + we'll also pass `fetchpriority="high"` via `...props`.

## Out of scope
- Related-post thumbnail `<img>` (line 1461) — defer to follow-up.
- Markdown content `<img>` rewriting — defer.
- New webp generation for the 2 `.jpg` images — they already render fine; Picture's logic for `.jpg → .webp` source + `.jpg` fallback is correct shape (though the `.webp` companion file may not exist; we accept the existing `.jpg` will be served via the `<img>` fallback).
