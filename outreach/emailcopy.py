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
# First match wins: carpet and window cleaners before flooring and glass, generic cleaning last.
NAME_HINTS = [(r"plumb|drain|rooter", "plumbers"), (r"carpet|steam|upholster", "carpet cleaners"), (r"window.*clean", "window cleaners"),
              (r"electric", "electricians"), (r"roof", "roofers"), (r"paint", "painters"),
              (r"landscap|lawn|yard", "landscapers"), (r"tree", "tree services"), (r"pool|spa\b", "pool services"),
              (r"fenc", "fence companies"), (r"concrete|cement|masonry", "concrete contractors"),
              (r"garage door", "garage door companies"), (r"pest|termite", "pest control companies"),
              (r"glass|window|mirror", "glass shops"), (r"floor|tile|carpet", "flooring companies"),
              (r"hvac|heating|cooling|air cond", "HVAC companies"), (r"handyman", "handymen"),
              (r"remodel|construct|builder|renovat", "contractors"), (r"auto|car |cars|collision|mechanic", "auto shops"),
              (r"cabinet", "cabinet makers"), (r"appliance", "appliance repair shops"), (r"pressure|power wash", "pressure washing companies"),
              (r"clean|maid|janitor", "cleaning companies")]
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
    for pat, noun in NAME_HINTS:
        if re.search(pat, lead["name"], re.I):
            who = noun
            break
    year = re.search(r"copyright (\d{4})", r)
    free = re.search(r"free subdomain \(([^)]+)\)", r)
    hi = f"Hi {first_name}," if first_name else "Hi,"
    intro = f"I came across {biz} while looking at {who} in {lead['city']}."
    if "not mobile-friendly" in r:
        problem = ("On my phone, your website loads the full desktop page, so I had to pinch and zoom just to find your "
                   "number. A lot of people won't bother. They'll call the next company on the list.")
        fix = "So I made you a new homepage that works on phones, with your number one tap away and your services up top."
    elif free:
        builder = free.group(1).split('.', 1)[1].split('.')[0].replace("wixsite", "Wix").replace("godaddysites", "GoDaddy").capitalize()
        problem = (f"Your website is on a free {builder} address, which can make a solid business "
                   "look temporary. People comparing companies online usually call the one that looks established.")
        fix = "So I made you a new homepage that looks as established as you are, with your number one tap away."
    elif "placeholder" in r:
        problem = ("Your website is showing an \"under construction\" page, so anyone who looks you up can't see your work "
                   "and moves on to the next company.")
        fix = "So I made you a finished homepage, with your services up top and your number one tap away."
    elif year:
        problem = (f"The bottom of your website still says © {year.group(1)}, which makes it look like the site hasn't been "
                   "touched in years. People comparing companies online usually call the one that looks current.")
        fix = "So I made you a new homepage with a fresh look, your services up top and your number one tap away."
    else:
        problem = ("Your website is built on an older layout that's hard to use on a phone, and most people look you up on "
                   "their phone first.")
        fix = "So I made you a new homepage that works on phones, with your number one tap away."
    proof, ask = "", "Want me to send you the link?"  # no links: the Gmail connector mangles them
    body = f"{hi}\n\n{intro} {problem}\n\n{fix} No charge.{proof}\n\n{ask}\n\n{FOOTER}"
    subject = f"I made {biz} a new homepage"
    if len(subject) > 60:
        subject = "I made you a new homepage"
    return subject, body
