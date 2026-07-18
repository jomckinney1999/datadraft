# Business Entity, Banking & Tax Setup Checklist

Phase 0 of `docs/LAUNCH-PLAN.md`. **This is guidance, not a substitute for a real accountant or lawyer** — I can't file paperwork, open a bank account, or give binding legal/tax advice, and nothing here should be treated as such. Treat this as the checklist to work through, with notes on where a professional's judgment actually matters.

Last updated: 2026-07-17.

---

## 1. Business entity

**Recommendation: single-member LLC**, unless you already have a different entity you're routing this through. Reasoning: liability protection (separates personal assets from business risk — relevant the moment you're processing real payments and giving paid advice/reviews via Career Track), simple pass-through taxation, and it's the standard default for a solo SaaS/education founder.

- [ ] **Decide the entity.** LLC is the default answer here. Only consider an S-corp election (still an LLC underlying it) once profit is consistently high enough that the self-employment tax savings outweigh the extra payroll/accounting overhead — not a v1 decision, revisit with an accountant once there's real revenue.
- [ ] **Pick a state to form in.** Form in **your home state**, not Delaware/Wyoming — the "form in Delaware for tax benefits" advice is for venture-backed startups raising institutional money, not a solo bootstrapped SaaS business. Forming out-of-state as a solo founder just adds a second state's annual filing/fees for no real benefit.
- [ ] **File the LLC.** Either DIY through your state's Secretary of State website (cheapest, a few hours of paperwork) or use a formation service (Stripe Atlas, ZenBusiness, Northwest Registered Agent) if you'd rather pay to skip the paperwork.
- [ ] **Registered agent.** Required in most states — either yourself (if you have a stable address you're fine listing publicly) or a registered agent service (~$100-150/yr, keeps your home address off public records).
- [ ] **Operating agreement.** Even single-member LLCs should have one — a template is fine for a v1 solo setup; revisit if you ever add a co-owner.

## 2. EIN (Employer Identification Number)

- [ ] **Apply directly at irs.gov — this is free and takes about 10 minutes.** Never pay a third-party site for this; the IRS issues EINs at no cost. You'll need the LLC to be formed first.
- [ ] Use the EIN (not your SSN) for the Stripe account, business bank account, and any contractor payments later.

## 3. Business banking

- [ ] **Open a dedicated business checking account** once the LLC + EIN exist. Keeping business and personal money separate isn't just tidy bookkeeping — commingling funds is one of the things that can pierce the LLC's liability protection if it's ever tested.
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

- [ ] As a single-member LLC (default: taxed as a sole proprietorship, pass-through), business income flows to your personal return (Schedule C) unless you've elected S-corp treatment.
- [ ] **Set aside estimated taxes** — a common rule of thumb is 25-30% of net income, but that's not a substitute for actually calculating your bracket with an accountant. Quarterly estimated payments are typically required once you owe more than a small threshold for the year — a real accountant conversation, not a DIY guess, especially the first year with real revenue.
- [ ] If Career Track ever brings on a contractor (a second reviewer, per the "some help" note in `docs/LAUNCH-PLAN.md`), you'll need to collect a W-9 and issue a 1099-NEC if you pay them $600+/year.

## 7. Terms of Service, Privacy Policy, Refund Policy

Drafted separately in `docs/legal/` (see `terms-of-service.md`, `privacy-policy.md`, `refund-policy.md`) — **these need your review, and ideally a real lawyer's sign-off, before Phase 2 (real payments) goes live.** I can draft reasonable, business-appropriate language; I can't give you a binding legal opinion that they're airtight for your specific situation/state.

## What I can't do here

I can't file your LLC, apply for your EIN, open your bank account, or give you a real accountant's/lawyer's sign-off — all of those need your identity, signature, and judgment. What I *can* do: draft the legal doc language (see above), write the Stripe Tax integration code once you've enabled it in your Stripe dashboard, and keep this checklist updated as you work through it — tell me what's done and I'll check it off and note the date.
