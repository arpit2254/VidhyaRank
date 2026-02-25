# CAPFinder — MHT-CET College Finder

Find colleges eligible for your MHT-CET percentile across all 2023 & 2024 CAP rounds.

## Stack
- React 18 + Vite
- PapaParse (CSV parsing, client-side)
- No backend needed — 14,459 records parsed in the browser

## Local Development

```bash
npm install
npm run dev
```
Open http://localhost:5173

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```
Follow the prompts. Vercel auto-detects Vite.

## Deploy to Netlify (free)

```bash
npm run build
```
Drag and drop the `dist/` folder to https://app.netlify.com/drop

Or connect your GitHub repo and set:
- Build command: `npm run build`
- Publish directory: `dist`

## Data
`public/data.csv` — 14,459 rows of MHT-CET cutoff data:
- Years: 2023, 2024
- CAP Rounds: 1, 2, 3
- 343+ colleges, 100+ branches
- 89 category columns (GOPENS, GOBCS, GSCS, etc.)
- 100% PDF-verified

## How filtering works
1. Filter by Year and CAP Round
2. For Home University categories (GOPENH, GOBCH, LOPENH) → filter Seat Type to HU rows
3. For all other categories → filter Seat Type = "State Level"
4. Keep rows where `category_cutoff ≤ user_percentile`
5. Deduplicate by college+branch (keep highest cutoff = most recent CAP round info)
6. Sort by cutoff descending
