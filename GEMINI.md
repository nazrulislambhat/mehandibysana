# Mehandi by Sana — Project Guidelines & Hardened Agent Rules

## 1. Operating Protocol & Scope Control (Zero Unsolicited Work)
- **Do ONLY What Is Asked**: Implement strictly what the user requests. Do NOT invent unsolicited features, floating docks, surprise animations, third-party style hampers, or background widgets.
- **No Unchecked Assumptions**: If a visual direction, layout, or feature behavior is ambiguous, clarify or propose options first instead of unilaterally generating heavy assets.
- **Clean Reversals**: When the user requests a revert, execute a 100% clean rollback. Leave zero orphaned assets, dead files, dangling state, or unused imports in the tree.

---

## 2. Brand Identity & Strict Copy Blacklist
- **Brand Definition**: Artisanal organic henna studio, 0.38mm hand-rolled henna cones, distilled essential oil blends, aftercare balms, and freelance bridal henna artistry.
- **Copy Blacklist (ZERO TOLERANCE)**:
  - **NEVER** use the words `"boutique"`, `"luxury boutique"`, or `"hamper"` anywhere—in UI text, button copy, image alt tags, ARIA labels, meta descriptions, or generated assets.
  - **NEVER** use the word `"Cart"` in customer-facing storefront UI. Always use **`"Bag"`** (e.g., *"Add to Bag"*, *"Shopping Bag"*, *"Your Bag"*, *"Bag (0)"*).
- **Approved Aesthetic**:
  - Grounded South Asian artisanal henna craft, warm Kashmir/Bengaluru studio heritage, minimalist luxury.
  - Primary Accent: Terracotta (`#C85A32` / `text-terracotta` / `bg-terracotta`)
  - Ground & Surface: Warm Ivory (`#FFFEE9`), Paper (`#FEFCF8`), Canvas (`#F7F4EB`)
  - Text: Primary `text-ink` (`#111827`), Secondary `text-umber` (`#6B5E55`)
  - Typography: Headings in `font-serif` (Cormorant Garamond); body in clean sans-serif

---

## 3. Storefront UI Hierarchy & Mobile Rules
- **Product Cards**:
  - Product name **must** use primary terracotta (`text-terracotta`) across all viewports.
  - Category tags **must** remain secondary and subtle so they never visually overpower or confuse product titles, especially on mobile.
  - Product Details Page (PDP) main title stays `text-ink`.
- **Mobile First & Touch Bounds**:
  - All interactive buttons, forms, and subscribe inputs must have strict boundary padding (no button overflowing its parent container).
  - Minimum touch target size: **>= 44px** on all mobile touch controls.
  - Always verify layout on both mobile (390px) and desktop (1280px) viewports.

---

## 4. Engineering & React Invariants (Hard Failures)
- **Rules of Hooks**:
  - **NEVER** place conditional early return statements (e.g., `if (hidden) return null;`) before React Hook declarations (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`).
  - All hooks must execute unconditionally in the exact same order on every render.
- **Hydration Safety**:
  - Guard all browser-only and persistent store data (e.g., cart, localStorage, window dimensions) with hydration checks (`isHydrated`) to avoid SSR mismatches.
- **Accessibility & Motion**:
  - All interactive elements require semantic HTML or explicit `aria-label`s.
  - Always respect `prefers-reduced-motion` for all transitions and animations.
  - Images must use modern WebP format, explicit aspect ratios, and priority flags for LCP images.

---

## 5. Git & Deployment Boundaries
- **Local-First Boundary**:
  - **NEVER** push to remote (`git push`) or create/open pull requests (`gh pr create`) unless explicitly instructed by the user.
  - Keep ongoing work strictly committed on local branches.
- **Branch Naming**:
  - Use conventional prefixes: `feat/<name>`, `fix/<name>`, `chore/<name>`.
- **Mandatory Verification**:
  - **Always** run `npm --prefix frontend run build` before declaring any task complete. The build must finish with **0 TypeScript and 0 Turbopack errors**.
- **Changelog**:
  - Update `CHANGELOG.md` or the user-facing `/changelog` route whenever instructed to log releases or notable improvements.
