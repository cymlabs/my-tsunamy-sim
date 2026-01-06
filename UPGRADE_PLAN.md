# Deluge Premium Upgrade Blueprint

This document outlines component-level upgrades for Deluge (tsunami simulation UI with WebGPU rendering) and how to source premium implementations from high-quality open-source repositories via Repogrep.

## Component Breakdown with Targeted Upgrades

| Component | Current/Baseline | Premium Upgrade Goal | Suggested Repos |
| --- | --- | --- | --- |
| Authentication & session | None (static single-page UI) | Add OAuth2/OIDC with refreshable tokens, device-aware login, and role claims for control panels. | `nextauthjs/next-auth`, `supabase/supabase`, `clerk/javascript` |
| Routing & state | Hash-based pane switching in `app.js` | Move to SPA router with persistent URL params, lazy loading, and error boundaries. | `remix-run/react-router`, `vitejs/vite` templates, `pmndrs/jotai` for state |
| UI theming & components | Custom CSS; hand-rolled controls | Replace with design system (glassmorphism variant), accessibility-first components, keyboard navigation. | `shadcn/ui` (with Radix), `mui/material-ui`, `chakra-ui/chakra-ui` |
| Accessibility & i18n | Basic aria labels | Add focus traps, skip links, live regions for status, full i18n with locale files. | `vercel/next.js` i18n examples, `formatjs/formatjs`, `react-aria` |
| Data fetching/backend | Static demo, no API | Introduce typed API (REST + WebSocket) for simulation states, events, and reports; deployable edge functions. | `nestjs/nest`, `trpc/trpc`, `prisma/prisma`, `supabase/supabase` |
| WebGPU core | Plain JS init with manual buffers/shaders | Modularize pipelines, add capability detection, device-loss recovery, and GPU/CPU parity mode. | `google/skia` WebGPU demos, `austinEng/webgpu-samples`, `BabylonJS/Babylon.js` (engine webgpu branch) |
| Simulation physics | Particle/grid buffers; simple parameters | Upgrade to SPH + heightfield hybrid, debris rigid bodies, adaptive timestep, and tiled culling. | `pmndrs/gpu-physics`, `voxelpixel/fluidsim`, `EmbarkStudios/kajiya` (for techniques) |
| Rendering/visuals | Basic canvas overlay | Move to `three.js` or `react-three-fiber` with PBR water, caustics, volumetric spray, tone mapping. | `mrdoob/three.js`, `pmndrs/react-three-fiber`, `pmndrs/drei` |
| Post-processing | Minimal | Add bloom, motion blur, SSR, atmospheric fog; toggles in settings. | `pmndrs/postprocessing`, `BabylonJS/Babylon.js` effects layer |
| UI interactions | DOM event listeners | Use React (or Svelte) with hooks for controls, timeline, share/report; optimistic updates and loading states. | `facebook/react`, `sveltejs/kit` |
| Sharing/reporting | Clipboard + simple URL | Generate PDF/PNG snapshots with timeline stamps, upload to storage, create signed links. | `vercel/next.js` examples (PDF/OG), `eKoopmans/html2pdf`, `supabase/storage-js` |
| Offline & installs | None | Add PWA with caching, install banner, and offline static mode (CPU fallback). | `GoogleChrome/workbox`, `pwa-builder/PWABuilder` |
| Telemetry & logging | None | Structured logs + analytics, GPU capability stats, error reporting. | `Sentry`, `PostHog/posthog-js`, `Axiom` |
| Testing & QA | Minimal manual | Add Playwright E2E, Vitest/Jest unit tests, WebGPU integration harness with headless adapter mocks. | `microsoft/playwright`, `vitest-dev/vitest`, `webgpu/webgpu-test-framework` |
| DevOps & delivery | Local only | CI with lint/test/build, preview deploys, CDN assets, feature flags. | `vercel/turbo`, `pnpm/pnpm`, `github/actions` templates |

## Repogrep Queries (copy/paste into https://app.ami.dev/repogrep after loading repos)
- **Advanced WebGPU water shader with React integration:**
  - `load repo mrdoob/three.js`
  - `Show a high-performance water or ocean shader with displacement maps and normal mapping for WebGPU or WebGL2, including code and explanation.`
