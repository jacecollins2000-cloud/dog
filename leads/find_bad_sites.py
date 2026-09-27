"""Find local businesses whose website is outdated/broken, with a way to reach them.
Step 1: Yellow Pages listings that HAVE a website.
Step 2: fetch each site, score how dated it is, pull emails + contact form.
Usage: python3 find_bad_sites.py  -> writes bad_sites.csv (sorted, worst first)
"""
import os
import concurrent.futures as cf, csv, html, re, ssl, sys, time, urllib.parse, urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
TRADES = ["roofing", "landscaping", "painting contractors", "house cleaning", "carpet cleaning",
          "pool service", "pressure washing", "handyman", "flooring", "remodeling contractors",
          "plumbers", "electricians", "garage doors", "pest control", "auto repair", "auto detailing",
          "tree service", "concrete contractors", "fence contractors", "cabinet makers",
          "glass repair", "hvac", "dog grooming", "appliance repair"]
import os
CITIES = os.environ["CITIES"].split("|") if os.environ.get("CITIES") else ["Mesa, AZ", "Gilbert, AZ", "Chandler, AZ", "Scottsdale, AZ", "Phoenix, AZ",
          "Tempe, AZ", "Glendale, AZ", "Peoria, AZ", "Tucson, AZ"]
TRADES = os.environ["TRADES"].split("|") if os.environ.get("TRADES") else TRADES
FREE_HOSTS = ("wixsite.com", "godaddysites.com", "weebly.com", "square.site", "business.site", "carrd.co",
              "webnode.com", "jimdosite.com", "site123.me", "mystrikingly.com", "yolasite.com", "wordpress.com", "blogspot.com")
SKIP_HOSTS = ("yellowpages.com", "facebook.com", "yelp.com", "google.com", "instagram.com",
              "angi.com", "homeadvisor.com", "bbb.org", "nextdoor.com", "thumbtack.com", "houzz.com")
BAD_EMAIL = re.compile(r"(\.png|\.jpg|\.gif|\.webp|example\.|sentry|wixpress|godaddy|domain\.com|email\.com|yourname|@2x)", re.I)

