# Madison Events

Event feed and calendar for Madison, WI: Camp Randall, the Kohl Center, the UW
Field House, the Alliant Energy Center (the Coliseum, the Arena), the Overture
Center (Overture Hall and the Capitol Theater, one row — Ticketmaster lists
both under the Capitol's name), the Sylvee, the Orpheum, Breese
Stevens Field and the music rooms (the Barrymore, the Majestic, the High Noon
Saloon) — with the home teams' seasons (Badgers football, basketball and
hockey, Forward Madison FC, and the Milwaukee clubs Madison follows: Packers,
Brewers, Bucks) in a Teams view.

Live at **https://madison.here.events/** once the domain is wired (GitHub
Pages, built by the Actions workflow once a day at noon Central).

The fourth city on the lqa-events codebase, after Everett and Chicago:
everything that makes this Madison's is `site/city.js` (every team, venue,
type, default, share-code registry and string), `site/index.html`,
`scripts/fetch-events.mjs` (the sources), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, the manifest and icons (the city flag's
isthmus and sun, rendered from `favicon.svg`). Everything else is lqa-events'
own, byte for byte — copy from there, never edit here.

## Embed

```html
<div id="madison-events"></div>
<script src="https://madison.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Ticketmaster Discovery API** — every room by its venue id (every page):
  12 rooms, from Camp Randall to the 400-seat High Noon. There is no city
  sweep (a Madison sweep pulls in the Dells and Milwaukee). Church, parking
  and stadium-tour listings are left out (`isChurch`, the venues' `exclude`).
- **Seasons** — ESPN for the Badgers' three programs (college football, men's
  basketball, men's hockey), Forward Madison (USL League One), the Packers and
  the Bucks; MLB's stats API for the Brewers (`scripts/schedules.mjs`, shared
  with lqa). The Badgers' football Saturdays and Forward Madison's home matches
  enter the listing from those schedules (`inject`) — Ticketmaster lists only
  the next few at Camp Randall and none at Breese Stevens.

Next to add: the rooms whose shows Ticketmaster never lists (the Bur Oak,
Crucible, the Memorial Union Terrace and the Wisconsin Union Theater, the
Comedy on State club), the Madison Mallards' summer schedule at Warner Park,
and the Dane County farmers' market and festival calendar.

## Local run

```sh
cp .env.example .env   # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
