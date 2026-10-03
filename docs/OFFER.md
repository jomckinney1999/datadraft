# DataDraft — The Offer, the Pitch and the Launch

The sales side of `docs/PLAN.md`: what we sell, at what price, the words we sell it with, and the order we do it in. PLAN.md holds the decisions and the reasoning; this holds the copy and the playbook. Change a price there first, then here.

**Status (2026-10-03): approved by Jo; nothing is for sale yet.** Every Season Pass feature is open and labelled "free in early access" (`PAYWALL_LIVE = false` in `lib/season-pass.ts`). Charging waits on the launch gates at the bottom of this doc, and HR's sign-off is the first of them.

---

## 1. The offer in one paragraph

**DataDraft is free to play every day. The Season Pass is for when you're going for the job.** It's the SQL interview, rehearsed on the stats you already argue about: every question in the bank with solutions, the Query Doctor on every miss, timed mock screens graded like the real thing, every course with no daily limit, and the proof for employers as it lands. **$19.99 a month, or $119 a year (under $10 a month).** Founding members pay **$79 a year, locked in for as long as they stay**. That's the first 500 people, through January 31. Full refund within 14 days, no questions.

## 2. The tiers

| | **Free** | **Season Pass** |
|---|---|---|
| Price | $0, forever | **$19.99/mo** or **$119/yr** · founding **$79/yr** (first 500, through Jan 31) |
| For | Everyone. The daily habit. | The numbers person going for the analyst job |
| Daily question, every language | ✓ | ✓ |
| Stat Duel, Draft Room (current season), Chart it, your own league | ✓ | ✓ |
| Practice Field and Spreadsheet sandboxes | ✓ | ✓ |
| Courses | The first unit of every course (5 graded lessons a day) | **Every lesson in every course, no daily limit** |
| Question bank | Today's questions, any question for 7 days after it was a daily, and a starter set | **The whole bank** (80 SQL today, growing to ~150; plus Python, R, Excel), with solutions |
| Query Doctor | 1 diagnosis a day | **On every miss**, plus Ask Coach |
| Mock SQL screens | 1 phone screen, to try it | **Unlimited**, phone and technical, with the report |
| Interview patterns | See them | **Track your progress on all nine** |
| Cases | First case | **All of them** |
| Draft Room | Current season | **Every season** |
| Proof for employers (profile, certificates) | | **Included when it ships** (needs accounts) |
| Weekly in-season drop and leaderboard | Play it | **Included when it ships**, with the archive |

**Why these lines:** everything that brings people in or gets passed around stays free: the daily, the duel, the draft, charts and your own league. The Pass is everything you grind once you've decided this is a career move. A hobbyist never hits the wall. A job-seeker hits it in their second week, and that's the moment to sell.

**Two rules the gate must keep:**
- **A shared link always works.** A question stays free for 7 days after it was a daily, so a friend's challenge link never lands on a paywall.
- **Never interrupt the fun parts.** No offer before or during the daily, the duel, a chart or a league. Offers show after a solve, at a limit, or when someone opens a Pass feature.

**The gate is a convenience, not a lock.** The answer keys ship to the browser and the repo is public. That's fine for a practice product: people pay for the full experience, not because they can't find the answers. Anything that has to be trusted (certificates, the leaderboard) gets checked on our server once accounts are live.

### Later, tested after launch (not at launch)
- **Gift a Season Pass** (December): "for your league's numbers person". Fantasy playoffs and the holidays land in the same weeks. One Stripe product, a code by email.
- **League Pass** (Aug 2027 test): the commissioner pays ~$49 a season and every manager in the league gets the weekly league charts. Ten to twelve people see the brand every week. Test it only if league charts are getting shared.
- **Student pricing**: only if students show up in the analytics and ask for it.

### Retired
Roadmap ($200–500 one-time) and Career Track ($1–5k/yr) came off the ladder when coaching was cut on 2026-09-30. A human reading resumes was what made Career Track worth that price, and we don't sell that any more. Don't bring either back without a conversation.

## 3. The numbers behind the price

