#!/usr/bin/env python3
"""Apply proposal chrome to existing public HTML pages."""
from pathlib import Path
import re

ROOT = Path("/Users/josue/Documents/PrYSM")

SKIP = {
    "brand.html",
    "proposal.html",
    "register.html",
    "login.html",
    "portal-events.html",
    "portal-comms.html",
}

CURRENT = {
    "our-story.html": "our-story.html",
    "our-community.html": "our-community.html",
    "our-networks.html": "our-networks.html",
    "our-campaigns.html": "our-campaigns.html",
    "rice.html": "rice.html",
    "organizing-circle.html": "organizing-circle.html",
    "announcements.html": "announcements.html",
    "know-your-rights.html": "know-your-rights.html",
    "know-your-rights-ice.html": "know-your-rights-ice.html",
    "pass-coalition-plan.html": "pass-coalition-plan.html",
    "lao-deportation-toolkit.html": "lao-deportation-toolkit.html",
    "contact.html": "contact.html",
}

KYR = {
    "know-your-rights.html",
    "know-your-rights-ice.html",
    "lao-deportation-toolkit.html",
}


def nav_for(filename):
    current = CURRENT.get(filename)

    def link(href, label):
        cur = ' aria-current="page"' if href == current else ""
        return f'<li><a href="{href}"{cur}>{label}</a></li>'

    return f'''      <nav class="site-nav" aria-label="Primary">
        <ul class="nav-list">
          <li>
            <details class="nav-sub">
              <summary>Act</summary>
              <ul class="nav-sublist">
              {link("register.html", "Register")}
              {link("portal-events.html", "Events")}
              <li><a href="https://secure.actblue.com/donate/PrYSM" rel="noopener noreferrer">Donate</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details class="nav-sub">
              <summary>Us</summary>
              <ul class="nav-sublist">
              {link("our-story.html", "Our Story")}
              {link("our-community.html", "Our Community")}
              {link("our-networks.html", "Our Networks")}
              {link("our-campaigns.html", "Our Campaigns")}
              {link("rice.html", "Rhode Island Civic Engagement")}
              {link("organizing-circle.html", "Organizing Circle")}
              {link("announcements.html", "Announcements")}
              </ul>
            </details>
          </li>
          <li>
            <details class="nav-sub">
              <summary>Tools</summary>
              <ul class="nav-sublist">
              {link("know-your-rights.html", "Know Your Rights")}
              {link("know-your-rights-ice.html", "Know Your Rights: ICE")}
              {link("pass-coalition-plan.html", "PASS Coalition Plan")}
              {link("lao-deportation-toolkit.html", "Lao Deportation Toolkit")}
              </ul>
            </details>
          </li>
          {link("contact.html", "Contact")}
        </ul>
      </nav>'''


TOOLS = '''      <div class="header-tools">
        <a class="header-login" href="login.html">Member login</a>
        <a class="btn btn-donate" href="https://secure.actblue.com/donate/PrYSM" rel="noopener noreferrer">Donate</a>
      </div>'''

OLD_TOOLS = '''      <div class="header-tools">
        <a class="btn btn-donate" href="https://secure.actblue.com/donate/PrYSM" rel="noopener noreferrer">Donate</a>
      </div>'''

STORY_SHARDS = '''        <div class="shard-gallery">
          <figure class="media-shard" data-crop="protest">
            <img src="images/hero.png" width="800" height="500" alt="Organizer holding a protest sign overhead">
          </figure>
          <figure class="media-shard" data-crop="fists">
            <img src="images/hero_2.png" width="800" height="500" alt="Young people standing together, several with fists raised">
          </figure>
          <figure class="media-shard" data-crop="family">
            <img src="images/hero_3.png" width="800" height="500" alt="Multi-generational group including an elder holding a baby">
          </figure>
        </div>'''

CAMPAIGN_SHARD = '''        <figure class="media-shard hero" data-crop="protest">
          <img src="images/hero.png" width="1200" height="720" alt="Organizer at a demonstration, sign raised">
        </figure>'''

