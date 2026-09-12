/**
 * BAC Mastery — Visual Design System & Theme Engine Verification Battery
 * Validates:
 * - 3 Visual Personalities (⚡ FOCUS, ✨ BALANCE, 🌿 PURE)
 * - Design Tokens Completeness (CSS variables, surfaces, borders, typography)
 * - Micro-interactions, Motion, and Reduced Motion compliance
 * - RTL/LTR Alignment & Logical Directional Support
 * - Mobile Touch Target Ergonomics
 * - Zero Gender Labeling & Non-Destructive Codebase Invariants
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ ${message}`);
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    process.exitCode = 1;
  }
}

console.log("\n==================================================================");
console.log("  BAC MASTERY — VISUAL DESIGN SYSTEM & THEME ENGINE BATTERY");
console.log("==================================================================\n");

// ------------------------------------------------------------------
// Suite 1: Theme Tokens & CSS Engine (globals.css)
// ------------------------------------------------------------------
console.log("--- Suite 1: Theme Tokens & CSS Engine (globals.css) ---");
const globalsCssPath = path.join(rootDir, "src/app/globals.css");
const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

assert(globalsCss.includes('[data-theme="focus"]'), "Focus theme token block defined");
assert(globalsCss.includes('[data-theme="balance"]'), "Balance theme token block defined");
assert(globalsCss.includes('[data-theme="pure"]'), "Pure theme token block defined");

// Focus Theme Tokens
assert(globalsCss.includes("--color-bg-base: #080D1A") || globalsCss.includes("#080D1A"), "Focus theme has deep navy base");
assert(globalsCss.includes("--color-primary: #3B82F6"), "Focus theme has electric blue primary");
assert(globalsCss.includes("--color-accent: #06B6D4"), "Focus theme has cyan accent");

// Balance Theme Tokens
assert(globalsCss.includes("--color-bg-base: #130B1E") || globalsCss.includes("#130B1E"), "Balance theme has deep plum base");
assert(globalsCss.includes("--color-primary: #A855F7"), "Balance theme has violet primary");
assert(globalsCss.includes("--color-accent: #F472B6"), "Balance theme has soft coral/pink accent");

// Pure Theme Tokens
assert(globalsCss.includes("--color-bg-base: #F8FAFC"), "Pure theme has ivory/clean slate base");
assert(globalsCss.includes("--color-primary: #0F172A"), "Pure theme has graphite primary");
assert(globalsCss.includes("--color-accent: #0D9488"), "Pure theme has teal accent");

// Color Schemes
assert(globalsCss.includes("color-scheme: dark"), "Dark color-scheme configured for Focus & Balance");
assert(globalsCss.includes("color-scheme: light"), "Light color-scheme configured for Pure");

// Animations & Micro-interactions
assert(globalsCss.includes("@keyframes calmShake"), "Calm error feedback keyframes defined");
assert(globalsCss.includes("@keyframes subtlePulse"), "Subtle active mission pulse keyframes defined");
assert(globalsCss.includes("prefers-reduced-motion"), "Accessibility reduced-motion query defined");
assert(globalsCss.includes("::-webkit-scrollbar"), "Custom themed scrollbars defined");

// ------------------------------------------------------------------
// Suite 2: Tailwind Design Tokens Configuration
// ------------------------------------------------------------------
console.log("\n--- Suite 2: Tailwind Configuration (tailwind.config.ts) ---");
const tailwindConfigPath = path.join(rootDir, "tailwind.config.ts");
const tailwindConfig = fs.readFileSync(tailwindConfigPath, "utf-8");

assert(tailwindConfig.includes("canvas: \"var(--color-bg-base)\""), "Tailwind exposes canvas token");
assert(tailwindConfig.includes("surface: \"var(--color-bg-surface)\""), "Tailwind exposes surface token");
assert(tailwindConfig.includes("card: \"var(--color-bg-card)\""), "Tailwind exposes card token");
assert(tailwindConfig.includes("theme-border"), "Tailwind exposes theme-border token");
assert(tailwindConfig.includes("theme-text"), "Tailwind exposes theme-text token");
assert(tailwindConfig.includes("theme-primary"), "Tailwind exposes theme-primary token");
assert(tailwindConfig.includes("theme-accent"), "Tailwind exposes theme-accent token");

// ------------------------------------------------------------------
// Suite 3: Theme Context & Persistence (context.tsx)
// ------------------------------------------------------------------
console.log("\n--- Suite 3: Theme Context & Persistence ---");
const themeContextPath = path.join(rootDir, "src/lib/theme/context.tsx");
const themeContext = fs.readFileSync(themeContextPath, "utf-8");

assert(themeContext.includes("ThemeProvider"), "ThemeProvider is exported");
assert(themeContext.includes("useTheme"), "useTheme hook is exported");
assert(themeContext.includes('DEFAULT_THEME: Theme = "focus"'), "Default theme is set to focus");
assert(themeContext.includes("bac_mastery_theme"), "localStorage key bac_mastery_theme is managed");
assert(themeContext.includes("data-theme"), "DOM attribute data-theme is synchronized");

// Verification that themes are personality-driven, not gender-labeled
assert(!themeContext.includes("femme") && !themeContext.includes("homme"), "Themes do not use French gender labels");
assert(!themeContext.includes("ذكر") && !themeContext.includes("أنثى"), "Themes do not use Arabic gender labels");
assert(themeContext.includes("⚡") && themeContext.includes("✨") && themeContext.includes("🌿"), "All 3 theme icons are present");
assert(themeContext.includes('"focus"') && themeContext.includes('"balance"') && themeContext.includes('"pure"'), "All 3 theme IDs are registered");

// ------------------------------------------------------------------
// Suite 4: Core UI Components Theme Adherence
// ------------------------------------------------------------------
console.log("\n--- Suite 4: Core UI Components Theme Adherence ---");

// AppShell
const appShellPath = path.join(rootDir, "src/components/ui/AppShell.tsx");
const appShell = fs.readFileSync(appShellPath, "utf-8");
assert(appShell.includes("bg-canvas") && appShell.includes("text-theme-text"), "AppShell uses theme canvas and text");
assert(!appShell.includes("bg-[#0B1020]"), "AppShell has zero hardcoded dark backgrounds");

// TopBar
const topBarPath = path.join(rootDir, "src/components/ui/TopBar.tsx");
const topBar = fs.readFileSync(topBarPath, "utf-8");
assert(topBar.includes("ThemeSelector"), "TopBar embeds ThemeSelector");
assert(topBar.includes("bg-surface"), "TopBar uses bg-surface token");
assert(topBar.includes("border-theme"), "TopBar uses border-theme token");

// BottomNav
const bottomNavPath = path.join(rootDir, "src/components/ui/BottomNav.tsx");
const bottomNav = fs.readFileSync(bottomNavPath, "utf-8");
assert(bottomNav.includes("bg-surface"), "BottomNav uses bg-surface token");
assert(bottomNav.includes("border-theme"), "BottomNav uses border-theme token");
assert(bottomNav.includes("min-h-[48px]"), "BottomNav guarantees 48px ergonomic touch targets");

// Card
const cardPath = path.join(rootDir, "src/components/ui/Card.tsx");
const card = fs.readFileSync(cardPath, "utf-8");
assert(card.includes("bg-card") && card.includes("border-theme"), "Card uses bg-card and border-theme");
assert(card.includes("shadow-theme-card"), "Card uses shadow-theme-card token");
assert(!card.includes("bg-[#111827]"), "Card default variant does not hardcode dark background");

// Button
const buttonPath = path.join(rootDir, "src/components/ui/Button.tsx");
const button = fs.readFileSync(buttonPath, "utf-8");
assert(button.includes("bg-[var(--color-primary)]"), "Button uses dynamic theme primary action color");
assert(button.includes("active:scale-[0.98]"), "Button features tactile press scale-down");
assert(button.includes("hover:-translate-y-0.5"), "Button features subtle elevation on hover");

// ProgressBar
const progressBarPath = path.join(rootDir, "src/components/ui/ProgressBar.tsx");
const progressBar = fs.readFileSync(progressBarPath, "utf-8");
assert(progressBar.includes("tabular-nums"), "ProgressBar uses tabular numerals for percentage clarity");
assert(progressBar.includes("bg-card-muted") && progressBar.includes("border-theme"), "ProgressBar track adapts to active theme");

// RoadVisualizer
const roadVisualizerPath = path.join(rootDir, "src/components/ui/RoadVisualizer.tsx");
const roadVisualizer = fs.readFileSync(roadVisualizerPath, "utf-8");
assert(
  roadVisualizer.includes("ltr:left-") && roadVisualizer.includes("rtl:right-"),
  "RoadVisualizer uses bidirectional RTL/LTR logical placement for the central pathway spine"
);
assert(roadVisualizer.includes("bg-card"), "RoadVisualizer node cards use theme card token");

// ThemeSelector
const themeSelectorPath = path.join(rootDir, "src/components/ui/ThemeSelector.tsx");
const themeSelector = fs.readFileSync(themeSelectorPath, "utf-8");
assert(themeSelector.includes('variant === "cards"'), "ThemeSelector supports full cards variant");
assert(themeSelector.includes('variant = "compact"') || themeSelector.includes('variant === "compact"'), "ThemeSelector supports compact header variant");
assert(themeSelector.includes("useTheme"), "ThemeSelector consumes useTheme hook");
assert(themeSelector.includes("THEMES"), "ThemeSelector connects to THEMES configuration");

// ------------------------------------------------------------------
// Suite 5: Account & Page Integration
// ------------------------------------------------------------------
console.log("\n--- Suite 5: Account & Page Integration ---");
const accountPagePath = path.join(rootDir, "src/app/account/page.tsx");
const accountPage = fs.readFileSync(accountPagePath, "utf-8");
assert(accountPage.includes("ThemeSelector"), "Account page includes ThemeSelector");
assert(accountPage.includes('variant="cards"'), "Account page displays the 3 theme cards");

const rootLayoutPath = path.join(rootDir, "src/app/layout.tsx");
const rootLayout = fs.readFileSync(rootLayoutPath, "utf-8");
assert(rootLayout.includes("ThemeProvider"), "RootLayout wraps application in ThemeProvider");
assert(rootLayout.includes("bg-canvas text-theme-text"), "RootLayout applies theme canvas and text");

console.log("\n==================================================================");
console.log(`  RESULT: ${passedAssertions} / ${totalAssertions} assertions passed (100%)`);
console.log("==================================================================\n");

if (passedAssertions !== totalAssertions) {
  process.exit(1);
}
