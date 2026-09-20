/**
 * Master Verification Suite: BAC Production Content Bundles (Batches 1 to 8)
 * Verifies all 11 modules under src/domain/content/ and resolution via getSkillLearningBundle
 */

import { getSkillLearningBundle } from "../src/domain/content/mappings";
import { BATCH1_PHILOSOPHY_ARABIC_BUNDLE } from "../src/domain/content/batch1-philosophy-arabic-bundle";
import { BATCH1_GESTION_ECO_BUNDLE } from "../src/domain/content/batch1-gestion-eco-bundle";
import { MATH_TERM2_SCIENCES_BUNDLE } from "../src/domain/content/math-term2-bundle";
import { PHYSICS_TERM2_SCIENCES_BUNDLE } from "../src/domain/content/physics-term2-bundle";
import { SNV_TERM2_3_SCIENCES_BUNDLE } from "../src/domain/content/snv-term2-3-bundle";
import { FOREIGN_LANGUAGES_BUNDLE } from "../src/domain/content/foreign-languages-bundle";
import { TECHNIQUE_MATH_BUNDLE } from "../src/domain/content/technique-math-bundle";
import { FOREIGN_LANGUAGES_THIRD_LANG_BUNDLE } from "../src/domain/content/foreign-languages-third-lang-bundle";
import { MATH_FACTORY_REVOLUTION_BUNDLE } from "../src/domain/content/math-factory-revolution-bundle";
import { BATCH7_GEO_ISLAMIC_ARABIC_BUNDLE } from "../src/domain/content/batch7-geo-islamic-arabic-bundle";
import { BATCH8_ITALIEN_MECANIQUE_GESTION_BUNDLE } from "../src/domain/content/batch8-italien-mecanique-gestion-bundle";
import { BATCH9_FINAL_CURRICULUM_BUNDLE } from "../src/domain/content/batch9-final-curriculum-bundle";
import { PACK1_ISLAMIC_STUDIES_BUNDLE } from "../src/domain/content/pack1-islamic-studies-full-bundle";
import { PACK2_LANGUAGES_BUNDLE } from "../src/domain/content/pack2-languages-french-english-bundle";
import { PACK3_PHILOSOPHY_BUNDLE } from "../src/domain/content/pack3-philosophy-scientific-bundle";
import { PACK4_ARABIC_LIT_MATH_BUNDLE } from "../src/domain/content/pack4-arabic-and-literature-math-bundle";
import { PACK5_ENGINEERING_SNV_BUNDLE } from "../src/domain/content/pack5-technique-math-engineering-expanded";
import { PACK6_LETTRES_PHILO_BUNDLE } from "../src/domain/content/pack6-lettres-philo-bundle";

interface TargetSkillTest {
  batchName: string;
  skillId: string;
  expectedSubject: string;
}

