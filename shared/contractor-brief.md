# PrYSM contractor brief

High-fidelity proposal package. Start at [proposal.html](../proposal.html). This is a static mock: no production auth, no live CRM writes.

## Clickable prototype (required path)

1. [Home](../index.html) — photo cycle, prism **layer** (not a takeover), Register CTA
2. [/links](../links.html) — Prism Compass + embedded Register / RSVP / Mutual Aid
3. [Register](../register.html) — 3-step wizard + spectrum consent
4. [Login](../login.html) — Quiet Chamber, magic link default, password alternate
5. [Gated events](../portal-events.html) — Shift Glass deck (logged in)
6. [Events logged out](../portal-events.html?auth=out) — gate + return to login
7. [Channel opt-ins](../portal-comms.html)
8. Event detail is the expanded listing (shifts on the card). No separate public URL.

State flags: `?state=error` · `?state=success` · `?state=offline` · `?auth=out`

## Auth (must-have)

- Real backend. Not Squarespace members.
- Magic link is the default (youth + organizers on transit). Password is secondary.
- Unauthenticated `/portal/*` redirects to login with `next`.
- Portal routes are `noindex, nofollow` and **must not** appear in the public sitemap.
- Session: httpOnly cookies, short-lived magic links (15 minutes in copy).

## Spline / 3D rules

See [brand-physics.md](brand-physics.md).

| Route | 3D |
|---|---|
| Home, `/links` | One CSS prism now; Spline only after “Load 3D” |
| Login, portal | Never |
| KYR, ICE, Lao toolkit | No mount in the DOM (`theme-kyr`) |

Do not autoload Spline on Save-Data, 2G, or `prefers-reduced-motion`. Poster still required.

## Signatures in this proposal

- **Public:** Prism Compass (`links.html`, Home layer)
- **Portal:** Shift Glass (`portal-events.html`)

Quiet Chamber + Spectrum Consent ship with register/login/comms.

## Webhook field map

POST JSON to Airtable and/or EveryAction. One event per successful form. Include `consent_at` (ISO-8601).

| Field | Type | Sources |
|---|---|---|
| `form_type` | string | `register`, `register-lite`, `rsvp`, `mutual-aid`, `event_rsvp`, `shift_signup`, `comms`, `newsletter`, `contact`, `login-magic` |
| `name` | string | register, rsvp, mutual aid, newsletter, contact |
| `email` | string | register, login, newsletter, contact |
| `phone` | string \| null | register |
| `contact` | string \| null | mutual aid |
| `need` | string | mutual aid |
| `channel_sms` | boolean | register, comms |
| `channel_whatsapp` | boolean | register, comms |
| `channel_email` | boolean | register, comms |
| `consent_at` | datetime | all opt-in writes |
| `event_id` | string \| null | rsvp, event_rsvp, shift_signup |
| `shift_id` | string \| null | shift_signup |
| `next` | string \| null | login return URL |
| `source` | string | page filename |

Never send event street addresses or member names in public analytics. Mutual aid `need` is staff-only.

## Form / auth state matrix

| Surface | Empty | Error | Success | Offline |
|---|---|---|---|---|
| Register | Step 1 blanks | Name/email required | “You’re in” + payload | Banner; queue locally in production |
| Login magic | Email blank | “Enter the email on your membership” | “Magic link sent” | Banner |
| Login password | — | Email + password required | Navigate to events | Banner |
| `/links` RSVP | Name blank | “Add your name” | Webhook queued | Banner |
| Mutual aid | Need blank | “Tell us what you need” | Webhook queued | Banner |
| Events RSVP/shift | — | Full shift not selectable | Confirm toast, then payload | Cached next event copy |
| Comms | Bands on | — | Saved + payload | Banner |

## Accessibility

- Focus rings already exist on public chrome; keep 3px cobalt (white on dark hero/CTA).
- Compass: 3D is `aria-hidden`; actions are real links. Reduced motion hides the crystal and shows stacked pills.
- Shift Glass: swipe is extra; **RSVP / Shifts buttons are the accessible path**. Confirm toast is keyboard-operable.
- Shift capacity: light density **and** the words Open / Filling / Full. Never color only.
- Tap targets ≥ 48px (`--thumb: 3rem`) on portal tools.
- Bilingual Khmer / Lao / English is **later**, not this bid.
- KYR pages: high contrast, no motion spectacle.

## Safety

- Gated event locations never in OG tags, sitemaps, or the Groundlight shelf.
- Social stills are staff-approved and delayed. No live Instagram scrape in this bid.
- ICE / KYR: document shelf, not decorative 3D, not gyro.

## Out of scope (do not bid as required)

- Live Instagram Graph API
- Admin CRM UI / EveryAction console clone
- Spline on every page or on KYR
- Gyro as the only Compass input
- Hover-only gestures
- Squarespace member areas
- Production payment besides existing ActBlue donate link

## Suggested stack (non-binding)

Jamstack public site. Auth (Clerk, Auth0, or Supabase). Serverless webhook to Airtable + EveryAction. Member role gate on `/portal/*`.

## Acceptance (proposal)

A contractor can bid after walking [proposal.html](../proposal.html) at 390px width, one-handed, without a meeting.
