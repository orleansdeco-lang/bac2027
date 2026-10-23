import fs from 'fs';
import path from 'path';

/**
 * High-definition Algerian Curriculum Cover Template Generator
 */
function createCoverSVG({
  title,
  subtitle,
  stream,
  editionYear = "2024 / 2025",
  badgeType = "كـتـاب مـدرسـي",
  theme: {
    bgDark,
    bgMid,
    bgLight,
    accentGold,
    accentGlow,
    borderGold,
  },
  illustrationSvg,
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgDark}" />
      <stop offset="50%" stop-color="${bgMid}" />
      <stop offset="100%" stop-color="${bgDark}" />
    </linearGradient>

    <!-- Gold Text Gradient -->
    <linearGradient id="goldTitle" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="35%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="${accentGold}" />
      <stop offset="100%" stop-color="${borderGold}" />
    </linearGradient>

    <!-- Border Gradient -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${borderGold}" />
      <stop offset="50%" stop-color="#fde047" />
      <stop offset="100%" stop-color="${accentGold}" />
    </linearGradient>

    <!-- Vignette Gradient -->
    <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bgDark}" stop-opacity="0.95" />
      <stop offset="25%" stop-color="${bgDark}" stop-opacity="0.4" />
      <stop offset="70%" stop-color="${bgDark}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${bgDark}" stop-opacity="0.95" />
    </linearGradient>

    <!-- Radial Glow Behind Subject Visual -->
    <radialGradient id="centerGlow" cx="50%" cy="58%" r="45%">
      <stop offset="0%" stop-color="${accentGlow}" stop-opacity="0.45" />
      <stop offset="50%" stop-color="${accentGlow}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${bgDark}" stop-opacity="0" />
    </radialGradient>

    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000000" flood-opacity="0.85" />
    </filter>

    <filter id="strongGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${accentGlow}" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="600" height="800" fill="${bgDark}" />

  <!-- Thematic Radial Backlight -->
  <rect x="0" y="240" width="600" height="560" fill="url(#centerGlow)" />

  <!-- Subject Expressive Artwork / Scene -->
  <g transform="translate(0, 260)">
    ${illustrationSvg}
  </g>

  <!-- Vignette Fade Overlay -->
  <rect x="0" y="240" width="600" height="560" fill="url(#vignette)" />

  <!-- Header Container -->
  <rect width="600" height="260" fill="url(#headerGrad)" />
  <rect x="0" y="0" width="600" height="7" fill="url(#goldBorder)" />

  <!-- Official State Header -->
  <g text-anchor="middle" font-family="'Cairo', 'Amiri', 'Traditional Arabic', serif" fill="#fef3c7" filter="url(#dropShadow)">
    <text x="300" y="44" font-size="18" font-weight="bold" letter-spacing="0.5">
      الـجـمـهـوريـة الـجـزائـريـة الـدّيـمـقـراطـيـة الـشـعـبـيـة
    </text>
    <text x="300" y="76" font-size="20" font-weight="900" fill="#fde047">
      وزارة الـتـربـيـة الـوطـنـيـة
    </text>
  </g>

  <!-- National Crescent & Star Badge -->
  <g transform="translate(300, 110)">
    <circle cx="0" cy="0" r="20" fill="${bgMid}" stroke="url(#goldBorder)" stroke-width="2" filter="url(#dropShadow)" />
    <path d="M 3 -10 A 12 12 0 1 0 3 10 A 9.5 9.5 0 1 1 3 -10 Z" fill="#fde047" />
    <polygon points="5,-2 7,-1 9,-1 7.5,1 8.5,3 6,1.5 4,3 5,0.5 3,-1 6,-1" fill="#fde047" />
  </g>

  <!-- Header Separator Line -->
  <line x1="80" y1="140" x2="520" y2="140" stroke="url(#goldBorder)" stroke-width="1.5" stroke-opacity="0.8" />
  <circle cx="300" cy="140" r="3.5" fill="#fde047" />

  <!-- Main Subject Title -->
  <g filter="url(#dropShadow)">
    <text x="300" y="200" text-anchor="middle" font-family="'Cairo', 'Amiri', 'Arial Black', sans-serif" font-size="${title.length > 20 ? 38 : 46}" font-weight="900" fill="url(#goldTitle)" filter="url(#strongGlow)" stroke="${bgDark}" stroke-width="1.2">
      ${title}
    </text>
  </g>

  <!-- Year & Subtitle Ribbon -->
  <g filter="url(#dropShadow)">
    <rect x="${subtitle ? 80 : 120}" y="222" width="${subtitle ? 440 : 360}" height="36" rx="18" fill="${bgDark}" fill-opacity="0.9" stroke="url(#goldBorder)" stroke-width="1.5" />
    <text x="300" y="246" text-anchor="middle" font-family="'Cairo', 'Tahoma', sans-serif" font-size="16" font-weight="900" fill="#ffffff">
      ${subtitle ? subtitle : "السنة الثالثة ثانوي • بكالوريا"}
    </text>
  </g>

  <!-- Stream Tag Ribbon -->
  <g filter="url(#dropShadow)" transform="translate(300, 280)">
    <rect x="-180" y="0" width="360" height="30" rx="15" fill="${bgMid}" fill-opacity="0.95" stroke="${borderGold}" stroke-width="1" />
    <text x="0" y="20" text-anchor="middle" font-family="'Cairo', 'Tahoma', sans-serif" font-size="14" font-weight="bold" fill="#fef08a">
      ${stream}
    </text>
  </g>

  <!-- Bottom Official Badge -->
  <g transform="translate(485, 740)" filter="url(#dropShadow)">
    <rect x="-65" y="-22" width="130" height="44" rx="10" fill="${bgDark}" fill-opacity="0.95" stroke="url(#goldBorder)" stroke-width="1.5" />
    <text x="0" y="-3" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="13" font-weight="900" fill="#ffffff">
      ${badgeType.split(' ')[0] || "كتاب"}
    </text>
    <text x="0" y="15" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="12" font-weight="bold" fill="#fde047">
      ${badgeType.split(' ')[1] || "مدرسي"}
    </text>
  </g>

  <!-- Edition Year -->
  <g transform="translate(105, 740)" filter="url(#dropShadow)">
    <rect x="-55" y="-18" width="110" height="36" rx="8" fill="${bgDark}" fill-opacity="0.95" stroke="url(#goldBorder)" stroke-width="1" />
    <text x="0" y="6" text-anchor="middle" font-family="'Cairo', 'Courier New', monospace" font-size="13" font-weight="bold" fill="#fef08a">
      ${editionYear}
    </text>
  </g>

  <!-- Outer Protective Frame -->
  <rect x="16" y="16" width="568" height="768" rx="16" fill="none" stroke="url(#goldBorder)" stroke-width="2" stroke-opacity="0.85" />
  <rect x="22" y="22" width="556" height="756" rx="12" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.12" />
