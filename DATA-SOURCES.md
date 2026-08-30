# SkyStation Sports — Phase 1 data sources

Last tested: 2026-08-29. The providers are deliberately independent of the UI. All browser calls are read-only and keyless; a production GitHub Pages deployment should be validated again for CORS and may use the planned Worker proxy.

| League | Current source / endpoint | Status, cost, and documentation | Available through the app's current adapter | Limitations / fallback |
|---|---|---|---|---|
| NFL | ESPN Site API: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/{scoreboard,standings,summary}` | Undocumented public web endpoint; no key or published rate limit; free to call in testing. | Schedule, score/status, logos, record, venue, broadcast, ESPN standings, game-summary endpoint. | No usage commitment or stable contract. CORS and terms must be rechecked before publishing. Do not treat returned standings as an official NFL feed. Worker proxy / licensed feed is the fallback. |
| MLB | ESPN Site API: `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/{scoreboard,standings,summary}` | Undocumented public web endpoint; no key or published rate limit; free to call in testing. A separate MLB Stats API was probed but did not return successfully in this test environment, so it is not used. | Schedule, score/status, logos, record, venue, broadcast, ESPN standings, game-summary endpoint. | Same undocumented-source risks. The provider can later be swapped to an MLB-approved source or Worker proxy. |
| NHL | NHL public web API: `https://api-web.nhle.com/v1/{schedule/YYYY-MM-DD,standings/now,gamecenter/:id/boxscore}` | Public NHL web endpoint, not presented here as a documented developer API; no key or published rate limit. | Schedule and status, team names/logos/scores, broadcast where supplied, current standings, game box-score endpoint. | Browser testing on 2026-08-29 produced `TypeError: Failed to fetch` from the NHL endpoint, consistent with a direct-browser CORS restriction. A Cloudflare Worker proxy is required before NHL can function reliably in this browser-only architecture. |

## Data behavior

* The score adapters normalize game fields before UI rendering (`id`, `league`, `date`, `status`, teams, scores, venue, broadcast, period data).
* The UI shows **temporarily unavailable**, **unavailable**, or **no verified games** rather than generating values.
* Wild-card/playoff views are intentionally not calculated from regular standings in Phase 1: a provider must supply a reliable explicit playoff data set first.
* Details/box score endpoints are isolated and present, but the current Game Center only renders normalized summary and game-info fields. Sport-specific box-score mapping is the next Phase 1 increment after source field validation.

## Caching and attribution

The service worker caches the application shell only. It excludes all cross-origin provider responses, preventing stale scores. No provider-specific attribution requirement was established from the endpoint responses; verify source terms and required branding/attribution before publication. Cache policy for a future Worker remains deliberately undecided until provider limits and terms are confirmed.