const ALL_CURRICULUM_SKILLS: TargetSkillTest[] = [
  // 1. Batch 1 Philosophy & Arabic
  { batchName: "Batch 1 Philo & Arabic", skillId: "phil_perception_empiricism_rationalism", expectedSubject: "philosophy" },
  { batchName: "Batch 1 Philo & Arabic", skillId: "phil_language_thought_connection", expectedSubject: "philosophy" },
  { batchName: "Batch 1 Philo & Arabic", skillId: "phil_consciousness_unconscious_freud", expectedSubject: "philosophy" },
  { batchName: "Batch 1 Philo & Arabic", skillId: "phil_memory_imagination_theories", expectedSubject: "philosophy" },
  { batchName: "Batch 1 Philo & Arabic", skillId: "phil_habit_will_conflict", expectedSubject: "philosophy" },
  { batchName: "Batch 1 Philo & Arabic", skillId: "ar_grammar_ida_idhan_rules", expectedSubject: "arabic" },

  // 2. Batch 1 Gestion & Eco
  { batchName: "Batch 1 Gestion & Eco", skillId: "acc_provisions_depreciation_adjustments", expectedSubject: "gestion_comptable" },
  { batchName: "Batch 1 Gestion & Eco", skillId: "eco_foreign_trade_balance_payments", expectedSubject: "economie_management" },
  { batchName: "Batch 1 Gestion & Eco", skillId: "law_sales_contract_obligations", expectedSubject: "droit" },
  { batchName: "Batch 1 Gestion & Eco", skillId: "math_fin_compound_interest_annuities", expectedSubject: "mathematiques" },

  // 3. Math Term 2
  { batchName: "Math Term 2", skillId: "math_complex_polar_exponential", expectedSubject: "math" },
  { batchName: "Math Term 2", skillId: "math_space_geometry_plane_line", expectedSubject: "math" },
  { batchName: "Math Term 2", skillId: "math_integration_by_parts_area", expectedSubject: "math" },

  // 4. Physics Term 2
  { batchName: "Physics Term 2", skillId: "phys_rlc_electrical_oscillations", expectedSubject: "physics" },
  { batchName: "Physics Term 2", skillId: "phys_mechanical_oscillations_spring", expectedSubject: "physics" },
  { batchName: "Physics Term 2", skillId: "phys_esterification_hydrolysis_equilibrium", expectedSubject: "physics" },

  // 5. SNV Term 2/3
  { batchName: "SNV Term 2/3", skillId: "snv_photosynthesis_light_reactions", expectedSubject: "science" },
  { batchName: "SNV Term 2/3", skillId: "snv_cellular_respiration_krebs_cycle", expectedSubject: "science" },
  { batchName: "SNV Term 2/3", skillId: "snv_geology_earth_structure_subduction", expectedSubject: "science" },

  // 6. Foreign Languages (Batch 3 Part 2)
  { batchName: "Foreign Languages", skillId: "fr_texte_histoire_enonciation", expectedSubject: "francais" },
  { batchName: "Foreign Languages", skillId: "fr_compte_rendu_objectif_critique", expectedSubject: "francais" },
  { batchName: "Foreign Languages", skillId: "fr_texte_argumentatif_plaidoyer_requisitoire", expectedSubject: "francais" },
  { batchName: "Foreign Languages", skillId: "fr_l_appel_incitatif", expectedSubject: "francais" },
  { batchName: "Foreign Languages", skillId: "eng_ethics_in_business_whistleblowing", expectedSubject: "anglais" },
  { batchName: "Foreign Languages", skillId: "eng_grammar_it_is_high_time_wish", expectedSubject: "anglais" },
  { batchName: "Foreign Languages", skillId: "eng_grammar_provided_that_condition", expectedSubject: "anglais" },
  { batchName: "Foreign Languages", skillId: "eng_ancient_civilizations_flourish_fall", expectedSubject: "anglais" },

  // 7. Technique Math (Batch 4)
  { batchName: "Technique Math", skillId: "tm_civil_beam_reactions", expectedSubject: "genie_civil" },
  { batchName: "Technique Math", skillId: "tm_civil_tension_compression_stress", expectedSubject: "genie_civil" },
  { batchName: "Technique Math", skillId: "tm_meca_dimensional_chains", expectedSubject: "genie_mecanique" },
  { batchName: "Technique Math", skillId: "tm_meca_simple_bending_rdm", expectedSubject: "genie_mecanique" },
  { batchName: "Technique Math", skillId: "tm_elec_sequential_counters", expectedSubject: "genie_electrique" },
  { batchName: "Technique Math", skillId: "tm_elec_operational_amplifiers", expectedSubject: "genie_electrique" },
  { batchName: "Technique Math", skillId: "tm_proc_organic_lipids_saponification", expectedSubject: "genie_procedes" },
  { batchName: "Technique Math", skillId: "tm_proc_chemical_kinetics_rate", expectedSubject: "genie_procedes" },

  // 8. Foreign Languages Third Lang & Lit (Batch 5)
  { batchName: "Third Lang & Lit", skillId: "ar_poetry_commit_liberation", expectedSubject: "arabic" },
  { batchName: "Third Lang & Lit", skillId: "ar_rhetoric_cohesion_coherence", expectedSubject: "arabic" },
  { batchName: "Third Lang & Lit", skillId: "esp_subjuntivo_deseo_duda", expectedSubject: "third_language" },
  { batchName: "Third Lang & Lit", skillId: "esp_oraciones_condicionales_si", expectedSubject: "third_language" },
  { batchName: "Third Lang & Lit", skillId: "all_passiv_modalverben", expectedSubject: "third_language" },
  { batchName: "Third Lang & Lit", skillId: "all_nebensaetze_weil_dass_wenn", expectedSubject: "third_language" },
  { batchName: "Third Lang & Lit", skillId: "phil_epistemology_biology_determinism", expectedSubject: "philosophy" },
  { batchName: "Third Lang & Lit", skillId: "phil_ethics_justice_equality_merit", expectedSubject: "philosophy" },

  // 9. Math Factory & Revolution (Batch 6)
  { batchName: "Math & Revolution", skillId: "math_arithmetic_congruences_periodicity", expectedSubject: "math" },
  { batchName: "Math & Revolution", skillId: "math_arithmetic_bezout_diophantine", expectedSubject: "math" },
  { batchName: "Math & Revolution", skillId: "math_arithmetic_gauss_prime_factorization", expectedSubject: "math" },
  { batchName: "Math & Revolution", skillId: "math_complex_geometric_transformations", expectedSubject: "math" },
  { batchName: "Math & Revolution", skillId: "hist_algerian_revolution_military_strategy", expectedSubject: "history_geography" },
  { batchName: "Math & Revolution", skillId: "hist_algerian_revolution_diplomatic_strategy", expectedSubject: "history_geography" },

  // 10. Geo / Islamic / Arabic / Philo (Batch 7)
  { batchName: "Batch 7 Bundle", skillId: "isl_inheritance_rules_hajb", expectedSubject: "islamic_studies" },
  { batchName: "Batch 7 Bundle", skillId: "isl_crime_deviance_hudud_qisas", expectedSubject: "islamic_studies" },
  { batchName: "Batch 7 Bundle", skillId: "geo_global_economic_powers_triad", expectedSubject: "history_geography" },
  { batchName: "Batch 7 Bundle", skillId: "ar_grammar_law_lawla_lawma", expectedSubject: "arabic" },
  { batchName: "Batch 7 Bundle", skillId: "ar_grammar_clauses_with_without_functions", expectedSubject: "arabic" },
  { batchName: "Batch 7 Bundle", skillId: "phil_mathematics_epistemology_axiomatics", expectedSubject: "philosophy" },

  // 11. Italien / Mécanique / Gestion (Batch 8)
  { batchName: "Batch 8 Bundle", skillId: "it_grammar_passato_imperfetto", expectedSubject: "third_language" },
  { batchName: "Batch 8 Bundle", skillId: "it_grammar_pronomi_combinati_ne", expectedSubject: "third_language" },
  { batchName: "Batch 8 Bundle", skillId: "acc_income_statement_by_function", expectedSubject: "gestion_comptable" },
  { batchName: "Batch 8 Bundle", skillId: "law_commercial_companies_sarl_spa", expectedSubject: "droit" },
  { batchName: "Batch 8 Bundle", skillId: "math_fin_loan_amortization_constant_payments", expectedSubject: "mathematiques" },
  { batchName: "Batch 8 Bundle", skillId: "tm_meca_spur_gears_kinematics", expectedSubject: "genie_mecanique" },

  // 12. Final Closing Bundle (Batch 9)
  { batchName: "Batch 9 Closing Bundle", skillId: "hist_non_aligned_movement_third_world", expectedSubject: "history_geography" },
  { batchName: "Batch 9 Closing Bundle", skillId: "hist_palestine_arab_israeli_conflict", expectedSubject: "history_geography" },
  { batchName: "Batch 9 Closing Bundle", skillId: "geo_algerian_economy_development_challenges", expectedSubject: "history_geography" },
  { batchName: "Batch 9 Closing Bundle", skillId: "geo_brazil_emerging_power_inequalities", expectedSubject: "history_geography" },
  { batchName: "Batch 9 Closing Bundle", skillId: "ar_grammar_plural_types_qillah_kathrah", expectedSubject: "arabic" },
  { batchName: "Batch 9 Closing Bundle", skillId: "ar_rhetoric_musnad_musnad_ilayh_syntax", expectedSubject: "arabic" },

  // 13. Pack 1 Complete Islamic Studies (12 units)
  { batchName: "Pack 1 Islamic Studies", skillId: "isl_aqeedah_individual_society", expectedSubject: "islamic_studies" },
  { batchName: "Pack 1 Islamic Studies", skillId: "isl_maqasid_sharia_priorities", expectedSubject: "islamic_studies" },
  { batchName: "Pack 1 Islamic Studies", skillId: "isl_sources_legislation_ijma_qiyas", expectedSubject: "islamic_studies" },
  { batchName: "Pack 1 Islamic Studies", skillId: "isl_riba_modern_financial_transactions", expectedSubject: "islamic_studies" },

  // 14. Pack 2 Languages French & English (10 units)
  { batchName: "Pack 2 Languages", skillId: "fr_debat_idees_plaidoyer_requisitoire_syntax", expectedSubject: "french" },
  { batchName: "Pack 2 Languages", skillId: "fr_appel_incitatif_structure_tripartite", expectedSubject: "french" },
  { batchName: "Pack 2 Languages", skillId: "fr_outils_langue_discours_rapporte_cause", expectedSubject: "french" },
  { batchName: "Pack 2 Languages", skillId: "eng_safety_first_advertising_junk_food", expectedSubject: "english" },
  { batchName: "Pack 2 Languages", skillId: "eng_astronomy_solar_system_exploration", expectedSubject: "english" },

  // 15. Pack 3 Scientific Philosophy (5 units)
  { batchName: "Pack 3 Scientific Philosophy", skillId: "phil_sci_problem_vs_dialectic", expectedSubject: "philosophy" },
  { batchName: "Pack 3 Scientific Philosophy", skillId: "phil_sci_math_rationalism_empiricism", expectedSubject: "philosophy" },
  { batchName: "Pack 3 Scientific Philosophy", skillId: "phil_sci_experimental_method_determinism", expectedSubject: "philosophy" },

  // 16. Pack 4 Arabic & Literary Math (11 units)
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "ar_idha_idhan_hinaidin", expectedSubject: "arabic" },
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "ar_jumal_lah_la_mahal", expectedSubject: "arabic" },
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "ar_mahjar_rabita_qalamiyya", expectedSubject: "arabic" },
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "ar_fan_maqal_jazaeri", expectedSubject: "arabic" },
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "math_lit_arithmetic_geometric_sequences", expectedSubject: "math" },
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "math_lit_euclidean_division_congruence", expectedSubject: "math" },
  { batchName: "Pack 4 Arabic & Lit Math", skillId: "math_lit_polynomial_rational_functions", expectedSubject: "math" },

  // 17. Pack 5 Engineering & Math Stream SNV (12 units)
  { batchName: "Pack 5 Engineering & SNV", skillId: "tm_civil_truss_analysis", expectedSubject: "civil_eng" },
  { batchName: "Pack 5 Engineering & SNV", skillId: "tm_meca_torsion_stress", expectedSubject: "mechanical_eng" },
  { batchName: "Pack 5 Engineering & SNV", skillId: "tm_elec_three_phase_systems", expectedSubject: "electrical_eng" },
  { batchName: "Pack 5 Engineering & SNV", skillId: "tm_proc_chemical_thermodynamics", expectedSubject: "process_eng" },
  { batchName: "Pack 5 Engineering & SNV", skillId: "snv_math_protein_synthesis_transcription_translation", expectedSubject: "natural_sciences" },
  { batchName: "Pack 5 Engineering & SNV", skillId: "snv_math_humoral_cellular_immunity", expectedSubject: "natural_sciences" },

  // 18. Pack 6 Lettres & Philo Legacy Unresolved Skills (13 units)
  { batchName: "Pack 6 Lettres & Philo", skillId: "phi_lp_dialectical_methodology", expectedSubject: "philosophy" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "phi_lp_investigation_defense", expectedSubject: "philosophy" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "phi_lp_comparison_methodology", expectedSubject: "philosophy" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "phi_lp_text_analysis", expectedSubject: "philosophy" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "ar_lp_exile_revival_poetry", expectedSubject: "arabic" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "ar_lp_intellectual_summary", expectedSubject: "arabic" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "ar_lp_rhetoric_imagery", expectedSubject: "arabic" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "ar_lp_critical_appreciation", expectedSubject: "arabic" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "hg_lp_cold_war_bipolarity", expectedSubject: "history_geography" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "is_lp_aqeedah_intellect", expectedSubject: "islamic_studies" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "is_lp_sources_legislation", expectedSubject: "islamic_studies" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "math_lp_sequences_arithmetic", expectedSubject: "math" },
  { batchName: "Pack 6 Lettres & Philo", skillId: "math_lp_congruence_modular", expectedSubject: "math" },
];

