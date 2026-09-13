import fs from 'fs';
import path from 'path';
import { HEADER_AND_PART_1 } from './part1_molecular.mjs';
import { PART_2_IMMUNOLOGY } from './part2_immunology.mjs';
import { PART_3_NEURO } from './part3_neuro.mjs';
import { PART_4_BIOENERGETICS } from './part4_bioenergetics.mjs';
import { PART_5_METHODOLOGY } from './part5_methodology.mjs';

const INDEX_AND_EXPORTS = `
// ============================================================================
// COMPLETE 17-CAPABILITY CANONICAL SNV EXPORT INDEX & MAP
// ============================================================================

export const SNV_IMMUNE_COOPERATION_PACKAGE = SNV_IMMUNE_COOPERATION_HIV_PACKAGE;

export const ALL_SNV_PACKAGES: CanonicalSNVCapabilityPackage[] = [
  SNV_PROTEIN_SYNTHESIS_PACKAGE,
  SNV_GENETIC_CODE_TRANSLATION_PACKAGE,
  SNV_PROTEIN_STRUCTURE_PACKAGE,
  SNV_ENZYME_KINETICS_PACKAGE,
  SNV_SELF_NONSELF_PACKAGE,
  SNV_HUMORAL_IMMUNITY_PACKAGE,
  SNV_CELLULAR_IMMUNITY_PACKAGE,
  SNV_IMMUNE_COOPERATION_HIV_PACKAGE,
  SNV_RESTING_POTENTIAL_PACKAGE,
  SNV_ACTION_POTENTIAL_PACKAGE,
  SNV_SYNAPTIC_TRANSMISSION_PACKAGE,
  SNV_PHOTOCHEM_PHASE_PACKAGE,
  SNV_CALVIN_CYCLE_PACKAGE,
  SNV_CELLULAR_RESPIRATION_PACKAGE,
  SNV_DOC_ANALYSIS_PACKAGE,
  SNV_SCIENTIFIC_REASONING_PACKAGE,
  SNV_FUNCTIONAL_SCHEMA_PACKAGE,
];

export const SNV_CAPABILITY_PACKAGES_MAP: Record<string, CanonicalSNVCapabilityPackage> = {
  snv_protein_synthesis_transcription_maturation: SNV_PROTEIN_SYNTHESIS_PACKAGE,
  snv_genetic_code_translation_activation: SNV_GENETIC_CODE_TRANSLATION_PACKAGE,
  snv_protein_structure_amphoteric_ionization: SNV_PROTEIN_STRUCTURE_PACKAGE,
  snv_enzyme_kinetics_active_site_regulation: SNV_ENZYME_KINETICS_PACKAGE,
  snv_self_nonself_hla_recognition: SNV_SELF_NONSELF_PACKAGE,
  snv_humoral_immunity_antibody_complex: SNV_HUMORAL_IMMUNITY_PACKAGE,
  snv_cellular_immunity_ltc_cytotoxicity: SNV_CELLULAR_IMMUNITY_PACKAGE,
  snv_immune_cooperation_interleukin_hiv: SNV_IMMUNE_COOPERATION_HIV_PACKAGE,
  snv_resting_potential_ionic_mechanisms: SNV_RESTING_POTENTIAL_PACKAGE,
  snv_action_potential_voltage_gated_channels: SNV_ACTION_POTENTIAL_PACKAGE,
  snv_synaptic_transmission_summation_integration: SNV_SYNAPTIC_TRANSMISSION_PACKAGE,
  snv_photosynthesis_photochemical_phase: SNV_PHOTOCHEM_PHASE_PACKAGE,
  snv_photosynthesis_calvin_cycle_synthesis: SNV_CALVIN_CYCLE_PACKAGE,
  snv_cellular_respiration_glycolysis_krebs: SNV_CELLULAR_RESPIRATION_PACKAGE,
  snv_document_analysis_information_extraction: SNV_DOC_ANALYSIS_PACKAGE,
  snv_scientific_reasoning_hypothesis_validation: SNV_SCIENTIFIC_REASONING_PACKAGE,
  snv_functional_schema_synthesis_construction: SNV_FUNCTIONAL_SCHEMA_PACKAGE,
};
`;

const finalFileContent = [
  HEADER_AND_PART_1,
  PART_2_IMMUNOLOGY,
  PART_3_NEURO,
  PART_4_BIOENERGETICS,
  PART_5_METHODOLOGY,
  INDEX_AND_EXPORTS
].join('\n\n');

const outputPath = path.resolve('src/domain/content/sciences-exp-snv-packages.ts');
fs.writeFileSync(outputPath, finalFileContent, 'utf8');

console.log('Successfully compiled complete SNV packages file:');
console.log('Output path:', outputPath);
console.log('Total characters:', finalFileContent.length);
console.log('Total lines:', finalFileContent.split('\n').length);
