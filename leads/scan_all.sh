#!/bin/bash
# Scan remaining US metros in batches of ~20 cities, one output CSV per batch.
cd "$(dirname "$0")"
TRADES="painting contractors|roofing|landscaping|plumbers|electricians|flooring|remodeling contractors|fence contractors|concrete contractors|garage doors|carpet cleaning|pool service|handyman|auto repair|glass repair|cabinet makers|tree service|pest control|house cleaning|pressure washing"
BATCHES=(
"Houston, TX|Dallas, TX|Austin, TX|Arlington, TX|Plano, TX|Corpus Christi, TX|Laredo, TX|Killeen, TX|McAllen, TX|Brownsville, TX|Abilene, TX|Wichita Falls, TX|San Angelo, TX|College Station, TX|Temple, TX|Denton, TX|Frisco, TX|McKinney, TX|Round Rock, TX|New Braunfels, TX"
"Atlanta, GA|Charlotte, NC|Nashville, TN|Orlando, FL|Miami, FL|Fort Lauderdale, FL|West Palm Beach, FL|Port St Lucie, FL|Cape Coral, FL|Clearwater, FL|St Petersburg, FL|Melbourne, FL|Palm Bay, FL|Durham, NC|Greensboro, NC|Winston-Salem, NC|Fayetteville, NC|Virginia Beach, VA|Norfolk, VA|Chesapeake, VA"
"Chicago, IL|Detroit, MI|Milwaukee, WI|Minneapolis, MN|St Paul, MN|Cleveland, OH|Cincinnati, OH|Pittsburgh, PA|Philadelphia, PA|Baltimore, MD|Newark, NJ|Jersey City, NJ|Providence, RI|Hartford, CT|New Haven, CT|Worcester, MA|Springfield, MA|Manchester, NH|Portland, ME|Burlington, VT"
"Los Angeles, CA|San Diego, CA|San Jose, CA|San Francisco, CA|Oakland, CA|Long Beach, CA|Anaheim, CA|Santa Ana, CA|Irvine, CA|Chula Vista, CA|Oxnard, CA|Santa Rosa, CA|Salinas, CA|Ontario, CA|Rancho Cucamonga, CA|Temecula, CA|Palm Springs, CA|Seattle, WA|Tacoma, WA|Portland, OR"
)
i=5
for b in "${BATCHES[@]}"; do
  CITIES="$b" TRADES="$TRADES" OUT="bad_sites_more$i.csv" python3 find_bad_sites.py > "find_bad_sites_more$i.log" 2>&1
  echo "batch $i done: $(tail -1 find_bad_sites_more$i.log)" >> scan_all.log
  i=$((i+1))
done
echo "all batches done" >> scan_all.log
