# Privacy Policy — DRAFT

**Status: draft. Do not publish or rely on this until it has been reviewed by you and ideally a real lawyer. This is dated ahead of actual commercial launch — update "Last updated" again once this is actually published live, not just drafted.**

Last updated: July 18, 2026

---

## 1. Who we are

**Jojo Lee McKinney, an individual doing business as DataDraft** ("DataDraft," "we," "us"), a sole proprietorship operating from 6617 Rock Lawn Dr, Clifton, VA 20124, operates the DataDraft website and Service. This policy explains what data we collect, why, and what your options are.

## 2. What we collect

**Account data:** email address (used for magic-link sign-in — we don't store passwords), a username, and account creation date.

**Usage data:** which lessons/labs you've completed, Weekly Challenge submissions and points, capstone submissions, and general product usage (pages visited, features used) via analytics tooling.

**Payment data:** handled by **Stripe**, our payment processor. We do not store your card number ourselves — Stripe is PCI-compliant and handles that directly. We do store which tier you're subscribed to, subscription status, and billing dates, linked to a Stripe customer ID.

**Fantasy platform data (if you connect one):** if you link a Sleeper, ESPN, or Yahoo fantasy account (see Phase 5 of `docs/LAUNCH-PLAN.md`), we access the roster/league data associated with that connection to power personalized features. This may include **league-mates' names or team names who never signed up for DataDraft themselves** — we only use this data to power the connected user's own experience (e.g., "beat your league's average"), not to build profiles on or contact people who haven't created an account. [This needs real scrutiny once Phase 5 is actually built — flag any additional handling decisions here as they're made.]

**Page analytics:** we use **Vercel Web Analytics**, which counts page views without cookies and without identifying you across sites. For each page view it records the page's path (with any query string removed, plus a short marker when you arrived through one of our own share links, such as a posted chart or a Stat Duel challenge), the referring site, and your country, browser, operating system and device type, as Vercel derives them from the request.

**Cookies:** session cookies for authentication (via Supabase Auth), only if you sign in. Our analytics set no cookies.

## 3. How we use it

- To provide the Service — track your progress, run the Weekly Challenge/leaderboard, process payments, deliver Career Track services.
- To communicate with you — transactional emails (receipts, magic links, renewal notices), and product updates you can opt out of.
- To improve the product — aggregate, de-identified usage patterns inform what we build next.
- We do not sell your personal data.

## 4. Who we share it with

Only the service providers necessary to run DataDraft, each bound by their own privacy/security commitments:

- **Vercel** — hosting and cookieless page analytics
- **Supabase** — database, authentication
- **Stripe** — payment processing (Stripe Tax for sales tax calculation)
- [Email provider, e.g. Resend/Postmark] — transactional email
- Sleeper/ESPN/Yahoo APIs — only for the specific connection you authorize, only to read the data needed for the feature

We do not share your data with advertisers or data brokers.

## 5. Data retention

We retain account and progress data as long as your account is active. If you delete your account, we delete your personal data within [30 days], except where we're required to retain records for tax/legal purposes (e.g., payment records via Stripe, per standard financial recordkeeping requirements).

## 6. Your rights

You can:
- Access or export your data (progress, submissions, account info) by request
- Correct inaccurate account information
- Delete your account and associated personal data
- Disconnect a linked fantasy platform account at any time

Contact us (Section 9) to exercise any of these. [If you have or expect EU/UK/California users specifically, this section needs GDPR/CCPA-specific language — a real lawyer call, not something to guess at generically.]

## 7. Children's privacy

The Service isn't directed at children under 13, and we don't knowingly collect data from them. If you believe a child under 13 has created an account, contact us and we'll delete it.

## 8. Security

We use industry-standard practices (encrypted connections, Supabase's built-in Row Level Security restricting data access, no local storage of card numbers) but no system is 100% secure — we can't guarantee absolute security of your data.

## 9. Changes to this policy

We'll post updates here and, for material changes, notify you via email or an in-app notice before they take effect.

## 10. Contact

Questions about this policy or your data: jomckinney1999@gmail.com, or by mail at 6617 Rock Lawn Dr, Clifton, VA 20124.
