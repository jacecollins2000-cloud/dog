"""Pick outreach targets from the website scans, build their mockups, and write messages.
Usage: python3 pick.py [max_forms] [max_emails]
Writes outreach/queue.json (form + email targets) and mockups into $SITE_DIR.
"""
import csv, json, os, pathlib, re, sys, urllib.parse
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / "previews"))
import build  # noqa: E402

ROOT = pathlib.Path(__file__).parent
SITE_DIR = pathlib.Path(os.environ["SITE_DIR"])
BASE = "https://jacecollins2000-cloud.github.io/dog"
NV = {"Las Vegas", "Henderson", "North Las Vegas", "Boulder City"}
CHAINS = re.compile(r"servpro|terminix|orkin|rooter|sears|home depot|lowe'?s|one hour|mister sparky|benjamin franklin|"
    r"molly maid|merry maid|stanley steemer|chem-?dry|trugreen|brightview|mr\.? handyman|mr\.? electric|midas|meineke|"
    r"firestone|goodyear|pep boys|valvoline|big o|discount tire|christian brothers|maaco|safelite|lennox|carrier|trane|"
    r"u-haul|two men|1-800|window genie|weed man|lawn doctor|sir grout|zerorez|oxi fresh|aptive|truly nolen|precision|"
    r"a-1 |abc home|ars |service experts|jiffy|fastsigns|budget|enterprise", re.I)
FREE_HOSTS = ("wixsite.com", "godaddysites.com", "weebly.com", "square.site", "carrd.co", "webnode.com",
              "jimdosite.com", "site123.me", "mystrikingly.com", "yolasite.com", "wordpress.com", "blogspot.com")
SIG = ("Jace, Stand Out Studios\njace.standoutstudios@gmail.com\n"
       "1000 North Green Valley Parkway, Henderson, NV 89074")

FONT_CREDITS = re.compile(r"impallari|anapbm|eyebytes|sansoxygen|typefoundry|sorkin|fuenzalida|cyreal|tipo|fontdiner|"
    r"typemade|huertatipografica|latinotype|sil\.org|googlefonts|fonts?@|type@|@typeco|kimberlygeswein|vernon", re.I)
FREEMAIL = ("gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "cox.net", "msn.com",
            "live.com", "me.com", "att.net", "sbcglobal.net", "comcast.net")

def best_email(emails, domain):
    """Business's own-domain address first, then a free mailbox; never font credits or bogus TLDs."""
    base = ".".join(domain.split(".")[-2:])
    ok = [e for e in emails if not FONT_CREDITS.search(e)
          and re.fullmatch(r"[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|net|org|us|biz|info|co|io|me|pro|services|build|design)", e)]
    own = [e for e in ok if e.split("@")[1].endswith(base)]
    own.sort(key=lambda e: (not re.match(r"(info|contact|office|hello|sales|service|admin)@", e), e))
    free = [e for e in ok if e.split("@")[1] in FREEMAIL]
    return (own or free or [""])[0]

def reason_line(reasons, domain):
    r = reasons.lower()
    year = re.search(r"copyright (\d{4})", r)
    lines = []
    if "not mobile-friendly" in r:
        lines.append(f"I pulled up {domain} on my phone and it shows the full desktop page shrunk down, "
                     "so your phone number is tiny and hard to tap.")
    if year:
        lines.append(f"{'The footer also' if lines else f'The footer on {domain}'} still says © {year.group(1)}, "
                     "and some customers take that to mean the business isn't active anymore.")
    free = re.search(r"free subdomain \(([^)]+)\)", reasons)
    if free and not lines:
        lines.append(f"Your website is on a free {free.group(1).split('.', 1)[1]} address, which can look temporary to customers."
                     "")
    if not lines and "no https" in r:
        lines.append(f'Chrome shows "Not secure" next to {domain}, which makes some customers leave before they read anything.')
    if not lines and "placeholder" in r:
        lines.append(f'{domain} is showing an "under construction" page right now, so people who look you up can\'t see your work.')
    if not lines:
        lines.append(f"{domain} uses an older layout that doesn't fit phones well.")
    return " ".join(lines[:2])