- **Anchors the buyer already has:** a bootcamp costs $10–20k, a master's $20–50k, and big learning platforms run in the low hundreds a year. $119 is a small, obvious yes next to all of those, and it should never be the cheapest thing in the market by so much that it reads as a toy. (Check any competitor's price on the day before putting it in copy; theirs change.)
- **Monthly is priced to sell annual.** $19.99 × 12 = $240, so $119 reads as half off, and it is. Annual also survives the fantasy season ending, which monthly won't.
- **Fees:** card fees run about 2.9% + 30¢ a charge: ~$0.88 on $19.99 (4.4%), ~$3.75 on $119 (3.2%), ~$2.59 on $79. Another reason to lead with annual.
- **Fixed costs at launch:** Vercel Pro (~$20/mo, required for a paid site), the domain (~$15/yr), Supabase and Resend on free tiers until volume, and the AI coach at well under a cent an answer behind a $5 budget. **Around 7 annual members cover the monthly bill.**
- **To $20k a month:** with about two-thirds on annual, a member averages ~$13 a month, so that's **~1,500 paying members**. At 3% conversion it takes ~50,000 engaged free users over time. Distribution is the hard part, not the price (see PLAN.md, Market size).

## 4. The founding offer (honest scarcity only)

- **$79 a year, locked in for as long as the membership stays active.** Lapse, and it's gone.
- **First 500 members, or January 31, whichever comes first.** Both limits are real, and the counter on the page shows the real number left. If 500 seems out of reach, say "through January 31" and leave the count off. A fake counter is the fastest way to lose a career-changer's trust.
- **Early-access users get 7 days' head start.** Anyone who used the site while it was free gets the email first. It's a real thank-you, and they're the warmest buyers we'll ever have.
- **Grandfathering is tracked by plan, not memory:** founding members are on their own Stripe price, so they keep it by construction when list prices rise.

## 5. The pitch

### The 30-second version
> You're already the numbers person in your league: the spreadsheet, the rankings, the stats in the group chat. DataDraft turns that into the SQL analysts use at work. There's a 90-second question every day on real NFL data, charts of your own league you'll actually post, and interview practice that grades you the way a real screen does. Playing is free every day. The Season Pass is for when you're going for the job.

### Pricing page
- **Headline:** Get the job. Keep the league.
- **Sub:** Season Pass is the SQL interview, rehearsed on the stats you already argue about. $119 a year, under $10 a month.
- **Card bullets (Season Pass):**
  - Every question in the bank, with solutions: SQL interview questions on real NFL data, plus Python, R and Excel
  - The Query Doctor on every miss: why your query is wrong, without giving the answer away
  - Timed mock SQL screens, graded like the real thing, with a report after
  - Every course, every lesson, no daily limit
  - The nine patterns analyst screens test, and where you stand on each
  - Coming to the Pass: a profile and certificates an employer can check
- **Under the button:** 14-day full refund. Cancel in two clicks.
- **Free card:** "Free, every day: the daily question, the Stat Duel, the Draft Room, Chart it, your own league."

### Where the offer appears (paywall moments)
| Moment | Copy |
|---|---|
| Out of the 5 daily lessons | "That's your five for today, and your streak's safe. Season Pass makes lessons unlimited." |
| Submit on a Pass question | "This one's in the Season Pass. Today's question is free, and so is any question for a week after it was the daily." |
| Second Query Doctor of the day | "That's today's free diagnosis. With the Season Pass, the Doctor reads every miss." |
| Second mock screen | "You've tried the phone screen. The Season Pass has unlimited screens, including the technical round." |
| After solving the daily (soft, dismissible) | "Going for an analyst job? The Season Pass is the prep. Here's what's inside." |

### Launch emails (to the waitlist and early-access users)
1. **"Your founding price is open"**: one paragraph on what the Pass is, the $79-a-year-for-good offer, the real deadline, one button.
2. **"Why your query is wrong"** (3 days later): show the Query Doctor on a real wrong answer. Demonstrate it instead of describing it.
3. **"48 hours left on founding pricing"** (2 days before the real deadline): the deadline, the refund, the button. Nothing else.

No more than three. Every email has an unsubscribe link, and the list is only people who asked to hear from us.

