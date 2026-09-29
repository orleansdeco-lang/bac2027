# DIWAN PRODUCTION AUDIT & HARDENING SPECIFICATION
**SHATER Platform — دیوان العلم (Study Majlis, Experiences & Shared Knowledge)**
*Date: September 2026 | Author: Senior Autonomous Full-Stack, Security & QA Engineer*

---

## 1. Current Architecture

«ديوان العلم» is architected as the community academic hub of SHATER, organized into three distinct pillars:
1. **Branch A — مجالس العلم (Study Majlis)** (`/diwan?tab=majlis`):
   - Synchronous, multi-student collaborative study rooms (capacity: 2 to 8 seats).
   - Modes: `PAPER_PRACTICE` (with ministry rubrics & Error Lab sync), `SPEED_BATTLE` (fast recall challenges), `GROUP_MEMORIZATION`, and `FULL_EXAM`.
   - Real-time synchronization layer backed by Supabase Realtime channels (`majlis-room-${roomId}`), Postgres change streams, and presence tracking.
2. **Branch B — تجارب ونصائح الطلاب (Student Experiences)** (`/diwan?tab=experiences`):
   - High-value advice and lessons learned from top baccalaureate achievers and successful repeaters across Algerian Wilayas.
   - Includes experience submissions, review workflows (pending/approved/rejected), comments, and upvotes.
3. **Branch C — المواضيع والملخصات التشاركية (Shared Topics & Summaries)** (`/diwan?tab=summaries`):
   - Community-contributed high-yield mind maps, ministerial traps, and lesson summaries.
   - Tied to user backpack (`campus_bag_items`) and one-click scheduling into Planner (`PlannerStorage.saveEvent`).

### Architectural Topology & Data Paths:
- **Client Components**: `src/components/diwan/*`, `src/components/experiences/*`.
- **Services**: `src/lib/campus/majlis-service.ts`, `src/lib/campus/campus-service.ts`, `src/lib/services/experience-service.ts`.
- **Route Handlers**: `/api/campus/stats`, `/api/campus/tables`, `/api/campus/tables/[id]/join`, `/api/campus/posts`, `/api/campus/reports`, `/api/campus/rsvp`, `/api/experiences`, `/api/experiences/[id]/comments`.
- **Database (Supabase PostgreSQL)**:
  - Majlis: `majlis_rooms`, `majlis_members`, `majlis_messages`, `majlis_rsvp`, `majlis_reports`, `majlis_tables` (legacy sync).
  - Knowledge Bank: `campus_posts`, `campus_post_likes`, `campus_bag_items`.
  - Experiences: `bac_experiences`, `experience_upvotes`, `experience_comments`.
- **Edge Middleware**: `src/middleware.ts` guards student routes while permitting invite exploration (`/diwan?invite=true` or `table=...`).

---

## 2. Real Features (Confirmed Operational)
- **Supabase Realtime Channel Architecture**: `subscribeToRoom` in `majlis-service.ts` correctly establishes broadcast and presence subscriptions on `majlis-room-${roomId}` and tracks `seat_change`, `paper_finished`, `score_update`, `new_message`, `seat_reaction`, and presence sync/leave.
- **Planner & Error Lab Cross-Service Persistence**:
  - `CampusService.recordMistakeToErrorVault` correctly logs faulty rubric questions or trivia errors into `ErrorRecord` (`lib/mission/storage.ts`) and schedules them into `PlannerStorage`.
  - Finishing a majlis session accurately dispatches `study-session-logged` and updates `PlannerStorage.saveStudySession`.
- **Strict Algerian Baccalaureate Stream Validation**: Both client-side checks and API route handlers (`/api/campus/tables`, `tables/[id]/join`) enforce that students can only take seats corresponding to their academic branch (`sciences_exp`, `math`, `technique_math`, etc.).
- **Privacy Name Masking**: `formatStudentPrivacyName` in `majlis-config.ts` prevents leakage of student full surnames (e.g., "سارة ب.") and strictly rejects raw emails, system IDs, or usernames with numbers.
- **Reporting System API**: `/api/campus/reports` exists, receives abuse reports, and writes to `majlis_reports`.
- **Safe Reaction Emojis**: Quick reactions (`☕`, `🔥`, `👏`, `🤲`) are bounded and broadcast cleanly via Realtime.

