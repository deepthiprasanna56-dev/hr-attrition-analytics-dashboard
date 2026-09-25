# PeoplePulse — HR Attrition Analytics Dashboard

A responsive HR dashboard built with React, Vite, and Tailwind CSS. PeoplePulse helps HR teams explore employee data, understand attrition patterns, and run an illustrative retention-risk assessment.

## Features

- Overview metrics for headcount, active employees, departures, attrition rate, and average salary
- Department headcount breakdown, employee movement chart, recent employee directory, and activity feed
- Employee directory with search, department filter, sorting, pagination, employee IDs, profile details, and CSV export
- Analytics for department, age group, job role, salary range, tenure, and job satisfaction
- Risk assessment form with a demo Low / Medium / High percentage result
- Sign-in UI with email/password validation, remember-me option, and forgot-password flow
- Responsive layout, mobile sidebar, dark appearance, modals, and toast feedback
- Demo account and employee data; no backend or real prediction service is connected

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Deploy

### Vercel

Import the GitHub repository in Vercel. Use the Vite preset, `npm run build` as the build command, and `dist` as the output directory.

### Netlify

Import the repository in Netlify. Set the build command to `npm run build` and the publish directory to `dist`.

## Demo access

Open the profile menu and choose **Sign out** to open the sign-in UI. The demo accepts any valid email and a password of at least six characters. Authentication is client-side only.

## Data and security

This is a frontend assignment demo. Employee records and assessment logic are mock data held in the client. Authentication, persistence, and predictive modelling require a backend before production use.

## UI component setup

This project uses React with JavaScript and Vite. Tailwind CSS v4 is configured with the Vite plugin. Reusable UI components live in `src/components/ui`; global styles start in `src/index.css`, and dashboard-specific styles are in `src/App.css`. Keeping shared UI in `components/ui` gives generated and hand-written components a predictable import location and makes them easy to reuse across pages.

The provided interactive synapse background is adapted as `src/components/ui/interactive-synapse-network.jsx`. It uses the browser canvas API and React hooks, so no animation library or image assets are required. Its palette and intensity are tuned for the dashboard, and it honors reduced-motion preferences.

shadcn/ui JavaScript support is configured in `components.json` (`tsx: false`), with `jsconfig.json` and Vite configured for the `@/` source alias. To add a shadcn component, run:

```bash
npx shadcn@latest add button
```

If you specifically need TypeScript, install it and migrate the JSX files to TSX with type annotations before changing `tsx` to `true` in `components.json`:

```bash
npm install -D typescript
```

Then follow the [shadcn Vite existing-project setup](https://ui.shadcn.com/docs/installation/vite) for TypeScript configuration. The current project already has Tailwind configured, so the Tailwind installation step is not needed. See the [shadcn JavaScript guide](https://ui.shadcn.com/docs/javascript) for the JavaScript mode used here.
