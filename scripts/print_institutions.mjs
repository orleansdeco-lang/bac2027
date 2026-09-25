import { OFFICIAL_INSTITUTIONS } from '../src/lib/orientation/data/institutions.ts';

console.log(`Total Institutions: ${OFFICIAL_INSTITUTIONS.length}`);
for (const inst of OFFICIAL_INSTITUTIONS) {
  console.log(`[${inst.code}] ${inst.shortName} (${inst.nameAr}) - Wilaya ${inst.wilayaId} - Type: ${inst.institutionType} - URL: ${inst.websiteUrl}`);
}