---

## 3. Fake / Mock / In-Memory Features (MUST BE ELIMINATED)

1. **In-Memory Volatile Stores in `majlis-service.ts`**:
   - `localRooms = new Map<string, MajlisRoom>()`
   - `localMembers = new Map<string, MajlisMember[]>()`
   - `localMessages = new Map<string, MajlisMessage[]>()`
   - Pre-seeded hardcoded default room `DEFAULT_ROOM_ID = "room-sciences-rc"` with fake active timing.
   - `fetchActiveRooms` falls back to `Array.from(localRooms.values())`, guaranteeing that if DB is empty, the fake seeded room is presented as if real.
2. **Artificial Baseline Bump in `/api/campus/stats/route.ts`**:
   - Lines 48-50 artificially inject: `if (activeRoomsCount === 0) activeRoomsCount = 1;` to fool the client into displaying at least 1 active majlis.
3. **Hardcoded Initial Room in `MajlisWorkspace.tsx`**:
   - `const loadRoom = useCallback(async (roomId = "room-sciences-rc") => { ... })` tries to load `"room-sciences-rc"` on mount instead of fetching genuinely active rooms from Supabase, or displaying a genuine empty state.
4. **`TableStore` In-Memory Fallback in `/api/campus/tables/route.ts`**:
   - Lines 45-46 call `TableStore.getAll()`, returning in-memory `SEED_TABLES` (with mock users `user-ali`, `user-tarek`, etc.).
5. **Branch B (Experiences) Mock Seed & LocalStorage Abuse**:
   - `src/data/experiences/index.ts` hardcodes `CURATED_BAC_EXPERIENCES` with fake upvotes (154, 298, etc.).
   - `ExperienceService` merges `CURATED_BAC_EXPERIENCES` and `localStorage` (`bac_local_experiences`) with remote database records.
   - Double-upvote prevention relies on client-side `localStorage` (`bac_upvoted_experiences`).
   - Line 505 of `experience-service.ts` contains an inversion bug: `if (typeof window !== "undefined") return [];`, breaking client-side upvote checks.
6. **Branch C (Summaries) Fake Seeds & LocalStorage**:
   - `src/lib/campus/campus-service.ts` seeds `SEED_POSTS` with fake authors ("أمينة ب. (معدل 18.72)", "كريم م.", etc.) and fake like counts (142, 215, 98, etc.).
   - `DiwanSharedSummariesTab.tsx` directly calls `CampusService.getPosts()`, mixing seeds with local storage.
   - Likes are only stored in `localStorage` (`shater_campus_likes_v1`).

---

## 4. Security Risks (Critical & High)

1. **Permissive RLS Policies with `USING (true)` and `WITH CHECK (true)`**:
   - In `032_majlis_realtime_multiplayer_engine.sql` and `033_diwan_production_readiness_and_safety.sql`:
     - `majlis_rooms`: Anyone can UPDATE or DELETE any room without verifying ownership (`host_user_id`).
     - `majlis_members`: Any client can insert, update, or DELETE any other user's seat!
     - `majlis_messages`: Any client can insert messages under any forged `user_id` or `user_name`!
     - `majlis_reports`: RLS policy `"Admin read majlis_reports"` is set to `USING (true)` and `"Admin update majlis_reports"` is `USING (true)`! Any unauthenticated attacker could read all confidential abuse reports and modify them!
2. **Unvalidated Client-Side User Identity**:
   - `takeSeat`, `leaveSeat`, `sendMessage`, and `submitSpeedAnswer` accept `userId` and `userName` directly from client parameters without verifying `auth.uid() = user_id`.
3. **Absence of Rate Limiting & Flood Protection in Chat**:
   - `sendMessage` in `majlis-service.ts` directly inserts into `majlis_messages` and broadcasts to `majlis-room-${roomId}` without throttling, character length bounds, or duplicate detection. A malicious client could send 100 messages/sec.
4. **Client-Side Duration Forgery in Study Sessions**:
   - In `MajlisWorkspace.tsx` (`handleLeave`), the client computes `totalSeconds = (Date.now() - sessionStart) / 1000` and sends it directly to `PlannerStorage.saveStudySession`. An attacker could forge 500 hours of study time.
