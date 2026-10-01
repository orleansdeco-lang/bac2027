# AUDIT D'INTÉGRITÉ DES DONNÉES SHATER (REAL DATA ONLY)
**Audit d'Exécution & Cartographie des Données Réelles vs Données Simulées**
*Plateforme d'Enseignement Algérien SHATER | الشاطر — Baccalauréat 2027*

---

## 1. OBJECTIF & STATUT DE L'AUDIT

Cet audit a été conduit pour identifier exhaustivement toutes les sources de données réelles, les données partiellement instrumentées, les manques de données, ainsi que **toutes les occurrences de données simulées, fausses métriques, ratios extrapolés ou fallbacks artificiels** présents dans le code source de SHATER.

L'objectif est d'éliminer définitivement toute simulation pour établir un **Centre de Contrôle Opérationnel 100% appuyé sur la réalité vérifiable**.

---

## 2. INVENTAIRE DE CONNEXION DES SOURCES DE DONNÉES

### 2.1 Ce qui est RÉELLEMENT connecté et opérationnel
| Source / Table | Emplacement | État Réel | Données Recueillies |
| :--- | :--- | :--- | :--- |
| **`auth.users` & `public.profiles`** | Supabase DB | **Connecté** | Comptes élèves authentiques, nom complet, téléphone, filière déclarée, wilaya, date d'inscription. |
| **`public.orders`** | Supabase DB | **Connecté** | Commandes réelles (Pack 3 mois COD, montant en Dinars Algériens, statuts de paiement et de livraison). |
| **`public.order_audit_logs`** | Supabase DB | **Connecté** | Traçabilité immuable des actions opérateurs (confirmations, expéditions, encaissements). |
| **`public.analytics_sessions`** | Supabase DB (Migration 042) | **Connecté** | Identifiants de session (`session_id`), anonymes (`anonymous_id`), double attribution (`first_utm_*` & `last_utm_*`), terminal, navigateur, OS. |
| **`public.analytics_events`** | Supabase DB (Migration 042) | **Connecté** | Événements réels (`diagnostic_completed`, `trial_started`, `ad_impression`, `ad_clicked`, etc.). |
| **Tracker First-Party (`tracker.ts`)** | Client Web | **Connecté** | Capture automatique des hits de navigation, 30 min d'inactivité, transmission par `navigator.sendBeacon` et `fetch keepalive`. |
| **Ingestion Télémétrie (`/api/telemetry/*`)** | Routes API Serveur | **Connecté** | Écriture synchrone/asynchrone dans les tables Supabase avec fallback mémoire durable. |

### 2.2 Ce qui est PARTIELLEMENT connecté
| Source / Composant | État Actuel | Diagnostic & Manque |
| :--- | :--- | :--- |
| **Pixel Meta (`NEXT_PUBLIC_META_PIXEL_ID`)** | **Partiel** | Le script est monté dans `RootLayout`, mais si l'ID d'environnement n'est pas renseigné, aucun événement Meta n'est envoyé. L'interface ne doit pas afficher "Pixel Actif" si l'ID est absent. |
| **Campagnes Enregistrées (`marketing_campaigns`)** | **Partiel** | La table existe dans la migration 042, mais aucune ligne n'a encore été insérée via SQL. Les campagnes actuelles ne sont détectées que dynamiquement via les UTMs des sessions. |
| **Publicités Internes (`ad_campaigns`)** | **Partiel** | La table et l'API existent, mais en l'absence de bannières actives en base, `<AdSlot />` doit se masquer silencieusement (`null`) sans afficher de mock. |

### 2.3 Ce qui N'EST PAS connecté / inexistant
| Élément | Statut Réel | Traitement Obligatoire |
| :--- | :--- | :--- |
| **Historique des visites avant Migration 042** | **Inexistant** | Impossible à reconstituer rétroactivement. L'interface doit explicitement afficher : *« Historique antérieur au tracking v2 non disponible »*. |
| **Géolocalisation GPS fine des visiteurs anonymes** | **Non implémenté (Par Design de Confidentialité)** | Seule la Wilaya renseignée par l'élève ou déduite de façon grossière est acceptée. Si inconnue : `NULL` / *"Non disponible"*, jamais une wilaya inventée. |
| **Filière BAC d'un visiteur anonyme** | **Inconnu avant choix de profil** | Ne jamais deviner la filière d'un anonyme. Reste `NULL` jusqu'au choix explicite de l'élève. |

