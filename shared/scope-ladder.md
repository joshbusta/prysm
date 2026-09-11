# PrYSM scope ladder

Proposal snapshot for contractor review. Public site and member portal share a brand; they are not the same product.

## Audiences

1. **New youth (Instagram → `/links`)** — One-handed, impatient, often on cellular. Highest-priority actions: Register, RSVP, Mutual Aid. Never bounce to a third-party form if we can embed it.
2. **Existing member on a bus** — Already trusted. Needs the next event, a shift, and a confirm that will not fire in a pocket. Low spectacle, large targets, works in a tunnel.
3. **Staff entering data zero times** — Name, channels, event, shift, and consent timestamps land in Airtable / EveryAction via webhook. No spreadsheet re-entry.

## Scope

### Must ship (contractor)

- Seamless registration for new members
- Secure login to a member portal
- Internal, gated events page for members only

### Should ship (inbound funnel)

- `/links` on-domain link-in-bio with embedded Register, RSVP, and Mutual Aid
- RSVP plus volunteer shift sign-up on event listings
- Granular SMS / WhatsApp / Email opt-ins
- Webhooks to Airtable / EveryAction (see [contractor-brief.md](contractor-brief.md))

### Signature (this proposal)

- **Public:** Prism Compass on `/links` and Home (CSS/JS stand-in for Spline; one scene budget)
- **Portal:** Shift Glass event deck (thumb-zone RSVP + spectrum shifts)

Quiet Chamber (login/portal chrome) and Spectrum Consent (channel bands) ship with the must-haves; they are not extra decoration.

### Later

- Live Instagram Graph API (this proposal uses a staff-curated shelf only)
- Full CRM / admin UI
- Bilingual Khmer / Lao / English UI
- Device gyro as a Compass input (drag + buttons ship first)

## Information architecture

**Public**

- Home, `/links`
- Us: Story, Community, Networks, Campaigns, RICE, Organizing Circle, Announcements
- Tools: Know Your Rights, ICE, PASS, Lao Deportation Toolkit
- Contact, Donate (ActBlue), Register, Login

**Gate**

- Register → portal
- Login → portal (magic link default)
- Unauthenticated `/portal/*` returns to Login with `next`

**Gated (noindex, not in sitemap)**

- Events + shifts
- Channel opt-ins

## Safety (non-negotiable)

- Know Your Rights, ICE, and deportation toolkit pages: high contrast, no Spline, no gyro, no decorative 3D.
- Gated event titles may be public-safe (“Community night”); addresses, member names, and shift sites never appear in OG tags, sitemaps, or Instagram shelves.
- Social stills are staff-approved and delayed. No live scrape.
- Color is never the only capacity signal on shifts.

## Judging screens

If a screen does not help one of the three audiences act in under 15 seconds, it is out of this proposal.
