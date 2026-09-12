# BAC Mastery — Pilot Data Privacy & Participant Protection Protocol
**Controlled Real-Student Validation (Prompt 18.2 § 5)**

---

## 1. Fundamental Principle of Data Minimization
BAC Mastery is an educational learning operating system. The integrity and privacy of student participants are paramount. The system adheres strictly to the principle of **radical data minimization**: we only collect what is strictly necessary to evaluate the cognitive learning loop and user interface ergonomics.

---

## 2. Strictly Prohibited Data Categories
The following information is **STRICTLY PROHIBITED** from ever being collected, logged, buffered, or exported:
- ❌ **Passwords & Credentials**: Plaintext passwords, hashed passwords, confirmation strings.
- ❌ **Authentication Tokens**: Bearer tokens, Supabase JWTs, refresh tokens, session secrets.
- ❌ **Financial & Payment Data**: Credit card numbers, CVCs, postal account credentials, bank identifiers (Payment is currently pilot-placeholder only).
- ❌ **Private Communications**: Private chat messages, notes between students, unmoderated free-text outside scoped feedback.
- ❌ **Sensitive Identity Information**: National identity numbers (NIN), physical home addresses, school registry numbers.
- ❌ **Medical & Health Data**: Energy state questions in onboarding are strictly operational/pedagogical (`good`, `normal`, `tired`, `stressed`) and never clinical or medical.

---

## 3. Pseudonymous Participant Identifiers
Real human participants in the 5–10 student pilot cohort are assigned pseudonymous identifiers:

| Pseudonym | Stream | Role |
| :---: | :---: | :---: |
| `STUDENT-01` | Sciences Expérimentales | Pilot Cohort Participant |
| `STUDENT-02` | Sciences Expérimentales | Pilot Cohort Participant |
| `STUDENT-03` | Sciences Expérimentales | Pilot Cohort Participant |
| `STUDENT-04` | Sciences Expérimentales | Pilot Cohort Participant |
| `STUDENT-05` | Sciences Expérimentales | Pilot Cohort Participant |
| `STUDENT-06` | Sciences Expérimentales | Pilot Cohort Participant (Extended) |
| `STUDENT-07` | Sciences Expérimentales | Pilot Cohort Participant (Extended) |
| `STUDENT-08` | Sciences Expérimentales | Pilot Cohort Participant (Extended) |
| `STUDENT-09` | Sciences Expérimentales | Pilot Cohort Participant (Extended) |
| `STUDENT-10` | Sciences Expérimentales | Pilot Cohort Participant (Extended) |

Synthetic automated test users are strictly separated and designated:
- `QA_USER_A`
- `QA_USER_B`
- `QA_STUDENT_EXECUTION_TEST`

Synthetic test data is never conflated with human pilot records.

---

## 4. Telemetry Sanitization & Device-Local Storage
1. **Device-Local Buffer**:
   - All telemetry events are stored in client-side `localStorage` (`bac_mastery_pilot_events`), capped at 500 events.
   - Zero remote streaming to third-party ad networks, Google Analytics, Facebook Pixel, or external data brokers.
2. **Automated Sanitization Engine (`sanitizeProperties`)**:
   - Every event is processed through an automated scrubber that drops keys matching `token`, `jwt`, `password`, `secret`, `auth_secret`, `access_token`, `refresh_token`, `apikey`, `bearer`.
   - String regex checks automatically scrub strings matching JWT patterns or `Bearer ...` headers.
3. **Anonymized Pilot Export (`exportAnonymizedPilotData`)**:
   - When an export is generated from `/account`, user IDs are masked with short irreversible prefixes (`anon_xxxx`), email fields are deleted, and only timestamped educational event names and scores are exported.

---

## 5. Voluntary Participation & Consent Protocol
Before a student interacts with BAC Mastery:
1. **Informed Consent**: The student and their parent/guardian (if under 18) are informed that this is an experimental educational pilot designed to test interface clarity, question difficulty, and error repair.
2. **Right to Withdraw**: The student may cease participation at any moment with zero academic penalty or obligation.
3. **Right to Data Deletion**: Students can clear all local data at any time via `/reset-demo` or by requesting deletion of their cloud profile from the pilot supervisor.