- **React-three-fiber PBR pipeline with postprocessing:**
  - `load repo pmndrs/react-three-fiber`
  - `Find an example that integrates drei water, bloom, and tone mapping; provide component code with hooks and performance tips.`
- **WebGPU compute particles with bind group layouts:**
  - `load repo austinEng/webgpu-samples`
  - `Surface a compute particle or fluid simulation sample; include bind group layout code for storage buffers and any device-loss handling.`
- **Auth + storage with Supabase (Next.js):**
  - `load repo supabase/supabase`
  - `Give a Next.js example that sets up OAuth login, RLS policies, and file uploads for user-generated reports.`
- **Playwright E2E for SPA navigation:**
  - `load repo microsoft/playwright`
  - `Provide an example for tabbed navigation E2E with hash/state assertions and clipboard mocking.`
- **Workbox PWA caching:**
  - `load repo GoogleChrome/workbox`
  - `Show a service worker setup that precaches static assets and handles offline fallbacks for API calls.`

## Upgrade & Integration Steps
1. **Adopt a modern stack**: Migrate UI to React (Vite + TypeScript). Build panes as routes (`/`, `/map`, `/satellite`, `/god`, `/settings`, `/share`, `/exit`) using React Router. Preserve canvas overlay for WebGPU scene.
2. **State management**: Introduce Jotai or Zustand for global simulation/control state with selectors for buttons. Mirror hash for deep links.
3. **WebGPU module**: Split into `gpu/device.ts`, `gpu/pipelines.ts`, `gpu/sim.ts`, `gpu/render.ts`, and `gpu/capabilities.ts`. Add device-loss listeners, retry, and CPU fallback path using Web Workers.
4. **Rendering**: Embed `Canvas` from `react-three-fiber` with layered passes (water surface, debris instancing, spray particles). Use drei helpers for environments and controls. Keep compute step in WebGPU feeding textures/buffers consumed by R3F custom materials.
5. **Physics**: Port SPH solver to compute shader (from sample) with grid hashing and neighbor lookup. Add debris rigid bodies using compute-based broadphase; expose parameters in settings pane.
6. **Share/Report**: Use Supabase storage for snapshots; generate PDF with html2pdf or `@react-pdf/renderer` including timeline and stats. Clipboard + share sheet fallbacks.
7. **Telemetry**: Wire Sentry/PostHog with consent toggle; log GPU caps and device-loss events.
8. **PWA**: Add Workbox-generated service worker with offline static shell and stale-while-revalidate for API; include manifest and icons.
9. **Testing**: Add Vitest for logic, Playwright for navigation/share/report, and a small WebGPU mock harness for capability detection.
10. **CI/CD**: GitHub Actions with lint/test/build, deploy to Vercel/Netlify, and upload Playwright traces.

## Example Skeleton (TypeScript + React + R3F)
```
/ src
  /gpu
    capabilities.ts   // check adapter + texture formats, expose flags
    device.ts         // request adapter/device, handle device-lost
    pipelines.ts      // create bind group/layouts for sim + render
    sim.ts            // compute passes (SPH + debris)
    render.ts         // R3F bridge materials consuming GPU buffers
  /components
    CanvasLayer.tsx   // wraps <Canvas> with controls and overlays
    PaneShell.tsx     // layout + glassmorphism theme
    Timeline.tsx      // slider + play/pause with keyboard support
    StatsGrid.tsx     // animated counters
    ShareActions.tsx  // copy link, export PDF, upload snapshot
  /state
    atoms.ts          // jotai atoms for pane, sim state, GPU caps
  /routes
    Landing.tsx
    Map.tsx
    Satellite.tsx
    God.tsx
    Settings.tsx
    Share.tsx
    Exit.tsx
  /pwa
    service-worker.ts // workbox setup
  main.tsx            // router + providers
```

## Holistic Polish Checklist
- Keyboard and screen-reader paths for all controls (focus rings, aria-live on status).
- Responsive layouts for mobile/tablet with reduced shader quality and CPU fallback.
- Graceful degradation: if WebGPU fails, show static map/metrics with mock data.
- Performance budgets: use requestAnimationFrame pacing, instancing, and culling; profile with Chrome WebGPU HUD.
- Security: CSP headers, sanitized share links, and role-based access on backend endpoints.
- Observability: structured logs, metrics dashboards, and synthetic monitors for WebGPU availability.

