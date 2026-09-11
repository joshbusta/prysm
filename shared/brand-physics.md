# PrYSM brand physics

Visual source of truth for the high-fidelity proposal. Tokens live in [css/styles.css](../css/styles.css). Open [brand.html](../brand.html) for the live board.

## Spectrum

Not gray glass. Light moves cobalt → coral.

| Token | Value | Role |
|---|---|---|
| `--cobalt` | `#0d6efd` | Cool facet, SMS band, focus |
| `--cobalt-deep` | `#1e60ff` | Interactive glow |
| `--cobalt-ink` | `#163a9a` | Links, secure text |
| `--coral` | `#ff5e4d` | Warm facet, WhatsApp band, donate heat |
| `--tangerine` | `#ff7a59` | Mid-spectrum, Email band |

Ambient page wash stays mist (`#f5f6fa`) over a fixed mesh. Grain overlays at ~42% overlay blend.

## Three glass depths

1. **Ambient** — `.site-canvas`. Soft frost over the mesh. Public pages only.
2. **Interactive** — buttons, shards, Compass stage, Shift cards. Brighter edge (`--glass-border`), caustic hover (border + glow), **no scale-up**.
3. **Secure** — `body.theme-secure`. Darker field `#12162a`, blur capped, contrast first. Login and portal. Almost no 3D.

KYR surfaces use `body.theme-kyr`: interactive glass is allowed; Compass/Spline mounts are forbidden.

## Type

- **Playfair Display italic** — voice, mission, display. Never for form labels or portal tables.
- **Inter** — chrome, nav, forms, shift tools, payload notes.

## Motion

Language is refraction: opacity, gradient shift, caustic edge. Not bounce and not `scale(1.045)` on every hover.

- Compass: rotateY / highlight facet
- Shift Glass: translateX RSVP, translateY expand
- Film play-reveal: keep existing documentary behavior
- `prefers-reduced-motion: reduce` — freeze Compass on a poster still; stacked action pills remain; no auto hero cycle (existing)

## Spline budget

- **Maximum one interactive 3D scene per route.**
- Allowed mounts: Home hero layer, `/links` Compass. Nowhere else in this proposal.
- Default: CSS prism. Spline (or equivalent) loads only after an explicit “Load 3D” tap, and never on `save-data`, coarse+slow connection heuristics, or reduced motion.
- Poster still required. If Spline fails, CSS prism stays.
- KYR / ICE / toolkit: no mount point in the DOM.

## People vs prism

Photographs are the solid. Prism is the light around them. Do not replace community with a 3D object.
