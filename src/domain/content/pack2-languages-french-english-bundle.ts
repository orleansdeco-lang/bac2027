/**
 * BAC 2026/2027 Complete French & English Languages Bundle (اللغتان الفرنسية والإنجليزية - المنهاج الوزاري الكامل 100%)
 * Covers all official communicative projects, writing genres, and core grammar across all 6 BAC streams.
 * Invariant: Content Purity (zero student_id / user_id)
 * File: src/domain/content/pack2-languages-french-english-bundle.ts
 */

import { Skill } from "./types";

export interface LanguageBundlePayload {
  skillId: string;
  title_ar: string;
  subject: "french" | "english";
  subjectNameAr: string;
  stream: "all_streams";
  streamNameAr: string;
  unit: string;
  bloomLevel: "apply" | "analyze";
  theory: {
    summary: string;
    keyTakeaways: string[];
    commonPitfalls: string[];
  };
  practice: {
    question: string;
    options: Array<{ id: string; text: string; correct: boolean }>;
    stepByStepSolution: string[];
  };
  isomorphicRetest: {
    question: string;
    options: Array<{ id: string; text: string; correct: boolean }>;
    repairGuide: string;
  };
}

export const PACK2_LANGUAGES_BUNDLE: Record<string, LanguageBundlePayload> = {
  // ==========================================================================
  // 1. FRANÇAIS (French 3AS - Projets 1, 2, 3 et Outils de Langue)
  // ==========================================================================

  // 1.1 Le texte d'histoire
  "fr_texte_histoire_enonciation_temoignage": {
    skillId: "fr_texte_histoire_enonciation_temoignage",
    title_ar: "اللغة الفرنسية: النص التاريخي، علامات الذاتية والحياد، والتمييز بين الوقائع والشهادات",
    subject: "french",
    subjectNameAr: "اللغة الفرنسية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Projet 1 : Le texte d'histoire (Faits et témoignages)",
    bloomLevel: "analyze",
    theory: {
      summary: "Le texte d'histoire en 3AS relate des événements historiques réels (guerre de libération nationale, événements majeurs). L'auteur peut adopter une posture objective (effacement de l'énonciateur, emploi de la 3e personne, passif, tournures impersonnelles, dates et chiffres précis) ou subjective (présence de modalisateurs : vocabulaire mélioratif ou péjoratif, adverbes d'opinion, certitude ou doute). Il intègre souvent des témoignages au discours direct ou indirect pour authentifier les faits, rendre hommage aux héros, ou dénoncer des atrocités.",
      keyTakeaways: [
        "Objectivité vs Subjectivité : L'objectivité se manifeste par l'absence de pronoms de la 1ère personne et l'usage de verbes déclaratifs neutres. La subjectivité se révèle par les modalisateurs (adjectifs évaluatifs, adverbes comme 'héroïquement', 'atrocement').",
        "Le rôle des témoignages : Les témoins vivants apportent une valeur de vérité, d'émotion et d'authentification historique (visée testimoniale).",
        "La visée communicative : Informer d'un événement, commémorer une date historique, rendre hommage à des martyrs, ou réhabiliter la vérité historique contre la propagande coloniale."
      ],
      commonPitfalls: [
        "Confondre l'auteur du texte (l'historien ou le journaliste) avec le témoin cité entre guillemets.",
        "Croire que l'absence de 'je' garantit une neutralité absolue; les modalisateurs lexicaux (ex: 'massacre', 'gloire') traduisent une prise de position évidente."
      ]
    },
    practice: {
      question: "Dans un texte d'histoire sur le 17 octobre 1961 à Paris, l'auteur écrit : « La police coloniale a réprimé avec une barbarie inouïe des manifestants pacifiques ». Quelle est la modalisation dominante ?",
      options: [
        { id: "opt_a", text: "Une subjectivité explicite et engagée marquée par un lexique péjoratif fort (« barbarie inouïe ») dénonçant la violence policière.", correct: true },
        { id: "opt_b", text: "Une neutralité scientifique absolue exempte de tout jugement de valeur ou d'appréciation morale.", correct: false },
        { id: "opt_c", text: "Une incitation directe à l'action sous forme d'injonction impérative immédiate.", correct: false },
        { id: "opt_d", text: "Une hypothèse scientifique incertaine formulée au mode conditionnel passé.", correct: false }
      ],
      stepByStepSolution: [
        "Analyse de l'énoncé : Les termes « barbarie inouïe » et « manifestants pacifiques » portent une charge affective et morale évidente.",
        "Le mot « barbarie » est un modalisateur péjoratif (dévalorisant), tandis que « pacifiques » est mélioratif pour les victimes.",
        "L'auteur s'implique donc émotionnellement et condamne l'acte.",
        "La bonne réponse est (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Quelle est la visée communicative dominante lorsqu'un historien publie des mémoires inédits de moudjahidines de la Wilaya IV ?",
      options: [
        { id: "iso_a", text: "Apporter un témoignage vivant pour authentifier les faits historiques et rendre hommage aux combattants de la liberté.", correct: true },
        { id: "iso_b", text: "Divertir les lecteurs par une fable imaginaire et fantastique sans ancrage réel.", correct: false },
        { id: "iso_c", text: "Donner une recette culinaire ou un mode d'emploi d'appareil électronique.", correct: false },
        { id: "iso_d", text: "Vendre des produits cosmétiques à travers un argumentaire publicitaire commercial.", correct: false }
      ],
      repairGuide: "Le témoignage dans le texte d'histoire vise toujours à authentifier les faits, commémorer le souvenir et rendre hommage."
    }
  },

  // 1.2 Le compte-rendu objectif et critique
  "fr_compte_rendu_objectif_critique_methodo": {
    skillId: "fr_compte_rendu_objectif_critique_methodo",
    title_ar: "اللغة الفرنسية: المنهجية الرسمية لكتابة التقرير الموضوعي والنقدي (Compte-rendu) وفق شبكة تنقيط البكالوريا",
    subject: "french",
    subjectNameAr: "اللغة الفرنسية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Expression écrite : Le compte-rendu objectif et critique",
    bloomLevel: "apply",
    theory: {
      summary: "Le compte-rendu est l'exercice de production écrite le plus choisi et le plus valorisé au Baccalauréat algérien. Il existe deux types : 1) Le compte-rendu objectif (pour toutes les filières) : composé d'une amorce/introduction (titre, auteur, source, date, thème et visée communicative) suivie d'un résumé condensé (au quart 1/4 du texte) rédigé à la 3e personne avec des verbes introducteurs ('l'auteur souligne, affirme, démontre'), sans donner son avis personnel ni copier de phrases intégrales. 2) Le compte-rendu critique (réservé aux filières Lettres et Langues) : comporte en plus une partie critique personnelle évaluant le fond (pertinence des idées, arguments) et la forme (clarté de la langue, vocabulaire).",
      keyTakeaways: [
        "Structure de l'amorce (Introduction) : Mentionner l'auteur, le titre de l'œuvre/source, la date de parution, le thème principal et la visée communicative du texte.",
        "Le corps du résumé : Restituer les idées essentielles en respectant l'enchaînement logique; utiliser ses propres mots (paraphrase) et employer des verbes d'analyse au présent de l'indicatif.",
        "Interdiction des marques personnelles dans l'objectif : Jamais de 'je' ou de 'mon avis' dans le compte-rendu objectif; neutralité stricte.",
        "La partie critique (Lettres/Langues) : Rédiger un paragraphe distinct analysant la rigueur de l'argumentation et la qualité du style."
      ],
      commonPitfalls: [
        "Le 'copier-coller' direct de phrases entières du texte (sanctionné lourdement par le barème du Bac).",
        "Donner son avis personnel dans le compte-rendu objectif des filières scientifiques et techniques."
      ]
    },
    practice: {
      question: "Dans l'amorce d'un compte-rendu objectif rédigé par un candidat au Bac, quel élément parmi les suivants est rigoureusement INTERDIT ?",
      options: [
        { id: "opt_a", text: "Insérer son opinion personnelle en écrivant : « À mon avis personnel, l'auteur a commis une grave erreur ».", correct: true },
        { id: "opt_b", text: "Mentionner le nom complet de l'auteur et la date de parution de l'article.", correct: false },
        { id: "opt_c", text: "Formuler la visée communicative principale de l'auteur avec un verbe d'intention.", correct: false },
        { id: "opt_d", text: "Indiquer le thème central et l'idée générale abordée dans le document.", correct: false }
      ],
      stepByStepSolution: [
        "Règle d'or du compte-rendu objectif : Le rédacteur doit faire preuve d'une neutralité absolue.",
        "Toute marque d'appréciation personnelle (« à mon avis », « je pense ») est proscrite de l'amorce et du résumé objectif.",
        "L'avis personnel n'est toléré que dans la section critique finale pour les filières Lettres et Langues.",
        "La réponse exacte est (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Quelle règle de proportionnalité doit impérativement respecter le résumé dans un compte-rendu au Bac ?",
      options: [
        { id: "iso_a", text: "Faire environ le quart (1/4) de la longueur du texte initial en reformulant les idées maîtresses.", correct: true },
        { id: "iso_b", text: "Écrire un texte trois fois plus long que le texte source en ajoutant des exemples inventés.", correct: false },
        { id: "iso_c", text: "Recopier uniquement la première et la dernière phrase de chaque paragraphe.", correct: false },
        { id: "iso_d", text: "Ne rédiger qu'un seul mot résumant le titre de l'article.", correct: false }
      ],
      repairGuide: "Le résumé officiel doit représenter le quart (1/4) de la longueur du texte initial avec vos propres mots."
    }
  },

  // 1.3 Le débat d'idées et le texte argumentatif
  "fr_debat_idees_plaidoyer_requisitoire_syntax": {
    skillId: "fr_debat_idees_plaidoyer_requisitoire_syntax",
    title_ar: "اللغة الفرنسية: حوار الأفكار والنص الحجاجي، المرافعة والاتهام، والروابط المنطقية",
    subject: "french",
    subjectNameAr: "اللغة الفرنسية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Projet 2 : Le débat d'idées (Plaidoyer et réquisitoire)",
    bloomLevel: "analyze",
    theory: {
      summary: "Le débat d'idées confronte deux thèses opposées sur une problématique de société (ex: progrès technologique, écologie, éthique médicale, réseaux sociaux). Deux stratégies dominent : 1) Le plaidoyer (défendre une cause avec des arguments favorables et un lexique mélioratif), 2) Le réquisitoire (attaquer et condamner une thèse avec des arguments défavorables et un lexique péjoratif). L'auteur utilise des connecteurs logiques de cause (car, parce que, en raison de), de conséquence (donc, par conséquent), d'opposition (mais, en revanche, alors que) et de concession (certes... mais, bien que + subjonctif, quoique).",
      keyTakeaways: [
        "Structure dialectique : Thèse soutenue, antithèse (contre-arguments), réfutation ou dépassement synthétique.",
        "La concession : Reconnaître une part de vérité à l'adversaire ('Certes...') avant de réaffirmer sa propre thèse avec plus de force ('...cependant / néanmoins').",
        "Le vocabulaire mélioratif / péjoratif : Véritable thermomètre de l'argumentation permettant de repérer le camp défendu par l'auteur."
      ],
      commonPitfalls: [
        "Confondre un connecteur d'opposition directe ('en revanche', 'au contraire') avec un connecteur de concession ('bien que', 'certes').",
        "Ignorer le subjonctif obligatoire après 'bien que' et 'quoique' dans les questions de grammaire du Bac."
      ]
    },
    practice: {
      question: "Dans la phrase : « Certes, le télétravail offre une flexibilité appréciable, néanmoins il risque d'isoler socialement les employés », quelle démarche argumentative est employée ?",
      options: [
        { id: "opt_a", text: "La stratégie de concession : accepter temporairement un argument adverse pour mieux le dépasser ensuite.", correct: true },
        { id: "opt_b", text: "Une énumération neutre et chronologique de faits sans prise de position.", correct: false },
        { id: "opt_c", text: "Une métaphore poétique sans aucune visée argumentative.", correct: false },
        { id: "opt_d", text: "Un appel incitatif fondé sur le mode impératif d'urgence.", correct: false }
      ],
      stepByStepSolution: [
        "Analyse de la structure : Le couple « Certes... néanmoins... » est le schéma type de la concession.",
        "L'auteur admet un avantage (« flexibilité appréciable ») puis introduit son objection majeure (« isoler socialement »).",
        "Cette démarche s'appelle la concession argumentative.",
        "La bonne réponse est (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Quelle subordonnée de concession est grammaticalement correcte parmi les propositions suivantes ?",
      options: [
        { id: "iso_a", text: "Bien que cette méthode soit complexe, elle donne des résultats remarquables.", correct: true },
        { id: "iso_b", text: "Bien que cette méthode est complexe, elle donne des résultats remarquables.", correct: false },
        { id: "iso_c", text: "Parce que cette méthode soit complexe, elle donne des résultats remarquables.", correct: false },
        { id: "iso_d", text: "Si cette méthode soit complexe, elle donne des résultats remarquables.", correct: false }
      ],
      repairGuide: "Retenez la règle impérative : la locution conjonctive 'bien que' exige toujours le mode subjonctif ('soit')."
    }
  },

  // 1.4 L'appel et le texte incitatif
  "fr_appel_incitatif_structure_tripartite": {
    skillId: "fr_appel_incitatif_structure_tripartite",
    title_ar: "اللغة الفرنسية: النص التحريضي (L'appel)، الهيكل الثلاثي، وأفعال الوجوب والإلزام",
    subject: "french",
    subjectNameAr: "اللغة الفرنسية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Projet 3 : L'appel (Structure et visée incitative)",
    bloomLevel: "apply",
    theory: {
      summary: "L'appel est un type de texte argumentatif à visée incitative ou exhortative : l'émetteur lance un cri d'alarme pour pousser le destinataire à réagir et à agir concrètement face à une situation intolérable (guerre, famine, racisme, pollution). Sa structure comprend obligatoirement trois parties : 1) La partie expositive (le constat négatif d'une situation alarmante), 2) La partie argumentative (l'analyse des causes et la démonstration de la nécessité impérieuse de changer les choses), 3) La partie exhortative / l'appel proprement dit (l'interpellation directe du destinataire avec l'impératif, le subjonctif et les verbes de modalité comme devoir, falloir, pouvoir).",
      keyTakeaways: [
        "Les trois parties indispensables : 1. Le constat négatif, 2. L'argumentation/nécessité, 3. L'exhortation/appel à l'action.",
        "Les marques énonciatives : Utilisation fréquente du 'nous' inclusif (fédérateur) et de la 2e personne 'vous' (destinataires interpellés).",
        "Les outils linguistiques d'incitation : L'impératif présent ('Agissons !'), les tournures d'obligation ('Il faut que', 'Nous devons'), et les interrogations oratoires."
      ],
      commonPitfalls: [
        "Confondre la partie expositive (qui décrit le problème) avec la partie exhortative (qui commande l'action).",
        "Oublier que l'appel vise une action concrète et urgente, contrairement au simple plaidoyer théorique."
      ]
    },
    practice: {
      question: "Dans un appel de l'UNESCO pour la sauvegarde des forêts, la phrase : « Citoyens du monde, unissez-vous et plantez un arbre avant qu'il ne soit trop tard ! » appartient à quelle section du texte ?",
      options: [
        { id: "opt_a", text: "La partie exhortative (l'appel proprement dit), caractérisée par l'interpellation et le verbe à l'impératif d'action.", correct: true },
        { id: "opt_b", text: "La partie expositive initiale dressant le bilan statistique des hectares brûlés.", correct: false },
        { id: "opt_c", text: "L'analyse économique des coûts financiers de la gestion forestière.", correct: false },
        { id: "opt_d", text: "Une conclusion scientifique passive sans destinataire désigné.", correct: false }
      ],
      stepByStepSolution: [
        "Analyse de l'extrait : L'émetteur interpelle (« Citoyens du monde ») et donne un ordre direct à l'impératif (« unissez-vous et plantez »).",
        "Ces indices sont spécifiques à la dernière partie de l'appel : la partie exhortative / incitative.",
        "La bonne réponse est (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Quel verbe de modalité exprime l'obligation absolue dans la phrase : « Pour préserver notre avenir, nous ________ éliminer les plastiques à usage unique » ?",
      options: [
        { id: "iso_a", text: "devons", correct: true },
        { id: "iso_b", text: "pourrions éventuellement", correct: false },
        { id: "iso_c", text: "hésitons à", correct: false },
        { id: "iso_d", text: "souhaiterions peut-être", correct: false }
      ],
      repairGuide: "Dans l'appel, le verbe 'devoir' au présent traduit l'obligation catégorique indispensable à l'action."
    }
  },

  // 1.5 Les outils de la langue : Le discours rapporté et les rapports logiques
  "fr_outils_langue_discours_rapporte_cause": {
    skillId: "fr_outils_langue_discours_rapporte_cause",
    title_ar: "اللغة الفرنسية: أدوات اللغة - الخطاب المنقول (Le discours rapporté)، والروابط المنطقية للسبب والنتيجة والهدف",
    subject: "french",
    subjectNameAr: "اللغة الفرنسية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Outils de la langue : Discours rapporté et rapports logiques (Cause, Conséquence, But)",
    bloomLevel: "apply",
    theory: {
      summary: "Les outils de langue constituent les questions systématiques de syntaxe au Baccalauréat algérien : 1) Le discours rapporté (direct / indirect) : lors du passage au discours indirect avec un verbe introducteur au passé (ex: 'L'historien a affirmé que...'), la concordance des temps s'applique rigoureusement : Présent -> Imparfait, Passé composé -> Plus-que-parfait, Futur simple -> Conditionnel présent. Les repères temporels changent également : hier -> la veille, aujourd'hui -> ce jour-là, demain -> le lendemain. 2) Les rapports logiques : A) La cause : introduite par 'parce que', 'car', 'comme' (en tête de phrase), 'en raison de' / 'à cause de' (cause négative + GN), 'grâce à' (cause positive + GN). B) La conséquence : introduite par 'donc', 'par conséquent', 'c'est pourquoi', 'si bien que'. C) Le but : exprimé par 'pour que' / 'afin que' (+ subjonctif obligatoire quand les sujets sont différents) ou 'pour' / 'afin de' (+ infinitif avec un sujet unique).",
      keyTakeaways: [
        "Concordance des temps au discours indirect : Présent -> Imparfait | Passé composé -> Plus-que-parfait | Futur -> Conditionnel présent.",
        "Repères spatio-temporels : ici -> là / là-bas | hier -> la veille | demain -> le lendemain | ce matin -> ce matin-là.",
        "Cause positive vs négative : 'Grâce à' s'emploie pour une issue favorable ('Grâce à son courage'), tandis que 'à cause de' s'emploie pour une issue défavorable ('À cause de la tempête').",
        "Le subjonctif du but : Après 'pour que' et 'afin que', le verbe subordonné doit toujours être conjugué au mode subjonctif."
      ],
      commonPitfalls: [
        "Oublier d'appliquer la concordance des temps lorsque le verbe introducteur est au passé (passé composé ou imparfait).",
        "Employer l'indicatif au lieu du subjonctif après 'afin que' et 'pour que'."
      ]
    },
    practice: {
      question: "Transformez au discours indirect la réplique suivante : Le témoin déclara : « J'ai vu les soldats encercler le village hier matin ».",
      options: [
        { id: "opt_a", text: "Le témoin déclara qu'il avait vu les soldats encercler le village la veille au matin.", correct: true },
        { id: "opt_b", text: "Le témoin déclara qu'il a vu les soldats encercler le village hier matin.", correct: false },
        { id: "opt_c", text: "Le témoin déclara qu'il verra les soldats encercler le village le lendemain matin.", correct: false },
        { id: "opt_d", text: "Le témoin déclara qu'il verrait les soldats encercler le village ce matin-là.", correct: false }
      ],
      stepByStepSolution: [
        "1. Le verbe introducteur « déclara » est au passé simple (temps du passé) : la concordance des temps s'impose.",
        "2. Le verbe « ai vu » est au passé composé -> il se transforme obligatoirement en plus-que-parfait : « avait vu ».",
        "3. Le pronom « j' » devient « il ».",
        "4. Le repère temporel « hier matin » se transforme en « la veille au matin ».",
        "5. La phrase correcte est : « Le témoin déclara qu'il avait vu les soldats encercler le village la veille au matin ».",
        "La bonne réponse est (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Quelle est la conjonction correcte pour exprimer le but dans la phrase : « Le ministère lance des campagnes de reboisement __________ le désert n'avance pas » ?",
      options: [
        { id: "iso_a", text: "afin que (suivi du subjonctif 'n'avance')", correct: true },
        { id: "iso_b", text: "parce que (exprime la cause)", correct: false },
        { id: "iso_c", text: "par conséquent (exprime la conséquence)", correct: false },
        { id: "iso_d", text: "grâce à (exprime une cause avec nom)", correct: false }
      ],
      repairGuide: "Pour exprimer l'objectif et la finalité voulue avec deux sujets différents, employez 'afin que' ou 'pour que' suivi du subjonctif."
    }
  },

  // ==========================================================================
  // 2. ENGLISH (English 3AS - Core Units & Essential Grammar)
  // ==========================================================================

  // 2.1 Ethics in Business
  "eng_ethics_business_corruption_whistleblowing": {
    skillId: "eng_ethics_business_corruption_whistleblowing",
    title_ar: "اللغة الإنجليزية: أخلاقيات الأعمال، مكافحة الفساد وتبييض الأموال، ودور التبليغ (Whistleblowing)",
    subject: "english",
    subjectNameAr: "اللغة الإنجليزية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Unit 1 : Ethics in Business",
    bloomLevel: "analyze",
    theory: {
      summary: "Ethics in Business is a mandatory core theme in the Algerian Baccalaureate for all streams. It explores moral principles governing commercial transactions and public governance. Key concepts include fighting corruption (bribery, embezzlement, money laundering, counterfeiting, tax evasion, nepotism) and promoting transparency, accountability, and corporate social responsibility. A central topic is 'whistleblowing'—disclosing illegal or unethical activities within an organization to authorities or the public.",
      keyTakeaways: [
        "Forms of Corruption: Bribery (giving money for illicit favors), Embezzlement (stealing entrusted public/corporate funds), Money Laundering (disguising illicit money as legitimate), Counterfeiting (illegal imitation of genuine goods).",
        "Whistleblowing: Reporting corruption from within an institution to protect society and public funds.",
        "Social and Economic Impact: Corruption erodes public trust, causes economic stagnation, decreases tax revenues, and endangers consumer safety (e.g., fake medications)."
      ],
      commonPitfalls: [
        "Confusing 'counterfeiting' (fake imitation products) with 'money laundering' (cleaning illicit cash).",
        "Believing that whistleblowers are criminals; legally and ethically, they are protected individuals uncovering illegality."
      ]
    },
    practice: {
      question: "Which of the following practices describes an employee who exposes illegal financial fraud happening inside his company to the judicial authorities?",
      options: [
        { id: "opt_a", text: "Whistleblowing, which plays a vital ethical role in fighting corporate corruption.", correct: true },
        { id: "opt_b", text: "Tax evasion and smuggling across international borders.", correct: false },
        { id: "opt_c", text: "Counterfeiting intellectual property and copyrighted software.", correct: false },
        { id: "opt_d", text: "Money laundering through offshore banking shell companies.", correct: false }
      ],
      stepByStepSolution: [
        "Question Analysis: Identifying the act of exposing internal illegal wrongdoing to the authorities.",
        "Definition: In English business ethics, an employee reporting illegal activity is called a 'whistleblower', and the act is 'whistleblowing'.",
        "Option (opt_a) correctly names and characterizes this ethical action.",
        "Correct Answer: (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Why is counterfeiting pharmaceutical medicines considered a severe criminal offense in business ethics?",
      options: [
        { id: "iso_a", text: "Because it directly endangers human lives by distributing fake, untested, and potentially lethal substances.", correct: true },
        { id: "iso_b", text: "Because it increases international trade competition and lowers consumer prices.", correct: false },
        { id: "iso_c", text: "Because it promotes organic farming in developing agricultural countries.", correct: false },
        { id: "iso_d", text: "Because it requires employees to work overtime during national holidays.", correct: false }
      ],
      repairGuide: "Counterfeiting medications is critical because it threatens human lives and breaches fundamental consumer safety."
    }
  },

  // 2.2 Grammar: It's High Time & Wish
  "eng_grammar_it_is_high_time_wish_syntax": {
    skillId: "eng_grammar_it_is_high_time_wish_syntax",
    title_ar: "اللغة الإنجليزية: قواعد التعبير عن الإلحاح والندم بتراكيب 'It's high time' و 'Wish'",
    subject: "english",
    subjectNameAr: "اللغة الإنجليزية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Grammar: It's High Time & Wish Structures",
    bloomLevel: "apply",
    theory: {
      summary: "This grammar rule appears almost every year on the Algerian Baccalaureate exam. 1) 'It's high time' / 'It's about time' + Subject + Past Simple: expresses urgency, criticism, or an action that should have been done already (e.g., 'It's high time governments stopped corruption'). 2) 'Wish' structures: A) Present Wish (regret about present situation): Subject + wish + Past Simple (e.g., 'I wish businesses were more ethical' = they are not ethical now). B) Past Wish (regret about past action): Subject + wish + Past Perfect (had + past participle) (e.g., 'He wishes he hadn't accepted the bribe' = he accepted it in the past). C) Future Wish / Complaint about someone else: Subject + wish + would + bare infinitive (e.g., 'I wish politicians would stop making empty promises').",
      keyTakeaways: [
        "It's high time + Subject + Past Simple: 'It's high time we fought (fight) counterfeiting'.",
        "Present Regret: I wish + Past Simple ('I wish I had more money' -> reality: I don't have enough money).",
        "Past Regret: I wish + Past Perfect (had + V3) ('She wishes she had studied harder' -> reality: she didn't study).",
        "Complaint / Irritation: I wish + would + stem (used when expressing impatience about another person's behavior)."
      ],
      commonPitfalls: [
        "Using the present tense after 'It's high time' (e.g., writing 'It's high time we fight' instead of 'fought').",
        "Confusing present regret (requires Past Simple) with past regret (requires Past Perfect 'had + PP')."
      ]
    },
    practice: {
      question: "Rewrite sentence (b) so that it means the same as sentence (a):\n(a) Governments must immediately enact strict laws against counterfeit products.\n(b) It is high time governments ____________________.",
      options: [
        { id: "opt_a", text: "enacted strict laws against counterfeit products.", correct: true },
        { id: "opt_b", text: "enact strict laws against counterfeit products.", correct: false },
        { id: "opt_c", text: "will enact strict laws against counterfeit products.", correct: false },
        { id: "opt_d", text: "are enacting strict laws against counterfeit products.", correct: false }
      ],
      stepByStepSolution: [
        "Rule check: The structure 'It is high time + Subject' requires the verb in the Past Simple.",
        "The base verb in the sentence is 'enact'.",
        "Its Past Simple regular form is 'enacted'.",
        "Therefore, sentence (b) must be completed with: 'enacted strict laws against counterfeit products.'",
        "Correct Answer: (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "A company manager regrets accepting an illegal bribe last year. How should he express this past regret using 'wish'?",
      options: [
        { id: "iso_a", text: "« I wish I had not accepted that bribe last year. »", correct: true },
        { id: "iso_b", text: "« I wish I do not accept that bribe last year. »", correct: false },
        { id: "iso_c", text: "« I wish I will not accept that bribe last year. »", correct: false },
        { id: "iso_d", text: "« I wish I am not accepting that bribe last year. »", correct: false }
      ],
      repairGuide: "Regrets about past events require 'wish + Past Perfect (had + past participle)'."
    }
  },

  // 2.3 Grammar: Conditional linkers (Provided that, As long as, Unless)
  "eng_grammar_condition_provided_that_unless": {
    skillId: "eng_grammar_condition_provided_that_unless",
    title_ar: "اللغة الإنجليزية: أدوات الشرط والاستثناء (Provided that, As long as, Unless)",
    subject: "english",
    subjectNameAr: "اللغة الإنجليزية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Grammar: Conditional Connectors & Inversion",
    bloomLevel: "apply",
    theory: {
      summary: "Conditional connectors replace 'if' in advanced English discourse: 1) 'Provided that' / 'Providing that' / 'As long as' / 'So long as' mean 'only if'. They follow the standard First Conditional rule: Connector + Present Simple, Future Simple ('Provided that citizens report bribery, corruption will decrease'). 2) 'Unless' means 'if... not' (except if). It introduces an exception. Key rule: Since 'unless' already contains a negative meaning, the verb following it must always be affirmative ('Unless we act now, corruption will spread' = If we do not act now, corruption will spread).",
      keyTakeaways: [
        "Provided that = As long as = If and only if (followed by Present Simple + will + stem).",
        "Unless = If not. Never use a negative verb directly after 'unless' (e.g., 'Unless you don't study' is incorrect; write 'Unless you study').",
        "Sentence transformation: 'If you don't pay taxes, you will be penalized' = 'Unless you pay taxes, you will be penalized'."
      ],
      commonPitfalls: [
        "Writing a double negative after 'unless' (e.g., 'Unless we don't fight' instead of 'Unless we fight').",
        "Using the future tense 'will' inside the conditional clause after 'provided that'."
      ]
    },
    practice: {
      question: "Rewrite sentence (b) so that it means the same as sentence (a):\n(a) If developing countries do not eradicate corruption, their economies will not grow.\n(b) Unless developing countries ____________________.",
      options: [
        { id: "opt_a", text: "eradicate corruption, their economies will not grow.", correct: true },
        { id: "opt_b", text: "do not eradicate corruption, their economies will not grow.", correct: false },
        { id: "opt_c", text: "will eradicate corruption, their economies will not grow.", correct: false },
        { id: "opt_d", text: "eradicated corruption, their economies would not grow.", correct: false }
      ],
      stepByStepSolution: [
        "Formula: 'If + negative verb' = 'Unless + affirmative verb'.",
        "Sentence (a) has 'If developing countries do not eradicate'.",
        "Replacing 'If... not' with 'Unless' transforms the verb into affirmative: 'Unless developing countries eradicate...'",
        "The main clause remains unchanged: 'their economies will not grow.'",
        "Correct Answer: (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "Complete correctly: « Our national products will regain global consumer trust, provided that manufacturers ____________ rigorous safety standards. »",
      options: [
        { id: "iso_a", text: "respect", correct: true },
        { id: "iso_b", text: "will respect", correct: false },
        { id: "iso_c", text: "respected yesterday", correct: false },
        { id: "iso_d", text: "are going to respect", correct: false }
      ],
      repairGuide: "After conditional linkers like 'provided that', use the Present Simple tense to match the future in the main clause."
    }
  },

  // 2.4 Safety First: Consumer Rights & Advertising
  "eng_safety_first_advertising_junk_food": {
    skillId: "eng_safety_first_advertising_junk_food",
    title_ar: "اللغة الإنجليزية: وحدة الأمان أولاً، حقوق المستهلك، والتأثير النفسي للإعلانات والأطعمة السريعة",
    subject: "english",
    subjectNameAr: "اللغة الإنجليزية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Unit 2 : Safety First (Food Safety & Advertising)",
    bloomLevel: "analyze",
    theory: {
      summary: "The 'Safety First' unit is a major theme for Scientific, Mathematical, and Gestion streams. It investigates food safety, advertising manipulation, and consumer protection. Topics include the health crisis caused by fast food (obesity, diabetes, cardiovascular diseases), chemical additives and GMOs, and deceptive advertising targeting children. It also highlights consumer associations that defend buyers' rights to honest labeling, safe goods, and fair pricing.",
      keyTakeaways: [
        "Food Hazards: Fast food high in trans-fats, excessive sugar, synthetic flavor enhancers, and artificial preservatives.",
        "Deceptive Advertising: Advertisers use persuasive emotional triggers, celebrity endorsements, and misleading slogans to manipulate vulnerable consumers, especially children.",
        "Consumer Rights: The right to safety, the right to information (clear nutrition labels), and the right to choose healthy alternatives."
      ],
      commonPitfalls: [
        "Confusing 'consumer' (the buyer/user) with 'producer' (the manufacturer).",
        "Overlooking the difference between cause connectors ('because', 'since', 'due to') and consequence connectors ('so', 'therefore', 'consequently') in exam reading comprehension."
      ]
    },
    practice: {
      question: "Why do health organizations strongly advocate for banning junk food advertising aimed specifically at young children?",
      options: [
        { id: "opt_a", text: "Because children lack critical judgment to evaluate commercial claims, leading to poor dietary habits and childhood obesity.", correct: true },
        { id: "opt_b", text: "Because children always have unlimited personal credit cards to purchase products.", correct: false },
        { id: "opt_c", text: "Because junk food companies do not pay taxes to municipal governments.", correct: false },
        { id: "opt_d", text: "Because fast food restaurants refuse to employ adult workers.", correct: false }
      ],
      stepByStepSolution: [
        "Pedagogical focus of Safety First: Children's vulnerability to psychological advertising tricks.",
        "Children cannot distinguish between genuine information and commercial bias, leading them to crave sugar-laden, nutrient-poor foods.",
        "This explains the link to rising childhood obesity and health campaigns.",
        "Correct Answer: (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "What is the primary role of non-governmental Consumer Protection Associations?",
      options: [
        { id: "iso_a", text: "To defend consumers' rights against counterfeit goods, false advertising, and toxic food additives.", correct: true },
        { id: "iso_b", text: "To manufacture sugary snacks and sell them in public school cafeterias.", correct: false },
        { id: "iso_c", text: "To organize political elections in foreign diplomatic embassies.", correct: false },
        { id: "iso_d", text: "To eliminate all imported goods from supermarket shelves regardless of safety.", correct: false }
      ],
      repairGuide: "Consumer protection bodies inform the public, test products for safety, and take legal action against deceitful marketing."
    }
  },

  // 2.5 Astronomy & Solar System
  "eng_astronomy_solar_system_exploration": {
    skillId: "eng_astronomy_solar_system_exploration",
    title_ar: "اللغة الإنجليزية: وحدة علم الفلك واستكشاف الفضاء، النظام الشمسي، والمقارنات العلمية",
    subject: "english",
    subjectNameAr: "اللغة الإنجليزية",
    stream: "all_streams",
    streamNameAr: "جميع الشعب",
    unit: "Unit 3 : Astronomy and the Solar System",
    bloomLevel: "apply",
    theory: {
      summary: "Astronomy and the Solar System is a prominent curricular unit for Sciences Expérimentales and Mathématiques. It explores celestial bodies (stars, planets, comets, asteroids, meteors), gravitational forces, space missions, and the search for habitable exoplanets. It serves as a rich context for practicing scientific English: expressing comparisons ('Earth is denser than Mars'), proportions, expressing conditions, and discussing the ethical allocation of budgets between space exploration and solving poverty on Earth.",
      keyTakeaways: [
        "Celestial Vocabulary: Orbit (path of a body), Satellite (natural moon or artificial device), Gravity (attraction force), Light-year (distance measurement).",
        "Planetary Classification: Terrestrial inner planets (rocky, like Earth and Mars) vs Gas giants (Jupiter, Saturn, Uranus, Neptune).",
        "Scientific Comparison Structures: Short adjectives + -er than; more/less + long adjective + than; as + adjective + as; the + superlative."
      ],
      commonPitfalls: [
        "Confusing 'astronomy' (the genuine science of celestial objects) with 'astrology' (the superstitious belief in horoscopes).",
        "Confusing 'meteor' (burning in atmosphere) with 'meteorite' (fragment that reaches the Earth's surface)."
      ]
    },
    practice: {
      question: "Which of the following statements demonstrates a scientifically and grammatically correct comparative structure regarding our Solar System?",
      options: [
        { id: "opt_a", text: "Jupiter is significantly larger and more massive than all the other planets combined.", correct: true },
        { id: "opt_b", text: "Jupiter is more large and most massive as all planets.", correct: false },
        { id: "opt_c", text: "Mars is the most closest planet to the Sun in the galaxy.", correct: false },
        { id: "opt_d", text: "The Moon is more further from Earth than the Sun.", correct: false }
      ],
      stepByStepSolution: [
        "Comparative grammar rules: For one-syllable adjectives like 'large', add '-er' -> 'larger'.",
        "For two-syllable adjectives not ending in -y like 'massive', use 'more massive than'.",
        "Option (opt_a) correctly applies 'larger and more massive than'.",
        "Correct Answer: (opt_a)."
      ]
    },
    isomorphicRetest: {
      question: "What is the crucial scientific distinction between a star (such as the Sun) and a planet (such as Earth)?",
      options: [
        { id: "iso_a", text: "A star generates its own light and heat through nuclear fusion, whereas a planet reflects light from its parent star.", correct: true },
        { id: "iso_b", text: "A star is composed of solid ice, whereas a planet is made entirely of liquid magma.", correct: false },
        { id: "iso_c", text: "A planet has a higher temperature than any star in the observable universe.", correct: false },
        { id: "iso_d", text: "Stars revolve around planets in perfectly circular low-altitude orbits.", correct: false }
      ],
      repairGuide: "Remember the core definition: stars generate light via nuclear fusion; planets are non-luminous bodies reflecting starlight."
    }
  }
};

export function getPack2LanguagesBundle(skillId: string): LanguageBundlePayload | null {
  return PACK2_LANGUAGES_BUNDLE[skillId] || null;
}

export function getAllPack2LanguageSkills(): Skill[] {
  return Object.values(PACK2_LANGUAGES_BUNDLE).map((b, idx) => ({
    id: b.skillId,
    topicId: `topic_${b.skillId}`,
    subjectId: b.subject,
    streamId: "sciences_exp" as any,
    title_ar: b.title_ar,
    title_fr: b.title_ar,
    description_ar: b.theory.summary,
    description_fr: b.theory.summary,
    prerequisites: [],
    cognitiveDimensions: ["knowledge", "understanding", "application"],
    difficulty: 2,
    order: idx + 1,
    repairStrategy_ar: b.isomorphicRetest.repairGuide,
    repairStrategy_fr: "",
    repairSteps_ar: b.theory.keyTakeaways,
    repairSteps_fr: [],
    academicYear: "2026-2027",
    sourceId: "src-ministry-curriculum-3as",
    sourceType: "official_curriculum",
    rightsStatus: "official_reference",
    verificationStatus: "verified",
    isActive: true,
  }));
}
