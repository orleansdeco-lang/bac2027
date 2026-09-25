// ==============================================================================
// Official MESRS Fields of Study (Domaines de Formation Universitaire)
// ==============================================================================
import { Field } from '@/types/orientation';

export const OFFICIAL_FIELDS: Field[] = [
  {
    id: 'MED',
    code: 'MED',
    nameAr: 'العلوم الطبية والصحية',
    nameFr: 'Sciences Médicales et de la Santé',
    icon: 'Stethoscope',
  },
  {
    id: 'MI',
    code: 'MI',
    nameAr: 'رياضيات وإعلام آلي وذكاء اصطناعي',
    nameFr: 'Mathématiques, Informatique et IA',
    icon: 'Binary',
  },
  {
    id: 'ST',
    code: 'ST',
    nameAr: 'علوم وتكنولوجيا وهندسة',
    nameFr: 'Sciences et Technologies',
    icon: 'Cpu',
  },
  {
    id: 'SNV',
    code: 'SNV',
    nameAr: 'علوم الطبيعة والحياة',
    nameFr: 'Sciences de la Nature et de la Vie',
    icon: 'Dna',
  },
  {
    id: 'SM',
    code: 'SM',
    nameAr: 'علوم المادة (فيزياء وكيمياء)',
    nameFr: 'Sciences de la Matière',
    icon: 'Atom',
  },
  {
    id: 'SEGC',
    code: 'SEGC',
    nameAr: 'علوم اقتصادية والتسيير وعلوم تجارية',
    nameFr: 'Sciences Économiques, de Gestion et Commerciales',
    icon: 'TrendingUp',
  },
  {
    id: 'DSP',
    code: 'DSP',
    nameAr: 'حقوق وعلوم سياسية',
    nameFr: 'Droit et Sciences Politiques',
    icon: 'Scale',
  },
  {
    id: 'LLE',
    code: 'LLE',
    nameAr: 'آداب ولغات أجنبية',
    nameFr: 'Lettres et Langues Étrangères',
    icon: 'Languages',
  },
  {
    id: 'HUM',
    code: 'HUM',
    nameAr: 'علوم إنسانية واجتماعية وإسلامية',
    nameFr: 'Sciences Humaines, Sociales et Islamiques',
    icon: 'BookOpen',
  },
  {
    id: 'ARCH',
    code: 'ARCH',
    nameAr: 'هندسة معمارية وعمران ومشاريع المدن',
    nameFr: 'Architecture et Urbanisme',
    icon: 'Building2',
  },
  {
    id: 'VET',
    code: 'VET',
    nameAr: 'علوم بيطرية وفلاحية',
    nameFr: 'Sciences Vétérinaires et Agronomiques',
    icon: 'PawPrint',
  },
  {
    id: 'ENS',
    code: 'ENS',
    nameAr: 'المدارس العليا للأساتذة (تكوين الأساتذة)',
    nameFr: 'Écoles Normales Supérieures (Enseignement)',
    icon: 'GraduationCap',
  },
  {
    id: 'STAPS',
    code: 'STAPS',
    nameAr: 'علوم وتقنيات النشاطات البدنية والرياضية',
    nameFr: 'STAPS',
    icon: 'Activity',
  },
  {
    id: 'ART',
    code: 'ART',
    nameAr: 'فنون وثقافة وإعلام',
    nameFr: 'Arts, Culture et Communication',
    icon: 'Palette',
  },
];