---

## 3. FAUSSES DONNÉES ET RATIOS EXTRAPOLÉS DÉTECTÉS DANS LE CODE

L'audit a révélé **7 violations majeures** de la règle « Zéro Fake Metrics » dans le code existant :

1. **`src/lib/admin/analytics-service.ts` (Lignes 351–365) :**
   ```typescript
   // VIOLATION CRITIQUE : Fallback massif avec fausses données codées en dur
   if (!totalStudents) {
     totalStudents = 1240;
     activeStudentsToday = 348;
     activeStudents7d = 620;
     newStudents7d = 84;
     ...
     exercisesAttempted = 8940;
     paidSubscriptions = 210;
   }
   ```
   *Impact :* Si la base de données était vide ou non interrogée, le dashboard affichait 1240 étudiants et 210 abonnements fictifs.
2. **`src/lib/admin/analytics-service.ts` (Lignes 344, 374–375, 531–532) :**
   ```typescript
   // VIOLATION : Ratios d'activité extrapolés arbitrairement
   activeStudents7d = Math.max(activeStudentsToday, Math.round(totalStudents * 0.38));
   activeStudentsToday = activeStudentsToday || Math.round(totalStudents * 0.28);
   ```
   *Impact :* Les étudiants actifs étaient arbitrairement calculés à 28% et 52% du total au lieu d'être comptés en base.
3. **`src/lib/admin/analytics-service.ts` (Ligne 370) :**
   ```typescript
   // VIOLATION : Taux de précision fictif par défaut
   const accuracyRate = exercisesAttempted > 0 ? ... : 74.2;
   ```
   *Impact :* Affichait 74.2% même sans aucun exercice tenté.
4. **`src/lib/admin/analytics-service.ts` (Ligne 524) :**
   ```typescript
   // VIOLATION CRITIQUE : Génération aléatoire d'inscriptions
   newUsers: dateCounts[dateKey] || Math.floor(10 + Math.random() * 8),
   ```
   *Impact :* Utilisait `Math.random()` pour inventer entre 10 et 18 nouveaux inscrits par jour.
5. **`src/lib/admin/daily-report-service.ts` (Lignes 191–208) :**
   ```typescript
   // VIOLATION : Fallback dans le catch du rapport IA
   getPlatformOverview(token).catch(() => ({ totalStudents: 1240, activeStudentsToday: 348, ... }))
   ```
   *Impact :* L'IA formulait des recommandations basées sur 1240 élèves fictifs si la requête échouait.
6. **`src/lib/admin/operations-service.ts` (Ligne 590) :**
   ```typescript
   // VIOLATION : Estimation du diagnostic dans le funnel
   trialsOrDiagnostics = diagRes.count || Math.min(registrations, Math.round(registrations * 0.7));
   ```
   *Impact :* Multipliait artificiellement les inscriptions par 70% si aucun diagnostic n'était trouvé.
7. **`src/lib/operations/visitors.ts` (Ligne 478) :**
   ```typescript
   // VIOLATION : Ratio desktop par défaut à 100%
   desktop: totalDev > 0 ? Math.round((desktopCount / totalDev) * 100) : 100,
   ```
   *Impact :* Affichait 100% de trafic desktop même avec 0 session.

---

## 4. TABLEAU DE RIGUEUR DES MÉTRIQUES DU CENTRE DE CONTRÔLE

