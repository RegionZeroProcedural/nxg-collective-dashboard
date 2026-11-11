# NXG Collective — Partner Dashboard

A responsive implementation of the supplied desktop and mobile mockups, using Next.js 16, React 19, TypeScript, Axios, and Lucide icons. The supplied logo is used directly; the avatar is displayed from the supplied mockup through CSS positioning.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run build       # Type-check and create the production export in out/
npm start           # Serve the production export at http://127.0.0.1:3000
npm run typecheck   # Standalone TypeScript check
npm test            # Playwright interaction and responsive tests
npm run format      # Format the source
```

The tests use an installed Google Chrome browser. Change `channel` in `playwright.config.ts` if you prefer another installed Playwright-compatible browser. The test runner starts the development server automatically when needed.

## Data and architecture

- `data/dashboard.json` contains the mock user, statistics, chart points, referrals, tier benefits, messages, teams, projects, bounties, and notifications.
- `app/api/dashboard.json/route.ts` exposes that data through a Next.js GET route. Static export generates `/api/dashboard.json`, so Axios requests work on both the development server and static hosting.
- `lib/api.ts` owns the typed Axios client and local invitation persistence. The JSON import here is type-only: dashboard content is fetched through HTTP.
- `components/dashboard.tsx` manages dashboard state, navigation, loading/retry behavior, clipboard feedback, and the mobile drawer.
- `components/dashboard-panels.tsx`, `growth-chart.tsx`, and `referral-table.tsx` contain focused, reusable dashboard sections.
- `components/dashboard-dialog.tsx` provides the forms and secondary views. Next.js loads it on demand to reduce initial JavaScript.
- `components/ui.tsx` contains shared icons, brand assets, status labels, and the accessible native dialog.
- `app/globals.css` defines the theme, desktop dashboard, and secondary views. `responsive.css` defines tablet and phone layouts. `refinements.css` documents narrow breakpoint and mockup alignment adjustments.

The desktop layout keeps a fixed sidebar and staggered two-column panels. At tablet widths, the sidebar becomes a drawer and panels follow the mobile reference order. Small phones use two statistic columns. The compact mobile table shows the three businesses featured in the mobile mockup; **View All Referrals** exposes the full searchable and filterable dataset.

## Working demo interactions

The chart switches between three and six months and shows values on hover, focus, or tap. Search, directory, referral filters/sorting, business details, tier benefits, notifications, project progress, teams, bounties, profile, settings, and messages all have working views. Copy controls use the clipboard API. Badge sharing downloads an SVG with the supplied logo or copies a website embed.

Invitations, profile edits, and notification preferences are saved in **localStorage on the current device**. Replies use **sessionStorage**. Invitation forms validate inputs and reject duplicate email addresses. No emails, messages, commissions, or external account changes are sent. These are explicitly marked demo interactions in the UI.

To connect a live backend, replace the reads in `lib/api.ts` and the local mutation helpers with authenticated Axios requests. Static export is deliberate for this mock-data demo; remove `output: "export"` and deploy a Next.js server if adding runtime POST handlers, authentication, or server-side persistence.

## Verification

Playwright covers JSON API failure/retry, chart periods, clipboard access, global search, referral filtering, invitation persistence/duplicates, badge downloads, message replies, preferences, every navigation destination, and overflow checks at 21 widths between 320 and 1920 pixels. `scripts/capture.mjs` creates local screenshots in the ignored `qa-artifacts/` directory.
