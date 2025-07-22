# The race server

This node server is used to fetch eBird tripreport data of the participant and serve three dataset for the race page: `checklists.json`, `user.json` and `info.json`.

## Compiling data with `fetchTripReport.js`

1. The user data is fetched from the google sheet page (https://docs.google.com/spreadsheets/d/1GtyqPSkGOwpwHsez6kc4KWx_n2nMu45iMPf5sJHsBXc/)
2. Get checklists list (`/tripreport-internal/v1/checklists/`), number of species (`/tripreport-internal/v1/num-species/`) and species list (`/tripreport-internal/v1/taxon-lis/`) from the tripreport ID. We use here the proxy interface from M. Gravey (http://tripreport.raphaelnussbaumer.com/).
3. Write the compiled data write it in `checklists.json`, `user.json` and `info.json`.

## Serving data with `server.js`

This node js server can be used to serve the compiled data. It serves the data under:

- https://api.johnstottbirdingday.com/user
- https://api.johnstottbirdingday.com/checklist
- https://api.johnstottbirdingday.com/info

The server can be started with `npm run start`.

Logs of the server can be found in `server.log` or https://api.johnstottbirdingday.com/fetch

## Running `fetchTripReport.js`

We can run this script with different manner:

- Manually `npm run fetch`
- Automatically every 15min with `npm run auto-fetch` (usually run during the day)
- Click on the button `fetch` on https://api.johnstottbirdingday.com/fetch