5. **Lack of User Blocking (`majlis_blocks`)**:
   - When a user is harassed, they can report, but cannot locally or server-side block an abusive user from their view.

---

## 5. Database Risks

1. **Unenforced Maximum Room Capacity at DB Level**:
   - `majlis_members` has a unique constraint on `(room_id, seat_index)` and `(room_id, user_id)`, but there is NO database trigger or function preventing concurrent transactions from exceeding `majlis_rooms.capacity`.
2. **Seat Index & Array Disconnect**:
   - `CozyMajlisDesk.tsx` indexed `members[idx]` by array offset rather than matching `member.seat_index === idx`. If seat 0 was vacant and seat 1 was occupied, `members[0]` was displayed in seat 0!
   - In `CozyMajlisDesk.tsx`, line 130 had a hardcoded assumption: `(!member && idx === 4)` forcing the current user into seat index 4 if unseated.
3. **Data Type Mismatch for `user_id`**:
   - In `majlis_members`, `majlis_messages`, and `majlis_rsvp`, `user_id` is defined as `TEXT` instead of `UUID REFERENCES auth.users(id) ON DELETE CASCADE`. This prevents Postgres RLS from strictly evaluating `auth.uid() = user_id` without type casting.
4. **Duplicate Schema Divergence between `majlis_rooms` and `majlis_tables`**:
   - Two parallel tables (`majlis_rooms` and `majlis_tables`) exist. `majlis-service.ts` attempts dual-writes to both, leading to desynchronization and potential orphaned rows.

---

## 6. Realtime Risks

1. **Simultaneous Seat Reservation Race Conditions**:
   - `takeSeat` does a client-side `getMembers()`, calculates an empty seat in memory, and then sends an upsert. If two users click simultaneously, one could overwrite or fail with an unhandled unique violation.
   - Solution: PostgreSQL atomic RPC function `majlis_reserve_seat(p_room_id, p_seat_index)` using row locking (`FOR UPDATE`).
2. **Presence Desynchronization on Tab Close / Network Drop**:
   - When a user abruptly closes the browser or loses WiFi, `beforeunload` might not fire. The user remains in `majlis_members` until purged.
   - Solution: Supabase Realtime Presence heartbeat + periodic sweep of stale seated members (e.g. idle > 15 minutes without heartbeat or session timeout).
3. **Duplicate Realtime Message Injection**:
   - Both Postgres CDC (`postgres_changes`) and broadcast (`new_message`) are subscribed simultaneously in `subscribeToRoom`, risking duplicate message display on the client if deduplication by `message.id` is not bulletproof.

---

## 7. UX Problems

1. **Missing Empty State when 0 Rooms Exist**:
   - Instead of displaying a dignified Arabic empty state:
     «ما كاين حتى مجلس مفتوح حالياً — أنشئ أول مجلس لشعبتك واجمع زملاءك 🏛️»
     the UI falls back to the mock `"room-sciences-rc"`.
2. **Broken Public Invite Flow**:
   - Sharing a table creates `/diwan?tab=majlis&invite=true` without attaching `&roomId=${roomId}`!
   - Prospective students opening the link see a generic banner without knowing the title, subject, stream, or available seats of the specific room they were invited to.
   - Middleware allows `/diwan?invite=true`, but the user is not taken to an authentic room invite preview page.
3. **Error Handling & Async Resilience**:
   - If Supabase is unreachable or queries fail, `majlis-service.ts` logs to console and returns empty or local arrays without user-facing retry states or error alerts.

---

## 8. Mobile Problems (Breakpoints: 320px, 360px, 390px, 430px, 768px, 1024px)

1. **Perimeter Seating Overlap at < 640px**:
   - On screens < 640px, the 6 perimeter absolute seat pills can overflow or clash with the center stage. `CozyMajlisDesk.tsx` already hides them on `sm:hidden` and renders a 2-column grid, but:
     - On 320px screens, the 2-column grid causes text clipping and button overflow.
     - On 360px and 390px screens, the timer and user badge wrap awkwardly.
2. **Inspector Panel & Chat Input Visibility**:
   - The chat box has a fixed height that does not adjust dynamically on mobile virtual keyboard popup, pushing the send button off-screen.
