#!/bin/bash
# Publish mockups in $SITE_DIR (a checkout of the gh-pages branch) to GitHub Pages,
# then wait until the newest one is live.
set -e
cd "$SITE_DIR"
printf '<!doctype html><meta http-equiv="refresh" content="0;url=https://stand-out-studios.pages.dev/"><title>Stand Out Studios</title>' > index.html
git add -A
git -c user.name="Stand Out Studios" -c user.email="jace.standoutstudios@gmail.com" commit -qm "Add homepage mockups

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TcfoaWf52FzsGdVZH3u381" || true
git push -q origin gh-pages
last=$(git log -1 --name-only --format= | grep '/index.html' | tail -1 | cut -d/ -f1)
[ -z "$last" ] && exit 0
for i in $(seq 1 30); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' "https://jacecollins2000-cloud.github.io/dog/$last/")" = 200 ] && { echo "live: $last"; exit 0; }
  sleep 10
done
echo "not live yet: $last"; exit 1
