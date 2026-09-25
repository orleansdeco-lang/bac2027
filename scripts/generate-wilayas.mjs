import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const geoalgeria = require('geoalgeria');

const wilayas = geoalgeria.wilayas
  .filter(w => w.code <= 58)
  .map(w => ({
    id: w.code,
    code: String(w.code).padStart(2, '0'),
    nameAr: w.name_ar,
    nameFr: w.name_fr,
    phoneCode: w.phone_code || undefined,
    postalCode: w.postal_code || undefined,
    latitude: w.latitude || undefined,
    longitude: w.longitude || undefined,
  }));

const outDir = path.resolve('src/lib/orientation/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const fileContent = `// ==============================================================================
// 58 Official Algerian Wilayas (MESRS & Administrative Division)
// Source of truth: geoalgeria + Journal Officiel
// ==============================================================================
import { Wilaya } from '@/types/orientation';

export const OFFICIAL_WILAYAS: Wilaya[] = ${JSON.stringify(wilayas, null, 2)};
`;

fs.writeFileSync(path.join(outDir, 'wilayas.ts'), fileContent, 'utf-8');
console.log(`Generated wilayas.ts with ${wilayas.length} wilayas.`);
