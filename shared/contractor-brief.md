# PrYSM contractor brief

High-fidelity proposal package. Start at [proposal.html](../proposal.html). This is a static mock: no production auth, no live CRM writes.

## Clickable prototype (required path)

1. [Home](../index.html)  photo cycle, Register and Our Story CTAs
2. [Register](../register.html)  3-step wizard + spectrum consent
3. [Login](../login.html)  Quiet Chamber, password only
4. [Gated events](../portal-events.html)  Shift Glass deck (logged in)
5. [Events logged out](../portal-events.html?auth=out)  gate + return to login
6. [Channel opt-ins](../portal-comms.html)
7. Event detail is the expanded listing (roles on the card). No separate public URL.

State flags: `?state=error` · `?state=success` · `?state=offline` · `?auth=out`

## Auth (must-have)

- Real backend. Not Squarespace members.
- Email + password is the only login method in this proposal.
- Unauthenticated `/portal/*` redirects to login with `next`.
- Portal routes are `noindex, nofollow` and **must not** appear in the public sitemap.
- Session: httpOnly cookies.

## Signatures in this proposal

- **Portal:** Shift Glass (`portal-events.html`) tap RSVP or Roles, then confirm in a centered dialog.

Quiet Chamber (dark login/portal chrome) and Spectrum Consent ship with register/login/comms.

## Webhook field map

POST JSON to Airtable and/or EveryAction. One event per successful form. Include `consent_at` (ISO-8601).

| Field | Type | Sources |
|---|---|---|
| `form_type` | string | `register`, `rsvp`, `mutual-aid`, `event_rsvp`, `shift_signup`, `comms`, `newsletter`, `contact`, `login-password` |
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
| Login password | Email / password blank | Email + password required | Navigate to events | Banner |
| Events RSVP / role | — | Full role not selectable | Centered confirm, then payload | Cached next event copy |
| Comms | Bands on | — | Saved + payload | Banner |

Mutual aid and public RSVP are collected on [Contact](../contact.html) and gated [Events](../portal-events.html), not a link-in-bio page.

## Accessibility

- Focus rings already exist on public chrome; keep 3px cobalt (white on dark hero/CTA).
- Shift Glass: **RSVP / Role buttons are the only path**. Confirm dialog is keyboard-operable (Escape, Cancel, Confirm).
- Shift capacity: light density **and** the words Open / Filling / Full. Never color only.
- Tap targets ≥ 48px (`--thumb: 3rem`) on portal tools.
- Bilingual Khmer / Lao / English is **later**, not this bid.
- KYR pages: high contrast, no motion spectacle.

## Safety

- Gated event locations never in OG tags, sitemaps, or public social shelves.
- Social stills are staff-approved and delayed. No live Instagram scrape in this bid.
- ICE / KYR: document shelf, not decorative 3D.

## Out of scope (do not bid as required)

- Live Instagram Graph API
- Admin CRM UI / EveryAction console clone
- Hover-only gestures
- Squarespace member areas
- Production payment besides existing ActBlue donate link

## Suggested stack (non-binding)

Jamstack public site. Auth (Clerk, Auth0, or Supabase). Serverless webhook to Airtable + EveryAction. Member role gate on `/portal/*`.

## Acceptance (proposal)

A contractor can bid after walking [proposal.html](../proposal.html) at 390px width, one-handed, without a meeting.
