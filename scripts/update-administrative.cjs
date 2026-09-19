const fs = require('fs');
const dz = require('geoalgeria');

const wilayas = dz.wilayas.map(w => ({
  code: String(w.code).padStart(2, '0'),
  name_ar: w.name_ar,
  name_fr: w.name_fr
})).sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));

const communes = dz.communes.map(c => ({
  code: String(c.code_commune || c.postal_code || '').padStart(4, '0'),
  wilaya_code: String(c.wilaya_code).padStart(2, '0'),
  name_ar: c.name_ar,
  name_fr: c.name_fr
})).sort((a, b) => {
  const wDiff = parseInt(a.wilaya_code, 10) - parseInt(b.wilaya_code, 10);
  if (wDiff !== 0) return wDiff;
  return a.name_ar.localeCompare(b.name_ar, 'ar');
});

const tsCode = `/**
 * BAC Mastery — Algerian Administrative Registry
 * Canonical reference for all 69 Algerian Wilayas and 1,541 Communes
 * Updated to official Algerian administrative divisions.
 */

export interface Wilaya {
  code: string;
  name_ar: string;
  name_fr: string;
}

export interface Commune {
  code: string;
  wilaya_code: string;
  name_ar: string;
  name_fr: string;
}

export const ALGERIAN_WILAYAS: Wilaya[] = ${JSON.stringify(wilayas, null, 2)};

export const ALGERIAN_COMMUNES: Commune[] = ${JSON.stringify(communes, null, 2)};

/**
 * Helper methods for administrative lookup
 */
export function getAlgerianWilayas(): Wilaya[] {
  return ALGERIAN_WILAYAS;
}

export function getWilayaByCode(code: string): Wilaya | undefined {
  const cleanCode = code ? String(code).trim().padStart(2, '0') : '';
  return ALGERIAN_WILAYAS.find((w) => w.code === cleanCode);
}

export function getCommunesByWilayaCode(wilayaCode: string): Commune[] {
  const cleanCode = wilayaCode ? String(wilayaCode).trim().padStart(2, '0') : '';
  return ALGERIAN_COMMUNES.filter((c) => c.wilaya_code === cleanCode);
}

export function getCommuneByCode(communeCode: string): Commune | undefined {
  return ALGERIAN_COMMUNES.find((c) => c.code === communeCode);
}

export function isValidCommuneForWilaya(wilayaCode: string, communeCodeOrName: string): boolean {
  const cleanWilaya = wilayaCode ? String(wilayaCode).trim().padStart(2, '0') : '';
  const communes = getCommunesByWilayaCode(cleanWilaya);
  return communes.some((c) => c.code === communeCodeOrName || c.name_ar === communeCodeOrName);
}
`;

fs.writeFileSync('src/domain/administrative/algeria-administrative.ts', tsCode, 'utf8');
console.log('Successfully updated algeria-administrative.ts with', wilayas.length, 'wilayas and', communes.length, 'communes');
