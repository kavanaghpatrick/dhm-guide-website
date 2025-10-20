# AGENTS.md - DHM Guide Website

## Build/Lint/Test Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview: `npm run preview`
- Verify registry: `npm run verify-registry`
- Generate registry: `npm run generate-registry`

## Code Style Guidelines
- Use pnpm (packageManager in package.json)
- React components use JSX
- Tailwind CSS for styling
- Import aliases: `@/` maps to `src/`
- Utility function `cn()` for merging Tailwind classes
- Component variants with `class-variance-authority`
- All components should use Radix UI primitives when available
- Mobile-first responsive design
- Dark mode support with `next-themes`
- ESLint rules: no unused vars (except uppercase), react-refresh warnings

## Naming Conventions
- Component files: lowercase with dashes (button.jsx)
- Component functions: PascalCase
- Utility functions: camelCase
- CSS classes: lowercase with dashes
- Tailwind class merging: always use `cn()` utility