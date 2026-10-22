// The city — every fact that makes this calendar Madison's rather than
// another town's, in one place (2026-10-11: the fourth city on lqa-events,
// after Everett and Chicago). The browser (filter.js, app.js) and the build
// (scripts/*.mjs) both read it; nothing else names a venue or a team. The
// shared files (app.js, filter.js, styles.css bar its --v-* hues,
// scripts/*.mjs bar fetch-events.mjs and sources.mjs) are lqa-events' own,
// byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Per team:
  //   re        the title match — Ticketmaster titles the Badgers' games
  //             "Wisconsin Badgers Football vs. …", "… Mens Basketball vs.",
  //             "… Hockey vs.", so each program matches its own words
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — every club here is on ESPN
  //             (the Badgers' three programs under their college leagues,
  //             Forward Madison under USL League One), so the season, the
  //             form block, news and transactions all come from there
  //             (schedules.mjs); the Brewers' season comes from MLB's stats
  //             API (first-pitch times, the standings), as lqa's Mariners
  //   inject    the club's home games enter the listing from the league
  //             schedule when the ticket feed lacks them (the Badgers'
  //             football Saturdays, Forward Madison's matches — Ticketmaster
  //             lists neither ground fully)
  //   division  (baseball) the division rivals by the abbreviations the
  //             schedule carries, for the standings line
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article; opens when the season usually starts
  // The Milwaukee clubs Madison follows (Packers, Brewers, Bucks) are Teams
  // view only — their home grounds are not Madison venues, so no games
  // enter the listing (no `inject`), as Everett's Seattle clubs.
  var MLB = function (slug) { return ['https://www.mlb.com/' + slug + '/feeds/news/rss.xml', 'MLB.com']; };
  var TEAMS = [
    { slug: 'badgers', label: 'Badgers', name: 'Wisconsin Badgers', abbr: 'WIS', re: /badgers football/i, sport: 'football', venue: 'Camp Randall Stadium', colors: ['#c5050c', '#ffffff'],
      espn: { sport: 'football', league: 'college-football', id: '275' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://uwbadgers.com/sports/football/schedule', name: 'Wisconsin Badgers Football' }, // Ticketmaster lists only the next few Saturdays
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png', schedule: 'https://uwbadgers.com/sports/football/schedule',
      club: 'Wisconsin Badgers', opens: 'late August', wiki: { title: 'Wisconsin Badgers football', teamPage: true }, // college seasons are titled "2026 Wisconsin Badgers football team", not "… season"
      news: [['https://www.buckys5thquarter.com/rss/current.xml', "Bucky's 5th Quarter"]] },
    { slug: 'badgershoops', label: 'Badgers Hoops', name: 'Wisconsin Badgers', abbr: 'WIS', re: /badgers mens basketball/i, sport: 'basketball', venue: 'Kohl Center', colors: ['#c5050c', '#ffffff'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '275' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png', schedule: 'https://uwbadgers.com/sports/mens-basketball/schedule',
      club: 'Wisconsin Badgers', opens: 'November', wiki: { title: "Wisconsin Badgers men's basketball", teamPage: true } },
    { slug: 'badgershockey', label: 'Badgers Hockey', name: 'Wisconsin Badgers', abbr: 'WIS', re: /badgers hockey/i, sport: 'hockey', venue: 'Kohl Center', colors: ['#c5050c', '#ffffff'],
      espn: { sport: 'hockey', league: 'mens-college-hockey', id: '275' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png', schedule: 'https://uwbadgers.com/sports/mens-ice-hockey/schedule',
      club: 'Wisconsin Badgers', opens: 'October', wiki: { title: "Wisconsin Badgers men's ice hockey", teamPage: true } },
    // USL League One (third tier), Breese Stevens Field, the flamingo
    { slug: 'forward', label: 'Forward', name: 'Forward Madison FC', re: /forward madison/i, sport: 'soccer', venue: 'Breese Stevens Field', colors: ['#f06ba8', '#1c2a4d'],
      espn: { sport: 'soccer', league: 'usa.usl.l1', id: '19995' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.forwardmadisonfc.com/tickets', name: 'Forward Madison FC' }, // Breese Stevens has no ticket feed
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/19995.png', schedule: 'https://www.forwardmadisonfc.com/schedule',
      club: 'Forward Madison FC', opens: 'March', wiki: { title: 'Forward Madison FC' } },
    { slug: 'packers', label: 'Packers', re: /packers/i, sport: 'football', venue: 'Lambeau Field', colors: ['#203731', '#ffb612'],
      espn: { sport: 'football', league: 'nfl', id: '9' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', schedule: 'https://www.packers.com/schedule/',
      club: 'Green Bay Packers', opens: 'September', wiki: { title: 'Green Bay Packers', startYear: true },
      news: [['https://www.packers.com/rss/news', 'Packers.com']] },
    { slug: 'brewers', label: 'Brewers', re: /brewers/i, sport: 'baseball', venue: 'American Family Field', colors: ['#12284b', '#ffc52f'],
      espn: { sport: 'baseball', league: 'mlb', id: '8' }, season: { kind: 'mlb', id: 158 }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png', schedule: 'https://www.mlb.com/brewers/schedule',
      club: 'Milwaukee Brewers', opens: 'late March', wiki: { title: 'Milwaukee Brewers' },
      division: ['CHC', 'STL', 'CIN', 'PIT'], // NL Central
      news: [MLB('brewers')] },
    { slug: 'bucks', label: 'Bucks', re: /\bbucks\b/i, sport: 'basketball', venue: 'Fiserv Forum', colors: ['#00471b', '#eee1c6'],
      espn: { sport: 'basketball', league: 'nba', id: '15' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', schedule: 'https://www.nba.com/bucks/schedule',
      club: 'Milwaukee Bucks', opens: 'late October', wiki: { title: 'Milwaukee Bucks' } },
  ];

  // The venues, one record each — the campus and downtown first by size,
  // then the music rooms. Per venue:
  //   capacity how many people the place holds
  //   area     'town' for the music rooms (the panel's second group);
  //            absent = the campus and downtown
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page). No city sweep, as Chicago
  //   alias    the other spellings the feeds use for it, folded to this name
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  var VENUES = {
    // --- Campus and downtown: the Badgers' grounds, the Alliant Energy Center, the Overture Center, the Sylvee and the Orpheum ---
    'Camp Randall Stadium': {
      capacity: 80321,
      type: 'sports',
      cssVar: '--v-randall',
      color: '#ea8686',
      url: 'https://uwbadgers.com/sports/football/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=uwbadgers.com&sz=128',
      tm: { id: 'KovZpZA17lEA', match: 'camp randall', fallbackUrl: 'https://uwbadgers.com/sports/football/schedule', exclude: /parking|stadium tour|arena tour|center tour/i },
      alias: /camp randall/i,
    },
    'Kohl Center': {
      capacity: 17287,
      type: 'sports',
      cssVar: '--v-kohl',
      color: '#86eaa3',
      url: 'https://www.kohlcenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.kohlcenter.com&sz=128',
      tm: { id: 'KovZpZAaJIFA', match: 'kohl center', fallbackUrl: 'https://www.kohlcenter.com/events', exclude: /parking|stadium tour|arena tour|center tour/i },
      alias: /kohl center/i,
    },
    'Veterans Memorial Coliseum': {
      capacity: 10231,
      type: 'concert',
      cssVar: '--v-coliseum',
      color: '#c086ea',
      url: 'https://www.alliantenergycenter.com/upcoming-events',
      icon: 'https://www.google.com/s2/favicons?domain=www.alliantenergycenter.com&sz=128',
      tm: { id: 'KovZpZAF6nvA', match: 'coliseum', fallbackUrl: 'https://www.alliantenergycenter.com/upcoming-events', exclude: /parking/i },
      alias: /veterans memorial coliseum|coliseum at alliant/i,
    },
    'UW Field House': {
      capacity: 7000,
      type: 'sports',
      cssVar: '--v-fieldhouse',
      color: '#eadd86',
      url: 'https://uwbadgers.com/sports/womens-volleyball/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=uwbadgers.com&sz=128',
      tm: { id: 'KovZpa6gre', match: 'field house', fallbackUrl: 'https://uwbadgers.com/sports/womens-volleyball/schedule' },
      alias: /uw field house|wisconsin field house/i,
    },
    'Breese Stevens Field': {
      capacity: 5000,
      type: 'sports',
      cssVar: '--v-breese',
      color: '#86d9ea',
      url: 'https://www.breesestevensfield.com/upcoming-events',
      icon: 'https://www.google.com/s2/favicons?domain=www.breesestevensfield.com&sz=128',
      tm: { id: 'KovZpZAEd1vA', match: 'breese stevens', fallbackUrl: 'https://www.breesestevensfield.com/upcoming-events' },
      alias: /breese stevens/i,
    },
    'Alliant Energy Center': {
      capacity: 5000,
      type: 'community',
      cssVar: '--v-alliant',
      color: '#ea86bc',
      url: 'https://www.alliantenergycenter.com/upcoming-events',
      icon: 'https://www.google.com/s2/favicons?domain=www.alliantenergycenter.com&sz=128',
      tm: { id: 'KovZ917ASD_', match: 'alliant energy center', fallbackUrl: 'https://www.alliantenergycenter.com/upcoming-events', exclude: /parking/i },
      alias: /arena at alliant|alliant energy center arena|exhibition hall at alliant|new holland pavilion/i,
    },
    'The Sylvee': {
      capacity: 2500,
      type: 'concert',
      cssVar: '--v-sylvee',
      color: '#9fea86',
      url: 'https://thesylvee.com/calendar/',
      icon: 'https://www.google.com/s2/favicons?domain=www.thesylvee.com&sz=128',
      tm: { id: 'KovZ917AQBC', match: 'sylvee', fallbackUrl: 'https://thesylvee.com/calendar/' },
      alias: /sylvee/i,
    },
    'Overture Center': { // Overture Hall (2,251) and the Capitol Theater (1,089): Ticketmaster lists both rooms under the Capitol's name, so they are one row here
      capacity: 2251,
      type: 'arts',
      cssVar: '--v-overture',
      color: '#8a86ea',
      url: 'https://www.overture.org/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.overture.org&sz=128',
      tm: { id: 'KovZpapW3e', match: 'overture center', fallbackUrl: 'https://www.overture.org/events/' },
      alias: /overture (?:hall|center)|capitol theat/i,
    },
    'Orpheum Theater': {
      capacity: 1700,
      type: 'concert',
      cssVar: '--v-orpheum',
      color: '#eaa786',
      url: 'https://madisonorpheum.com/calendar/',
      icon: 'https://www.google.com/s2/favicons?domain=www.madisonorpheum.com&sz=128',
      tm: { id: 'KovZpZAalItA', match: 'orpheum', fallbackUrl: 'https://madisonorpheum.com/calendar/' },
      alias: /orpheum/i,
    },
    // --- Music rooms (`area: 'town'`): the Barrymore, the Majestic and the High Noon ---
    'Barrymore Theatre': {
      area: 'town',
      capacity: 970,
      type: 'concert',
      cssVar: '--v-barrymore',
      color: '#86eac4',
      url: 'https://www.barrymorelive.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.barrymorelive.com&sz=128',
      tm: { id: 'KovZpZAaE7dA', match: 'barrymore', fallbackUrl: 'https://www.barrymorelive.com/' },
      alias: /barrymore/i,
    },
    'Majestic Theatre': {
      area: 'town',
      capacity: 600,
      type: 'concert',
      cssVar: '--v-majestic',
      color: '#e186ea',
      url: 'https://majesticmadison.com/',
      icon: 'https://www.google.com/s2/favicons?domain=majesticmadison.com&sz=128',
      tm: { id: 'KovZpZAaltvA', match: 'majestic', fallbackUrl: 'https://majesticmadison.com/' },
      alias: /majestic theat/i,
    },
    'High Noon Saloon': {
      area: 'town',
      capacity: 400,
      type: 'concert',
      cssVar: '--v-highnoon',
      color: '#d5ea86',
      url: 'https://high-noon.com/',
      icon: 'https://www.google.com/s2/favicons?domain=high-noon.com&sz=128',
      tm: { id: 'KovZpZAaE7kA', match: 'high noon', fallbackUrl: 'https://high-noon.com/' },
      alias: /high noon/i,
    },
  };

  // The usual view: every room on — nothing here lists nightly bar programs
  var DEFAULT_ON = ['Camp Randall Stadium', 'Kohl Center', 'Veterans Memorial Coliseum', 'UW Field House', 'Breese Stevens Field', 'Alliant Energy Center', 'The Sylvee', 'Overture Center', 'Orpheum Theater', 'Barrymore Theatre', 'Majestic Theatre', 'High Noon Saloon'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — arena tours to club nights' },
    { key: 'sports', label: 'Sports', title: 'Badgers football, basketball, hockey and volleyball, Forward Madison' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Overture Center, Broadway tours, the symphony, comedy, dance' },
    { key: 'community', label: 'Community', title: 'The Alliant Energy Center shows, festivals, family days' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 27 slots from the first build: six base-36 digits.
  var CODE_LENGTH = 6;
  var REGISTRY = [
    ['venue', 'Camp Randall Stadium'], ['venue', 'Kohl Center'], ['venue', 'Veterans Memorial Coliseum'], ['venue', 'UW Field House'], ['venue', 'Breese Stevens Field'], ['venue', 'Alliant Energy Center'], ['venue', 'The Sylvee'], ['venue', 'Overture Center'], ['venue', 'Orpheum Theater'], ['venue', 'Barrymore Theatre'], ['venue', 'Majestic Theatre'], ['venue', 'High Noon Saloon'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'badgers'], ['team', 'badgershoops'], ['team', 'badgershockey'], ['team', 'forward'], ['team', 'packers'], ['team', 'brewers'], ['team', 'bucks'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Madison', // the board drops it from the clubs' names ("Forward Madison FC" keeps its own)
    presetDefault: 'Every room — the campus, downtown and the music rooms — every team and type',
    presetNeighborhood: 'The campus and downtown only',
    presetBig: 'Only the places that hold 2,000 or more — Camp Randall, the Kohl Center, the Coliseum, the Overture Center and the Sylvee',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing the campus and downtown only.', big: 'Showing the big rooms only — the stadium, the arenas and the big halls.' },
  };

  global.LQACity = {
    key: 'madison',
    name: 'Madison',
    site: 'https://madison.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; madison-events/1.0; +https://madison.here.events/)',
    tz: 'America/Chicago', tzName: 'Central', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: "Wisconsin", stateOutline: 'M8.9 21.9L8.8 21.5L8.0 21.1L7.5 20.4L7.4 19.5L7.5 18.7L7.3 18.4L7.2 18.1L7.0 16.6L6.7 15.8L5.8 15.2L5.2 14.5L4.5 13.9L4.0 13.7L3.6 13.3L3.0 13.1L2.7 12.7L2.6 12.3L2.7 11.7L2.7 11.1L2.7 10.4L2.9 9.8L2.7 9.3L2.3 8.9L2.6 8.3L2.9 7.8L3.8 7.3L4.1 7.1L4.1 5.9L4.1 4.7L4.4 4.5L4.6 4.3L5.4 4.2L6.1 3.8L7.1 3.2L8.3 2.4L9.4 2.0L10.4 2.1L10.7 2.5L10.4 3.2L10.1 3.9L9.7 4.6L9.6 5.2L9.8 5.2L10.1 5.3L10.3 5.7L10.4 6.0L11.2 6.2L11.9 6.4L12.6 6.6L13.3 6.8L13.8 7.1L14.2 7.3L14.8 7.4L15.6 7.5L16.3 7.8L16.3 8.2L17.1 8.6L17.2 8.9L17.2 9.2L17.0 9.7L17.0 10.0L17.1 10.1L17.5 10.0L17.6 10.1L17.4 10.6L17.5 10.9L18.2 11.3L18.8 10.4L19.7 9.7L21.1 10.2L21.3 11.0L20.4 12.2L19.8 14.2L19.3 16.2L19.1 17.5L19.2 19.8L19.4 22.0L16.8 22.0L14.2 22.0L11.5 21.9L8.9 21.9Z', // the masthead's small state, linking to here.events (scripts/state-outline.mjs, Natural Earth 1:50m)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Madison Events', short: 'Madison Events', teams: 'Madison home teams — every season', prodid: '-//here.events//madison-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around Madison\\, WI — Camp Randall\\, the Kohl Center\\, the Overture Center\\, the Sylvee and the music rooms' },
    teams: TEAMS,
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