</svg>`;
}

const coversData = [
  // 1. الهندسة الميكانيكية
  {
    filename: 'cover-mech-001.svg',
    title: 'الهندسة الميكانيكية',
    subtitle: 'دراسة الآليات • التحليل الوظيفي • RDM',
    stream: 'الشعبة: تقني رياضي • هندسة ميكانيكية',
    badgeType: 'كـتـاب مـدرسـي',
    theme: {
      bgDark: '#0a0f1d',
      bgMid: '#162038',
      bgLight: '#243254',
      accentGold: '#f59e0b',
      accentGlow: '#38bdf8',
      borderGold: '#d97706',
    },
    illustrationSvg: `
      <!-- Interlocking Precision Gears & Robotic Arm -->
      <g stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.85">
        <!-- Big Central Sun Gear -->
        <circle cx="300" cy="200" r="110" stroke="#f59e0b" stroke-width="4" stroke-dasharray="14 10" />
        <circle cx="300" cy="200" r="85" stroke="#f59e0b" stroke-width="2" />
        <circle cx="300" cy="200" r="50" fill="#162038" stroke="#38bdf8" stroke-width="3" />
        <circle cx="300" cy="200" r="22" fill="#0a0f1d" stroke="#fde047" stroke-width="3" />
        <!-- Gear Spokes -->
        <line x1="190" y1="200" x2="410" y2="200" stroke="#f59e0b" stroke-width="3" />
        <line x1="300" y1="90" x2="300" y2="310" stroke="#f59e0b" stroke-width="3" />
        <line x1="222" y1="122" x2="378" y2="278" stroke="#f59e0b" stroke-width="2" />
        <line x1="222" y1="278" x2="378" y2="122" stroke="#f59e0b" stroke-width="2" />

        <!-- Satellite Gear Left -->
        <circle cx="150" cy="290" r="65" stroke="#38bdf8" stroke-width="3" stroke-dasharray="10 8" />
        <circle cx="150" cy="290" r="25" fill="#0a0f1d" stroke="#f59e0b" stroke-width="2" />
        <!-- Satellite Gear Right -->
        <circle cx="450" cy="290" r="65" stroke="#38bdf8" stroke-width="3" stroke-dasharray="10 8" />
        <circle cx="450" cy="290" r="25" fill="#0a0f1d" stroke="#f59e0b" stroke-width="2" />

        <!-- Technical Drawing Blueprint Grid -->
        <path d="M 50 380 L 550 380 M 50 420 L 550 420" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="6 6" />
        <!-- Dimension Line -->
        <line x1="150" y1="390" x2="450" y2="390" stroke="#fde047" stroke-width="1.5" />
        <polygon points="150,390 160,387 160,393" fill="#fde047" />
        <polygon points="450,390 440,387 440,393" fill="#fde047" />
        <text x="300" y="384" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#fde047" text-anchor="middle">Ø 300 H7/g6</text>

        <!-- Mechanical Kinematic Vectors -->
        <path d="M 230 110 C 270 80 330 80 370 110" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow)" />
        <text x="300" y="70" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#38bdf8" text-anchor="middle">ω = 1450 tr/min</text>
      </g>
    `,
  },

  // 2. الهندسة المدنية
  {
    filename: 'cover-civil-001.svg',
    title: 'الهندسة المدنية',
    subtitle: 'علم السكون • الخرسانة المسلحة • المنشآت',
    stream: 'الشعبة: تقني رياضي • هندسة مدنية',
    badgeType: 'كـتـاب مـدرسـي',
    theme: {
      bgDark: '#081326',
      bgMid: '#12284c',
      bgLight: '#1f4077',
      accentGold: '#fbbf24',
      accentGlow: '#60a5fa',
      borderGold: '#d97706',
    },
    illustrationSvg: `
      <!-- Suspension Bridge Cables & Structural Truss Geometry -->
      <g stroke="#60a5fa" stroke-width="2" fill="none" opacity="0.9">
        <!-- Main Tower Pylon Left -->
        <path d="M 180 360 L 210 100 L 240 360 Z" fill="#12284c" stroke="#fbbf24" stroke-width="3" />
        <line x1="195" y1="230" x2="225" y2="230" stroke="#fbbf24" stroke-width="2.5" />
        <line x1="202" y1="165" x2="218" y2="165" stroke="#fbbf24" stroke-width="2" />

        <!-- Main Tower Pylon Right -->
        <path d="M 360 360 L 390 100 L 420 360 Z" fill="#12284c" stroke="#fbbf24" stroke-width="3" />
        <line x1="375" y1="230" x2="405" y2="230" stroke="#fbbf24" stroke-width="2.5" />
        <line x1="382" y1="165" x2="398" y2="165" stroke="#fbbf24" stroke-width="2" />

        <!-- Catenary Main Suspension Cables -->
        <path d="M 50 200 Q 210 260 300 280 Q 390 260 550 200" stroke="#fde047" stroke-width="4" />
        <path d="M 210 100 Q 300 240 390 100" stroke="#fde047" stroke-width="4" />
        <path d="M 50 260 L 210 100" stroke="#fde047" stroke-width="3" />
        <path d="M 390 100 L 550 260" stroke="#fde047" stroke-width="3" />

        <!-- Vertical Suspension Hangers -->
        <line x1="240" y1="210" x2="240" y2="350" stroke="#60a5fa" stroke-width="1.5" />
        <line x1="270" y1="250" x2="270" y2="350" stroke="#60a5fa" stroke-width="1.5" />
        <line x1="300" y1="260" x2="300" y2="350" stroke="#60a5fa" stroke-width="1.5" />
        <line x1="330" y1="250" x2="330" y2="350" stroke="#60a5fa" stroke-width="1.5" />
        <line x1="360" y1="210" x2="360" y2="350" stroke="#60a5fa" stroke-width="1.5" />

        <!-- Bridge Deck & Warren Truss -->
        <rect x="40" y="350" width="520" height="24" fill="#081326" stroke="#fbbf24" stroke-width="2.5" />
        <!-- Truss Triangles -->
        <path d="M 60 374 L 80 350 L 100 374 L 120 350 L 140 374 L 160 350 L 180 374 L 200 350 L 220 374 L 240 350 L 260 374 L 280 350 L 300 374 L 320 350 L 340 374 L 360 350 L 380 374 L 400 350 L 420 374 L 440 350 L 460 374 L 480 350 L 500 374 L 520 350 L 540 374" stroke="#60a5fa" stroke-width="1.5" />

        <!-- Statics Equilibrium Formula Vector -->
        <text x="300" y="420" font-family="'Courier New', serif" font-size="18" font-weight="bold" fill="#fde047" text-anchor="middle">∑ F_ext = 0  •  ∑ M_(/O) = 0</text>
      </g>
    `,
  },

  // 3. هندسة الطرائق
  {
    filename: 'cover-chem-001.svg',
    title: 'هندسة الطرائق',
    subtitle: 'الكيمياء العضوية • الحركية والديناميكا الحرارية',
    stream: 'الشعبة: تقني رياضي • هندسة الطرائق',
    badgeType: 'كـتـاب مـدرسـي',
    theme: {
      bgDark: '#03201d',
      bgMid: '#0a423d',
      bgLight: '#146860',
      accentGold: '#2dd4bf',
      accentGlow: '#14b8a6',
      borderGold: '#0d9488',
    },
    illustrationSvg: `
      <!-- Benzene Rings, Chemical Distillation & Molecular Bonds -->
      <g stroke="#2dd4bf" stroke-width="2.5" fill="none" opacity="0.9">
        <!-- Central Luminous Benzene Ring -->
        <polygon points="300,120 370,160 370,240 300,280 230,240 230,160" stroke="#fde047" stroke-width="4" fill="#0a423d" fill-opacity="0.6" />
        <circle cx="300" cy="200" r="45" stroke="#fde047" stroke-width="2.5" stroke-dasharray="8 6" />

        <!-- Attached Functional Groups -->
        <line x1="370" y1="160" x2="430" y2="125" stroke="#fde047" stroke-width="3" />
        <text x="445" y="125" font-family="'Courier New', sans-serif" font-size="20" font-weight="900" fill="#2dd4bf">CH₃</text>

        <line x1="300" y1="280" x2="300" y2="340" stroke="#fde047" stroke-width="3" />
        <text x="300" y="365" font-family="'Courier New', sans-serif" font-size="20" font-weight="900" fill="#2dd4bf" text-anchor="middle">OH</text>

        <line x1="230" y1="160" x2="170" y2="125" stroke="#fde047" stroke-width="3" />
        <text x="135" y="125" font-family="'Courier New', sans-serif" font-size="20" font-weight="900" fill="#2dd4bf" text-anchor="middle">NO₂</text>

        <!-- Industrial Distillation Column Right -->
        <rect x="440" y="180" width="70" height="200" rx="10" stroke="#2dd4bf" stroke-width="2" fill="#03201d" fill-opacity="0.8" />
        <line x1="440" y1="220" x2="510" y2="220" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="4 4" />
        <line x1="440" y1="260" x2="510" y2="260" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="4 4" />
        <line x1="440" y1="300" x2="510" y2="300" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="4 4" />
        <line x1="440" y1="340" x2="510" y2="340" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="4 4" />
        <text x="475" y="395" font-family="'Courier New', monospace" font-size="12" fill="#fde047" text-anchor="middle">تقطير مجزأ</text>

        <!-- Erlenmeyer Flask Left -->
        <path d="M 120 220 L 140 220 L 140 250 L 100 340 A 15 15 0 0 0 115 360 L 175 360 A 15 15 0 0 0 190 340 L 150 250 L 150 220 Z" stroke="#2dd4bf" stroke-width="2.5" fill="#03201d" fill-opacity="0.8" />
        <path d="M 108 320 Q 145 315 182 320 L 175 355 L 115 355 Z" fill="#14b8a6" fill-opacity="0.6" />
        <!-- Effervescent bubbles -->
        <circle cx="135" cy="300" r="4" fill="#fde047" />
        <circle cx="155" cy="285" r="3" fill="#fde047" />
        <circle cx="145" cy="265" r="2.5" fill="#fde047" />

        <!-- Thermodynamics & Enthalpy -->
        <text x="300" y="420" font-family="'Courier New', serif" font-size="18" font-weight="bold" fill="#fde047" text-anchor="middle">ΔH° = ∑ ΔH°_f(prod) - ∑ ΔH°_f(réact)</text>
      </g>
    `,
  },

  // 4. الرياضيات - الجزء الثاني
  {
    filename: 'cover-math-002.svg',
    title: 'الرياضيات • ج 2',
    subtitle: 'الأعداد المركبة • الاحتمالات • الهندسة الفضائية',
    stream: 'الشعبة: علوم تجريبية | تقني رياضي | رياضيات',
    badgeType: 'سلسلة مـرجـعـيـة',
    theme: {
      bgDark: '#0b0f19',
      bgMid: '#161e31',
      bgLight: '#263353',
      accentGold: '#fbbf24',
      accentGlow: '#6366f1',
      borderGold: '#d97706',
    },
    illustrationSvg: `
      <!-- Complex Plane, 3D Vectors & Probability Curve -->
      <g stroke="#818cf8" stroke-width="2" fill="none" opacity="0.9">
        <!-- 3D Coordinate Space Axes (x, y, z) -->
        <line x1="300" y1="220" x2="480" y2="220" stroke="#fde047" stroke-width="3" />
        <polygon points="485,220 473,215 473,225" fill="#fde047" />
        <text x="495" y="225" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#fde047">Re (x)</text>

        <line x1="300" y1="220" x2="300" y2="50" stroke="#fde047" stroke-width="3" />
        <polygon points="300,45 295,57 305,57" fill="#fde047" />
        <text x="300" y="35" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#fde047" text-anchor="middle">Im (y)</text>

        <line x1="300" y1="220" x2="160" y2="330" stroke="#fde047" stroke-width="3" />
        <polygon points="155,334 163,322 171,329" fill="#fde047" />
        <text x="140" y="348" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#fde047">z (cote)</text>

        <!-- Complex Number Vector z = r * e^(iθ) -->
        <circle cx="300" cy="220" r="140" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6 6" />
        <line x1="300" y1="220" x2="400" y2="120" stroke="#38bdf8" stroke-width="3.5" />
        <circle cx="400" cy="120" r="6" fill="#fde047" stroke="#ffffff" stroke-width="2" />
        <text x="415" y="115" font-family="'Courier New', serif" font-size="18" font-weight="900" fill="#38bdf8">z = r·e^(iθ)</text>

        <!-- Gaussian Probability Normal Bell Curve -->
        <path d="M 80 400 Q 220 400 260 350 Q 300 280 340 350 Q 380 400 520 400" stroke="#fde047" stroke-width="3" />
        <line x1="300" y1="280" x2="300" y2="400" stroke="#fde047" stroke-width="1.5" stroke-dasharray="4 4" />
        <text x="300" y="425" font-family="'Courier New', serif" font-size="16" font-weight="bold" fill="#818cf8" text-anchor="middle">P(A ∩ B) = P(A) · P(B|A)</text>
      </g>
    `,
  },

  // 5. العلوم الفيزيائية - الجزء الثاني
  {
    filename: 'cover-phys-002.svg',
    title: 'العلوم الفيزيائية • ج 2',
    subtitle: 'الميكانيك والجاذبية • الظواهر والتحولات النووية',
    stream: 'الشعبة: علوم تجريبية | تقني رياضي | رياضيات',
    badgeType: 'سلسلة مـرجـعـيـة',
    theme: {
      bgDark: '#030712',
      bgMid: '#0f172a',
      bgLight: '#1e293b',
      accentGold: '#38bdf8',
      accentGlow: '#0284c7',
      borderGold: '#facc15',
    },
    illustrationSvg: `
      <!-- Planetary Orbit & Nuclear Reactions (Strictly NO rainbow) -->
      <g stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.9">
        <!-- Glowing Central Planet / Earth -->
        <circle cx="240" cy="200" r="45" fill="#0f172a" stroke="#38bdf8" stroke-width="3" />
        <!-- Continental Lat/Long Grids -->
        <ellipse cx="240" cy="200" rx="45" ry="18" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 5" />
        <line x1="240" y1="155" x2="240" y2="245" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Elliptical Satellite Orbit -->
        <ellipse cx="240" cy="200" rx="160" ry="60" stroke="#fde047" stroke-width="2.5" transform="rotate(-25, 240, 200)" />
        <!-- Satellite Position -->
        <circle cx="370" cy="140" r="7" fill="#fde047" stroke="#ffffff" stroke-width="2" />
        <!-- Gravitational Force Vector -->
        <line x1="370" y1="140" x2="310" y2="170" stroke="#38bdf8" stroke-width="3" />
        <polygon points="310,170 322,165 320,175" fill="#38bdf8" />
        <text x="360" y="125" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#fde047">F_G = G·(M·m)/r²</text>

        <!-- Nuclear Fission Core Right -->
        <g transform="translate(420, 260)">
          <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
          <text x="0" y="6" font-family="'Courier New', sans-serif" font-size="13" font-weight="bold" fill="#fde047" text-anchor="middle">²³⁵U</text>
          <!-- Emitted Neutrons & Rays -->
          <line x1="0" y1="-30" x2="0" y2="-65" stroke="#38bdf8" stroke-width="2.5" />
          <circle cx="0" cy="-70" r="5" fill="#38bdf8" />
          <line x1="28" y1="20" x2="60" y2="45" stroke="#38bdf8" stroke-width="2.5" />
          <circle cx="65" cy="50" r="5" fill="#38bdf8" />
          <line x1="-28" y1="20" x2="-60" y2="45" stroke="#38bdf8" stroke-width="2.5" />
          <circle cx="-65" cy="50" r="5" fill="#38bdf8" />
        </g>

        <!-- Kepler Laws & Newton's Law -->
        <text x="300" y="420" font-family="'Courier New', serif" font-size="18" font-weight="bold" fill="#fde047" text-anchor="middle">T² / a³ = 4π² / (G·M)  •  E = Δm·c²</text>
      </g>
    `,
  },

  // 6. علوم الطبيعة والحياة - الجزء الثاني
  {
    filename: 'cover-sci-002.svg',
    title: 'علوم الطبيعة والحياة • ج 2',
    subtitle: 'المناعة • الاتصال العصبي • الجيولوجيا',
    stream: 'الشعبة: علوم تجريبية | رياضيات',
    badgeType: 'سلسلة مـرجـعـيـة',
    theme: {
      bgDark: '#022018',
      bgMid: '#064434',
      bgLight: '#0d6b53',
      accentGold: '#34d399',
      accentGlow: '#10b981',
      borderGold: '#facc15',
    },
    illustrationSvg: `
      <!-- Y-shaped Antibodies & Neural Synapses -->
      <g stroke="#34d399" stroke-width="3" fill="none" opacity="0.9">
        <!-- Central Y-shaped Antibody Structure (IgG) -->
        <g transform="translate(300, 190)" filter="url(#dropShadow)">
          <!-- Stem of Y (Fc region) -->
          <path d="M -8 100 L -8 10 L -40 -35 L -85 -50" stroke="#fde047" stroke-width="6" stroke-linecap="round" />
          <path d="M 8 100 L 8 10 L 40 -35 L 85 -50" stroke="#fde047" stroke-width="6" stroke-linecap="round" />
          <!-- Light chains -->
          <path d="M -30 0 L -60 -45 L -105 -60" stroke="#34d399" stroke-width="5" stroke-linecap="round" />
          <path d="M 30 0 L 60 -45 L 105 -60" stroke="#34d399" stroke-width="5" stroke-linecap="round" />
          <!-- Antigen binding sites (Paratopes) -->
          <polygon points="-85,-50 -105,-60 -95,-75 -75,-65" fill="#fde047" />
          <polygon points="85,-50 105,-60 95,-75 75,-65" fill="#fde047" />
          <!-- Bound Antigens -->
          <circle cx="-105" cy="-85" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
          <circle cx="105" cy="-85" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
          <text x="0" y="130" font-family="'Courier New', sans-serif" font-size="14" font-weight="900" fill="#34d399" text-anchor="middle">جسم مضاد نوعي (IgG)</text>
        </g>

        <!-- Neural Synapse on Bottom Right -->
        <g transform="translate(450, 310)">
          <path d="M -30 -40 Q 0 -10 30 -40" stroke="#34d399" stroke-width="3" />
          <path d="M -30 20 Q 0 -10 30 20" stroke="#34d399" stroke-width="3" />
          <!-- Neurotransmitter Vesicles -->
          <circle cx="-8" cy="-2" r="3.5" fill="#fde047" />
          <circle cx="6" cy="-4" r="3.5" fill="#fde047" />
          <circle cx="0" cy="5" r="3.5" fill="#fde047" />
        </g>

        <!-- Immunology Formula / Concept -->
        <text x="300" y="420" font-family="'Courier New', serif" font-size="18" font-weight="bold" fill="#fde047" text-anchor="middle">معقد مناعي (جسم مضاد - مستضد)</text>
      </g>
    `,
  },

  // 7. اللغة الإسبانية
  {
    filename: 'cover-esp-001.svg',
    title: 'Español • الإسبانية',
    subtitle: 'Gramática • Comprensión • Expresión Escrita',
    stream: 'الشعبة: لغات أجنبية (لغة أجنبية ثالثة)',
    badgeType: 'كـتـاب مـدرسـي',
    theme: {
      bgDark: '#2c0707',
      bgMid: '#571313',
      bgLight: '#8a2323',
      accentGold: '#facc15',
      accentGlow: '#f59e0b',
      borderGold: '#ca8a04',
    },
    illustrationSvg: `
      <!-- Spanish Guitar Silhouette & Moorish Alhambra Arches -->
      <g stroke="#facc15" stroke-width="2" fill="none" opacity="0.9">
        <!-- Alhambra Moorish Horseshoe Arch -->
        <path d="M 120 370 L 120 200 A 180 180 0 0 1 480 200 L 480 370" stroke="#facc15" stroke-width="3.5" fill="#571313" fill-opacity="0.5" />
        <path d="M 150 370 L 150 215 A 150 150 0 0 1 450 215 L 450 370" stroke="#facc15" stroke-width="1.5" stroke-dasharray="6 4" />

        <!-- Classical Spanish Guitar Silhouette Centered -->
        <g transform="translate(300, 230)" filter="url(#dropShadow)">
          <!-- Upper bout -->
          <path d="M 0 -90 C -35 -90 -45 -60 -35 -40 C -25 -20 -45 10 -55 40 C -65 75 -40 100 0 100 C 40 100 65 75 55 40 C 45 10 25 -20 35 -40 C 45 -60 35 -90 0 -90 Z" fill="#2c0707" stroke="#facc15" stroke-width="3" />
          <!-- Sound Hole -->
          <circle cx="0" cy="-20" r="20" fill="#150202" stroke="#facc15" stroke-width="2.5" />
          <circle cx="0" cy="-20" r="24" stroke="#facc15" stroke-width="1" stroke-dasharray="4 4" />
          <!-- Fretboard / Neck -->
          <rect x="-7" y="-190" width="14" height="100" fill="#2c0707" stroke="#facc15" stroke-width="2" />
          <line x1="-3" y1="-190" x2="-3" y2="40" stroke="#ffffff" stroke-width="0.8" />
          <line x1="0" y1="-190" x2="0" y2="40" stroke="#ffffff" stroke-width="0.8" />
          <line x1="3" y1="-190" x2="3" y2="40" stroke="#ffffff" stroke-width="0.8" />
        </g>

        <!-- Don Quixote Quote / Spanish Literature Motif -->
        <text x="300" y="420" font-family="'Times New Roman', serif" font-size="17" font-weight="bold" fill="#facc15" text-anchor="middle">«En un lugar de la Mancha, de cuyo nombre...»</text>
      </g>
    `,
  },

  // 8. اللغة الألمانية
  {
    filename: 'cover-deu-001.svg',
    title: 'Deutsch • الألمانية',
    subtitle: 'Grammatik • Leseverstehen • Wortschatz',
    stream: 'الشعبة: لغات أجنبية (لغة أجنبية ثالثة)',
    badgeType: 'كـتـاب مـدرسـي',
    theme: {
      bgDark: '#080c18',
      bgMid: '#131b2e',
      bgLight: '#212d4a',
      accentGold: '#f59e0b',
      accentGlow: '#eab308',
      borderGold: '#ca8a04',
    },
    illustrationSvg: `
      <!-- Brandenburg Gate Neoclassical Columns Silhouette -->
      <g stroke="#f59e0b" stroke-width="2" fill="none" opacity="0.9">
        <!-- Brandenburg Gate Entablature & Pediment -->
        <g transform="translate(300, 200)" filter="url(#dropShadow)">
          <!-- Top Quadriga Statue Silhouette Placeholder -->
          <path d="M -40 -70 L 40 -70 L 25 -50 L -25 -50 Z" fill="#f59e0b" />
          <rect x="-18" y="-95" width="36" height="25" fill="#f59e0b" />
          <!-- Attic Level -->
          <rect x="-190" y="-50" width="380" height="30" fill="#131b2e" stroke="#f59e0b" stroke-width="2.5" />
          <!-- Doric Columns (6 grand columns) -->
          <rect x="-170" y="-20" width="22" height="160" fill="#080c18" stroke="#f59e0b" stroke-width="2" />
          <rect x="-105" y="-20" width="22" height="160" fill="#080c18" stroke="#f59e0b" stroke-width="2" />
          <rect x="-40" y="-20" width="22" height="160" fill="#080c18" stroke="#f59e0b" stroke-width="2" />
          <rect x="25" y="-20" width="22" height="160" fill="#080c18" stroke="#f59e0b" stroke-width="2" />
          <rect x="90" y="-20" width="22" height="160" fill="#080c18" stroke="#f59e0b" stroke-width="2" />
          <rect x="155" y="-20" width="22" height="160" fill="#080c18" stroke="#f59e0b" stroke-width="2" />
          <!-- Base Podium -->
          <rect x="-200" y="140" width="400" height="20" fill="#131b2e" stroke="#f59e0b" stroke-width="2" />
        </g>

        <!-- Classic German Philosophy & Literature Phrase -->
        <text x="300" y="420" font-family="'Georgia', serif" font-size="17" font-weight="bold" fill="#f59e0b" text-anchor="middle">«Der Wille zum Wissen eröffnet die Zukunft»</text>
      </g>
    `,
  },

  // 9. اللغة الإيطالية
  {
    filename: 'cover-ita-001.svg',
    title: 'Italiano • الإيطالية',
    subtitle: 'Grammatica • Lessico • Produzione Scritta',
    stream: 'الشعبة: لغات أجنبية (لغة أجنبية ثالثة)',
    badgeType: 'كـتـاب مـدرسـي',
    theme: {
      bgDark: '#200808',
      bgMid: '#421313',
      bgLight: '#692020',
      accentGold: '#f59e0b',
      accentGlow: '#d97706',
      borderGold: '#b45309',
    },
    illustrationSvg: `
      <!-- Roman Colosseum & Florence Renaissance Duomo Silhouette -->
      <g stroke="#f59e0b" stroke-width="2" fill="none" opacity="0.9">
        <!-- Roman Colosseum Exterior Arcades -->
        <g transform="translate(300, 220)" filter="url(#dropShadow)">
          <!-- Outer Ellipse Silhouette -->
          <path d="M -210 110 C -210 -20 210 -20 210 110 Z" fill="#421313" fill-opacity="0.6" stroke="#f59e0b" stroke-width="2.5" />
          <!-- Tier 1 Arches -->
          <path d="M -180 110 L -180 70 A 15 15 0 0 1 -150 70 L -150 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M -135 110 L -135 70 A 15 15 0 0 1 -105 70 L -105 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M -90 110 L -90 70 A 15 15 0 0 1 -60 70 L -60 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M -45 110 L -45 70 A 15 15 0 0 1 -15 70 L -15 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M 0 110 L 0 70 A 15 15 0 0 1 30 70 L 30 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M 45 110 L 45 70 A 15 15 0 0 1 75 70 L 75 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M 90 110 L 90 70 A 15 15 0 0 1 120 70 L 120 110" stroke="#f59e0b" stroke-width="2" />
          <path d="M 135 110 L 135 70 A 15 15 0 0 1 165 70 L 165 110" stroke="#f59e0b" stroke-width="2" />
          <!-- Tier 2 Arches -->
          <line x1="-190" y1="50" x2="190" y2="50" stroke="#f59e0b" stroke-width="2" />
          <path d="M -150 50 L -150 15 A 12 12 0 0 1 -126 15 L -126 50" stroke="#f59e0b" stroke-width="1.5" />
          <path d="M -105 50 L -105 15 A 12 12 0 0 1 -81 15 L -81 50" stroke="#f59e0b" stroke-width="1.5" />
          <path d="M -60 50 L -60 15 A 12 12 0 0 1 -36 15 L -36 50" stroke="#f59e0b" stroke-width="1.5" />
          <path d="M -15 50 L -15 15 A 12 12 0 0 1 9 15 L 9 50" stroke="#f59e0b" stroke-width="1.5" />
          <path d="M 30 50 L 30 15 A 12 12 0 0 1 54 15 L 54 50" stroke="#f59e0b" stroke-width="1.5" />
          <path d="M 75 50 L 75 15 A 12 12 0 0 1 99 15 L 99 50" stroke="#f59e0b" stroke-width="1.5" />
          <path d="M 120 50 L 120 15 A 12 12 0 0 1 144 15 L 144 50" stroke="#f59e0b" stroke-width="1.5" />
        </g>

        <!-- Italian Renaissance Dante Alighieri Quotation -->
        <text x="300" y="420" font-family="'Times New Roman', serif" font-size="17" font-weight="bold" fill="#f59e0b" text-anchor="middle">«Fatti non foste a viver come bruti...»</text>
      </g>
    `,
  },

  // 10. التاريخ والجغرافيا - زاد البكالوريا
  {
    filename: 'cover-hist-002.svg',
    title: 'التاريخ والجغرافيا • زاد البكالوريا',
    subtitle: 'خرائط ذهنية • الشخصيات والتواريخ • منهجية',
    stream: 'الشعبة: جميع الشعب',
    badgeType: 'دليـل التـفـوق',
    theme: {
      bgDark: '#1a0d05',
      bgMid: '#381c0c',
      bgLight: '#592c14',
      accentGold: '#f59e0b',
      accentGlow: '#d97706',
      borderGold: '#b45309',
    },
    illustrationSvg: `
      <!-- Vintage Algerian Revolution Astrolabe & Historical Map Motif -->
      <g stroke="#f59e0b" stroke-width="2" fill="none" opacity="0.9">
        <!-- Astrolabe Celestial Coordinates -->
        <circle cx="300" cy="200" r="110" stroke="#f59e0b" stroke-width="3" />
        <circle cx="300" cy="200" r="80" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="8 6" />
        <circle cx="300" cy="200" r="45" fill="#381c0c" stroke="#fde047" stroke-width="2" />
        <circle cx="300" cy="200" r="10" fill="#fde047" />

        <!-- Compass Pointer Needles -->
        <polygon points="300,95 306,190 300,200 294,190" fill="#ef4444" stroke="#fde047" stroke-width="1" />
        <polygon points="300,305 306,210 300,200 294,210" fill="#fde047" stroke="#381c0c" stroke-width="1" />
        <polygon points="195,200 290,194 300,200 290,206" fill="#fde047" stroke="#381c0c" stroke-width="1" />
        <polygon points="405,200 310,194 300,200 310,206" fill="#fde047" stroke="#381c0c" stroke-width="1" />

        <!-- Historic 1st November 1954 Declaration Seal Motif -->
        <rect x="160" y="340" width="280" height="38" rx="8" fill="#1a0d05" stroke="#f59e0b" stroke-width="1.5" />
        <text x="300" y="365" font-family="'Amiri', 'Traditional Arabic', serif" font-size="16" font-weight="900" fill="#fde047" text-anchor="middle">بيان أول نوفمبر 1954 • ثورة التحرير</text>

        <!-- World History Timeline Coordinates -->
        <text x="300" y="420" font-family="'Cairo', sans-serif" font-size="16" font-weight="bold" fill="#f59e0b" text-anchor="middle">منهجية تحليل الخرائط والمقال التاريخي</text>
      </g>
    `,
  },
];

const outputDir = path.resolve('public/images/books');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

coversData.forEach((c) => {
  const fullSvg = createCoverSVG(c);
  const outPath = path.join(outputDir, c.filename);
  fs.writeFileSync(outPath, fullSvg, 'utf8');
  console.log('Saved cover:', c.filename);
});

console.log('\\nAll 10 book covers generated successfully with rich subject-specific artwork!');
