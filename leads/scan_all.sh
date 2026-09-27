#!/bin/bash
# Scan remaining US metros in batches of ~20 cities, one output CSV per batch.
cd "$(dirname "$0")"
TRADES="painting contractors|roofing|landscaping|plumbers|electricians|flooring|remodeling contractors|fence contractors|concrete contractors|garage doors|carpet cleaning|pool service|handyman|auto repair|glass repair|cabinet makers|tree service|pest control|house cleaning|pressure washing"
BATCHES=(
"Boston, MA|Lowell, MA|Brockton, MA|Stamford, CT|Bridgeport, CT|Waterbury, CT|Trenton, NJ|Toms River, NJ|Wilmington, DE|Dover, DE|Frederick, MD|Hagerstown, MD|Lancaster, PA|York, PA|Reading, PA|Erie, PA|Utica, NY|Binghamton, NY|Poughkeepsie, NY|Long Island, NY"
"Columbus, GA|Albany, GA|Valdosta, GA|Athens, GA|Spartanburg, SC|Myrtle Beach, SC|Florence, SC|Hickory, NC|Rocky Mount, NC|Lynchburg, VA|Charlottesville, VA|Bristol, TN|Johnson City, TN|Clarksville, TN|Murfreesboro, TN|Bowling Green, KY|Owensboro, KY|Huntington, WV|Charleston, WV|Morgantown, WV"
"Lafayette, LA|Lake Charles, LA|Monroe, LA|Alexandria, LA|Gulfport, MS|Hattiesburg, MS|Tupelo, MS|Dothan, AL|Tuscaloosa, AL|Auburn, AL|Fort Smith, AR|Fayetteville, AR|Jonesboro, AR|Joplin, MO|Columbia, MO|Topeka, KS|Lawrence, KS|Lincoln, NE|Grand Island, NE|Rapid City, SD"
"Green Bay, WI|Appleton, WI|Eau Claire, WI|La Crosse, WI|Rochester, MN|Duluth, MN|St Cloud, MN|Davenport, IA|Waterloo, IA|Sioux City, IA|Champaign, IL|Springfield, IL|Bloomington, IL|Decatur, IL|Terre Haute, IN|Muncie, IN|Lafayette, IN|Saginaw, MI|Traverse City, MI|Muskegon, MI"
)
i=9
for b in "${BATCHES[@]}"; do
  CITIES="$b" TRADES="$TRADES" OUT="bad_sites_more$i.csv" python3 find_bad_sites.py > "find_bad_sites_more$i.log" 2>&1
  echo "batch $i done: $(tail -1 find_bad_sites_more$i.log)" >> scan_all.log
  i=$((i+1))
done
echo "all batches done" >> scan_all.log
