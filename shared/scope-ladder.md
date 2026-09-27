# PrYSM scope ladder

Proposal snapshot for contractor review. Public site and member portal share a brand; they are not the same product.

## Audiences

1. **New youth (Instagram → Home / Register)** One-handed, impatient, often on cellular. Highest-priority actions: Register, RSVP, Mutual Aid (Contact).
2. **Existing member on a bus** Already trusted. Needs the next event, a role, and a confirm that will not fire in a pocket. Low spectacle, large targets, works in a tunnel.
3. **Staff entering data zero times** Name, channels, event, shift, and consent timestamps land in Airtable / EveryAction via webhook. No spreadsheet re-entry.

## Scope

### Must ship (contractor)

- Seamless registration for new members
- Secure login to a member portal
- Internal, gated events page for members only

### Should ship (inbound funnel)

- RSVP plus volunteer role sign-up on event listings
- Granular SMS / WhatsApp / Email opt-ins
- Webhooks to Airtable / EveryAction (see [contractor-brief.md](contractor-brief.md))

### Signature (this proposal)

- **Portal:** Shift Glass event deck — tap RSVP or Roles, then a centered confirm dialog

Quiet Chamber (dark login/portal chrome) and Spectrum Consent (channel bands) ship with the must-haves; they are not extra decoration.

### Later

- Live Instagram Graph API (this proposal uses a staff-curated shelf only)
- Full CRM / admin UI
- Bilingual Khmer / Lao / English UI

## Information architecture

**Public**

- Home
- Us: Story, Community, Networks, Campaigns, RICE, Organizing Circle, Announcements
- Tools: Know Your Rights, ICE, PASS, Lao Deportation Toolkit
- Contact, Donate (ActBlue), Register, Login

**Gate**

- Register → portal
- Login → portal (email + password)
- Unauthenticated `/portal/*` returns to Login with `next`

**Gated (noindex, not in sitemap)**

- Events + Roles
- Channel opt-ins

## Safety (non-negotiable)

- Know Your Rights, ICE, and deportation toolkit pages: high contrast, no decorative 3D.
- Gated event titles may be public-safe (“Community night”); addresses, member names, and shift sites never appear in OG tags, sitemaps, or Instagram shelves.
- Social stills are staff-approved and delayed. No live scrape.
- Color is never the only capacity signal on roles.

## Judging screens

If a screen does not help one of the three audiences act in under 15 seconds, it is out of this proposal.
