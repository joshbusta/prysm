# PrYSM website

High-fidelity design proposal for the [Providence Youth Student Movement](https://prysm.us/) rebuild. Luminous cobalt/coral glass, mobile-first. Static HTML/CSS/JS, no bundler.

## Open the prototype

```bash
cd /Users/josue/Documents/PrYSM
python3 -m http.server 8000
```

Contractor walk-through: [http://localhost:8000/proposal.html](http://localhost:8000/proposal.html)

Or open `proposal.html` directly. Internal links are relative.

## What to review

- **Must-haves:** [register.html](register.html), [login.html](login.html), [portal-events.html](portal-events.html)
- **Funnel:** [portal-comms.html](portal-comms.html)
- **Tokens:** [brand.html](brand.html)
- **Brief:** [shared/contractor-brief.md](shared/contractor-brief.md)
- **Scope:** [shared/scope-ladder.md](shared/scope-ladder.md)
- **Brand physics:** [shared/brand-physics.md](shared/brand-physics.md)

Signature in this mock: Shift Glass on gated events (tap RSVP / Roles, centered confirm).

## Notes

- Duplicate header/footer HTML is intentional.
- Donate still points at the live ActBlue form.
- Forms show success/error/payload states in-browser. They do not write to a live CRM.
- Portal pages are `noindex`. Event sites stay behind login.
- Login is email + password only.
- Know Your Rights / ICE pages use a high-contrast toolkit treatment.
