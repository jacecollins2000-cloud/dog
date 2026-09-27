"""Build spec homepage previews for cold outreach.

Reads previews/leads.json and writes previews/site/<slug>/index.html plus
previews/site/index.html (a hidden, noindex list). Deploy previews/site to
Cloudflare Pages (build command: none, output dir: previews/site).

Each lead:
  {"slug": "blue-sky-painting", "name": "Blue Sky Painting", "trade": "painting",
   "city": "Gilbert", "phone": "(480) 664-2423",
   "headline": "...", "sub": "...",            # optional, else trade defaults
   "services": ["...", ...],                    # optional
   "reviews": [{"text": "...", "who": "..."}],  # optional, real reviews only
   "years": "12", "rating": "4.9", "review_count": "37"}  # optional
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "site"
CLAIM = "https://stand-out-studios.pages.dev/start/"
DEPOSIT = "https://buy.stripe.com/eVq3cudQMf6A9L7axGcAo00"

# One big idea per trade, in the Stand Out Studios spirit.
THEMES = {
    "painting": dict(
        bg="#F6F1E7", ink="#1E1B16", accent="#2F5DA8", soft="#E7DCC7",
        display="Fraunces", idea="stroke",
        headline="One coat of care. Every wall, edge and trim line.",
        sub="Interior and exterior painting in {city}. We tape, prep and clean up like it’s our own house.",
        services=["Interior painting", "Exterior painting", "Cabinet refinishing", "Drywall repair", "Stucco and trim", "Color help"],
        cta="Get a free estimate"),
    "cleaning": dict(
        bg="#F3F6F5", ink="#14201D", accent="#0F8A6C", soft="#DCE9E4",
        display="Fraunces", idea="wipe",
        headline="Come home to a house that’s already done.",
        sub="House cleaning in {city}. The same crew every visit, and a checklist you can see.",
        services=["Recurring cleaning", "Deep cleaning", "Move-in and move-out", "Airbnb turnovers", "Inside the fridge and oven", "Windows and baseboards"],
        cta="Price my clean"),
    "landscaping": dict(
        bg="#F4F1E8", ink="#1C1E19", accent="#6B7F3A", soft="#E4DECB",
        display="Castoro", idea="plan",
        headline="Desert yards that look good in July.",
        sub="Landscaping in {city}. Design, install and upkeep, with plants that live on less water.",
        services=["Yard design", "Desert landscaping", "Irrigation and drip", "Pavers and hardscape", "Tree and shrub care", "Weekly upkeep"],
        cta="Book a yard visit"),
    "stone": dict(
        bg="#F2EFEA", ink="#1D1B19", accent="#9A5B34", soft="#E2DAD0",
        display="Castoro", idea="plan",
        headline="Stone work that looks like it was always there.",
        sub="Stone and water features in {city}. Built by hand, built to last the heat.",
        services=["Waterfalls and ponds", "Stone walls", "Fire pits", "Pavers and patios", "Boulders and accents", "Repairs"],
        cta="Book a site visit"),
    "roofing": dict(
        bg="#F1EFEC", ink="#16181B", accent="#C2410C", soft="#DDD8D1",
        display="Archivo", idea="shingles",
        headline="Monsoon season is coming. Is your roof ready?",
        sub="Roof repair and replacement in {city}. A straight answer and photos of every problem we find.",
        services=["Roof repair", "Full replacement", "Tile and shingle", "Flat and foam roofs", "Storm damage", "Free inspections"],
        cta="Book a free inspection"),
    "glass": dict(
        bg="#EEF3F6", ink="#12202A", accent="#1B6FA8", soft="#D6E3EB",
        display="Archivo", idea="crack",
        headline="Broken glass today. Clear glass tomorrow.",
        sub="Glass and window repair in {city}. We measure, cut and install, fast.",
        services=["Window repair", "Sliding doors", "Shower doors", "Mirrors", "Storefront glass", "Emergency board-up"],
        cta="Call the shop"),
    "grooming": dict(
        bg="#FBF4EC", ink="#221A14", accent="#C7652B", soft="#F0E0CE",
        display="Fraunces", idea="paws",
        headline="They go in scruffy. They come out proud.",
        sub="Dog grooming in {city}. Gentle hands, no rush, and a photo when they’re done.",
        services=["Full groom", "Bath and brush", "Nail trim", "De-shedding", "Puppy’s first groom", "Teeth brushing"],
        cta="Book a groom"),
    "pressure washing": dict(
        bg="#EEF2F4", ink="#131A1F", accent="#0E7490", soft="#D5DFE4",
        display="Archivo", idea="wash",
        headline="Watch ten years of dirt come off in an afternoon.",
        sub="Pressure washing in {city}. Driveways, walls, roofs and patios, back to new.",
        services=["Driveways", "House washing", "Roof washing", "Patios and pavers", "Pool decks", "Commercial"],
        cta="Get a quote"),
    "hvac": dict(
        bg="#F2F4F7", ink="#121822", accent="#D9480F", soft="#DCE2EA",
        display="Archivo", idea="temp",
        headline="118° outside. 72° inside.",
        sub="A/C and heating in {city}. Same-day repair when it matters most.",
        services=["A/C repair", "New systems", "Tune-ups", "Heat pumps", "Ductwork", "Refrigeration"],
        cta="Call for same-day service"),
    "gates": dict(
        bg="#F1F0EE", ink="#191919", accent="#8A6D3B", soft="#DEDAD2",
        display="Archivo", idea="bars",
        headline="The first thing people see of your home.",
        sub="Custom gates and fences in {city}. Designed, welded and installed by us.",
        services=["Custom gates", "Driveway gates", "Iron fencing", "Gate openers", "Repairs", "Railings"],
        cta="Get a quote"),
}
THEMES["tree service"] = THEMES["landscaping"]
THEMES["fence"] = THEMES["gates"]

def _t(base, **kw):
    d = dict(THEMES[base]); d.update(kw); return d

THEMES.update({
    "pool": _t("pressure washing", accent="#0284C7", headline="A pool you want to jump in, every week.",
        sub="Pool service in {city}. Weekly cleaning, balanced water and repairs, with a photo after every visit.",
        services=["Weekly pool service", "Green-to-clean", "Filter cleaning", "Pump and motor repair", "Acid washes", "Equipment upgrades"], cta="Get a service quote"),
    "plumbing": _t("pressure washing", accent="#1D4ED8", headline="Leak today. Fixed today.",
        sub="Plumbing in {city}. Upfront prices, clean work, and a plumber who shows up when we say.",
        services=["Leak repair", "Water heaters", "Drain cleaning", "Repiping", "Fixtures and faucets", "Emergency service"], cta="Call a plumber"),
    "electrical": _t("hvac", accent="#CA8A04", headline="Power you don’t have to think about.",
        sub="Electrical work in {city}. Licensed, upfront pricing, and done to code the first time.",
        services=["Panel upgrades", "Lighting", "Outlets and switches", "Ceiling fans", "EV chargers", "Troubleshooting"], cta="Get a quote"),
    "flooring": _t("painting", accent="#92400E", idea="shingles", headline="Floors you notice every time you walk in.",
        sub="Flooring in {city}. Tile, wood and vinyl, measured, installed and cleaned up by our own crew.",
        services=["Tile", "Hardwood", "Luxury vinyl", "Carpet", "Floor removal", "Free measure"], cta="Book a free measure"),
    "remodeling": _t("painting", accent="#9A3412", idea="bars", headline="The kitchen you keep showing people.",
        sub="Remodeling in {city}. Kitchens, baths and more, on schedule and on budget.",
        services=["Kitchen remodels", "Bathroom remodels", "Cabinets and counters", "Flooring", "Room additions", "Design help"], cta="Book a consultation"),
    "handyman": _t("gates", accent="#B45309", headline="That list on your fridge? Done this week.",
        sub="Handyman service in {city}. Repairs, installs and odd jobs, big or small.",
        services=["Repairs", "Drywall patches", "Installs and mounting", "Doors and trim", "Fixtures", "Honey-do lists"], cta="Send me your list"),
    "auto detailing": _t("pressure washing", accent="#111827", headline="Like the day you drove it home.",
        sub="Auto detailing in {city}. Inside and out, down to the cup holders.",
        services=["Full detail", "Interior deep clean", "Wash and wax", "Paint correction", "Ceramic coating", "Headlight restore"], cta="Book a detail"),
    "auto repair": _t("hvac", accent="#DC2626", idea="bars", headline="Straight answers about your car.",
        sub="Auto repair in {city}. We show you what’s wrong before we fix it, and we call before any extra work.",
        services=["Brakes", "Engine diagnostics", "A/C repair", "Oil changes", "Suspension", "Inspections"], cta="Book a repair"),
    "garage doors": _t("gates", accent="#475569", idea="shingles", headline="Stuck garage door? Same-day fix.",
        sub="Garage door repair in {city}. Springs, openers and new doors, installed right.",
        services=["Spring repair", "Openers", "New doors", "Off-track doors", "Tune-ups", "Emergency service"], cta="Call for same-day service"),
    "pest control": _t("landscaping", accent="#15803D", idea="paws", headline="Scorpions out. Family in.",
        sub="Pest control in {city}. Safe for kids and pets, with a guarantee between visits.",
        services=["Scorpions", "Termites", "Ants and roaches", "Rodents", "Bees", "Monthly plans"], cta="Get a free inspection"),
    "appliance repair": _t("hvac", accent="#0F766E", idea="bars", headline="Fixed, not replaced.",
        sub="Appliance repair in {city}. Washers, dryers, fridges and ovens, usually in one visit.",
        services=["Refrigerators", "Washers", "Dryers", "Ovens and ranges", "Dishwashers", "Ice makers"], cta="Book a repair"),
    "cabinets": _t("painting", accent="#78350F", idea="bars", headline="Cabinets built for your kitchen, not a catalog.",
        sub="Custom cabinets in {city}. Designed, built and installed by our shop.",
        services=["Kitchen cabinets", "Bathroom vanities", "Built-ins", "Closets", "Refacing", "Installation"], cta="Book a measure"),
})
TRADE_THEME = {"roofing": "roofing", "landscaping": "landscaping", "painting contractors": "painting",
    "house cleaning": "cleaning", "carpet cleaning": "cleaning", "pool service": "pool",
    "pressure washing": "pressure washing", "handyman": "handyman", "flooring": "flooring",
    "remodeling contractors": "remodeling", "plumbers": "plumbing", "electricians": "electrical",
    "garage doors": "garage doors", "pest control": "pest control", "auto repair": "auto repair",
    "auto detailing": "auto detailing", "tree service": "landscaping", "concrete contractors": "stone",
    "fence contractors": "gates", "cabinet makers": "cabinets", "glass repair": "glass", "hvac": "hvac",
    "dog grooming": "grooming", "appliance repair": "appliance repair"}


def e(s):
    return html.escape(str(s), quote=True)


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


IDEAS = {
    # Each idea is a hero visual: SVG/CSS only, no stock photos.
    "stroke": """<svg class="art" viewBox="0 0 600 420" aria-hidden="true">
  <rect x="40" y="40" width="520" height="340" fill="var(--soft)"/>
  <path class="draw" d="M20 130 C160 90 300 170 580 110" stroke="var(--accent)" stroke-width="90" fill="none" stroke-linecap="round"/>
  <path class="draw d2" d="M20 250 C200 210 360 300 580 230" stroke="var(--accent)" stroke-width="90" fill="none" stroke-linecap="round" opacity=".85"/>
  <path class="draw d3" d="M20 360 C180 330 380 400 580 350" stroke="var(--accent)" stroke-width="70" fill="none" stroke-linecap="round" opacity=".7"/>
