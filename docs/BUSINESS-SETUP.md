# Business Entity, Banking & Tax Setup Checklist

Phase 0 of `docs/LAUNCH-PLAN.md`. **This is guidance, not a substitute for a real accountant or lawyer** — I can't file paperwork, open a bank account, or give binding legal/tax advice, and nothing here should be treated as such. Treat this as the checklist to work through, with notes on where a professional's judgment actually matters.

Last updated: 2026-07-18.

---

## 1. Business entity

**Decided 2026-07-18: operating as a sole proprietorship for now** — Jojo Lee McKinney, doing business as SQL Sports, Virginia — since real commercial launch (actual payments) is still months out per `docs/LAUNCH-PLAN.md`. This is a legitimate choice for pre-revenue drafting/testing; the tradeoff worth naming plainly: **a sole proprietorship has no liability separation** between you personally and the business. Once real money and real Career Track advice-giving are live, that exposure becomes real, not theoretical.

- [x] **Entity for now: sole proprietorship.** No filing needed to operate this way in Virginia — it's the default if you do business under your own judgment without forming anything else. Revisit before real launch (see below).
- [ ] **Virginia DBA / Fictitious Name filing.** Operating under "SQL Sports" rather than your own legal name as a sole proprietor requires filing a Fictitious Name certificate with the Circuit Court Clerk in the county where you do business (Rappahannock County, for the Flint Hill address) — a real filing step, not optional, and separate from anything federal.
- [ ] **Revisit LLC formation before real payments go live.** The original recommendation stands as the upgrade path: a single-member LLC once you're taking real money via Stripe and giving paid Career Track advice — that's when the liability exposure of staying a sole proprietorship stops being theoretical. Converting later means re-pointing Stripe/Supabase/contracts at the new entity and republishing the legal docs below with the LLC's name instead of your personal name — plan for that as real work, not a formality, when the time comes.
- [ ] If/when you do form the LLC: form in **Virginia** (your home state), not Delaware/Wyoming — that advice is for venture-backed startups, not a solo bootstrapped business.

## 2. EIN (Employer Identification Number)

- [ ] **Apply directly at irs.gov — this is free and takes about 10 minutes.** Never pay a third-party site for this; the IRS issues EINs at no cost. A sole proprietor can apply as an individual — no LLC needs to exist first. Worth getting one anyway so you're not handing out your SSN to Stripe/vendors/contractors.
- [ ] Use the EIN (not your SSN) for the Stripe account, business bank account, and any contractor payments later.

## 3. Business banking

- [ ] **Open a dedicated business checking account** once the EIN exists. Keeping business and personal money separate isn't just tidy bookkeeping — as a sole proprietorship there's no liability shield to pierce yet, but clean separation now makes an eventual LLC conversion (and every tax season before that) much less painful.
- [ ] Common no-fuss options for a solo online business: Mercury, Novo, or Relay (all built for exactly this — online-first, no branch visits, free tiers) or a local bank/credit union business account if you'd rather have a physical branch relationship.
- [ ] Route all Stripe payouts into this account, not a personal one.

## 4. Bookkeeping

- [ ] Set up **basic bookkeeping from day one** — even a simple spreadsheet tracking income/expenses is better than reconstructing a year of Stripe transactions come tax season. Tools like Wave (free) or QuickBooks Simple Start are reasonable for a solo SaaS business at this stage.
- [ ] Connect the business bank account + Stripe to whatever bookkeeping tool you pick so transactions import automatically instead of manual entry.

## 5. Sales tax / VAT on digital products

This is the genuinely complex part, and it's exactly where DIY-ing without help gets risky — **US sales tax on SaaS/digital goods varies enormously by state** (some states tax SaaS subscriptions, some don't; economic nexus thresholds vary; digital course content may be taxed differently than a subscription).

- [ ] **Turn on Stripe Tax** (built into the Stripe integration already being set up in Phase 0/1) — it automatically calculates and can collect the right tax per state/country based on where the customer is, without you having to become a 50-state sales tax expert. This is the practical answer for a solo founder, not DIY-ing nexus research.
- [ ] Once revenue is meaningful, a real conversation with an accountant about which states you have nexus in and whether you need to register/remit there is worth the cost — Stripe Tax calculates and collects, but you still have to file/remit in states where you have nexus.

## 6. Income tax basics

- [ ] As a sole proprietorship, business income flows directly to your personal return (Schedule C) — there's no separate business tax filing to do right now.
- [ ] **Set aside estimated taxes** — a common rule of thumb is 25-30% of net income, but that's not a substitute for actually calculating your bracket with an accountant. Quarterly estimated payments are typically required once you owe more than a small threshold for the year — a real accountant conversation, not a DIY guess, especially the first year with real revenue.
- [ ] If Career Track ever brings on a contractor (a second reviewer, per the "some help" note in `docs/LAUNCH-PLAN.md`), you'll need to collect a W-9 and issue a 1099-NEC if you pay them $600+/year.

## 7. Terms of Service, Privacy Policy, Refund Policy

Drafted separately in `docs/legal/` (see `terms-of-service.md`, `privacy-policy.md`, `refund-policy.md`) — **these need your review, and ideally a real lawyer's sign-off, before Phase 2 (real payments) goes live.** I can draft reasonable, business-appropriate language; I can't give you a binding legal opinion that they're airtight for your specific situation/state.

## What I can't do here

I can't file your DBA or a future LLC, apply for your EIN, open your bank account, or give you a real accountant's/lawyer's sign-off — all of those need your identity, signature, and judgment. What I *can* do: draft the legal doc language (see above), write the Stripe Tax integration code once you've enabled it in your Stripe dashboard, and keep this checklist updated as you work through it — tell me what's done and I'll check it off and note the date.
