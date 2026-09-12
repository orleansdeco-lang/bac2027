/**
 * BAC Mastery — Math Priority Engine Ranking & Evaluation
 * 
 * Computes deterministic expansion priority for the 12 production batch skills in 3AS Mathématiques.
 * Uses evaluateExpansionPriority() with 10 objective pedagogical factors.
 * 
 * Invariant: ZERO fabricated numerical percentages; transparent categorical HIGH priority with human-readable rationales.
 */

import { PriorityFactorInputs, ExpansionPriorityResult } from "@/domain/content-quality/types";
import { evaluateExpansionPriority } from "@/domain/content-quality/priority-engine";

export interface RankedSkillPriorityEntry {
  skillId: string;
  rank: number;
  factors: PriorityFactorInputs;
  evaluation: ExpansionPriorityResult;
}

export const MATH_BATCH_01_FACTOR_INPUTS: Record<string, PriorityFactorInputs> = {
  // 1. Divisibilité et Congruences (Topic 1)
  math_m_arithmetic_congruence: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 2. Bézout et Équations Diophantiennes (Topic 2)
  math_m_bezout_diophantine: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 3. Gauss et Nombres Premiers (Topic 2)
  math_m_gauss_prime_factors: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 4,
  },

  // 4. Nombres Complexes: Forme Exponentielle & Équations (Topic 3)
  math_m_complex_algebraic_trig: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 5,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 5. Similitudes Planes Directes (Topic 4)
  math_m_similitudes_directes: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 6. Dérivabilité & TVI avec rigueur (Topic 5)
  math_m_derivatives_tvi_rigor: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 5,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 7. Exponentielle, Logarithme & Croissances Comparées (Topic 6)
  math_m_exp_log_croissances: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 5,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 8. Intégration par parties & Calcul d'aires (Topic 7)
  math_m_integration_parts: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 4,
  },

  // 9. Équations Différentielles Linéaires (Topic 8)
  math_m_differential_equations: {
    studentDemandPotential: 4,
    examRelevance: 4,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 4,
  },

  // 10. Suites Numériques & Suites Adjacentes (Topic 9)
  math_m_induction_adjacent_suites: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 11. Géométrie dans l'Espace & Plans (Topic 10)
  math_m_space_geometry_planes: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 3,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 4,
  },

  // 12. Dénombrement & Loi Binomiale (Topic 11)
  math_m_combinatorics_bernoulli: {
    studentDemandPotential: 4,
    examRelevance: 4,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 3,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 4,
  },
};

/**
 * Computes the ranked priority order for all 12 skills.
 */
export function getRankedMathBatch01Skills(): RankedSkillPriorityEntry[] {
  const entries: RankedSkillPriorityEntry[] = Object.entries(MATH_BATCH_01_FACTOR_INPUTS).map(
    ([skillId, factors], index) => {
      const evaluation = evaluateExpansionPriority(factors);
      return {
        skillId,
        rank: index + 1,
        factors,
        evaluation,
      };
    }
  );

  return entries;
}

export const MATH_BATCH_02_FACTOR_INPUTS: Record<string, PriorityFactorInputs> = {
  // 1. Limites de suites par comparaison (Suites)
  math_m_sequences_comparison_limits: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 2. Suites géométriques et sommes (Suites)
  math_m_geometric_sequences: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 3. Racines n-ièmes de l'unité (Complexes)
  math_m_roots_of_unity: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 4. Lieux géométriques complexes (Complexes)
  math_m_complex_argument_loci: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 5. Dérivation logarithmique (Analyse)
  math_m_logarithmic_differentiation: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 4,
  },

  // 6. Étude et tracé de fonctions (Analyse)
  math_m_function_study: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 5,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 7. Fonctions bornées (Analyse)
  math_m_bounded_functions: {
    studentDemandPotential: 4,
    examRelevance: 5,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 4,
  },

  // 8. Arbres pondérés (Probabilités)
  math_m_conditional_probability_trees: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 3,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 9. Probabilités totales & Bayes (Probabilités)
  math_m_total_probability: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },
};


export const MATH_BATCH_03_FACTOR_INPUTS: Record<string, PriorityFactorInputs> = {
  // 1. Petit théorème de Fermat (Arithmétique)
  math_m_fermat_little_theorem: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 2. Systèmes de numération (Arithmétique)
  math_m_numeral_systems: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 3. Polynômes dans C (Complexes)
  math_m_complex_polynomials_factorization: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 4. Primitives de fractions rationnelles (Analyse)
  math_m_primitives_rational_fractions: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 5,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 5. Fonctions intégrales à bornes variables (Analyse)
  math_m_integral_functions_variable_bounds: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 5,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 5,
    educationalRoi: 5,
  },

  // 6. Équations différentielles du second ordre (Analyse)
  math_m_second_order_differential_equations: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 4,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 3,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 4,
  },

  // 7. Droites dans l'espace (Géométrie Espace)
  math_m_space_lines_intersections: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 8. Sphères dans l'espace (Géométrie Espace)
  math_m_space_spheres_equations: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 4,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },

  // 9. Variables aléatoires et espérance (Probabilités)
  math_m_random_variables_expectation: {
    studentDemandPotential: 5,
    examRelevance: 5,
    curriculumCentrality: 5,
    prerequisiteImportance: 5,
    crossTopicDependency: 4,
    difficultyLevel: 2,
    currentContentGap: true,
    trustworthySourcesAvailable: true,
    errorFrequencyPotential: 4,
    educationalRoi: 5,
  },
};

export const ALL_MATH_FACTOR_INPUTS: Record<string, PriorityFactorInputs> = {
  ...MATH_BATCH_03_FACTOR_INPUTS,
  ...MATH_BATCH_01_FACTOR_INPUTS,
  ...MATH_BATCH_02_FACTOR_INPUTS,
};

export function getAllRankedMathSkills(): RankedSkillPriorityEntry[] {
  const entries: RankedSkillPriorityEntry[] = Object.entries(ALL_MATH_FACTOR_INPUTS).map(
    ([skillId, factors], index) => {
      const evaluation = evaluateExpansionPriority(factors);
      return {
        skillId,
        rank: index + 1,
        factors,
        evaluation,
      };
    }
  );
  return entries;
}