</svg>""",
    "wipe": """<div class="art wipe" aria-hidden="true"><div class="room"><span>Kitchen</span><span>Bathrooms</span><span>Floors</span><span>Baseboards</span><span>Windows</span></div><div class="grime"></div></div>""",
    "plan": """<svg class="art" viewBox="0 0 600 420" aria-hidden="true">
  <rect x="20" y="20" width="560" height="380" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="6 6" opacity=".35"/>
  <g class="pop" fill="none" stroke="var(--accent)" stroke-width="2">
    <circle cx="150" cy="140" r="70"/><circle cx="150" cy="140" r="4" fill="var(--accent)"/>
    <circle cx="420" cy="110" r="45"/><circle cx="470" cy="290" r="55"/>
    <circle cx="300" cy="300" r="28"/><circle cx="240" cy="230" r="18"/><circle cx="360" cy="210" r="22"/>
    <circle cx="110" cy="320" r="30"/>
  </g>
  <path d="M40 380 C200 330 330 360 560 250" stroke="var(--ink)" stroke-width="2" fill="none" opacity=".5" class="draw"/>
</svg>""",
    "shingles": """<div class="art shingles" aria-hidden="true">""" + "".join(f'<i style="--d:{i*0.03:.2f}s"></i>' for i in range(48)) + "</div>",
    "crack": """<svg class="art" viewBox="0 0 600 420" aria-hidden="true">
  <rect x="30" y="30" width="540" height="360" fill="var(--soft)" stroke="var(--ink)" stroke-width="6"/>
  <g class="heal" stroke="var(--ink)" stroke-width="2" fill="none">
    <path d="M300 210 L220 90 L180 40"/><path d="M300 210 L420 120 L520 60"/><path d="M300 210 L470 260 L570 300"/>
    <path d="M300 210 L330 330 L350 390"/><path d="M300 210 L150 280 L40 330"/><path d="M220 90 L260 60"/><path d="M470 260 L480 330"/>
  </g>
  <path d="M80 70 L140 70" stroke="#fff" stroke-width="10" opacity=".6"/>
