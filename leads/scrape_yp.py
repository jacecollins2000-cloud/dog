"""Pull local businesses with NO website from Yellow Pages search results.
Usage: python3 scrape_yp.py > leads.csv
"""
import csv, html, re, sys, time, urllib.parse, urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
TRADES = ["roofing", "landscaping", "cabinet makers", "house cleaning", "dog grooming",
          "glass repair", "tree service", "pressure washing", "painting contractors",
          "fence contractors", "concrete contractors", "handyman", "pool service", "hvac"]
CITIES = ["Mesa, AZ", "Gilbert, AZ", "Chandler, AZ", "Scottsdale, AZ", "Phoenix, AZ", "Tempe, AZ"]
PAGES = 2

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=25).read().decode("utf-8", "ignore")

def field(block, pat):
    m = re.search(pat, block, re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", m.group(1))).strip() if m else ""

seen, rows = set(), []
for trade in TRADES:
    for city in CITIES:
        for page in range(1, PAGES + 1):
            q = urllib.parse.urlencode({"search_terms": trade, "geo_location_terms": city, "page": page})
            try:
                s = get("https://www.yellowpages.com/search?" + q)
            except Exception as e:
                print(f"skip {trade}/{city}/{page}: {e}", file=sys.stderr); continue
            blocks = s.split('<div class="result"')[1:]
            for b in blocks:
                if "track-visit-website" in b:
                    continue  # already has a website
                name = field(b, r'class="business-name"[^>]*><span>(.*?)</span>')
                phone = field(b, r'class="phones phone primary">(.*?)</div>')
                if not name or not phone or (name, phone) in seen:
                    continue
                seen.add((name, phone))
                rows.append({
                    "trade": trade, "search_city": city, "name": name, "phone": phone,
                    "street": field(b, r'class="street-address">(.*?)</div>'),
                    "locality": field(b, r'class="locality">(.*?)</div>'),
                    "years_in_business": field(b, r'class="number">(\d+)</div>'),
                    "yp_reviews": field(b, r'class="count">\((\d+)\)</span>'),
                    "yp_url": "https://www.yellowpages.com" + field(b, r'class="business-name" href="([^"?]+)'),
                })
            time.sleep(1.0)
        print(f"{trade}: {len(rows)} total", file=sys.stderr)

w = csv.DictWriter(sys.stdout, fieldnames=list(rows[0].keys()))
w.writeheader(); w.writerows(rows)
