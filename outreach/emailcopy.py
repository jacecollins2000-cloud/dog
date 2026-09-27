"""Email copy for first-touch outreach. One job: get a reply ("yes, send it").
Subject reads like a gift, the opener is about what happened when we looked at THEIR site,
one line on what that costs them, then a yes/no question. No links, no price."""
import re

PLURAL = {
    "painting": "painters", "cleaning": "cleaning companies", "landscaping": "landscapers",
    "stone": "stone and concrete contractors", "roofing": "roofers", "glass": "glass shops", "grooming": "groomers",
    "pressure washing": "pressure washing companies", "hvac": "HVAC companies", "gates": "fence companies",
    "pool": "pool services", "plumbing": "plumbers", "electrical": "electricians", "flooring": "flooring companies",
    "remodeling": "remodelers", "handyman": "handymen", "auto detailing": "detailers", "auto repair": "auto shops",
    "garage doors": "garage door companies", "pest control": "pest control companies",
    "appliance repair": "appliance repair shops", "cabinets": "cabinet makers", "barber": "barbershops",
    "salon": "salons", "nails": "nail salons", "spa": "spas", "restaurant": "restaurants", "cafe": "coffee shops",
    "bakery": "bakeries", "florist": "florists", "tattoo": "tattoo studios", "boutique": "boutiques",
}
FOOTER = ("Jace\nStand Out Studios, Henderson NV\n\n"
          "1000 North Green Valley Parkway, Henderson, NV 89074. "
          'Not interested? Reply "no" and I won\'t email again.')


def short_name(name):
    s = re.sub(r"\b(llc|inc|co|corp|company|ltd)\b\.?", "", name, flags=re.I)
    return re.sub(r"\s+", " ", s).strip(" ,.-&")


def compose(lead, first_name="", variant="A"):
    """lead needs: name, domain, reasons, city, trade (theme key). Returns (subject, body)."""
    biz = short_name(lead["name"])
    domain, r = lead["domain"], lead["reasons"].lower()
    who = PLURAL.get(lead.get("trade", ""), "local businesses")
    year = re.search(r"copyright (\d{4})", r)
    free = re.search(r"free subdomain \(([^)]+)\)", r)
    hi = f"Hi {first_name}," if first_name else "Hi,"
    intro = f"I came across {biz} while looking at {who} in {lead['city']}."
    if "not mobile-friendly" in r:
        problem = (f"On my phone, {domain} loads the full desktop page, so I had to pinch and zoom just to find your "
                   "number. A lot of people won't bother. They'll call the next company on the list.")
        fix = "So I made you a new homepage that works on phones, with your number one tap away and your services up top."
    elif free:
        problem = (f"Your site is on a free {free.group(1).split('.', 1)[1]} address, which can make a solid business "
                   "look temporary. People comparing companies online usually call the one that looks established.")
        fix = "So I made you a new homepage that looks as established as you are, with your number one tap away."
    elif "placeholder" in r:
        problem = (f"{domain} is showing an \"under construction\" page, so anyone who looks you up can't see your work "
                   "and moves on to the next company.")
        fix = "So I made you a finished homepage, with your services up top and your number one tap away."
    elif year:
        problem = (f"The bottom of {domain} still says © {year.group(1)}, which makes it look like the site hasn't been "
                   "touched in years. People comparing companies online usually call the one that looks current.")
        fix = "So I made you a new homepage with a fresh look, your services up top and your number one tap away."
    else:
        problem = (f"{domain} is built on an older layout that's hard to use on a phone, and most people look you up on "
                   "their phone first.")
        fix = "So I made you a new homepage that works on phones, with your number one tap away."
    proof = ("\n\nYou can see the kind of sites I design here: stand-out-studios.pages.dev" if variant == "B" else "")
    ask = "Want me to send you yours?" if variant == "B" else "Want me to send you the link?"
    body = f"{hi}\n\n{intro} {problem}\n\n{fix} No charge.{proof}\n\n{ask}\n\n{FOOTER}"
    subject = f"I made {biz} a new homepage"
    if len(subject) > 60:
        subject = "I made you a new homepage"
    return subject, body
