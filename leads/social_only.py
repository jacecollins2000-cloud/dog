"""Yellow Pages listings whose only 'website' is an Instagram or Facebook page.
Usage: CITIES="..." TRADES="..." python3 social_only.py > social_only.csv"""
import csv, html, os, re, sys, time, urllib.parse, urllib.request
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
CITIES = os.environ["CITIES"].split("|"); TRADES = os.environ["TRADES"].split("|")
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=25).read().decode("utf-8", "ignore")
def field(b, pat):
    m = re.search(pat, b, re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", m.group(1))).strip() if m else ""
rows, seen = [], set()
for trade in TRADES:
    for city in CITIES:
        for page in (1, 2):
            try:
                s = get("https://www.yellowpages.com/search?" + urllib.parse.urlencode({"search_terms": trade, "geo_location_terms": city, "page": page}))
            except Exception as e:
                print("skip", trade, city, e, file=sys.stderr); continue
            for b in s.split('<div class="result"')[1:]:
                m = re.search(r'class="track-visit-website" href="([^"]+)"', b)
                if not m:
                    continue
                site = html.unescape(m.group(1))
                if not re.search(r"instagram\.com|facebook\.com", site, re.I):
                    continue
                name = field(b, r'class="business-name"[^>]*><span>(.*?)</span>')
                if not name or name in seen:
                    continue
                seen.add(name)
                rows.append({"trade": trade, "city": city.split(",")[0], "state": city.split(",")[1].strip(), "name": name,
                             "phone": field(b, r'class="phones phone primary">(.*?)</div>'), "social": site})
            time.sleep(0.8)
    print(trade, len(rows), file=sys.stderr)
w = csv.DictWriter(sys.stdout, fieldnames=["trade", "city", "state", "name", "phone", "social"]); w.writeheader(); w.writerows(rows)