COMMUNITY_SHARDS = '''        <div class="shard-gallery">
          <figure class="media-shard" data-crop="left">
            <img src="images/hero_2.png" width="800" height="500" alt="Community portrait of young organizers">
          </figure>
          <figure class="media-shard" data-crop="family">
            <img src="images/hero_3.png" width="800" height="500" alt="Family and elders in community space">
          </figure>
          <figure class="media-shard" data-crop="fists">
            <img src="images/hero.png" width="800" height="500" alt="Organizer with sign at a demonstration">
          </figure>
        </div>'''

RICE_HERO = '''        <figure class="media-shard hero" data-crop="family">
          <img src="images/hero_3.png" width="1200" height="720" alt="Multi-generational gathering supporting family defense">
        </figure>'''

RICE_GALLERY = '''        <div class="shard-gallery">
          <figure class="media-shard" data-crop="left"><img src="images/hero_2.png" width="800" height="500" alt="Youth gathered for a community panel"></figure>
          <figure class="media-shard" data-crop="family"><img src="images/hero_3.png" width="800" height="500" alt="Community gathering"></figure>
          <figure class="media-shard" data-crop="protest"><img src="images/hero.png" width="800" height="500" alt="Demonstration for deportation defense"></figure>
          <figure class="media-shard" data-crop="fists"><img src="images/hero_2.png" width="800" height="500" alt="Partner event, fists raised"></figure>
        </div>'''

RICE_PARTNERS = '''        <div class="partner-row">
          <div class="partner-mark">SEAFN</div>
          <div class="partner-mark">CDP</div>
          <div class="partner-mark">AMOR</div>
        </div>'''

OC_GALLERY = '''        <div class="shard-gallery">
          <figure class="media-shard" data-crop="fists"><img src="images/hero_2.png" width="800" height="500" alt="Youth in organizing circle"></figure>
          <figure class="media-shard" data-crop="protest"><img src="images/hero.png" width="800" height="500" alt="Youth at a demonstration"></figure>
          <figure class="media-shard" data-crop="left"><img src="images/hero_2.png" width="800" height="500" alt="Training session"></figure>
          <figure class="media-shard" data-crop="family"><img src="images/hero_3.png" width="800" height="500" alt="Community care after an action"></figure>
        </div>'''

OC_PARTNERS = '''        <div class="partner-row">
          <div class="partner-mark">Black Earth Lab</div>
          <div class="partner-mark">PASS</div>
        </div>'''

ICE_SHELF = '''        <div class="toolkit-shelf">
          <article class="toolkit-card">
            <h2>ICE home visit — English</h2>
            <p>2025 update. Production swaps this card for the current flyer PDF. High contrast, no 3D.</p>
            <p><a class="btn" href="lao-deportation-toolkit.html">Open related toolkit</a></p>
          </article>
          <article class="toolkit-card">
            <h2>ICE home visit — additional languages</h2>
            <p>Slots for Khmer, Lao, and Spanish flyers. Staff replace files.</p>
          </article>
          <figure class="media-shard" data-crop="family">
            <img src="images/hero_3.png" width="800" height="500" alt="Community members standing together">
          </figure>
        </div>'''

