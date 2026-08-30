# SkyStation Sports gateway

Deploy from this directory with Wrangler after replacing `YOUR_GITHUB_USERNAME` in `wrangler.jsonc`. Set the deployed Worker URL in `window.SKYSPORTS_API_BASE` before loading the app (for example in `index.html`). Routes: `/api/{nfl,mlb,nhl}/{scores,standings,teams}`. The Worker permits only localhost:5500 and the configured GitHub Pages origin, handles OPTIONS, and caches scores for 60 seconds, standings for 10 minutes, and teams for 24 hours.