3. **Create Room Modal Responsiveness**:
   - On 320px-375px screens, the modal inner padding causes study mode cards to be cut off vertically.

---

## 9. Missing Database Models & Enhancements

1. **`majlis_blocks` Table**:
   - Allows students to block disruptive peers in real-time, instantly hiding their chat messages and presence.
2. **`majlis_reserve_seat` Stored Function (Atomic Transaction)**:
   - Locks room row, checks capacity, checks stream match, checks if seat is already occupied, and inserts/updates member atomically.
3. **`majlis_leave_seat` Stored Function**:
   - Frees seat, calculates authoritative server-side duration, and logs completed session.
4. **Hardened RLS Policies Migration (`034_harden_diwan_production_security.sql`)**:
   - Replaces all permissive `USING (true)` with strict `auth.uid()` checks and admin/operator verification.
5. **Post Likes & Experiences Upvotes Persistence**:
   - Real `/api/campus/posts/[id]/like` endpoint tied to `campus_post_likes` table with DB-level unique constraint preventing double-likes.
   - Real `/api/experiences/[id]/upvote` endpoint with authentic toggle.

---

## 10. Exact Implementation Plan

### Step 1: Database Migration `034_harden_diwan_production_security.sql`
- Create `majlis_blocks` table with RLS.
- Harden RLS policies for `majlis_rooms`, `majlis_members`, `majlis_messages`, `majlis_reports`, and `majlis_rsvp`:
  - `majlis_rooms`: Only authenticated users can create; only `host_user_id` or admin/operator can update/delete.
  - `majlis_members`: Only authenticated user can take/leave their own seat (`auth.uid()::text = user_id`).
  - `majlis_messages`: Only seated members of the room can insert; `auth.uid()::text = user_id`.
  - `majlis_reports`: Authenticated users can insert; ONLY operator/admin can select/update.
- Create atomic PostgreSQL function `majlis_take_seat_atomic` to eliminate race conditions.
- Clean up any legacy mock seeds from tables.

### Step 2: Purge All Mock & Seed Data from Services
- Remove `localRooms`, `localMembers`, `localMessages`, and `DEFAULT_ROOM_ID` from `majlis-service.ts`.
- Remove `SEED_TABLES` and in-memory map from `table-store.ts`.
- Remove `SEED_POSTS` from `campus-service.ts`.
- Clean `/api/campus/stats/route.ts` to strictly return exact DB counts with zero fake `+1` fallbacks.
- Update `ExperienceService` and `data/experiences` to eliminate fake counts.

### Step 3: Branch A (Majlis) Hardening & Realtime Robustness
- Fix seat indexing bug in `CozyMajlisDesk.tsx` (`members.find(m => m.seat_index === idx)`).
- Implement honest Empty State: when no room exists, display «ما كاين حتى مجلس مفتوح حالياً» with «أنشئ أول مجلس».
- Add Chat Moderation: rate-limiting (max 1 msg / 2s), length cap (300 chars), HTML escaping, report/block integration.
- Fix study session server-side time recording.

### Step 4: Branch B (Experiences) Hardening
- Implement real DB-backed CRUD (create, read, edit own, delete own) via `/api/experiences` and `/api/experiences/[id]`.
- Fix upvote logic and eliminate `localStorage` double-upvote mock.

### Step 5: Branch C (Shared Summaries) Hardening
- Connect `DiwanSharedSummariesTab.tsx` directly to `/api/campus/posts`.
- Implement genuine like toggle endpoint `/api/campus/posts/[id]/like`.
- Add author edit/delete permissions for personal contributions.

### Step 6: Public Invite Flow Hardening
- Update invite links to contain `?tab=majlis&roomId=${roomId}&invite=true`.
- Build an authentic Invite Landing Modal/Card for guests showing room title, subject, stream, available seats, and host.
- Preserve redirect so that logging in/registering automatically takes the user into the invited room.

### Step 7: Mobile & Responsive Polish
- Test and tune layouts for 320px, 360px, 390px, 430px, 768px, 1024px.
- Ensure no layout shift or overflow on small viewports.

### Step 8: Comprehensive Verification & Audit Tests
- Run TypeScript typecheck, verify scripts, integration tests, and build.
- Produce `DIWAN_PRODUCTION_READINESS.md`.

---
*Proceeding directly to execution autonomously.*
