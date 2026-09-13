# BAC Mastery — Operator Runbook
## Phase 2: Operations Foundation P0

### Procedure 1: Reviewing & Approving a Manual Payment
1. Navigate to `/ops/finance`.
2. Inspect orders with status `PENDING`.
3. Verify student reference ID and match against the incoming BaridiMob or CCP bank receipt.
4. Verify the transfer amount is 3,900 DZD.
5. Click **Approve**.
6. System atomically transitions order to `APPROVED`, elevates student profile `access_status = 'PAID'`, and writes an audit log entry.
7. Student immediately receives full access on their dashboard without needing to re-login.

### Procedure 2: Rejecting a Fraudulent or Invalid Receipt
1. In `/ops/finance`, locate the pending order.
2. Click **Reject**.
3. A modal will prompt for a mandatory rejection reason (e.g. "Receipt blurred", "Transaction ID already used", "Amount insufficient").
4. Click **Confirm Rejection**.
5. Order status becomes `REJECTED`, reason is saved, and audit log is recorded.

### Procedure 3: Inspecting a Struggling Student Dossier
1. Navigate to `/ops/students`.
2. Search by student name, email, or wilaya.
3. Click **Dossier**.
4. Review target score, demonstrated skills, active error lab bottlenecks, and twin retest clearance.
5. Note: Impersonation is disabled by design. Support must be provided through external messaging (WhatsApp/SMS) using the student's contact number.
