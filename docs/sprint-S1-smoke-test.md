# Sprint S1 — Manual smoke-test runbook

**Goal:** prove the operator + approval workflow end-to-end against a real Clerk + Supabase. Real browser, real clicks, two real users.

## 0. Preconditions

- Branch `claude/exciting-cartwright-f8fb4b` checked out (in worktree or main repo).
- `.env.local` present and the dev server starts on `http://localhost:3010`.
- A second email address you can sign up with (for the operator). Use a `+alias` of your primary email if Clerk allows it; otherwise a real second mailbox.
- Schema-v23 already applied to Supabase (verified by `node scripts/verify-v23.js` → 13/13 passing).

## 1. Sign in as CDIO + create a sandbox client

1. Open `http://localhost:3010` → sign in as your usual Clerk account (the owner).
2. Visit `/clients` → create a fresh **sandbox** client. Name it something like `Smoke Test Co` so we don't confuse it with real engagements.
3. Open the client → click **Settings** in the chrome → confirm a new **"Team access"** panel renders below the profile form (this is the new InvitationsPanel).

## 2. Invite the operator

In the **Team access** panel:

1. Enter the operator's email (`youralias+operator@gmail.com` is fine).
2. Select role: **Operator**.
3. Click **Send invitation**.
4. Expected: green success message reading "Invitation sent to ...". Below, an **Active invitations** card lists the entry.

Check the operator's inbox — a Clerk invitation email should arrive within ~1 minute.

## 3. Sign up as the operator

1. Open an **incognito** / private window (so you stay signed in as the CDIO in your main window).
2. Click the invitation link from the email → complete the Clerk sign-up flow.
3. After sign-up you should land at `/clients/<orgId>/inbox` (the redirectUrl configured during invite creation).
4. Expected on the operator's inbox:
   - Top of page: "Your role: operator"
   - All three sections are empty (you haven't drafted anything yet).
   - A welcome card explains the inbox concept.

Sanity check the operator's `/clients` page: the smoke-test client should be the **only** client visible. If you see other clients, role-scoping is broken.

## 4. Operator drafts an initiative

Still signed in as the operator:

1. Navigate to **Initiatives** in the chrome → **New initiative**.
2. Fill in a title + goal. (For S1, no other fields required.)
3. Save.
4. Expected: redirected to the initiative detail page. At the top, an **Approval** panel shows badge **Draft** with a **Submit for approval** button.

## 5. Operator submits

1. On the initiative detail page, click **Submit for approval**.
2. Expected: badge flips to **Pending CDIO approval**. The Submit button is replaced by **Withdraw**.
3. Return to `/clients/<orgId>/inbox`:
   - "Pending your action" now empty
   - "Awaiting approval" shows the initiative

## 6. CDIO sees it in the approval queue

Switch back to your main window (signed in as CDIO):

1. Open `/clients/<smoke-test-org-id>/inbox`.
2. Expected: a new section **"Awaiting your approval"** with the operator's initiative listed.
3. Click the initiative.

## 7. CDIO returns with a comment

1. On the initiative detail (signed in as CDIO), click **Return with comment**.
2. Type something like `Tighten the goal — too vague.` and click **Send back**.
3. Expected: badge flips to **Returned with edits**.

## 8. Operator sees the return + revises

Switch to the operator's incognito window:

1. Reload `/clients/<orgId>/inbox`.
2. Expected: "Pending your action" now shows the returned initiative.
3. Click into it. The Approval panel shows:
   - Badge: **Returned with edits**
   - Blue callout: "CDIO comment — Tighten the goal — too vague."
   - Button: **Resubmit**
4. Edit the initiative (use the existing edit flow), then click **Resubmit**.
5. Expected: badge flips back to **Pending CDIO approval**.

## 9. CDIO approves with edits

Switch back to the CDIO window:

1. Reload the initiative. Click **Approve with edits**.
2. Expected: badge flips to **Approved**. All action buttons disappear (terminal state for now).

## 10. Verify the audit trail

```sql
-- via psql / supabase SQL editor — or run in scripts/verify-v23.js style
select event_type, actor_practitioner_id, payload, created_at
from approval_events
where artifact_id = '<your-test-initiative-id>'
order by created_at;
```

Expected 4 rows in chronological order:
1. `submitted` (operator)
2. `returned` with `payload = { "comment": "Tighten the goal — too vague." }` (CDIO)
3. `submitted` (operator — the resubmit)
4. `approved_with_edits` (CDIO)

## 11. Negative tests (role gates + IDOR)

Quickly verify:

- **Operator cannot approve** — signed in as operator, hit `POST /api/initiatives/<id>/approve` via DevTools / curl → expect **403**.
- **Operator cannot act on someone else's draft** — create a second initiative as the CDIO (no submit). Signed in as operator, try `POST /api/initiatives/<that-other-id>/submit` → expect **403** (it's owner-authored, not operator's).
- **Cross-org isolation** — create another sandbox client as the CDIO. Signed in as the OPERATOR, hit `/clients/<other-org-id>/inbox` directly → expect 404 or empty/blocked state.
- **Email lowercase** — try inviting `Foo@Bar.com` (mixed case). Expected: stored as `foo@bar.com`; subsequent invite of `foo@bar.com` triggers the upsert path (refresh expiry, no duplicate).

## 12. Revoke + clean up

1. Settings → Active invitations → click **Revoke** on any unaccepted invitation. Expected: row moves to "Past invitations" labeled `revoked`.
2. Optional: hard-delete the sandbox client to clean up Supabase.

---

## What "smoke test passing" looks like

- All 12 sections complete with the expected behavior.
- `approval_events` table grew by exactly 4 rows during sections 5–9.
- No 500s in the console. (403s and 404s are expected during section 11.)
- The operator's `/clients` list contains exactly the one smoke-test client.

If any step diverges from "expected", the discrepancy is a bug to fix before PR.