### Posting (Reddit, X, LinkedIn)
- **Lead with the thing, not the product.** The weekly chart, a duel result, a hard question. The site is in the image and the link. Read each subreddit's self-promotion rules before posting, and never post from fake accounts or plant comments.
- **LinkedIn leads with the skill:** "I modelled my fantasy league in SQL. Here's the chart and the query." The football is the hook, the SQL is the point.

## 6. Objections, in the order they come

| They say | We say |
|---|---|
| "Will employers take a football project seriously?" | They take SQL seriously. Football is why you practised every day. A league you modelled is a story an interviewer remembers. |
| "I only know Excel." | That's where most of our people start. The Excel course meets you there, and SQL is the next step, one question a day. |
| "I don't have time." | Ninety seconds a day is the habit. The Pass is there for the weeks you go deeper. |
| "There are free SQL sites." | There are, and the daily here is free too. The Pass is real data you care about, a doctor that explains your mistakes, and screens graded like the real thing. |
| "What if it's not for me?" | Full refund within 14 days. Cancel in two clicks. |
| "My league's not on Sleeper." | The notebook takes an ESPN or Yahoo CSV. |

**Never say:** that it gets you a job, that anyone got a job (until someone tells us they did, and says we can quote them), a learner count we haven't counted, or any betting language: no odds, spreads, picks or "league dues".

## 7. When to sell (the calendar)

| When | Play |
|---|---|
| **Now → December** | Build the free habit and the list: daily question, duel, Tuesday charts, the waitlist. Measure (analytics on). Clear the launch gates. |
| **Mid-December** | Founding offer to early-access users (7-day head start), then the waitlist. Gift a Pass for the holidays, if it's ready. |
| **January → March** | **The big push: "The season's over. Now get the job."** Fantasy ends just as job searches and New Year plans start. This is the career pitch's best moment. Founding pricing closes January 31. |
| **April → July** | Offseason. Content and SEO (every question has its own page), product depth, testimonials collected with permission. |
| **August** | **Draft season: sell annual.** The Draft Room is the hook. "Draft your season, then draft your career." |
| **September → December** | In-season weekly drop and leaderboard (once built), Tuesday charts, monthly plans welcome. |

## 8. How we'll know it's working

Measured with the analytics that just went in, then Stripe once billing exists:

- **Free → Pass:** 2–5% of weekly active users within 30 days of launch.
- **Annual share:** 60% or more of new subscriptions.
- **Monthly churn:** under 7%. **Refunds:** under 5%.
- **The funnel:** daily-question and duel challenge arrivals (`~challenge`, `/vs/`), chart arrivals (`~chart`), and which paywall moment converts best.

If conversion is under 1% after a month, the problem is the free-to-Pass moment, not the price. Fix the moment before touching the price.

## 9. Launch gates (all of them, in order)

1. **HR sign-off** (Jo). Nothing commercial before it.
2. **Business setup:** DBA, EIN, bank account (`docs/BUSINESS-SETUP.md`). Jo.
3. **Legal review** of Terms, Privacy and Refund (`docs/legal/`). Replace the home street address with a business address or PO box before any of it is published. Jo, ideally with a lawyer.
4. **Vercel Pro.** Vercel's free plan is non-commercial, and that includes advertising something for sale, so this comes before prices appear on the site. ~$20/month. Jo.
5. **Accounts live:** domain, Resend, Supabase URL settings and migrations (the P0s in Notion). A purchase has to belong to a person, not a browser.
6. **Stripe:** account (Jo), then products and prices for monthly, annual and founding, Checkout, the Customer Portal for two-click cancel, and the webhook that writes the subscription to the account (Claude builds). The Pass is granted from the server-side subscription, never from browser storage.
7. **Sales tax:** decide with an accountant whether to register anywhere; Stripe Tax can collect it.
8. **Flip `PAYWALL_LIVE`**, and the "free in early access" tags become the offer.

**Built 2026-10-03, behind the switch:** the pricing page, every paywall moment above with its copy, checkout for all three plans with the founding cap enforced on the server, the billing portal, the webhook and server-side entitlement. Launch day is gates 1–7, then the switch. The steps are in CLAUDE.md under the Season Pass. The switch-on paths haven't run end to end yet; test them locally with Stripe in test mode first.