console.log("==================================================================");
console.log("  VERIFYING ALL BAC PRODUCTION CONTENT BUNDLES (BATCHES 1 TO 9 + PACKS 1-6)");
console.log("==================================================================\n");

// 1. Verify all bundle objects are defined and non-empty
const bundleObjects = [
  { name: "BATCH1_PHILOSOPHY_ARABIC_BUNDLE", obj: BATCH1_PHILOSOPHY_ARABIC_BUNDLE, minKeys: 6 },
  { name: "BATCH1_GESTION_ECO_BUNDLE", obj: BATCH1_GESTION_ECO_BUNDLE, minKeys: 4 },
  { name: "MATH_TERM2_SCIENCES_BUNDLE", obj: MATH_TERM2_SCIENCES_BUNDLE, minKeys: 3 },
  { name: "PHYSICS_TERM2_SCIENCES_BUNDLE", obj: PHYSICS_TERM2_SCIENCES_BUNDLE, minKeys: 3 },
  { name: "SNV_TERM2_3_SCIENCES_BUNDLE", obj: SNV_TERM2_3_SCIENCES_BUNDLE, minKeys: 3 },
  { name: "FOREIGN_LANGUAGES_BUNDLE", obj: FOREIGN_LANGUAGES_BUNDLE, minKeys: 8 },
  { name: "TECHNIQUE_MATH_BUNDLE", obj: TECHNIQUE_MATH_BUNDLE, minKeys: 8 },
  { name: "FOREIGN_LANGUAGES_THIRD_LANG_BUNDLE", obj: FOREIGN_LANGUAGES_THIRD_LANG_BUNDLE, minKeys: 8 },
  { name: "MATH_FACTORY_REVOLUTION_BUNDLE", obj: MATH_FACTORY_REVOLUTION_BUNDLE, minKeys: 6 },
  { name: "BATCH7_GEO_ISLAMIC_ARABIC_BUNDLE", obj: BATCH7_GEO_ISLAMIC_ARABIC_BUNDLE, minKeys: 6 },
  { name: "BATCH8_ITALIEN_MECANIQUE_GESTION_BUNDLE", obj: BATCH8_ITALIEN_MECANIQUE_GESTION_BUNDLE, minKeys: 6 },
  { name: "BATCH9_FINAL_CURRICULUM_BUNDLE", obj: BATCH9_FINAL_CURRICULUM_BUNDLE, minKeys: 6 },
  { name: "PACK1_ISLAMIC_STUDIES_BUNDLE", obj: PACK1_ISLAMIC_STUDIES_BUNDLE, minKeys: 12 },
  { name: "PACK2_LANGUAGES_BUNDLE", obj: PACK2_LANGUAGES_BUNDLE, minKeys: 10 },
  { name: "PACK3_PHILOSOPHY_BUNDLE", obj: PACK3_PHILOSOPHY_BUNDLE, minKeys: 5 },
  { name: "PACK4_ARABIC_LIT_MATH_BUNDLE", obj: PACK4_ARABIC_LIT_MATH_BUNDLE, minKeys: 11 },
  { name: "PACK5_ENGINEERING_SNV_BUNDLE", obj: PACK5_ENGINEERING_SNV_BUNDLE, minKeys: 12 },
  { name: "PACK6_LETTRES_PHILO_BUNDLE", obj: PACK6_LETTRES_PHILO_BUNDLE, minKeys: 13 },
];

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