def patch(path: Path):
    html = path.read_text()
    name = path.name

    if "css/proposal.css" not in html:
        html = html.replace(
            '<link rel="stylesheet" href="css/styles.css">',
            '<link rel="stylesheet" href="css/styles.css">\n  <link rel="stylesheet" href="css/proposal.css">',
            1,
        )
    if "js/proposal.js" not in html:
        html = html.replace(
            '<script src="js/site.js" defer></script>',
            '<script src="js/site.js" defer></script>\n  <script src="js/proposal.js" defer></script>',
            1,
        )

    html = re.sub(r'<nav class="site-nav".*?</nav>', nav_for(name), html, count=1, flags=re.S)

    if 'header-login' not in html:
        html = html.replace(OLD_TOOLS, TOOLS, 1)

    if name in KYR and 'class="theme-kyr"' not in html:
        html = html.replace("<body>", '<body class="theme-kyr">', 1)

    html = html.replace(
        '<p class="note">This form is a non-working mockup for layout review.</p>',
        '<p class="note">Production posts this digest to EveryAction. Submit to preview the success state.</p>',
    )
    html = html.replace(
        '<form action="#newsletter" method="get">',
        '<form action="#newsletter" method="get" data-mock-form="newsletter">\n          <p class="form-status" data-status hidden></p>',
    )
    html = html.replace(
        '<form action="#contact-form" method="get">',
        '<form action="#contact-form" method="get" data-mock-form="contact">\n          <p class="form-status" data-status hidden></p>',
    )
    html = html.replace(
        '<button class="btn" type="submit">Sign me up!</button>\n        </form>',
        '<button class="btn" type="submit">Sign me up!</button>\n          <pre class="payload-view" hidden></pre>\n        </form>',
    )

    if name == "our-story.html":
        html = html.replace(
            '<div class="placeholder-media">Image gallery slot: community and organizing photos (12 slides on the live site)</div>',
            STORY_SHARDS,
        )
    if name == "our-campaigns.html":
        html = html.replace(
            '<div class="placeholder-media">Image slot: SEARR campaign</div>',
            CAMPAIGN_SHARD,
        )
    if name == "our-community.html":
        html = re.sub(
            r'<div class="placeholder-gallery">\s*<div class="placeholder-media">Photo slot: Kab Pham</div>\s*<div class="placeholder-media">Photo slot: community portrait</div>\s*<div class="placeholder-media">Photo slot: organizing / testimony</div>\s*</div>',
            COMMUNITY_SHARDS,
            html,
            count=1,
            flags=re.S,
        )
    if name == "rice.html":
        html = html.replace(
            '<div class="placeholder-media hero">Image slot: RICE program</div>',
            RICE_HERO,
        )
        html = re.sub(
            r'<div class="placeholder-gallery">\s*<div class="placeholder-media">Photo: legal clinic / panel</div>\s*<div class="placeholder-media">Photo: community gathering</div>\s*<div class="placeholder-media">Photo: deportation defense</div>\s*<div class="placeholder-media">Photo: partner event</div>\s*</div>',
            RICE_GALLERY,
            html,
            count=1,
            flags=re.S,
        )
        html = html.replace(
            '<div class="placeholder-media">Logo / partner gallery slot</div>',
            RICE_PARTNERS,
        )
    if name == "organizing-circle.html":
        html = re.sub(
            r'<div class="placeholder-gallery">\s*<div class="placeholder-media">Photo slot 1</div>\s*<div class="placeholder-media">Photo slot 2</div>\s*<div class="placeholder-media">Photo slot 3</div>\s*<div class="placeholder-media">Photo slot 4</div>\s*</div>',
            OC_GALLERY,
            html,
            count=1,
            flags=re.S,
        )
        html = html.replace(
            '<div class="placeholder-media">Partner logo slot</div>',
            OC_PARTNERS,
        )
    if name == "know-your-rights-ice.html":
        html = re.sub(
            r'<p class="lede">The live page is a set of Know Your Rights flyers and photos\. Image assets are not copied here; use these slots in the visual round\.</p>\s*<div class="placeholder-media hero">Flyer slot: ICE Home Visit — English — 2025 update</div>\s*<div class="placeholder-gallery">\s*<div class="placeholder-media">Flyer / photo slot</div>\s*<div class="placeholder-media">Flyer / photo slot</div>\s*<div class="placeholder-media">Community photo slot</div>\s*</div>',
            '<p class="lede">High-contrast toolkit. No 3D. Production attaches current flyers; this proposal shows the shelf, not fake documents.</p>\n'
            + ICE_SHELF,
            html,
            count=1,
            flags=re.S,
        )
    if name == "index.html":
        if 'href="register.html">Register</a>' not in html.split("hero-actions")[-1][:400]:
            html = html.replace(
                '<a class="btn" href="our-story.html">Our Story</a>',
                '<a class="btn" href="register.html">Register</a>\n          <a class="btn" href="our-story.html">Our Story</a>',
                1,
            )

    path.write_text(html)
    print("patched", name)


def main():
    for path in sorted(ROOT.glob("*.html")):
        if path.name in SKIP:
            continue
        patch(path)


if __name__ == "__main__":
    main()
