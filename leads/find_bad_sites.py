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

def own_emails(emails, site):
    host = urllib.parse.urlparse(site).netloc.lower().removeprefix("www.")
    base = ".".join(host.split(".")[-2:])
    return [e for e in emails if e.split("@")[-1] in FREE or e.split("@")[-1].endswith(base)]

def emails_in(s):
    found = set(re.findall(r"mailto:([^\"'?>\s]+)", s, re.I))
    found |= set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", s))
    return sorted({html.unescape(e).strip().lower() for e in found if not BAD_EMAIL.search(e)})

def has_form(s):
    return bool(re.search(r"<form", s, re.I) and re.search(r"<textarea", s, re.I))

def captcha(s):
    return bool(re.search(r"recaptcha|hcaptcha|turnstile|captcha", s, re.I))

def check(lead):
    r = dict(lead, final_url="", status="", score=0, reasons="", emails="", contact_url="", form="", captcha="")
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
    emails = emails_in(s)
    form, cap, contact_url = has_form(s), captcha(s), ""
    if not form or not emails:
        m = re.search(r'href="([^"]*contact[^"]*)"', s, re.I)
        if m:
            contact_url = urllib.parse.urljoin(final, html.unescape(m.group(1)))
            try:
                _, c = get(contact_url)
                emails = sorted(set(emails) | set(emails_in(c)))
                if has_form(c):
                    form, cap = True, captcha(c)
            except Exception:
                pass
    emails = own_emails(emails, final)
    r.update(score=score, reasons="; ".join(reasons), emails=" ".join(emails[:3]),
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
