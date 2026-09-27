# Stand Out Studios: cold outreach playbook

Goal: $100 preview deposits from local businesses with no website or a bad one.
Leads: `leads/verified_leads.csv` (A-list first). Previews: `previews/site/<slug>/`.

## Why this converts
1. **Show, don't pitch.** Each lead gets a homepage with *their* name, phone and trade before you ever talk. People reply to things made for them.
2. **Ask for a reply first, money second.** A cold stranger won't pay $100 from message #1. The first ask is "Want me to finish it?" Everyone who says yes gets the deposit link.
3. **Call first.** Tradespeople answer phones and ignore email. A call plus a text link beats 50 emails.
4. **Speed.** Reply within 5 minutes during work hours. Most deals are lost to slow replies.

## Daily routine (about 1 hour, aim for 15 contacts)
Call between 7–9am or 4–6pm, when owners are driving between jobs, not on a roof.

### 1. Call (30 seconds)
> "Hey, is this [Owner/Business]? This is Jace, I'm a web designer here in the Valley. Real quick: I noticed [Business] doesn't have a website, so people searching '[trade] near me' end up at whoever does. I already built you a homepage mockup. Can I text you the link? No charge to look."

- **Yes** → text the link (below) while you're still on the phone. Ask: "Open it, what do you think?"
- **"How much?"** → "One page is $399, most people do the $799 five-page. To start, it's a $100 deposit that counts toward the price, and if you don't love the finished preview you get it back."
- **"Not interested"** → "No problem. Mind if I text the link anyway? It's already made." (Most say fine.)
- **"I get work from word of mouth"** → "That's the best kind. When someone refers you, the first thing they do is Google you. Right now they find nothing, or a competitor."
- **"I'm too busy"** → "Perfect time for a site then. It answers the 'how much / do you do X' calls for you. It takes 10 minutes of your time. I do the rest."
- **"Send me info"** → text the link, then follow up in 2 days.

### 2. Text (after the call, or instead of it)
> Hi, it's Jace with Stand Out Studios. I built a homepage for [Business] so you can see what customers would see: [preview link]
> If you like it, I'll finish it with your photos, live in 7 days. Want it?

### 3. Voicemail
> "Hey, Jace here. I built [Business] a free website mockup. I'm texting you the link now. Take a look when you're off the job."

### 4. Email / Facebook DM (when there's no phone answer, or as a second touch)
Subject: `I made [Business] a homepage`
> Hi [Name],
>
> I noticed [Business] has no website [or: "your site hasn't been updated in a while"], so people searching for a [trade] in [City] find your competitors instead. So I built you a homepage: [preview link]
>
> If you like it, I'll finish it with your real photos and have it live in 7 days. Sites start at $399.
>
> Want it? Just reply "yes."
>
> Jace, Stand Out Studios
> [your mailing address] · Reply "stop" and I won't email again.

(Email must include your address and an opt-out. That's CAN-SPAM. Text and call business numbers one at a time, by hand. Don't use auto-dialers or bulk text tools.)

## When they say yes → get the deposit the same day
> "Awesome. Here's how we start: fill out this quick form, it takes 2 minutes: https://stand-out-studios.pages.dev/start/
> After the form it takes you to the $100 deposit. That counts toward your price, and it's refundable if you don't love the final preview. I'll have your full preview with your photos in 48 hours."

If they stall 24h: "Hey [Name], I'm holding a spot for [Business] this week. Still want it?"

## Follow-ups (most sales happen here)
- Day 0: call + text
- Day 2: "Did you get a chance to look? [link]"
- Day 5: a Loom video (45s) scrolling their preview: "Here's yours, [Name]."
- Day 10: "Last one from me. Should I pass the design to someone else, or keep it for you?"

## Track it
Add columns to the lead CSV: `contacted, reply, preview_opened, yes, deposit_paid`.
Numbers to beat: 15 contacts a day → 3–4 conversations → 1 yes every 1–2 days.

## Organic content (post daily, 15 min)
Every preview you build is a post. Screen-record it on your phone:
- "I built a website for a Mesa roofer who doesn't have one. Here's what it'd look like." (Blur/skip their phone.)
- "118° outside, 72° inside. An A/C company homepage in 30 seconds."
- End with: "Own a business in the Valley with no website? Comment your trade. I'll build you a preview free."
Post on TikTok, Instagram Reels and Facebook Reels, plus local groups ("Mesa Business Network", "Gilbert Small Business", "East Valley Contractors").
Everyone who comments gets a preview → straight into the call/text flow above.

## Adding more leads
`python3 leads/scrape_yp.py > leads/yp_no_website.csv` (edit TRADES/CITIES at the top).
Then add the best ones to `previews/leads.json` and run `python3 previews/build.py`.
