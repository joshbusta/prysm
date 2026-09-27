# PrYSM brand physics

Visual source of truth for the proposal. Tokens live in [css/styles.css](../css/styles.css). Open [brand.html](../brand.html) for the live board.

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

1. **Ambient:** `.site-canvas`. Soft frost over the mesh. Public pages only.
2. **Interactive:** buttons, shards, Shift cards. Brighter edge (`--glass-border`), caustic hover (border + glow), **no scale-up**.
3. **Secure:** `body.theme-secure`. Darker field `#12162a`, blur capped, contrast first. Login and portal.

KYR surfaces use `body.theme-kyr`: interactive glass is allowed; no decorative 3D.

## Type

- **Syne:** headings and brand wordmark (to be included with the other two faces).
- **Playfair Display italic:** voice, mission, display. Never for form labels or portal tables.
- **Inter:** chrome, nav, forms, shift tools, payload notes.

## Motion

Language is refraction: opacity, gradient shift, caustic edge. Not bounce and not `scale(1.045)` on every hover.

- Shift Glass: expand roles on tap; confirm in a centered dialog
- Film play-reveal: keep existing documentary behavior
- `prefers-reduced-motion: reduce` no auto hero cycle (existing)

## People in the brand

Photographs are the solid. Color and glass are the light around them. Do not replace community with a 3D object.
