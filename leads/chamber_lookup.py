"""Find websites + contact emails for new Henderson Chamber members, then score their sites.
Input: outreach/chamber_new.json  Output: leads/chamber_sites.csv"""
import base64, csv, html, json, re, sys, time, urllib.parse, urllib.request, concurrent.futures as cf
sys.path.insert(0, "/home/user/dog/leads")
import find_bad_sites as fbs  # noqa: E402

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
DIRS = re.compile(r"yelp|facebook|instagram|linkedin|bbb\.org|yellowpages|mapquest|chamber|google|bing|youtube|"
                  r"angi|homeadvisor|thumbtack|nextdoor|houzz|manta|zoominfo|bizapedia|opencorporates|indeed|"
                  r"glassdoor|tiktok|twitter|x\.com|pinterest|apple\.com|wikipedia|reddit|birdeye|porch|buildzoom", re.I)
STOP = {"llc", "inc", "the", "of", "and", "las", "vegas", "henderson", "nv", "co", "company", "services", "service",
        "group", "ltd", "dmd", "greater", "nevada", "at", "by", "&"}

def bing(q):
    req = urllib.request.Request("https://www.bing.com/search?q=" + urllib.parse.quote(q), headers={"User-Agent": UA})
    s = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
    out = []
    for u in re.findall(r'<h2[^>]*><a[^>]+href="([^"]+)"', s):
        u = html.unescape(u)
        m = re.search(r"[?&]u=a1([^&]+)", u)
        if m:
            b = m.group(1); b += "=" * (-len(b) % 4)
            try: u = base64.urlsafe_b64decode(b).decode()
            except Exception: continue
        out.append(u)
    return out

def pick(business, urls):
    toks = [t for t in re.findall(r"[a-z0-9]+", business.lower()) if t not in STOP and len(t) > 2]
    for u in urls:
        host = urllib.parse.urlparse(u).netloc.lower().removeprefix("www.")
        if not host or DIRS.search(host):
            continue
        squashed = re.sub(r"[^a-z0-9]", "", host.split(".")[0])
        # strict: the first two distinctive words together (or the only word + nothing unrelated) must be in the domain
        key = "".join(toks[:2]) if len(toks) >= 2 else (toks[0] if toks else "")
        if key and len(key) >= 6 and key in squashed and len(squashed) <= len(key) + 12:
            return "https://" + host
    return ""

def run(m):
    try:
        site = pick(m["business"], bing(f'"{m["business"]}" Henderson OR "Las Vegas"'))
    except Exception:
        site = ""
    time.sleep(1)
    r = {"trade": "", "city": "Henderson", "name": m["business"], "phone": "", "years_in_business": "",
         "website": site, "contact": m["contact"]}
    if not site:
        return dict(r, status="no site found")
    c = fbs.check(r)
    c["contact"] = m["contact"]
    return c

if __name__ == "__main__":
    members = json.load(open("/home/user/dog/outreach/chamber_new.json"))
    with cf.ThreadPoolExecutor(4) as ex:
        rows = list(ex.map(run, members))
    keys = sorted({k for r in rows for k in r})
    with open("/home/user/dog/leads/chamber_sites.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys); w.writeheader(); w.writerows(rows)
    found = [r for r in rows if r.get("website")]
    print(f"{len(rows)} members, {len(found)} sites found, "
          f"{sum(1 for r in found if r.get('emails'))} with email, "
          f"{sum(1 for r in found if int(r.get('score') or 0) >= 2)} dated (score>=2)")