def main():
    max_forms = int(sys.argv[1]) if len(sys.argv) > 1 else 40
    max_emails = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    done = set()
    for name in ("sent_log.csv", "email_log.csv"):
        log = ROOT / name
        if log.exists():
            done |= {r["domain"] for r in csv.DictReader(open(log))}
    for q in ROOT.glob("queue*.json"):  # anything already queued in an earlier batch
        done |= {x["domain"] for x in json.loads(q.read_text())}
    dnc = ROOT / "do_not_contact.txt"
    if dnc.exists():
        done |= set(dnc.read_text().split())
    rows = []
    for f in ["bad_sites_vegas.csv", "bad_sites.csv"]:  # Vegas first: local to Henderson
        p = ROOT.parent / "leads" / f
        if p.exists():
            rows += list(csv.DictReader(open(p)))
    queue, slugs, forms, emails = [], set(), 0, 0
    for r in rows:
        free_site = any(urllib.parse.urlparse(r["final_url"]).netloc.lower().endswith(h) for h in FREE_HOSTS)
        if r["status"] != "ok" or (int(r["score"] or 0) < 3 and not free_site) or not r["name"] or CHAINS.search(r["name"]):
            continue
        domain = urllib.parse.urlparse(r["final_url"]).netloc.lower().removeprefix("www.")
        if not domain or domain in done:
            continue
        email = best_email(r["emails"].split(), urllib.parse.urlparse(r["final_url"]).netloc.lower().removeprefix("www."))
        if "free subdomain" not in r["reasons"] and any(domain.endswith(h) for h in FREE_HOSTS):
            r["reasons"] = (r["reasons"] + "; " if r["reasons"] else "") + f"free subdomain ({domain})"
        # try the site's form whenever there's no CAPTCHA; the browser finds JS-rendered forms too
        form_ok = r["captcha"] != "yes" and (r["form"] == "yes" or r["contact_url"] or not email)
        if not r["contact_url"]:
            r["contact_url"] = r["final_url"]
        if form_ok and forms < max_forms:
            channel = "form"; forms += 1
        elif email and emails < max_emails:
            channel = "email"; emails += 1
        else:
            continue
        slug = build.slugify(r["name"])[:50]
        while slug in slugs:
            slug += "-2"
        slugs.add(slug)
        state = "NV" if r["city"] in NV else "AZ"
        theme = build.TRADE_THEME.get(r["trade"], "handyman")
        lead = {"slug": slug, "name": r["name"], "trade": theme, "city": r["city"], "state": state, "phone": r["phone"]}
        d = SITE_DIR / slug
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(build.page(lead))
        url = f"{BASE}/{slug}/"
        why = reason_line(r["reasons"], domain)
        form_msg = (f"Hi, Jace here. I'm a web designer (Stand Out Studios in Henderson, NV), so this isn't a job request.\n\n"
                    f"{why}\n\nSo I made {r['name']} a free mockup of a phone-friendly homepage. You can see it here:\n{url}\n\n"
                    "If you like it, I can turn it into your real site. Prices start at $399 and it's live in 7 days. "
                    "If not, no worries at all. Just reply to jace.standoutstudios@gmail.com.\n\n" + SIG)
        short = re.sub(r"\b(llc|inc|co|corp|company)\b\.?", "", r["name"], flags=re.I).strip(" ,.-")
        email_body = (f"Hi,\n\n{why}\n\nI'm a web designer in Henderson, and I made {short} a free mockup of a phone-friendly "
                      "homepage, with your services up top and a one-tap call button.\n\nWant me to send you the link?\n\n"
                      + SIG + '\nReply "no" and I won\'t email again.')
        queue.append(dict(lead, channel=channel, domain=domain, website=r["final_url"], contact_url=r["contact_url"],
                          email=email, reasons=r["reasons"], preview_url=url, form_message=form_msg,
                          email_subject=f"{short} on phones", email_body=email_body))
    (ROOT / os.environ.get("QUEUE_OUT", "queue.json")).write_text(json.dumps(queue, indent=1))
    print(f"queued {forms} forms, {emails} emails")

if __name__ == "__main__":
    main()
