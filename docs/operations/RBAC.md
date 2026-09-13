# BAC Mastery — Role-Based Access Control (RBAC) Specification
## Phase 2: Operations Foundation P0

### 1. Role Taxonomy
The system recognizes 4 explicit roles stored in `public.user_roles`:

1. **`OWNER`**: Highest administrative authority. Can grant/revoke roles, approve/reject orders, configure system parameters, and inspect all audit logs.
2. **`OPERATOR`**: Customer operations and pedagogical supervisor. Can review payment orders, approve/reject manual subscriptions, inspect student dossiers, and view error heatmaps. Cannot promote users to `OWNER`.
3. **`CONTENT_REVIEWER`**: Curriculum inspector. Can inspect problem drop-off indexes, difficulty calibrations, and disputed question reports.
4. **`TEACHER_ADMIN`**: Reserved for Phase 2 institutional high school deployments.

Normal students have **no role record** in `user_roles` (implicit `STUDENT`).

### 2. Permissions Matrix

| Capability | STUDENT | CONTENT_REVIEWER | OPERATOR | OWNER |
| :--- | :---: | :---: | :---: | :---: |
| Access `/dashboard` & Learning Core | Yes | Yes | Yes | Yes |
| Access `/ops` Operations Center | **NO (403)** | Partial | **Yes** | **Yes** |
| View Student Dossier | **NO** | No | **Yes** | **Yes** |
| Review Payment Orders | **NO** | No | **Yes** | **Yes** |
| Approve / Reject Payments | **NO** | No | **Yes** | **Yes** |
| Extend 72h Student Trial | **NO** | No | **Yes** | **Yes** |
| View Operations Audit Log | **NO** | No | **Yes** | **Yes** |
| Grant / Revoke Roles | **NO** | No | **NO** | **Yes** |

### 3. Owner Bootstrap Procedure
To prevent self-escalation while avoiding hardcoded passwords:
1. `bootstrap_initial_owner(target_user_id UUID)` in PostgreSQL checks if `count(*) FROM user_roles WHERE role = 'OWNER'` is 0.
2. If 0, it grants `OWNER` to `target_user_id`.
3. If an owner already exists, all subsequent bootstrap calls throw an exception (`RAISE EXCEPTION`).
4. Once bootstrapped, only an existing `OWNER` can grant additional roles.
