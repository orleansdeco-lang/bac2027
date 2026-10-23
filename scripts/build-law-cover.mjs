import fs from 'fs';
import path from 'path';

const gavelPath = path.resolve('public/images/books/gavel-compressed.jpg');
const gavelBase64 = fs.readFileSync(gavelPath).toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <!-- Background Header Gradient -->
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a081a" />
      <stop offset="60%" stop-color="#4a0e2e" />
      <stop offset="100%" stop-color="#180410" />
    </linearGradient>

    <!-- Gold Text Gradient -->
    <linearGradient id="goldTitle" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#facc15" />
      <stop offset="70%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>

    <!-- Gold Border Gradient -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ca8a04" />
      <stop offset="50%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>

    <!-- Dark Vignette Gradient -->
    <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#180410" stop-opacity="1" />
      <stop offset="25%" stop-color="#180410" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#180410" stop-opacity="0" />
      <stop offset="85%" stop-color="#000000" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.9" />
    </linearGradient>

    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
    </filter>

    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#fbbf24" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Base Black Background -->
  <rect width="600" height="800" fill="#0c0208" />

  <!-- 3D Golden Gavel Photo Background -->
  <image href="data:image/jpeg;base64,${gavelBase64}" x="-100" y="220" width="800" height="580" preserveAspectRatio="xMidYMid slice" />

  <!-- Smooth Dark Overlay Vignette -->
  <rect x="0" y="220" width="600" height="580" fill="url(#vignette)" />

  <!-- Header Banner -->
  <rect width="600" height="280" fill="url(#headerGrad)" />

  <!-- Ornate Algerian Header Top Border -->
  <rect x="0" y="0" width="600" height="8" fill="url(#goldBorder)" />

  <!-- Official State Header -->
  <g text-anchor="middle" font-family="'Cairo', 'Amiri', 'Traditional Arabic', serif" fill="#fef3c7" filter="url(#dropShadow)">
    <text x="300" y="48" font-size="20" font-weight="bold" letter-spacing="0.5">
      الـجـمـهـوريـة الـجـزائـريـة الـدّيـمـقـراطـيـة الـشـعـبـيـة
    </text>
    <text x="300" y="82" font-size="22" font-weight="900" fill="#fde047">
      وزارة الـتـربـيـة الـوطـنـيـة
    </text>
  </g>

  <!-- National Emblem Ribbon Ornament -->
  <g transform="translate(300, 118)">
    <circle cx="0" cy="0" r="22" fill="#78350f" stroke="url(#goldBorder)" stroke-width="2" filter="url(#dropShadow)" />
    <!-- Crescent & Star -->
    <path d="M 4 -12 A 14 14 0 1 0 4 12 A 11 11 0 1 1 4 -12 Z" fill="#fde047" />
    <polygon points="6,-3 8,-1 11,-1 9,1 10,4 7,2 5,4 6,1 4,-1 7,-1" fill="#fde047" />
  </g>

  <!-- Decorative Separator Line -->
  <line x1="80" y1="150" x2="520" y2="150" stroke="url(#goldBorder)" stroke-width="1.5" stroke-opacity="0.7" />
  <circle cx="300" cy="150" r="4" fill="#fde047" />

  <!-- Main Subject Title: القانون -->
  <g filter="url(#dropShadow)">
    <text x="300" y="245" text-anchor="middle" font-family="'Cairo', 'Amiri', 'Arial Black', sans-serif" font-size="74" font-weight="900" fill="url(#goldTitle)" filter="url(#goldGlow)" stroke="#78350f" stroke-width="1.5">
      الـقـانـون
    </text>
  </g>

  <!-- Subtitle Ribbon -->
  <g filter="url(#dropShadow)">
    <!-- Subtitle Card -->
    <rect x="110" y="270" width="380" height="42" rx="21" fill="#1e0514" fill-opacity="0.9" stroke="url(#goldBorder)" stroke-width="1.5" />
    <text x="300" y="298" text-anchor="middle" font-family="'Cairo', 'Tahoma', sans-serif" font-size="20" font-weight="900" fill="#ffffff">
      السنة الثالثة ثانوي • بكالوريا
    </text>
  </g>

  <!-- Stream Tag -->
  <g filter="url(#dropShadow)">
    <rect x="160" y="324" width="280" height="34" rx="17" fill="#78350f" fill-opacity="0.9" stroke="#facc15" stroke-width="1" />
    <text x="300" y="347" text-anchor="middle" font-family="'Cairo', 'Tahoma', sans-serif" font-size="16" font-weight="bold" fill="#fef08a">
      الشعبة: تسيير واقتصاد
    </text>
  </g>

  <!-- Bottom Official Badge -->
  <g transform="translate(480, 725)" filter="url(#dropShadow)">
    <rect x="-65" y="-22" width="130" height="44" rx="10" fill="#180410" fill-opacity="0.92" stroke="url(#goldBorder)" stroke-width="1.5" />
    <text x="0" y="-3" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="14" font-weight="900" fill="#ffffff">
      كـتـاب
    </text>
    <text x="0" y="15" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="13" font-weight="bold" fill="#fde047">
      مـدرسـي
    </text>
  </g>

  <!-- Edition / Year -->
  <g transform="translate(100, 725)" filter="url(#dropShadow)">
    <rect x="-55" y="-18" width="110" height="36" rx="8" fill="#180410" fill-opacity="0.92" stroke="url(#goldBorder)" stroke-width="1" />
    <text x="0" y="6" text-anchor="middle" font-family="'Cairo', 'Courier New', monospace" font-size="14" font-weight="bold" fill="#fef08a">
      2024 / 2025
    </text>
  </g>

  <!-- Outer Border Frame -->
  <rect x="18" y="18" width="564" height="764" rx="18" fill="none" stroke="url(#goldBorder)" stroke-width="2" stroke-opacity="0.8" />
  <rect x="24" y="24" width="552" height="752" rx="12" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.15" />
</svg>`;

fs.writeFileSync('public/images/books/cover-law-001.svg', svgContent, 'utf8');
console.log('Saved cover-law-001.svg with embedded 3D gavel artwork!');
