# Frontend Social App (React + TypeScript + Vite)

This is the **frontend** for your app. I only changed **design/cosmetics** (layout, spacing, typography, colors), not the app's behavior.

## What I changed (design only)

- Added a small global design system using **styled-components**:
  - `src/styles/theme.ts` (colors, spacing, radius, shadows)
  - `src/styles/GlobalStyle.ts` (clean defaults for typography, buttons, inputs, and shared layout classes)
  - `src/styles/styled.d.ts` (TypeScript typing for the theme)
- Updated the login/signup layout to a centered "card" style (simple, modern, mobile friendly).
- Updated the top navigation bar to a minimal sticky header.
- Removed the broken background image reference from the feed container.
- Styled the existing classNames used by Feed/Wall (like `.feed-container`, `.post-card`, `.pagination`) **without changing component logic**.

## Prerequisites

1. **Node.js** installed (LTS recommended).
2. Backend running locally on **http://localhost:8080** (this frontend currently points there).

## Run the frontend (terminal commands)

Open a terminal in the project folder (the same folder as `package.json`). Then:

### 1) Install dependencies

```bash
npm install
```

### 2) Start the development server

```bash
npm run dev
```

Vite will print a URL (usually `http://localhost:5173`). Open that in your browser.

### 3) Optional: build for production

```bash
npm run build
```

### 4) Optional: preview the production build

```bash
npm run preview
```

## Running in IntelliJ IDEA (simple path)

1. **Open** the project folder in IntelliJ IDEA.
2. Open the **Terminal** tab inside IntelliJ.
3. Run:

```bash
npm install
npm run dev
```

That’s it — you’ll run it the same way as in a normal terminal.

## Troubleshooting

- **Blank page / API calls fail**: confirm the backend is running at `http://localhost:8080`.
- **Port already in use**: stop the other process or change the port Vite uses:

```bash
npm run dev -- --port 5174
```

- **Fresh install issues**: delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```
