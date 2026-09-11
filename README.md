# BAC Mastery — bac2027

> **"ماشي واش تقرا. كيفاش توصل."**  
> **من مستواك الحالي إلى هدفك في البكالوريا.**

BAC Mastery est une plateforme d'apprentissage adaptatif conçue spécifiquement pour les élèves algériens préparant le Baccalauréat (filière Sciences Expérimentales — 3AS).

---

## 🎯 La Boucle d'Apprentissage

$$\text{الهدف} \longrightarrow \text{التشخيص} \longrightarrow \text{الفجوة} \longrightarrow \text{المهمة} \longrightarrow \text{التدريب} \longrightarrow \text{الغلط} \longrightarrow \text{الترميم} \longrightarrow \text{إعادة الاختبار} \longrightarrow \text{التمكن}$$

1. **Objectif Stratégique (الهدف)**: Définition d'un objectif de moyenne au BAC (ex: 16.00/20) avec auto-évaluation guidée.
2. **Diagnostic Empirique (التشخيص)**: Test de 15 questions ciblant les 4 dimensions cognitives (connaissances, compréhension, application, méthodologie).
3. **Analyse des Écarts (تحليل الفجوة)**: Détection du goulet d'étranglement primaire sans sur-promesse.
4. **Feuille de Route Adaptative (الخريطة التكيفية)**: Priorisation déterministe (NOW, NEXT, PROGRESS) selon 7 niveaux de priorité.
5. **Entraînement & Missions (التدريب والمهمات)**: Questions pratiques ciblées avec évaluation de la confiance métacognitive (1 à 5).
6. **Laboratoire d'Erreurs (مخبر الأخطاء)**: *"الغلط ماشي فشل. الغلط معلومة."* — Diagnostic de la cause de l'erreur (oubli, incompréhension, méthodologie, calcul, etc.).
7. **Guide de Réparation (خطوات الترميم)**: Étapes d'action concrètes et stratégie adaptée à la cause identifiée.
8. **Re-Test Jumelé (إعادة الاختبار)**: Exercice équivalent inédit (*"سؤال جديد • نفس المهارة"*) pour valider la remédiation.
9. **Preuve de Maîtrise (إثبات التمكن)**: Maîtrise démontrée uniquement après réussite du re-test.

---

## 🛠️ Stack Technique

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Thème Dark-First, Tokens sur-mesure)
- **Typographie**: `IBM Plex Sans Arabic` + `Plus Jakarta Sans`
- **Icônes**: [Lucide React](https://lucide.dev/)
- **Persistance**: Local-First via `localStorage` (Zéro dépendance serveur obligatoire)
- **Bilingue**: Support complet Arabe (RTL) et Français (LTR)

---

## 🚀 Démarrage Local

```bash
# 1. Cloner le projet
git clone https://github.com/orleansdeco-lang/bac2027.git
cd bac2027

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🧪 Tests Automatisés

Le projet comprend 6 suites de tests complètes (109 tests) :

```bash
# Vérification TypeScript
npm run typecheck

# Build de production
npm run build

# Suites de tests du moteur
node ./scripts/test-onboarding.mjs     # 3/3 tests
node ./scripts/test-diagnostic.mjs     # 18/18 tests
node ./scripts/test-missions.mjs       # 17/17 tests
node ./scripts/test-mastery.mjs        # 28/28 tests
node ./scripts/test-roadmap.mjs        # 23/23 tests
node ./scripts/test-content-model.mjs  # 20/20 tests
```

---

## 🌐 Déploiement en Ligne (Vercel)

Le projet est 100% prêt pour un déploiement instantané sur **Vercel** :

1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte GitHub (`orleansdeco-lang`).
2. Cliquez sur **"Add New Project"** > **"Import Git Repository"**.
3. Sélectionnez le repository **`bac2027`**.
4. Laissez les paramètres par défaut (Next.js détecté automatiquement).
5. Cliquez sur **"Deploy"**. En moins de 60 secondes, votre application sera accessible en ligne sur une URL publique sécurisée (HTTPS).

---

## 📄 Licence

Projet développé pour les candidats au Baccalauréat Algérien. Tous droits réservés.