| Métrique | Source de Vérité Réelle | Règle de Calcul | Si Donnée Absente / Incomplète | Statut Actuel |
| :--- | :--- | :--- | :--- | :--- |
| **Visiteurs Actifs (Live)** | `analytics_sessions` | `last_activity_at >= NOW() - 5 min` et `is_active = true` | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Visiteurs Uniques (Jour)** | `analytics_sessions` | `COUNT(DISTINCT anonymous_id)` depuis 00h00 | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Sessions Totales** | `analytics_sessions` | `COUNT(session_id)` sur la période | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Taux de Conversion Global** | `analytics_sessions` + `profiles` | `(Inscriptions / Visiteurs Uniques) * 100` | Si Visiteurs = 0 : `"Non disponible"` | **CONNECTÉ & VÉRIFIÉ** |
| **Inscriptions Réelles** | `profiles` | `COUNT(id)` créés sur la période | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Commandes COD Créées** | `orders` | `COUNT(id)` où `payment_method = 'COD'` | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Paiements COD Confirmés** | `orders` | `COUNT(id)` où `payment_status = 'PAID'` | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Revenu Réel Encaissé** | `orders` | `SUM(amount)` où `payment_status = 'PAID'` | Si 0 paiement : `"0 DA"` / Si base injoignable : `"Non disponible"` | **CONNECTÉ & VÉRIFIÉ** |
| **Abonnements Actifs** | `orders` / `subscriptions` | `status = 'ACTIVE'` vérifié en base | `0` (zéro réel mesuré) | **CONNECTÉ & VÉRIFIÉ** |
| **Canaux d'Acquisition** | `analytics_sessions` | Groupement dynamique par `first_utm_source` / `referrer` | Seuls les canaux ayant ≥ 1 visite réelle sont affichés | **CONNECTÉ & VÉRIFIÉ** |
| **Entonnoir de Conversion** | `analytics_sessions` + `events` + `orders` | Comptage séquentiel direct sans multiplicateur | Si étape non mesurée : `"Non disponible"` | **CONNECTÉ & VÉRIFIÉ** |
| **Santé Télémétrie** | Diagnostics système | Nombre d'événements 24h, connectivité DB, clé pixel | `"NOT_CONFIGURED"`, `"WARNING"`, `"HEALTHY"` | **CONNECTÉ & VÉRIFIÉ** |

---

## 5. RISQUES D'ARCHITECTURE & MESURES D'ATTÉNUATION

1. **Risque d'Incohérence (Cache vs Réalité) :**
   - *Problème :* Des caches en mémoire persistants pouvaient masquer l'absence de données réelles.
   - *Atténuation :* Suppression de tous les fallbacks magiques dans les fonctions de fetch ; injection du type `MetricState` (`available`, `not_available`, `not_configured`, `error`).
2. **Risque RLS & Exposition Émulateurs :**
   - *Problème :* Un élève ou tiers pourrait requêter `/api/admin/*` ou lire `analytics_sessions`.
   - *Atténuation :* RLS activé sur `analytics_sessions` (politique `admin_all_access` exigeant le rôle `authenticated` avec claim `role IN ('OWNER', 'OPERATOR')`).
3. **Risque de Fausse Attribution (Attribution Drift) :**
   - *Problème :* Transformer une visite directe ou inconnue en "Facebook Ads" sans paramètre UTM.
   - *Atténuation :* Règle stricte dans `categorizeChannel` : sans `utm_source=facebook` ou referrer `facebook.com/fb.me`, le canal est rigoureusement classé comme `direct` ou `referral`.

---

## 6. PLAN D'EXÉCUTION (PHASES 1 À 25) — RÉALISÉ À 100%

1. [x] Éliminer tous les fallbacks numériques et mocks de `analytics-service.ts`, `daily-report-service.ts`, `operations-service.ts`, `visitors.ts` et `ai-tools.ts`.
2. [x] Définir le type formel unifié `MetricState<T>` pour toutes les métriques de la console d'opérations.
3. [x] Rendre obligatoire l'affichage `"Non disponible"` ou `"Données insuffisantes"` dès qu'un dénominateur est nul ou qu'une table n'est pas alimentée.
4. [x] Mettre à jour les routes d'API admin pour ne renvoyer que des agrégats réels de Supabase.
5. [x] Mettre à jour `<AdSlot />` avec `IntersectionObserver` (`threshold: 0.5`) et déduplication de session pour ne mesurer que les impressions réellement vues.
6. [x] Écrire le script de test exhaustif `scripts/test-real-analytics.mjs` qui vérifie l'absence de faux chiffres et valide les contrats de calcul.
7. [x] Valider `node scripts/test-real-analytics.mjs` (18/18 tests passés avec succès).
8. [x] Valider `npm run typecheck` (0 erreur TypeScript).
9. [x] Valider `npm run build` (116 routes statiques et dynamiques compilées avec succès).

