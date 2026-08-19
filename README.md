# foractive.info

Static pages served at **foractive.info** (GitHub Pages, custom domain).

| Path | What |
| --- | --- |
| `/` | redirects to https://www.foractive.com (what the domain did before, as a redirect instead of a frame) |
| `/running_clubs/` | **ForActive for running clubs** — the landing page |

## Source of truth

The page implements the Claude Design canvas *ForActive Running Clubs* (project
`d50e00e1-fa97-46e2-be6f-16c05c66127e`, files `RunClub*.dc.html`) on the ForActive Design
System (`51f4e1a8-2c7a-4be9-a8f1-07c801d73d0b`). Copy comes from
`docs/positioning/running-clubs-value-proposition.md` in the growth-agent repo
(this folder lives at `site/foractive.info/` there; `publish.sh` has the GitHub Pages + DNS steps).

## Build

```
cd src && node build.js        # writes ../docs (the published tree)
```

- `src/template.html` — page markup; `{{fi:…}}`, `{{si:…}}`, `{{ni:…}}`, `{{logo:…}}`
  expand to `<use>` references into an inline SVG sprite built from `src/ds/ds-data.json`
  (logo + icon vector data extracted from the design system's `_ds_bundle.js`).
- `src/styles.css` — tokens + the design's frame variables (`--f-*`): mobile values by
  default, desktop values from 1024px.
- `src/assets/` — hero photo, the check-in camera crop, two avatars (from the design
  project's `assets/`).

GitHub Pages serves `docs/` from `main`.
