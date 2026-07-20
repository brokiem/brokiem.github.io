# brokiem.github.io — modern rebuild

A performance-focused rewrite of the portfolio using SolidJS, Vite, and structured plain CSS.

## Commands

- `pnpm dev` — start the local development server
- `pnpm check` — run strict TypeScript checks
- `pnpm build` — type-check and create the production build
- `pnpm preview` — preview the production build

## Architecture

- `src/components` contains focused UI and feature components.
- `src/data` owns the live Lanyard connection and derived presence model.
- `src/lib` contains framework-independent helpers.
- `src/styles` is plain CSS split by tokens, foundations, features, and responsive behavior.

CSS drives lifecycle animation, ripples, and simple transitions. A small local spring controller is reserved for pointer-dependent interactions. Expensive large-area blur animation has been replaced with layered gradients, cached geometry, and compositor-friendly transforms/opacity.

## Technology decisions

- CSS keyframes drive ripple and lifecycle animation, leaving JavaScript responsible only for interaction state and pointer-dependent geometry.
- Route components are imported eagerly so switching to the projects page never waits on a second JavaScript request.
- The Lanyard client is a small typed module with stale-response guards, visibility-aware reconnects, and snapshot recovery.
- Pretext was evaluated for the variable-font hero. It is intentionally not included: the heading already exists in the DOM, and direct CSS font-axis updates avoid adding a text-measurement runtime that cannot model the standalone variation axes used here.
