#!/usr/bin/env python3
"""Generate PrYSM client contract PDFs (scope, invoice, brand physics)."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)

OUT = Path(__file__).resolve().parent
MARGIN = 0.75 * inch
PAGE_W, PAGE_H = letter


def money(n: float) -> str:
    return f"${n:,.2f}"


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def base_styles(serif=True):
    styles = getSampleStyleSheet()
    body_font = "Times-Roman" if serif else "Helvetica"
    bold_font = "Times-Bold" if serif else "Helvetica-Bold"
    italic_font = "Times-Italic" if serif else "Helvetica-Oblique"

    styles.add(
        ParagraphStyle(
            name="DocTitle",
            fontName=bold_font,
            fontSize=18,
            leading=22,
            spaceAfter=6,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSubtitle",
            fontName=body_font,
            fontSize=11,
            leading=14,
            spaceAfter=10,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1",
            fontName=bold_font,
            fontSize=13,
            leading=16,
            spaceBefore=14,
            spaceAfter=6,
            textColor=colors.black,
            keepWithNext=True,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2",
            fontName=bold_font,
            fontSize=11,
            leading=14,
            spaceBefore=10,
            spaceAfter=4,
            textColor=colors.black,
            keepWithNext=True,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            fontName=body_font,
            fontSize=10,
            leading=13,
            spaceAfter=6,
            alignment=TA_JUSTIFY,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyLeft",
            fontName=body_font,
            fontSize=10,
            leading=13,
            spaceAfter=6,
            alignment=TA_LEFT,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocBullet",
            fontName=body_font,
            fontSize=10,
            leading=13,
            leftIndent=14,
            firstLineIndent=-10,
            spaceAfter=3,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            fontName=body_font,
            fontSize=9,
            leading=11,
            spaceAfter=4,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            fontName=body_font,
            fontSize=8.5,
            leading=10.5,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHead",
            fontName=bold_font,
            fontSize=8.5,
            leading=10.5,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Meta",
            fontName=body_font,
            fontSize=10,
            leading=13,
            spaceAfter=2,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverLine",
            fontName=body_font,
            fontSize=11,
            leading=15,
            spaceAfter=4,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="InvoiceBig",
            fontName=bold_font,
            fontSize=20,
            leading=24,
            spaceAfter=8,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="RightMeta",
            fontName=body_font,
            fontSize=10,
            leading=13,
            alignment=TA_RIGHT,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CenterNote",
            fontName=italic_font,
            fontSize=9,
            leading=11,
            alignment=TA_CENTER,
            spaceBefore=8,
            textColor=colors.black,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Limit",
            fontName=body_font,
            fontSize=9.5,
            leading=12,
            spaceAfter=6,
            borderPadding=4,
            textColor=colors.black,
        )
    )
    return styles, body_font, bold_font


def header_footer(canvas, doc, title: str):
    canvas.saveState()
    canvas.setFillColor(colors.black)
    canvas.setStrokeColor(colors.black)
    canvas.setFont("Times-Roman", 9)
    # Header: document title
    top = PAGE_H - 0.45 * inch
    canvas.drawString(MARGIN, top, title)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, top - 4, PAGE_W - MARGIN, top - 4)
    # Footer: PrYSM + page number
    bottom = 0.45 * inch
    canvas.line(MARGIN, bottom + 10, PAGE_W - MARGIN, bottom + 10)
    canvas.drawString(MARGIN, bottom, "PrYSM")
    canvas.drawRightString(PAGE_W - MARGIN, bottom, f"Page {doc.page}")
    canvas.restoreState()


def make_table(data, col_widths, styles_pair, font_size=8.5):
    body_font, bold_font = styles_pair
    styl = TableStyle(
        [
            ("FONTNAME", (0, 0), (-1, 0), bold_font),
            ("FONTNAME", (0, 1), (-1, -1), body_font),
            ("FONTSIZE", (0, 0), (-1, -1), font_size),
            ("LEADING", (0, 0), (-1, -1), font_size + 2),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.92, 0.92, 0.92)),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]
    )
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(styl)
    return t


# ---------------------------------------------------------------------------
# 1. Scope of Work
# ---------------------------------------------------------------------------

def build_scope():
    styles, body_font, bold_font = base_styles(serif=True)
    path = OUT / "PrYSM-Scope-of-Work.pdf"
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=0.85 * inch,
        bottomMargin=0.85 * inch,
        title="PrYSM Scope of Work",
        author="Josue Bustamante",
    )
    story = []  
    usable = PAGE_W - 2 * MARGIN

    # Cover
    story.append(Paragraph("Scope of Work", styles["DocTitle"]))
    story.append(Paragraph("PrYSM Website Proposal Package", styles["DocSubtitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=12))
    story.append(Paragraph("<b>Project:</b> PrYSM website: Prototype proposal, Database Creation, Specification, and Handoff", styles["CoverLine"]))
    story.append(Paragraph("<b>Client:</b> Providence Youth Student Movement (PrYSM)", styles["CoverLine"]))
    story.append(Paragraph("PO Box 6487, Providence, RI 02940 · info@prysm.us · 401-383-7450", styles["CoverLine"]))
    story.append(Paragraph("<b>Contractor:</b> Josue Bustamante", styles["CoverLine"]))
    story.append(Paragraph("<b>Date:</b> 27 September 2026", styles["CoverLine"]))
    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            "A completed high-fidelity static proposal for the PrYSM site rebuild: "
            "public pages, registration, email-and-password login, a gated member events deck "
            "(Shift Glass), channel opt-ins, brand rules, accessibility and safety constraints, "
            "and a webhook field map for Airtable and/or EveryAction.",
            styles["Body"],
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "<b>Engagement limits.</b> This is a static HTML/CSS/JS prototype. Forms demonstrate "
            "empty, error, success, and offline states in the browser. There is no production "
            "authentication and no live CRM writes. The engagement proceeds to a production launch "
            "after prototype approval and after the production database is deployed.",
            styles["Limit"],
        )
    )

    # Engagement summary
    story.append(Paragraph("1. Engagement summary", styles["H1"]))
    story.append(
        Paragraph(
            "This engagement delivered a clickable, high-fidelity static proposal for rebuilding "
            "the PrYSM public site and member portal. The public site and member portal share a brand; "
            "they are not the same product. Reviewers open <b>proposal.html</b> and walk the register → "
            "login → gated events → channel opt-ins path on a phone-width viewport. Forms show "
            "success, error, offline, and webhook payload examples in the browser; they do not write "
            "to a live CRM. The written specifications in this package define auth rules, the webhook "
            "data contract, accessibility, and safety constraints for a future production build.",
            styles["Body"],
        )
    )

    # Audiences
    story.append(Paragraph("2. Audiences (priority order)", styles["H1"]))
    story.append(
        Paragraph(
            "1. <b>New youth (Instagram → Home / Register).</b> One-handed, often on "
            "cellular. Highest-priority actions: Register, RSVP, Mutual Aid (Contact).",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "2. <b>Existing member.</b> Already trusted. Needs the next event, a role, and a "
            "confirm that will not fire in a pocket. Low spectacle, large targets, works efficiently.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "3. <b>Staff entering data zero times.</b> Name, channels, event, shift, and consent "
            "timestamps land in Airtable / EveryAction via webhook. No spreadsheet re-entry.",
            styles["DocBullet"],
        )
    )

    # Scope of work
    story.append(Paragraph("3. Scope of work", styles["H1"]))

    story.append(Paragraph("Must ship", styles["H2"]))
    story.append(Paragraph("• Seamless registration for new members", styles["DocBullet"]))
    story.append(Paragraph("• Secure login to a member portal (email + password)", styles["DocBullet"]))
    story.append(Paragraph("• Internal, gated events page for members only", styles["DocBullet"]))

    story.append(Paragraph("Should ship", styles["H2"]))
    story.append(Paragraph("• RSVP plus volunteer role sign-up on event listings", styles["DocBullet"]))
    story.append(Paragraph("• Granular SMS / WhatsApp / Email opt-ins", styles["DocBullet"]))
    story.append(
        Paragraph(
            "• Webhooks to Airtable / EveryAction (field map and consent rules in the contractor brief)",
            styles["DocBullet"],
        )
    )

    story.append(Paragraph("Signature behavior", styles["H2"]))
    story.append(
        Paragraph(
            "• <b>Shift Glass</b> (portal events deck): tap RSVP or Roles, then a centered confirm dialog.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>Dark Pallette</b> (dark login/portal chrome) and <b>Spectrum Consent</b> (channel bands) "
            "ship with the must-haves; they are not extra decoration.",
            styles["DocBullet"],
        )
    )

    # Deliverables
    story.append(Paragraph("4. Deliverables", styles["H1"]))
    story.append(
        Paragraph(
            "• <b>Public information architecture</b> — Home; Us (Story, Community, Networks, Campaigns, "
            "RICE, Organizing Circle, Announcements); Tools (Know Your Rights, ICE, PASS, Lao Deportation "
            "Toolkit); Contact; Donate (ActBlue); Register; Login. Reviewer can navigate the public site structure.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>register.html</b> — Three-step registration wizard with Spectrum Consent. Reviewer can "
            "walk empty, error, success, and offline states via query flags.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>login.html</b> — Quiet Chamber, email + password only. Reviewer can test gate redirect "
            "and error/offline banners.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>portal-events.html</b> — Gated Shift Glass events deck (noindex). Reviewer can RSVP/role "
            "with centered confirm, or open logged-out gate returning to login with <font face='Courier'>next</font>.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>portal-comms.html</b> — Channel opt-ins (SMS / WhatsApp / Email). Reviewer can toggle "
            "spectrum bands and see saved + payload states.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>brand.html</b> — Live brand board for tokens, glass depths, and motion. Reviewer can "
            "inspect visual rules against the site.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>proposal.html</b> — Hub linking screens, state flags, and written specs for one-handed review.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>Written specifications (delivered with this package):</b>",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "— <b>Scope ladder</b> (<font face='Courier'>shared/scope-ladder.md</font>): audiences, must/should "
            "ship, information architecture, and safety.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "— <b>Contractor brief</b> (<font face='Courier'>shared/contractor-brief.md</font>): auth, webhook "
            "field map, form-state matrix, accessibility, out of scope.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "— <b>Brand physics</b> (<font face='Courier'>shared/brand-physics.md</font>; also "
            "<b>PrYSM-Brand-Physics.pdf</b> appendix): spectrum tokens, glass depths, type, and motion.",
            styles["DocBullet"],
        )
    )

    # Specification summary
    story.append(Paragraph("5. Specification summary", styles["H1"]))
    story.append(
        Paragraph(
            "Condensed from the contractor brief. Prototype forms demonstrate states in the browser; "
            "Production authentication and live CRM writes to be implemented.",
            styles["Body"],
        )
    )

    story.append(Paragraph("Auth rules", styles["H2"]))
    story.append(Paragraph("• Email + password is the only login method in this proposal.", styles["DocBullet"]))
    story.append(
        Paragraph(
            "• Unauthenticated <font face='Courier'>/portal/*</font> redirects to login with a "
            "<font face='Courier'>next</font> return URL.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Portal routes are <font face='Courier'>noindex, nofollow</font> and must not appear in the "
            "public sitemap.",
            styles["DocBullet"],
        )
    )
    story.append(Paragraph("• Production session model specified: httpOnly cookies (not implemented live here).", styles["DocBullet"]))

    webhook_block = []
    webhook_block.append(Paragraph("Webhook field map (data contract)", styles["H2"]))
    webhook_block.append(
        Paragraph(
            "POST JSON to Airtable and/or EveryAction. One event per successful form. Include "
            "<font face='Courier'>consent_at</font> (ISO-8601)."
            "Production database to be deployed.",
            styles["Body"],
        )
    )

    field_rows = [
        [
            Paragraph("Field", styles["TableHead"]),
            Paragraph("Type", styles["TableHead"]),
            Paragraph("Sources", styles["TableHead"]),
        ],
        [
            Paragraph("<font face='Courier'>form_type</font>", styles["TableCell"]),
            Paragraph("string", styles["TableCell"]),
            Paragraph(
                "<font face='Courier'>register</font>, <font face='Courier'>rsvp</font>, "
                "<font face='Courier'>mutual-aid</font>, <font face='Courier'>event_rsvp</font>, "
                "<font face='Courier'>shift_signup</font>, <font face='Courier'>comms</font>, "
                "<font face='Courier'>newsletter</font>, <font face='Courier'>contact</font>, "
                "<font face='Courier'>login-password</font>",
                styles["TableCell"],
            ),
        ],
        [
            Paragraph("<font face='Courier'>name</font>", styles["TableCell"]),
            Paragraph("string", styles["TableCell"]),
            Paragraph("register, rsvp, mutual aid, newsletter, contact", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>email</font>", styles["TableCell"]),
            Paragraph("string", styles["TableCell"]),
            Paragraph("register, login, newsletter, contact", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>phone</font>", styles["TableCell"]),
            Paragraph("string | null", styles["TableCell"]),
            Paragraph("register", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>contact</font>", styles["TableCell"]),
            Paragraph("string | null", styles["TableCell"]),
            Paragraph("mutual aid", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>need</font>", styles["TableCell"]),
            Paragraph("string", styles["TableCell"]),
            Paragraph("mutual aid (staff-only)", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>channel_sms</font>", styles["TableCell"]),
            Paragraph("boolean", styles["TableCell"]),
            Paragraph("register, comms", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>channel_whatsapp</font>", styles["TableCell"]),
            Paragraph("boolean", styles["TableCell"]),
            Paragraph("register, comms", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>channel_email</font>", styles["TableCell"]),
            Paragraph("boolean", styles["TableCell"]),
            Paragraph("register, comms", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>consent_at</font>", styles["TableCell"]),
            Paragraph("datetime", styles["TableCell"]),
            Paragraph("all opt-in writes", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>event_id</font>", styles["TableCell"]),
            Paragraph("string | null", styles["TableCell"]),
            Paragraph("rsvp, event_rsvp, shift_signup", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>shift_id</font>", styles["TableCell"]),
            Paragraph("string | null", styles["TableCell"]),
            Paragraph("shift_signup", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>next</font>", styles["TableCell"]),
            Paragraph("string | null", styles["TableCell"]),
            Paragraph("login return URL", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>source</font>", styles["TableCell"]),
            Paragraph("string", styles["TableCell"]),
            Paragraph("page filename", styles["TableCell"]),
        ],
    ]
    webhook_block.append(make_table(field_rows, [1.35 * inch, 0.95 * inch, usable - 2.3 * inch], (body_font, bold_font)))
    webhook_block.append(Spacer(1, 6))
    webhook_block.append(
        Paragraph(
            "Never send event street addresses or member names in public analytics. Mutual aid "
            "<font face='Courier'>need</font> is staff-only.",
            styles["Small"],
        )
    )
    story.append(KeepTogether(webhook_block))

    state_block = []
    state_block.append(Paragraph("Form / auth state matrix", styles["H2"]))
    state_rows = [
        [
            Paragraph("Surface", styles["TableHead"]),
            Paragraph("Empty", styles["TableHead"]),
            Paragraph("Error", styles["TableHead"]),
            Paragraph("Success", styles["TableHead"]),
            Paragraph("Offline", styles["TableHead"]),
        ],
        [
            Paragraph("Register", styles["TableCell"]),
            Paragraph("Step 1 blanks", styles["TableCell"]),
            Paragraph("Name/email required", styles["TableCell"]),
            Paragraph("“You’re in” + payload", styles["TableCell"]),
            Paragraph("Banner; queue locally in production", styles["TableCell"]),
        ],
        [
            Paragraph("Login password", styles["TableCell"]),
            Paragraph("Email / password blank", styles["TableCell"]),
            Paragraph("Email + password required", styles["TableCell"]),
            Paragraph("Navigate to events", styles["TableCell"]),
            Paragraph("Banner", styles["TableCell"]),
        ],
        [
            Paragraph("Events RSVP / role", styles["TableCell"]),
            Paragraph("—", styles["TableCell"]),
            Paragraph("Full role not selectable", styles["TableCell"]),
            Paragraph("Centered confirm, then payload", styles["TableCell"]),
            Paragraph("Cached next event copy", styles["TableCell"]),
        ],
        [
            Paragraph("Comms", styles["TableCell"]),
            Paragraph("Bands on", styles["TableCell"]),
            Paragraph("—", styles["TableCell"]),
            Paragraph("Saved + payload", styles["TableCell"]),
            Paragraph("Banner", styles["TableCell"]),
        ],
    ]
    col_w = usable / 5
    state_block.append(make_table(state_rows, [col_w] * 5, (body_font, bold_font), font_size=8))
    state_block.append(Spacer(1, 6))
    state_block.append(
        Paragraph(
            "Mutual aid and public RSVP are collected on Contact and gated Events, not a link-in-bio page. "
            "State flags: <font face='Courier'>?state=error</font> · <font face='Courier'>?state=success</font> · "
            "<font face='Courier'>?state=offline</font> · <font face='Courier'>?auth=out</font>.",
            styles["Small"],
        )
    )
    story.append(KeepTogether(state_block))

    story.append(Paragraph("Accessibility", styles["H2"]))
    story.append(
        Paragraph(
            "• Focus rings: 3px cobalt (white on dark hero/CTA).",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Shift Glass: RSVP / Role buttons are the only path. Confirm dialog is keyboard-operable "
            "(Escape, Cancel, Confirm).",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Shift capacity: light density and the words Open / Filling / Full. Never color only.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Tap targets ≥ 48px (<font face='Courier'>--thumb: 3rem</font>) on portal tools.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Bilingual Khmer / Lao / English UI is out of scope for this engagement.",
            styles["DocBullet"],
        )
    )
    story.append(Paragraph("• KYR pages: high contrast, no motion spectacle.", styles["DocBullet"]))

    story.append(Paragraph("Safety", styles["H2"]))
    story.append(
        Paragraph(
            "• Know Your Rights, ICE, and deportation toolkit pages: high contrast, no decorative 3D.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Gated event titles may be public-safe (“Community night”); addresses, member names, and "
            "shift sites never appear in OG tags, sitemaps, or Instagram shelves.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Social stills are staff-approved and delayed. No live Instagram scrape.",
            styles["DocBullet"],
        )
    )
    story.append(Paragraph("• Color is never the only capacity signal on roles.", styles["DocBullet"]))

    # Out of scope
    story.append(Paragraph("6. Out of scope", styles["H1"]))
    story.append(
        Paragraph(
            "The following are not included in this engagement and are not billed:",
            styles["BodyLeft"],
        )
    )
    story.append(Paragraph("• Live Instagram Graph API (this proposal uses a staff-curated shelf only)", styles["DocBullet"]))
    story.append(Paragraph("• Admin CRM UI / EveryAction console clone", styles["DocBullet"]))
    story.append(Paragraph("• Hover-only gestures", styles["DocBullet"]))
    story.append(Paragraph("• Squarespace member areas", styles["DocBullet"]))
    story.append(
        Paragraph(
            "• Production payment processing beyond the existing ActBlue donate link",
            styles["DocBullet"],
        )
    )
    story.append(Paragraph("• Bilingual Khmer / Lao / English UI", styles["DocBullet"]))
    story.append(
        Paragraph(
            "• Production authentication, live CRM writes, and any deployed database",
            styles["DocBullet"],
        )
    )

    # Acceptance
    story.append(Paragraph("7. Acceptance", styles["H1"]))
    story.append(
        Paragraph(
            "A reviewer can walk <b>proposal.html</b> at 390px width, one-handed, without a meeting. "
            "If a screen does not help one of the three audiences act in under 15 seconds, it is out "
            "of this proposal.",
            styles["Body"],
        )
    )

    # Commercial close
    story.append(Paragraph("8. Commercial close", styles["H1"]))
    story.append(
        Paragraph(
            "Labor is billed at <b>$150.00 per hour</b> across engineering, database construction "
            "(specified data contract — not a deployed database), onboarding, and support. Materials "
            "are billed separately. <b>Amount due: $5,000.00</b> on the accompanying invoice "
            "(INV-2026-0927). Line-item detail appears only on that invoice.",
            styles["Body"],
        )
    )

    def on_page(canvas, doc_):
        header_footer(canvas, doc_, "PrYSM Scope of Work")

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return path


# ---------------------------------------------------------------------------
# 2. Invoice (exactly one page)
# ---------------------------------------------------------------------------

def build_invoice():
    styles, body_font, bold_font = base_styles(serif=True)
    path = OUT / "PrYSM-Invoice.pdf"
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=0.85 * inch,
        bottomMargin=0.85 * inch,
        title="PrYSM Invoice INV-2026-0927",
        author="Josue Bustamante",
    )
    story = []
    usable = PAGE_W - 2 * MARGIN

    # Header row
    left = [
        Paragraph("INVOICE", styles["InvoiceBig"]),
        Paragraph("Invoice number: <b>INV-2026-0927</b>", styles["Meta"]),
        Paragraph("Invoice date: <b>27 September 2026</b>", styles["Meta"]),
        Paragraph("Terms: <b>Net 30</b>", styles["Meta"]),
    ]
    right = [
        Paragraph("<b>From</b>", styles["Meta"]),
        Paragraph("Josue Bustamante", styles["Meta"]),
        Paragraph("Street Address: 433 34th Ave, Apt 9, San Francisco, CA 94121", styles["Meta"]),
        Paragraph("Email: joshdbusta@gmail.com", styles["Meta"]),
        Paragraph("Phone: (203) 540-7723", styles["Meta"]),
    ]
    header_tbl = Table(
        [[left, right]],
        colWidths=[usable * 0.55, usable * 0.45],
    )
    header_tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(header_tbl)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=8))

    story.append(Paragraph("<b>Bill to</b>", styles["Meta"]))
    story.append(Paragraph("Providence Youth Student Movement (PrYSM)", styles["Meta"]))
    story.append(Paragraph("PO Box 6487, Providence, RI 02940", styles["Meta"]))
    story.append(Paragraph("info@prysm.us · 401-383-7450", styles["Meta"]))
    story.append(Spacer(1, 8))

    story.append(
        Paragraph(
            "<b>Project:</b> PrYSM website: Prototype proposal, Database Creation, Specification, and Handoff",
            styles["BodyLeft"],
        )
    )
    story.append(
        Paragraph(
            "Static HTML/CSS/JS prototype. Forms demonstrate empty, error, success, and offline "
            "states in the browser. No production authentication and no live CRM writes. This invoice "
            "is for a production launch after prototype approval and after the production database "
            "is deployed.",
            styles["Small"],
        )
    )

    # Services table
    story.append(Paragraph("<b>Services (labor)</b>", styles["H2"]))
    cell = styles["TableCell"]
    head = styles["TableHead"]

    eng_desc = Paragraph(
        "<b>Engineering</b> — Public pages; registration and login; gated Shift Glass events; "
        "channel opt-ins; brand system; interaction states in the proposal (empty, error, success, offline).",
        cell,
    )
    db_desc = Paragraph(
        "<b>Database construction</b> — Specified data contract for the prototype: webhook field map, "
        "form payloads, consent timestamp rules, and Airtable/EveryAction contract. "
        "<b>Production database to be deployed.</b>",
        cell,
    )
    on_desc = Paragraph(
        "<b>Onboarding</b> — Walkthrough of the proposal hub, scope, and brief so staff can review "
        "the prototype.",
        cell,
    )
    sup_desc = Paragraph(
        "<b>Support</b> — Close-out already reflected in the files: state coverage, safety constraints, "
        "and revisions in the current proposal.",
        cell,
    )

    svc = [
        [
            Paragraph("Description", head),
            Paragraph("Hours", head),
            Paragraph("Rate", head),
            Paragraph("Amount", head),
        ],
        [eng_desc, Paragraph("22.0", cell), Paragraph("$150.00", cell), Paragraph("$3,300.00", cell)],
        [db_desc, Paragraph("5.0", cell), Paragraph("$150.00", cell), Paragraph("$750.00", cell)],
        [on_desc, Paragraph("3.0", cell), Paragraph("$150.00", cell), Paragraph("$450.00", cell)],
        [sup_desc, Paragraph("2.0", cell), Paragraph("$150.00", cell), Paragraph("$300.00", cell)],
    ]
    # Description | Hours | Rate | Amount
    svc_tbl = Table(svc, colWidths=[usable - 2.55 * inch, 0.7 * inch, 0.85 * inch, 1.0 * inch])
    svc_tbl.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), bold_font),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.92, 0.92, 0.92)),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("ALIGN", (1, 0), (1, 0), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(svc_tbl)
    story.append(Spacer(1, 8))

    # Materials
    story.append(Paragraph("<b>Materials</b> (billed separately from labor)", styles["H2"]))
    mat = [
        [
            Paragraph("Description", head),
            Paragraph("Amount", head),
        ],
        [
            Paragraph("Development tooling (Cursor)", cell),
            Paragraph("$200.00", cell),
        ],
    ]
    mat_tbl = Table(mat, colWidths=[usable - 1.2 * inch, 1.2 * inch])
    mat_tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.92, 0.92, 0.92)),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(mat_tbl)
    story.append(Spacer(1, 10))

    # Totals
    totals = [
        [
            Paragraph("Labor subtotal (32.0 hours)", styles["BodyLeft"]),
            Paragraph("<b>$4,800.00</b>", styles["RightMeta"]),
        ],
        [
            Paragraph("Materials subtotal", styles["BodyLeft"]),
            Paragraph("<b>$200.00</b>", styles["RightMeta"]),
        ],
        [
            Paragraph("<b>Amount due</b>", styles["BodyLeft"]),
            Paragraph("<b>$5,000.00</b>", styles["RightMeta"]),
        ],
    ]
    tot_tbl = Table(totals, colWidths=[usable - 1.4 * inch, 1.4 * inch])
    tot_tbl.setStyle(
        TableStyle(
            [
                ("LINEABOVE", (0, 2), (-1, 2), 1, colors.black),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(tot_tbl)
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceAfter=6))
    story.append(Paragraph("Terms: Net 30.", styles["Small"]))
    story.append(
        Paragraph(
            "This invoice covers the PrYSM website proposal package (prototype, specification, and handoff).",
            styles["Small"],
        )
    )
    story.append(Paragraph("Payment method: ________", styles["Small"]))
    story.append(
        Paragraph(
            "Note: “Database construction” on this invoice is the specified webhook field map, payload "
            "examples, and consent timestamp rules. Production database to be deployed.",
            styles["Small"],
        )
    )

    def on_page(canvas, doc_):
        header_footer(canvas, doc_, "PrYSM Invoice")

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return path


# ---------------------------------------------------------------------------
# 3. Brand Physics appendix
# ---------------------------------------------------------------------------

def build_brand():
    styles, body_font, bold_font = base_styles(serif=True)
    path = OUT / "PrYSM-Brand-Physics.pdf"
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=0.85 * inch,
        bottomMargin=0.85 * inch,
        title="PrYSM Brand Physics — Visual Specification",
        author="Josue Bustamante",
    )
    story = []
    usable = PAGE_W - 2 * MARGIN

    story.append(Paragraph("Brand Physics", styles["DocTitle"]))
    story.append(
        Paragraph(
            "Visual specification for this engagement (appendix to the Scope of Work)",
            styles["DocSubtitle"],
        )
    )
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=10))
    story.append(
        Paragraph(
            "Visual source of truth for the proposal. Tokens live in <font face='Courier'>css/styles.css</font>. "
            "Open <font face='Courier'>brand.html</font> for the live board.",
            styles["Body"],
        )
    )

    story.append(Paragraph("Spectrum", styles["H1"]))
    story.append(
        Paragraph(
            "Not gray glass. Light moves cobalt → coral.",
            styles["BodyLeft"],
        )
    )

    token_rows = [
        [
            Paragraph("Token", styles["TableHead"]),
            Paragraph("Value", styles["TableHead"]),
            Paragraph("Role", styles["TableHead"]),
        ],
        [
            Paragraph("<font face='Courier'>--cobalt</font>", styles["TableCell"]),
            Paragraph("<font face='Courier'>#0d6efd</font>", styles["TableCell"]),
            Paragraph("Cool facet, SMS band, focus", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>--cobalt-deep</font>", styles["TableCell"]),
            Paragraph("<font face='Courier'>#1e60ff</font>", styles["TableCell"]),
            Paragraph("Interactive glow", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>--cobalt-ink</font>", styles["TableCell"]),
            Paragraph("<font face='Courier'>#163a9a</font>", styles["TableCell"]),
            Paragraph("Links, secure text", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>--coral</font>", styles["TableCell"]),
            Paragraph("<font face='Courier'>#ff5e4d</font>", styles["TableCell"]),
            Paragraph("Warm facet, WhatsApp band, donate heat", styles["TableCell"]),
        ],
        [
            Paragraph("<font face='Courier'>--tangerine</font>", styles["TableCell"]),
            Paragraph("<font face='Courier'>#ff7a59</font>", styles["TableCell"]),
            Paragraph("Mid-spectrum, Email band", styles["TableCell"]),
        ],
    ]
    story.append(make_table(token_rows, [1.7 * inch, 1.2 * inch, usable - 2.9 * inch], (body_font, bold_font)))
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "Ambient page wash stays mist (<font face='Courier'>#f5f6fa</font>) over a fixed mesh. "
            "Grain overlays at ~42% overlay blend.",
            styles["Body"],
        )
    )

    story.append(Paragraph("Three glass depths", styles["H1"]))
    story.append(
        Paragraph(
            "1. <b>Ambient:</b> <font face='Courier'>.site-canvas</font>. Soft frost over the mesh. "
            "Public pages only.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "2. <b>Interactive:</b> buttons, shards, Shift cards. Brighter edge "
            "(<font face='Courier'>--glass-border</font>), caustic hover (border + glow), "
            "<b>no scale-up</b>.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "3. <b>Secure:</b> <font face='Courier'>body.theme-secure</font>. Darker field "
            "<font face='Courier'>#12162a</font>, blur capped, contrast first. Login and portal.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "KYR surfaces use <font face='Courier'>body.theme-kyr</font>: interactive glass is allowed; "
            "no decorative 3D.",
            styles["Body"],
        )
    )

    story.append(Paragraph("Type", styles["H1"]))
    story.append(
        Paragraph(
            "• <b>Playfair Display italic</b> — voice, mission, display. Never for form labels or "
            "portal tables.",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <b>Inter</b> — chrome, nav, forms, shift tools, payload notes.",
            styles["DocBullet"],
        )
    )

    story.append(Paragraph("Motion", styles["H1"]))
    story.append(
        Paragraph(
            "Language is refraction: opacity, gradient shift, caustic edge. Not bounce and not "
            "<font face='Courier'>scale(1.045)</font> on every hover.",
            styles["Body"],
        )
    )
    story.append(
        Paragraph(
            "• Shift Glass: expand roles on tap; confirm in a centered dialog",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• Film play-reveal: keep existing documentary behavior",
            styles["DocBullet"],
        )
    )
    story.append(
        Paragraph(
            "• <font face='Courier'>prefers-reduced-motion: reduce</font> — no auto hero cycle (existing)",
            styles["DocBullet"],
        )
    )

    story.append(Paragraph("People in the brand", styles["H1"]))
    story.append(
        Paragraph(
            "Photographs are the solid. Color and glass are the light around them. Do not replace "
            "community with a 3D object.",
            styles["Body"],
        )
    )

    def on_page(canvas, doc_):
        header_footer(canvas, doc_, "PrYSM Brand Physics — Visual Specification")

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return path


def main():
    scope = build_scope()
    invoice = build_invoice()
    brand = build_brand()
    from pypdf import PdfReader

    for p in (scope, invoice, brand):
        r = PdfReader(str(p))
        print(f"{p.name}: {len(r.pages)} page(s)  ({p.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