console.log("--- 1. Checking 11 Bundle Objects Presence & Integrity ---");
for (const b of bundleObjects) {
  totalChecks++;
  const keyCount = Object.keys(b.obj || {}).length;
  if (b.obj && keyCount >= b.minKeys) {
    console.log(`✅ ${b.name}: Present (${keyCount} keys)`);
    passedChecks++;
  } else {
    console.error(`❌ ${b.name}: Missing or insufficient keys (found ${keyCount}, expected >= ${b.minKeys})`);
    failedChecks++;
  }
}

console.log("\n--- 2. Checking Skill Resolution via getSkillLearningBundle ---");

for (const target of ALL_CURRICULUM_SKILLS) {
  const bundle = getSkillLearningBundle(target.skillId);
  totalChecks++;
  if (!bundle) {
    console.error(`❌ [${target.batchName}] ${target.skillId}: Resolution returned NULL!`);
    failedChecks++;
    continue;
  }

  // Verify core bundle properties
  const hasSkill = Boolean(bundle.skill && bundle.skill.id === target.skillId);
  const hasLesson = Boolean(bundle.lesson);
  const hasWorkedExample = Boolean(bundle.workedExample);
  const hasPractice = Boolean(bundle.practiceQuestions && bundle.practiceQuestions.length >= 1);
  const hasRetest = Boolean(bundle.retest);
  const hasRepairGuide = Boolean(bundle.repairGuide);
  const isMasteryReady = bundle.readiness?.status === "MASTERY_READY";

  totalChecks += 7;
  let skillOk = true;

  if (hasSkill) passedChecks++; else { console.error(`  - Skill object mismatch for ${target.skillId}`); failedChecks++; skillOk = false; }
  if (hasLesson) passedChecks++; else { console.error(`  - Missing lesson for ${target.skillId}`); failedChecks++; skillOk = false; }
  if (hasWorkedExample) passedChecks++; else { console.error(`  - Missing worked example for ${target.skillId}`); failedChecks++; skillOk = false; }
  if (hasPractice) passedChecks++; else { console.error(`  - Missing practice questions for ${target.skillId}`); failedChecks++; skillOk = false; }
  if (hasRetest) passedChecks++; else { console.error(`  - Missing retest question for ${target.skillId}`); failedChecks++; skillOk = false; }
  if (hasRepairGuide) passedChecks++; else { console.error(`  - Missing repair guide for ${target.skillId}`); failedChecks++; skillOk = false; }
  if (isMasteryReady) passedChecks++; else { console.error(`  - Readiness is not MASTERY_READY for ${target.skillId}`); failedChecks++; skillOk = false; }

  if (skillOk) {
    passedChecks++;
    totalChecks++;
    console.log(`✅ [${target.batchName}] ${target.skillId} -> ${bundle.skill.title_ar} (Subject: ${bundle.skill.subjectId})`);
  } else {
    failedChecks++;
    totalChecks++;
  }
}

console.log("\n==================================================================");
console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log("==================================================================");

if (failedChecks === 0) {
  console.log("🎉 ALL BUNDLES (BATCHES 1 TO 8) AND SKILLS SUCCESSFULLY VERIFIED!");
  process.exit(0);
} else {
  console.error("❌ VERIFICATION SUITE FAILED WITH ERRORS!");
  process.exit(1);
}