def get(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        return r.geturl(), r.read(600_000).decode("utf-8", "ignore")

def field(block, pat):
    m = re.search(pat, block, re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", m.group(1))).strip() if m else ""

def yp_listings():
    out, seen = [], set()
    for trade in TRADES:
        for city in CITIES:
            q = urllib.parse.urlencode({"search_terms": trade, "geo_location_terms": city})
            try:
                _, s = get("https://www.yellowpages.com/search?" + q, 25)
            except Exception as e:
                print("yp skip", trade, city, e, file=sys.stderr); continue
            for b in s.split('<div class="result"')[1:]:
                m = re.search(r'class="track-visit-website" href="([^"]+)"', b)
                if not m:
                    continue
                site = html.unescape(m.group(1))
                host = urllib.parse.urlparse(site).netloc.lower().removeprefix("www.")
                if not host or any(h in host for h in SKIP_HOSTS) or host in seen:
                    continue
                seen.add(host)
                out.append({"trade": trade, "city": city.split(",")[0],
                            "name": field(b, r'class="business-name"[^>]*><span>(.*?)</span>'),
                            "phone": field(b, r'class="phones phone primary">(.*?)</div>'),
                            "years_in_business": field(b, r'class="number">(\d+)</div>'),
                            "website": site})
            time.sleep(0.8)
        print(f"{trade}: {len(out)} sites", file=sys.stderr)
    return out

FREE = ("gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "cox.net", "msn.com",
        "live.com", "me.com", "att.net", "sbcglobal.net", "comcast.net", "centurylink.net", "earthlink.net")
# Font designers credited in the Google Fonts licenses that site builders (GoDaddy's especially) inline
FONT_CREDIT_EMAILS = {"impallari@gmail.com", "anapbm@gmail.com", "team@latofonts.com", "eben@eyebytes.com",
                      "contact@sansoxygen.com", "julieta.ulanovsky@gmail.com"}
FONT_LICENSE = re.compile(r"copyright\b[^<>]{0,300}?(?:project authors\s*\([^()<>]*\)|reserved font names?\b|"
                          r"sorkin type[^()<>]*\([^()<>]*\))", re.I)
with open(os.path.join(os.path.dirname(__file__), "tlds.txt")) as f:  # data.iana.org/TLD/tlds-alpha-by-domain.txt
    TLDS = {t.strip().lower() for t in f if not t.startswith("#")} - {""}
ROLE = re.compile(r"(info|contact|office|hello|sales|service|admin)@")

def valid_email(e):
    """Sane syntax and a real TLD (w@yjx.ko isn't), and not an image name or a font designer's credit."""
    m = re.fullmatch(r"[a-z0-9._%+-]+@(?:[a-z0-9-]+\.)+([a-z]{2,})", e)
    return bool(m) and m.group(1) in TLDS and e not in FONT_CREDIT_EMAILS and not BAD_EMAIL.search(e)

def own_emails(emails, site, mailto=()):
    """The business's addresses, best first: its own domain, then any it links with mailto: (even on
    another domain, like a short one it uses for mail), then free mailboxes."""
    host = (urllib.parse.urlparse(site).netloc or site).lower().removeprefix("www.")
    base = ".".join(host.split(".")[-2:])
    def tier(e):
        dom = e.split("@")[-1]
        return 0 if dom == base or dom.endswith("." + base) else 1 if e in mailto else 2 if dom in FREE else 3
    keep = {e for e in emails if tier(e) < 3 and valid_email(e)}
    return sorted(keep, key=lambda e: (tier(e), not ROLE.match(e), e))

def emails_in(s, mailto_only=False):
    """Addresses on the page, lowercased: all of them, or only those in mailto: links.
    <style> blocks, @font-face rules and font licenses go first: their designer credits
    ("Copyright 2016 The Cabin Project Authors (impallari@gmail.com)") aren't contact addresses."""
    s = re.sub(r"<style\b.*?</style\s*>", " ", s, flags=re.I | re.S)
    s = FONT_LICENSE.sub(" ", re.sub(r"@font-face\s*\{[^}]*\}", " ", s, flags=re.I))
    found = re.findall(r"mailto:([^\"'?>\s]+)", s, re.I)
    if not mailto_only:
        found += re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", s)
    return sorted({e for e in (html.unescape(x).strip().lower() for x in found) if valid_email(e)})

def has_form(s):
    return bool(re.search(r"<form", s, re.I) and re.search(r"<textarea", s, re.I))

def captcha(s):
    return bool(re.search(r"recaptcha|hcaptcha|turnstile|captcha", s, re.I))

def check(lead):
    r = dict(lead, final_url="", status="", score=0, reasons="", emails="", mailto="", contact_url="", form="", captcha="")
    url = re.sub(r"^http://", "https://", lead["website"])
    try:
        final, s = get(url)
    except Exception as e:
        r["status"] = "dead"; r["score"] = 5; r["reasons"] = f"site down ({type(e).__name__})"
        return r
    r["final_url"], r["status"] = final, "ok"
    reasons, score = [], 0
    low = s.lower()
    if 'name="viewport"' not in low and "name=viewport" not in low and "name='viewport'" not in low:
        score += 3; reasons.append("not mobile-friendly (no viewport)")
    years = [int(y) for y in re.findall(r"(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d{2})", low)]
    if years:
        y = max(years)
        if y <= 2016: score += 3; reasons.append(f"copyright {y}")
        elif y <= 2021: score += 2; reasons.append(f"copyright {y}")
    fh = urllib.parse.urlparse(final).netloc.lower()
    if any(fh.endswith(h) for h in FREE_HOSTS):
        score += 3; reasons.append(f"free subdomain ({fh})")
    if final.startswith("http://"):
        score += 1; reasons.append("no https (Not Secure)")
    if re.search(r"under construction|coming soon|website builder|this domain|parked", low) and len(low) < 40000:
        score += 2; reasons.append("placeholder/parked")
    gen = re.search(r'<meta name="generator" content="([^"]+)"', s, re.I)
    if gen and re.search(r"frontpage|dreamweaver|web\.com|homestead|yola|sitey|website builder|intuit|iweb", gen.group(1), re.I):
        score += 2; reasons.append(f"built with {gen.group(1)[:30]}")
    if low.count("<table") >= 5 or "<frameset" in low or ".swf" in low:
        score += 1; reasons.append("tables/flash layout")
    emails, mailto = emails_in(s), set(emails_in(s, mailto_only=True))
    form, cap, contact_url = has_form(s), captcha(s), ""
    if not form or not emails:
        m = re.search(r'href="([^"]*contact[^"]*)"', s, re.I)
        if m:
            contact_url = urllib.parse.urljoin(final, html.unescape(m.group(1)))
            try:
                _, c = get(contact_url)
                emails = sorted(set(emails) | set(emails_in(c)))
                mailto |= set(emails_in(c, mailto_only=True))
                if has_form(c):
                    form, cap = True, captcha(c)
            except Exception:
                pass
    emails = own_emails(emails, final, mailto)[:3]
    r.update(score=score, reasons="; ".join(reasons), emails=" ".join(emails),
             mailto=" ".join(e for e in emails if e in mailto),
             contact_url=contact_url or (final if form else ""), form="yes" if form else "",
             captcha="yes" if cap else "")
    return r

if __name__ == "__main__":
    if os.environ.get("RECHECK"):
        keep = ["trade", "city", "name", "phone", "years_in_business", "website"]
        leads = [{k: x[k] for k in keep} for x in csv.DictReader(open(os.environ["RECHECK"]))]
    else:
        leads = yp_listings()
    print(f"checking {len(leads)} websites", file=sys.stderr)
    with cf.ThreadPoolExecutor(16) as ex:
        rows = list(ex.map(check, leads))
    rows.sort(key=lambda x: -x["score"])
    with open(os.environ.get("OUT", "bad_sites.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader(); w.writerows(rows)
    good = [x for x in rows if x["score"] >= 3 and (x["emails"] or (x["form"] and not x["captcha"]))]
    print(f"done: {len(rows)} sites, {len(good)} dated + reachable", file=sys.stderr)
