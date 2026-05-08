# John Stott Birding Day

This repository contains two applications deployed from the same GitHub branch:

- `apps/web`: the public website, deployed to GitHub Pages
- `apps/server`: the race data server, running on a Google Compute Engine instance

This structure fits your workflow well:

- develop both apps locally in one repository
- push changes to GitHub once
- let GitHub Actions deploy the website from a build artifact
- update the Google server from the same repository with `git pull`

## Repository structure

```text
apps/
  server/
  web/
.github/workflows/
package.json
README.md
```

## Local development

Install dependencies separately for each app:

```bash
npm install --prefix apps/web
npm install --prefix apps/server
```

Run the website:

```bash
npm run web:dev
```

Run the server:

```bash
npm run server:dev
```

Run a manual fetch:

```bash
npm run server:fetch
```

## Frontend configuration

The frontend uses `VITE_API_BASE_URL`.

Create a local env file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Typical values:

- local frontend against local server: `VITE_API_BASE_URL=http://localhost:8081`
- deployed frontend against production API: `VITE_API_BASE_URL=https://api.johnstottbirdingday.com`

## Website deployment

The GitHub Pages deployment is handled by [build_and_deploy.yml](./.github/workflows/build_and_deploy.yml).

It now uses the GitHub Pages artifact flow:

1. build `apps/web`
2. upload the generated `apps/web/dist` as a Pages artifact
3. deploy with `actions/deploy-pages`

This does not require a separate `gh-pages` branch.

## Server deployment on Google Compute Engine

The server is not deployed by GitHub Actions. Update it directly on the instance from the same repository.

Typical update flow:

```bash
ssh <your-server>
cd /path/to/johnstottbirdingday
git fetch origin
git checkout 2026
git pull --ff-only origin 2026
npm ci --prefix apps/server
pm2 restart johnstottbirdingday
pm2 restart johnstottbirdingday-fetch
```

If the PM2 processes do not exist yet:

```bash
npm run server:pm2:start
npm run server:pm2:fetch
```

## Notes

- The website and server are intentionally separate apps because they have different runtime and deployment targets.
- They should communicate only through the API, not through shared generated files.
- See [apps/server/README.md](/Users/rafnuss/Documents/GitHub/johnstottbirdingday/apps/server/README.md) for server-specific behavior.