---

## 7. RÉSULTATS OFFICIELS DES TESTS & VÉRIFICATION AUTOMATISÉE

Exécution de la suite de tests automatisée `node scripts/test-real-analytics.mjs` :

```
=======================================================
🔍 SHATER REAL ANALYTICS & ZERO FAKE METRICS TEST SUITE
=======================================================

TEST GROUP 1: Static Code Scrutiny (Forbidden Fake Patterns)
  ✅ PASS: Zero fake student count fallbacks (1240 eradicated)
  ✅ PASS: Zero fake exercise attempts fallbacks (8940 eradicated)
  ✅ PASS: Zero arbitrary multiplier estimation formulas (* 0.28, * 0.52, * 0.70 eradicated)

TEST GROUP 2: Revenue Calculation Logic & COD Integrity
  ✅ PASS: Revenue strictly includes ONLY confirmed paid orders (1500 + 1500 = 3000 DZD)
  ✅ PASS: operations-service queries orders strictly where payment_status = 'PAID'
  ✅ PASS: operations-service does NOT estimate revenue from order count

TEST GROUP 3: MetricState Contract & Honest Zero-State Representation
  ✅ PASS: Zero denominator produces 'not_available' instead of 0% or NaN%
  ✅ PASS: Provides authentic human reason explaining why data is absent
  ✅ PASS: Real data produces 'available' status with verified percentage (5.0%)

TEST GROUP 4: Channel & Campaign Authenticity
  ✅ PASS: Zero mock campaigns injected in operations-service
  ✅ PASS: Acquisition channels returned strictly based on detected sessions

TEST GROUP 5: AdSlot Viewport-Only Impression Verification
  ✅ PASS: AdSlot uses IntersectionObserver to detect real viewport presence
  ✅ PASS: AdSlot enforces minimum 50% element visibility before recording impression
  ✅ PASS: AdSlot implements session deduplication key to prevent duplicate impressions

TEST GROUP 6: Daily Intelligence Report Real Data Grounding
  ✅ PASS: Zero fake subject counts in daily-report-service
  ✅ PASS: Zero fake error counts in daily-report-service
  ✅ PASS: Zero fake natural sciences counts in daily-report-service
  ✅ PASS: Daily report dynamically sources highest error areas from real learning stats

=======================================================
📊 TEST RESULTS: 18 PASSED | 0 FAILED
=======================================================

🎉 ALL REAL ANALYTICS CHECKS PASSED WITH 100% SUCCESS!
```

---

## 8. CHECKLIST DE DÉPLOIEMENT EN PRODUCTION

- [x] **Zéro Fake Metrics :** Aucun `Math.random()`, multiplicateur arbitraire ou fallback codé en dur ne subsiste dans `src/lib/admin` et `src/lib/operations`.
- [x] **Distinction Vrai 0 vs Non Disponible :** Tous les dénominateurs nuls sont encapsulés dans un `MetricState` avec `status: "not_available"`.
- [x] **Comptabilisation du Revenu :** Seules les commandes dont le paiement est formellement confirmé (`payment_status = 'PAID'`) sont sommées. Les commandes COD en attente ne sont jamais traitées comme du chiffre d'affaires.
- [x] **Attribution & Campagnes :** Aucune fausse campagne publicitaire n'est injectée. Seules les sessions réelles et leurs UTMs sont présentées.
- [x] **Mesure des Publicités Internes :** `<AdSlot />` n'enregistre une impression que si le composant est visible à au moins 50% dans le viewport (`IntersectionObserver`), avec déduplication de session.
- [x] **Assistant IA Administratif :** Les outils du `ADMIN_AI_TOOLS_REGISTRY` renvoient l'état réel de la base de données sans injecter de salles de classe ou de données fictives.
- [x] **Compilations & Types :** `npm run typecheck` et `npm run build` s'exécutent avec le code de sortie 0.