</svg>""",
    "paws": """<div class="art paws" aria-hidden="true">""" + "".join(
        f'<svg style="left:{x}%;top:{y}%;--d:{i*0.35:.2f}s;transform:rotate({r}deg)" viewBox="0 0 40 40"><ellipse cx="20" cy="27" rx="10" ry="8"/><circle cx="9" cy="15" r="4"/><circle cx="16" cy="9" r="4"/><circle cx="24" cy="9" r="4"/><circle cx="31" cy="15" r="4"/></svg>'
        for i, (x, y, r) in enumerate([(10, 75, -20), (25, 58, 10), (38, 70, -15), (52, 48, 15), (64, 58, -10), (78, 34, 20), (86, 14, 5)])) + "</div>",
    "wash": """<div class="art wash" aria-hidden="true"><div class="pavers"></div><div class="dirt"></div></div>""",
    "temp": """<div class="art temp" aria-hidden="true"><div class="num"><span class="hot">118°</span><span class="cool">72°</span></div><div class="bar"><div class="fill"></div></div></div>""",
    "bars": """<svg class="art" viewBox="0 0 600 420" aria-hidden="true"><g stroke="var(--ink)" stroke-width="8" fill="none">
  <path class="draw" d="M40 400 V140 Q300 20 560 140 V400"/>""" + "".join(
        f'<path class="draw" style="animation-delay:{0.2+i*0.08:.2f}s" d="M{80+i*55} 400 V{150 - (0 if i in (0, 8) else 30)}"/>' for i in range(9)) + """
  <path class="draw" d="M40 260 H560"/></g><circle cx="300" cy="150" r="26" fill="none" stroke="var(--accent)" stroke-width="8" class="draw"/></svg>""",
}

CSS = """
*{box-sizing:border-box;margin:0}
:root{--bg:%(bg)s;--ink:%(ink)s;--accent:%(accent)s;--soft:%(soft)s;--display:'%(display)s',Georgia,serif}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font:17px/1.55 'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}
.preview-bar{background:var(--ink);color:var(--bg);font-size:14px;padding:10px 16px;text-align:center}
.preview-bar a{color:var(--bg);font-weight:700}
header{display:flex;justify-content:space-between;align-items:center;padding:18px clamp(16px,4vw,48px);gap:12px}
.logo{font-family:var(--display);font-weight:700;font-size:22px;letter-spacing:-.01em}
.call{background:var(--accent);color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;white-space:nowrap;font-size:15px}
.hero{display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(24px,5vw,64px);align-items:center;padding:clamp(24px,6vw,72px) clamp(16px,4vw,48px) clamp(40px,7vw,96px)}
h1{font-family:var(--display);font-size:clamp(38px,6vw,74px);line-height:1.02;letter-spacing:-.02em;font-weight:700}
.sub{font-size:clamp(17px,1.6vw,20px);margin-top:20px;max-width:34em;opacity:.85}
.ctas{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.btn{display:inline-block;padding:15px 22px;border-radius:999px;font-weight:700;text-decoration:none;border:2px solid var(--ink)}
.btn.primary{background:var(--ink);color:var(--bg)}
.trust{display:flex;gap:22px;flex-wrap:wrap;margin-top:26px;font-size:14px;opacity:.75}
.art{width:100%%;height:auto;aspect-ratio:600/420;display:block}
section{padding:clamp(48px,7vw,96px) clamp(16px,4vw,48px)}
h2{font-family:var(--display);font-size:clamp(30px,4vw,48px);line-height:1.08;letter-spacing:-.015em;max-width:18em}
.services{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin-top:32px}
.services div{background:var(--soft);padding:22px;border-radius:14px;font-weight:600;font-size:18px}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:32px}
.photos div{aspect-ratio:4/3;border-radius:14px;background:repeating-linear-gradient(135deg,var(--soft) 0 14px,transparent 14px 28px);display:grid;place-items:center;font-size:14px;opacity:.8;text-align:center;padding:12px}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:32px;counter-reset:s}
.steps div{border-top:3px solid var(--accent);padding-top:16px}
.steps div::before{counter-increment:s;content:counter(s);font-family:var(--display);font-size:40px;font-weight:700;color:var(--accent);display:block}
.reviews{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:32px}
blockquote{background:#fff;padding:24px;border-radius:14px;font-size:18px}
blockquote cite{display:block;margin-top:12px;font-style:normal;font-size:14px;opacity:.65}
.quote{background:var(--ink);color:var(--bg)}
.quote form{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px;max-width:720px}
.quote input,.quote textarea{font:inherit;padding:14px;border-radius:10px;border:0;background:rgba(255,255,255,.1);color:inherit}
.quote textarea{grid-column:1/-1;min-height:110px}
.quote button{grid-column:1/-1;font:inherit;font-weight:700;padding:16px;border-radius:999px;border:0;background:var(--accent);color:#fff;cursor:pointer}
.claim{background:var(--soft);text-align:center}.claim h2{margin:0 auto}.claim p{max-width:36em;margin:16px auto}.claim .btn{margin-top:8px}.claim .fine{font-size:14px;opacity:.75}
footer{padding:28px clamp(16px,4vw,48px);font-size:14px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;opacity:.8}
.sticky-call{display:none}
@media (max-width:760px){
 .hero{grid-template-columns:1fr}.steps{grid-template-columns:1fr}.photos{grid-template-columns:1fr 1fr}
 .quote form{grid-template-columns:1fr}
 .sticky-call{display:block;position:fixed;left:16px;right:16px;bottom:16px;text-align:center;z-index:5;box-shadow:0 8px 24px rgba(0,0,0,.25)}
 body{padding-bottom:84px}
}
/* hero ideas */
.draw{stroke-dasharray:1400;stroke-dashoffset:1400;animation:draw 1.6s cubic-bezier(.6,0,.2,1) forwards}
.d2{animation-delay:.5s}.d3{animation-delay:1s}
@keyframes draw{to{stroke-dashoffset:0}}
.pop circle{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:pop .6s ease forwards}
.pop circle:nth-child(n){animation-delay:calc(var(--i,0)*1s)}
.pop circle:nth-child(2){animation-delay:.2s}.pop circle:nth-child(3){animation-delay:.4s}.pop circle:nth-child(4){animation-delay:.6s}.pop circle:nth-child(5){animation-delay:.8s}.pop circle:nth-child(6){animation-delay:1s}.pop circle:nth-child(7){animation-delay:1.2s}.pop circle:nth-child(8){animation-delay:1.4s}
@keyframes pop{to{transform:scale(1)}}
.wipe{position:relative;background:var(--soft);border-radius:18px;overflow:hidden}
.wipe .room{position:absolute;inset:0;display:grid;align-content:center;gap:10px;padding:32px;font-weight:700;font-size:clamp(18px,2.4vw,26px)}
.wipe .room span::before{content:'✓ ';color:var(--accent)}
.wipe .grime{position:absolute;inset:0;background:repeating-radial-gradient(circle at 30%% 40%%,#b8ad97 0 3px,#a89c84 3px 9px);animation:wipe 2.4s .4s cubic-bezier(.6,0,.2,1) forwards;clip-path:inset(0 0 0 0)}
@keyframes wipe{to{clip-path:inset(0 0 0 100%%)}}
.shingles{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;transform:perspective(700px) rotateX(28deg);border-radius:10px;overflow:hidden}
.shingles i{aspect-ratio:1.4;background:var(--accent);opacity:0;border-radius:0 0 10px 10px;animation:tile .4s var(--d) forwards}
.shingles i:nth-child(3n){filter:brightness(.85)}.shingles i:nth-child(5n){filter:brightness(1.12)}
@keyframes tile{to{opacity:1}}
.heal path{stroke-dasharray:400;stroke-dashoffset:0;animation:heal 1.8s 1s ease forwards}
@keyframes heal{to{stroke-dashoffset:400}}
.paws{position:relative;background:var(--soft);border-radius:18px}
.paws svg{position:absolute;width:13%%;fill:var(--accent);opacity:0;animation:tile .3s var(--d) forwards}
.wash{position:relative;border-radius:18px;overflow:hidden}
.wash .pavers{position:absolute;inset:0;background:conic-gradient(from 90deg at 2px 2px,#0000 90deg,#cfc7ba 0) 0 0/60px 40px,#ebe5da}
.wash .dirt{position:absolute;inset:0;background:linear-gradient(#5f574bdd,#4c463cdd);animation:wipe 2.6s .4s cubic-bezier(.6,0,.2,1) forwards}
.temp{display:grid;align-content:center;gap:18px;background:var(--soft);border-radius:18px;padding:32px}
.temp .num{position:relative;height:1.1em;font:700 clamp(64px,10vw,130px)/1 var(--display)}
.temp .num span{position:absolute}
.temp .hot{color:var(--accent);animation:out .6s 1.4s forwards}
.temp .cool{color:#1B6FA8;opacity:0;animation:in .6s 1.6s forwards}
.temp .bar{height:14px;background:#fff;border-radius:99px;overflow:hidden}
.temp .fill{height:100%%;width:95%%;background:var(--accent);animation:cool 2s .4s ease forwards}
@keyframes cool{to{width:35%%;background:#1B6FA8}}
@keyframes out{to{opacity:0;transform:translateY(-20px)}}
@keyframes in{to{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation-duration:0s!important;animation-delay:0s!important}}
"""


def page(lead):
    t = dict(THEMES[lead["trade"]])
    city = lead.get("city", "")
    name = lead["name"]
    phone = lead["phone"]
    tel = re.sub(r"[^0-9+]", "", phone)
    headline = lead.get("headline") or t["headline"]
    sub = (lead.get("sub") or t["sub"]).format(city=city)
    services = lead.get("services") or t["services"]
    trust = []
    if lead.get("years"):
        trust.append(f"{e(lead['years'])} years in business")
    if lead.get("rating") and lead.get("review_count"):
        trust.append(f"★ {e(lead['rating'])} from {e(lead['review_count'])} reviews")
    trust.append(f"Serving {e(city)} and nearby")
    reviews = lead.get("reviews") or []
    reviews_html = ""
    if reviews:
        reviews_html = '<section><h2>What customers say.</h2><div class="reviews">' + "".join(
            f'<blockquote>“{e(r["text"])}”<cite>{e(r["who"])}</cite></blockquote>' for r in reviews) + "</div></section>"
    fonts = f"family={t['display'].replace(' ', '+')}:wght@400;700&family=Inter:wght@400;600;700"
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>{e(name)} · Homepage preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap">
<style>{CSS % t}</style>
</head><body>
<div class="preview-bar">A free homepage mockup made for {e(name)} by Stand Out Studios. Words and photos are placeholders until you send yours. <a href="#claim">Make it yours →</a></div>
<header><div class="logo">{e(name)}</div><a class="call" href="tel:{tel}">Call {e(phone)}</a></header>
<main>
<div class="hero">
 <div>
  <h1>{e(headline)}</h1>
  <p class="sub">{e(sub)}</p>
  <div class="ctas"><a class="btn primary" href="#quote">{e(t['cta'])}</a><a class="btn" href="tel:{tel}">Call {e(phone)}</a></div>
  <div class="trust">{''.join(f'<span>{x}</span>' for x in trust)}</div>
 </div>
 {IDEAS[t['idea']]}
</div>
<section><h2>What we do.</h2><div class="services">{''.join(f'<div>{e(s)}</div>' for s in services)}</div></section>
<section style="padding-top:0"><h2>Your work goes here.</h2>
 <div class="photos"><div>Your job photos</div><div>Before and after</div><div>Your crew</div><div>Your best job</div><div>Your truck or shop</div><div>A happy customer</div></div></section>
{reviews_html}
<section><h2>How it works.</h2><div class="steps">
 <div><strong>Tell us about the job.</strong><p>Call or send the form. A short note is plenty.</p></div>
 <div><strong>Get a clear price.</strong><p>In writing, before any work starts.</p></div>
 <div><strong>We do the work.</strong><p>On time, cleaned up, and checked with you at the end.</p></div>
</div></section>
<section class="quote" id="quote"><h2>{e(t['cta'])}.</h2>
 <form onsubmit="event.preventDefault();this.querySelector('button').textContent='This is a preview. The live form sends straight to you.'">
  <input placeholder="Name" aria-label="Name"><input placeholder="Phone" aria-label="Phone">
  <textarea placeholder="What do you need done?" aria-label="What do you need done?"></textarea>
  <button>Send</button></form></section>
<section class="claim" id="claim"><h2>Want this to be your website?</h2>
 <p>Stand Out Studios builds it with your own photos and words. One page from $399, up to 5 pages for $799. Live in 7 days.</p>
 <a class="btn primary" href="{DEPOSIT}">Start with a $100 refundable deposit</a>
 <p class="fine">The $100 counts toward your price. If you don't love the finished preview, you get it back. Questions? Email jace.standoutstudios@gmail.com</p>
</section>
</main>
<footer><span>© {e(name)} · {e(city)}, {e(lead.get('state', 'AZ'))}</span><span>Preview by <a href="{CLAIM}">Stand Out Studios</a></span></footer>
<a class="btn primary sticky-call" href="tel:{tel}">Call {e(phone)}</a>
</body></html>"""


def main():
    import os
    leads = json.loads((ROOT / os.environ.get("LEADS", "leads.json")).read_text())
    OUT.mkdir(exist_ok=True)
    rows = []
    for lead in leads:
        lead.setdefault("slug", slugify(lead["name"]))
        d = OUT / lead["slug"]
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(page(lead))
        rows.append(f'<li><a href="{lead["slug"]}/">{e(lead["name"])}</a></li>')
    (OUT / "index.html").write_text(
        '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">'
        f'<title>Previews</title><ul>{"".join(rows)}</ul>')
    (OUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
    print(f"built {len(leads)} previews in {OUT}")


if __name__ == "__main__":
    main()
