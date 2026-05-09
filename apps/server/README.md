# Race Server

This app fetches eBird trip report data and serves the compiled race datasets.

It writes:

- `checklists.json`
- `user.json`
- `info.json`

It serves:

- `GET /`
- `GET /user`
- `GET /checklist`
- `GET /info`
- `GET /log`
- `GET /fetch` (redirects to `/`)
- `GET /fetch-start`

## Install

```bash
npm install
```

Or from the repository root:

```bash
npm install --prefix apps/server
```

## Run locally

```bash
npm start
```

Or from the repository root:

```bash
npm run server:dev
```

The server listens on port `8081`.

## Fetch trip report data

Manual fetch:

```bash
npm run fetch
```

From the repository root:

```bash
npm run server:fetch
```

Archive the current live data into a commit-friendly snapshot:

```bash
npm run archive -- 2026-final
```

Or from the repository root:

```bash
npm run server:archive -- 2026-final
```

Automatic fetch with PM2:

```bash
npm run pm2:fetch
```

This starts a persistent scheduler process under PM2 that runs the fetch immediately and then every 15 minutes.

## Validate

```bash
npm run check
```

From the repository root:

```bash
npm run server:check
```

## Deploy on the Google server

Typical update flow on the instance:

```bash
cd /path/to/johnstottbirdingday
git fetch origin
git checkout 2026
git pull --ff-only origin 2026
npm ci --prefix apps/server
pm2 restart johnstottbirdingday
pm2 restart johnstottbirdingday-fetch
```

Initial PM2 start:

```bash
npm run server:pm2:start
npm run server:pm2:fetch
```

## Notes

- Only rows for the current year are imported.
- Fetch logs are appended to `log.txt`.
- Output JSON files are written inside `apps/server/`.
- `checklists.json`, `user.json`, `info.json`, and `log.txt` are live runtime files and should stay untracked.
- Use `apps/server/archive/<label>/` for yearly or final snapshots that you do want to commit.
