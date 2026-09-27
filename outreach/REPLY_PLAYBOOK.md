# Reply playbook (what to send when a business answers)

Logs: `outreach/sent_log.csv` (forms), `outreach/email_log.csv` (emails). Each row has the mockup URL.
Deposit link (Stripe, $100, counts toward price, refundable): https://buy.stripe.com/eVq3cudQMf6A9L7axGcAo00
Project brief (optional, after paying): https://stand-out-studios.pages.dev/start/
Check for payment: Gmail search `from:stripe.com newer_than:7d`.

## "Yes / sure / send it / how much?"
> Here it is: {mockup_url}
>
> It's a first pass with placeholder words and photos. Your real site would use your photos, your services and your reviews. You can see other sites I've designed, and how the process works, here: https://stand-out-studios.pages.dev/
>
> A one-page site like this is $399, or $799 for up to 5 pages. To start, there's a $100 deposit that counts toward the price. If you don't love the full preview, you get it back:
> https://buy.stripe.com/eVq3cudQMf6A9L7axGcAo00
>
> Once that's in, reply with a few photos of your work and I'll send the full preview within 48 hours. Your site is live within 7 days.
>
> Jace

## They liked it but haven't paid (24h later)
> Hi {name}, just checking you saw this. I'm holding a spot for {business} this week. Want me to go ahead?

## "Is this legit? / who are you?"
Answer plainly: Jace, Stand Out Studios, Henderson NV. Samples: https://stand-out-studios.pages.dev/#work. No contract, no subscription; the $100 is refundable if they don't love the preview.

## "Already have someone / not interested / stop"
> No problem, I won't reach out again. Good luck with the season!
Add the domain to `outreach/do_not_contact.txt`.

## Follow-ups for no reply (same thread)
- Day 3: "Hi, bumping this in case it got buried. Want me to send the mockup link?"
- Day 7: "Last note from me. Should I send the mockup, or close the file?"
