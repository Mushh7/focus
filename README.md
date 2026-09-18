# Focus Dashboard

A student task dashboard with a built-in Pomodoro focus timer, built from the design
reference in [`design/dashboard-reference.png`](design/dashboard-reference.png).

The left column groups tasks into **Today**, **Upcoming** and **Later** tinted cards with
priority pills and inline actions. The right column is a focus panel: a circular progress
ring, a 25/50/90/custom duration picker, Focus / Break / Stats tabs and a quote card.

All styling is hand-written plain CSS — no Tailwind, no component framework.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- Plain CSS with design tokens in custom properties (`src/styles/tokens.css`)
- [Inter](https://rsms.me/inter/) self-hosted through `@fontsource-variable/inter`, so the
  app renders identically offline

## Run it locally

```bash
npm install
npm run dev
```

The dev server is pinned to an uncommon port, so the app is at
**http://127.0.0.1:43137**.

Other scripts:

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server with hot reload on port 43137      |
| `npm run build`   | Type-check with `tsc -b` and build to `dist/` |
| `npm run preview` | Serve the production build on port 43137      |
| `npm run lint`    | Lint with oxlint                              |

## What works

- **Tasks** — check tasks off, rename one inline with the pencil action, move it between
  lists or delete it from the `…` menu, and add a new task from the **Add Task** button
  (title, list, priority and an optional due time).
- **Empty states** — clear out a list and the section shows a dashed empty card with a
  shortcut back to the composer.
- **Focus timer** — start, pause, resume and reset a wall-clock-accurate countdown. The
  ring fills as the session progresses. Click the big time to type a session length from
  1 to 180 minutes; Enter or blur saves it, Escape cancels.
- **Scratchpad** — park a distracting thought mid-session without touching the timer.
  Enter saves, each thought has its own delete button, and the list caps its height and
  scrolls instead of stretching the panel.
- **Tabs** — Focus and Break switch the timer's mode and default length; Stats shows sessions,
  minutes focused, tasks checked off and a seven-day bar chart.
- **Responsive** — the two-column desktop grid collapses to a single column at 900px,
  with tighter spacing and a smaller ring below 560px.
- **Accessible basics** — real buttons, inputs and labels, a restyled native checkbox,
  `aria-selected` tabs, a labelled duration editor, visible focus rings and
  `prefers-reduced-motion` support.

## Project structure

```
src/
├── App.tsx                 # Task state, the two-column shell
├── components/             # Greeting, task sections/rows, focus card, timer, stats
├── data/dashboard.ts       # Seed tasks, sections, quotes
├── hooks/                  # useCountdown (wall-clock timer), useDismissable (popovers)
├── lib/format.ts           # Date, clock and due-label formatting
└── styles/
    ├── index.css           # Entry point: imports everything in order
    ├── tokens.css          # Colour, type, space, radius, shadow, motion tokens
    ├── reset.css           # Small reset + focus-visible defaults
    ├── base.css            # Document typography and shared text roles
    ├── layout.css          # App shell, two-column grid, breakpoints
    └── components/         # One stylesheet per UI piece (card, pill, timer, …)
```

### CSS conventions

- Every colour, size, radius, shadow and duration lives in `tokens.css`; component
  stylesheets only reference `var(--token)`.
- Class names are BEM-ish: `.task-row`, `.task-row__title`, `.task-row--done`.
- Variants that repeat (section tints, priority pills) set local custom properties such
  as `--section-bg` or `--pill-fg`, so a single shared rule handles every colourway.
- Breakpoints re-declare tokens (`--ring-size`, `--text-timer`) instead of overriding
  individual component rules.
