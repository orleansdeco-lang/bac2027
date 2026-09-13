# BAC Mastery — Operations Audit Log Specification
## Phase 2: Operations Foundation P0

### 1. Purpose
Every sensitive operational action must produce an immutable audit trail entry in `public.operations_audit_logs`.

### 2. Monitored Actions
- `PAYMENT_APPROVED`: Operator approved payment receipt and granted `PAID` access.
- `PAYMENT_REJECTED`: Operator rejected order with reason.
- `TRIAL_EXTENDED`: Operator granted trial extension.
- `SUBSCRIPTION_ACTIVATED`: Direct activation.
- `ROLE_GRANTED`: Owner granted new role to user.
- `ROLE_REVOKED`: Owner revoked role.
- `STUDENT_FLAGGED`: Operator flagged suspicious student activity.
- `CONFIG_CHANGED`: System setting modified.

### 3. Schema & Immutability
- Columns: `id`, `actor_user_id`, `actor_role`, `action`, `target_type`, `target_id`, `reason`, `before_state` (JSONB), `after_state` (JSONB), `ip_address`, `created_at`.
- Application-Level Immutability: The application code contains strictly zero `UPDATE` or `DELETE` statements on this table.
- Database-Level Policy: RLS grants `SELECT` to operators, `INSERT` to authenticated actors/operators, and **zero** `UPDATE` or `DELETE` grants.
