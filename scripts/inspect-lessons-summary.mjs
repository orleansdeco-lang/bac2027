import { PROMPT12_LESSONS } from "../src/domain/content/lessons.js";
import { CANONICAL_SCIENCES_EXP_SKILLS } from "../src/data/skills/canonical-sciences.js";
import { GESTION_ECO_SKILLS } from "../src/data/skills/gestion-economie.js";
import { LETTRES_PHILO_SKILLS } from "../src/data/skills/lettres-philo.js";
import { GESTION_ECO_PACKAGES } from "../src/domain/content/gestion-eco-mappings.js";
import { MATH_BATCH_01_PACKAGES } from "../src/domain/content-factory/math-batch-01.js";
import { ALGERIAN_BAC_STREAMS } from "../src/lib/constants/streams.js";

console.log("=== INSPECTION SUMMARY ===");
console.log("PROMPT12_LESSONS count:", PROMPT12_LESSONS?.length);
console.log("MATH_BATCH_01_PACKAGES count:", Object.keys(MATH_BATCH_01_PACKAGES || {}).length);
console.log("GESTION_ECO_PACKAGES count:", Object.keys(GESTION_ECO_PACKAGES || {}).length);
console.log("CANONICAL_SCIENCES_EXP_SKILLS count:", CANONICAL_SCIENCES_EXP_SKILLS?.length);
console.log("GESTION_ECO_SKILLS count:", GESTION_ECO_SKILLS?.length);
console.log("LETTRES_PHILO_SKILLS count:", LETTRES_PHILO_SKILLS?.length);
