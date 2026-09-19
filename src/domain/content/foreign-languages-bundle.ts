/**
 * BAC 2026/2027 Production Foreign Languages Bundle
 * Languages: Français & English (Batch 3 - Part 2)
 * Target: All Algerian Baccalaureate Streams (Common Core & Literary/Languages)
 * File: src/domain/content/foreign-languages-bundle.ts
 */

export interface ForeignLanguageBundlePayload {
  skillId: string;
  language: 'french' | 'english';
  subject: string;
  stream: string;
  unitAr: string;
  titleAr: string;
  bloomLevel: 'apply' | 'analyze' | 'understand';
  theory: {
    summary: string;
    keyTakeaways: string[];
    commonPitfalls: string[];
  };
  practice: {
    question: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    explanationStepByStep: string;
  };
  isomorphicRetest: {
    question: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    repairGuide: string;
  };
}

export type SkillLearningBundle = ForeignLanguageBundlePayload;

export const FOREIGN_LANGUAGES_BUNDLE: Record<string, ForeignLanguageBundlePayload> = {
  "fr_texte_histoire_enonciation": {
    "skillId": "fr_texte_histoire_enonciation",
    "language": "french",
    "subject": "francais",
    "stream": "toutes_series",
    "unitAr": "Projet 1: Le texte d'histoire (Le fait d'histoire et le témoignage)",
    "titleAr": "Le texte d'histoire: visée communicative, témoignage et marques de subjectivité",
    "bloomLevel": "analyze",
    "theory": {
      "summary": "Le texte d'histoire présente des événements historiques réels. L'auteur peut adopter une visée purement informative (objectivité apparente: absence de 'je', verbes au présent de narration ou passé simple, vocabulaire neutre) ou une visée testimoniale / commémorative / critique (subjectivité: modalisateurs, lexique mélioratif ou dépréciatif, témoignages au discours direct pour rendre hommage ou dénoncer).",
      "keyTakeaways": [
        "Visée communicative dominante: Informer sur un fait historique, rendre hommage à des martyrs/héros (commémoration), ou dénoncer les crimes coloniaux.",
        "Indices d'énonciation (Subjectivité): Présence de pronoms personnels (je, nous), modalisateurs de certitude (sans doute, incontestablement) ou de doute (peut-être, sembler), et lexique évaluatif (courageux, barbarie).",
        "Statut de l'auteur: Historien impartial (recul historique, sources croisées) ou témoin/acteur direct (vécu personnel, implication émotionnelle)."
      ],
      "commonPitfalls": [
        "Affirmer que l'auteur est objectif uniquement parce qu'il n'utilise pas le pronom 'je' (l'absence de 'je' n'exclut pas la subjectivité par le choix des adjectifs valorisants ou dépréciatifs).",
        "Confondre la date de l'événement relaté avec la date d'écriture du texte."
      ]
    },
    "practice": {
      "question": "Dans un extrait de texte historique sur la guerre de libération algérienne, l'auteur écrit: « Cette sanglante répression perpétrée contre de paisibles manifestants illustre la cruauté inouïe du système colonial ». Quelle est la visée communicative de l'auteur et la nature de son implication ?",
      "options": [
        {
          "id": "opt_a",
          "text": "Visée dénonciatrice avec une forte subjectivité marquée par un lexique dépréciatif (« sanglante », « cruauté inouïe »).",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "Visée purement informative et scientifique avec une totale neutralité historique.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "Visée exhortative invitant le lecteur à s'engager militairement.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "Visée descriptive neutre sans aucun modalisateur de jugement.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) Repérage lexical: les termes 'sanglante', 'paisibles', 'cruauté inouïe' expriment un jugement de valeur tranché.\n2) Analyse de la visée: l'auteur ne se contente pas de relater la date et le lieu, il qualifie et condamne moralement l'acte colonial, ce qui constitue une visée critique et dénonciatrice."
    },
    "isomorphicRetest": {
      "question": "Relevez la phrase où l'auteur marque sa subjectivité par un modalisateur de certitude:",
      "options": [
        {
          "id": "iso_a",
          "text": "« Il est incontestable que le 1er Novembre 1954 a constitué le tournant décisif du destin national. »",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "« La réunion s'est déroulée le 23 octobre à Alger en présence de six dirigeants. »",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "« Les troupes se sont repliées vers le sud selon le rapport militaire officiel. »",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "« Trois accords bilatéraux furent signés à la fin du mois de mars. »",
          "isCorrect": false
        }
      ],
      "repairGuide": "L'adverbe 'incontestable' ou l'expression 'il est incontestable' élimine toute possibilité de doute et traduit l'adhésion totale de l'énonciateur à son propos."
    }
  },
  "fr_compte_rendu_objectif_critique": {
    "skillId": "fr_compte_rendu_objectif_critique",
    "language": "french",
    "subject": "francais",
    "stream": "toutes_series",
    "unitAr": "Méthodologie de l'écrit: Production écrite du BAC",
    "titleAr": "Méthodologie du Compte Rendu: Accroche, Résumé et Critique",
    "bloomLevel": "apply",
    "theory": {
      "summary": "Le compte rendu est l'épreuve reine de production écrite au Baccalauréat algérien. Pour les filières scientifiques et de gestion, il est 'objectif' (Accroche + Résumé au quart de la longueur sans prise de position). Pour les filières littéraires (Langues Étrangères / Lettres & Philo), il comporte en plus la 'critique' (évaluation du fond et de la forme).",
      "keyTakeaways": [
        "Structure de l'accroche (Le paratexte): Titre du texte, nom de l'auteur, source/maison d'édition, date de parution, thème général et visée communicative (« Dans ce texte intitulé..., l'auteur [Nom] traite de... avec une visée informative/argumentative »).",
        "Le corps du résumé: Respect strict de l'objectivité; interdiction formelle d'utiliser 'je', 'moi', 'nous'. Utilisation des verbes introducteurs d'opinion au présent de l'indicatif à la 3e personne: « L'auteur débute par affirmer que... ensuite il démontre que... enfin il conclut en soulignant que... ».",
        "La partie critique (Lettres & Langues): Jugement sur la forme (clarté du vocabulaire, cohérence des enchaînements logiques) et le fond (pertinence des arguments, véracité historique)."
      ],
      "commonPitfalls": [
        "Recopier des phrases intégrales du texte (le compte rendu exige une reformulation personnelle sous peine de sanctions sévères).",
        "Insérer son avis personnel (« À mon avis », « Je pense que ») dans la partie résumé objectif."
      ]
    },
    "practice": {
      "question": "Quelle formulation respecte parfaitement les critères de neutralité d'un compte rendu objectif pour introduire la thèse de l'auteur ?",
      "options": [
        {
          "id": "opt_a",
          "text": "« Dès l'entame de son texte, l'auteur soutient que l'indépendance nationale a été arrachée grâce au sacrifice populaire. »",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "« Je trouve que l'auteur a entièrement raison quand il parle des sacrifices du peuple. »",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "« Selon moi, le texte est très beau car il raconte les événements de notre chère patrie. »",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "« L'auteur a copié son idée principale du livre d'histoire sans rien expliquer. »",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "La formulation 'opt_a' utilise un verbe d'énonciation ('soutient que') à la 3ème personne du singulier, reformule l'idée principale, et exclut tout pronom personnel de première personne (je, moi)."
    },
    "isomorphicRetest": {
      "question": "Dans le compte rendu critique destiné aux séries Lettres et Langues, quel élément appartient exclusivement à la partie critique ?",
      "options": [
        {
          "id": "iso_a",
          "text": "L'évaluation de la pertinence des arguments et de l'accessibilité du registre de langue employé.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "La mention du nom de l'auteur et de la date de parution dans le journal.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "La condensation du texte initial au quart de sa longueur initiale.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "La reprise chronologique des connecteurs d'énumération.",
          "isCorrect": false
        }
      ],
      "repairGuide": "La critique porte sur la forme (style, syntaxe, enchaînement) et sur le fond (solidité des preuves et véracité des thèses défendues)."
    }
  },
  "fr_texte_argumentatif_plaidoyer_requisitoire": {
    "skillId": "fr_texte_argumentatif_plaidoyer_requisitoire",
    "language": "french",
    "subject": "francais",
    "stream": "toutes_series",
    "unitAr": "Projet 2: Le débat d'idées (L'argumentation)",
    "titleAr": "Le débat d'idées: thèse, antithèse, plaidoyer, réquisitoire et concession",
    "bloomLevel": "analyze",
    "theory": {
      "summary": "Le débat d'idées confronte deux points de vue opposés sur une problématique de société. L'auteur peut défendre une cause (Plaidoyer) ou attaquer/condamner une situation (Réquisitoire). La stratégie argumentative repose souvent sur la concession (Certes... mais...) et l'usage rigoureux des connecteurs logiques de cause, conséquence, et opposition.",
      "keyTakeaways": [
        "Plaidoyer vs Réquisitoire: Le plaidoyer valorise (lexique mélioratif, arguments favorables); le réquisitoire accuse et déprécie (lexique péjoratif, mise en cause).",
        "Stratégie de concession: Reconnaître temporairement une part de vérité dans la thèse adverse pour mieux la détruire ensuite: « Certes / Il est vrai que [Thèse adverse], cependant / toutefois / néanmoins [Notre véritable thèse] ».",
        "Connecteurs logiques essentiels: Cause (car, parce que, puisque, étant donné que), Conséquence (donc, par conséquent, si bien que), Opposition (mais, en revanche, par contre, alors que)."
      ],
      "commonPitfalls": [
        "Confondre l'opposition directe (deux faits distincts incompatibles) avec la concession (une restriction apportée à un fait admis).",
        "Ne pas identifier la prise de position réelle de l'auteur lorsqu'il cite d'abord les arguments de ses détracteurs."
      ]
    },
    "practice": {
      "question": "Soit la phrase: « Certes, les réseaux sociaux favorisent la circulation instantanée des nouvelles, néanmoins ils constituent un vecteur dangereux de désinformation. » Quelle stratégie argumentative est mise en œuvre ?",
      "options": [
        {
          "id": "opt_a",
          "text": "La concession (admettre un avantage partiel avant de réfuter et d'imposer son point de vue critique).",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "Une simple addition d'arguments convergents sans nuance.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "Une relation de cause à effet directe et univoque.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "Une conclusion par analogie comparative.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "La structure 'Certes... néanmoins...' est le marqueur grammatical fondamental de la concession dans le programme de terminale: l'énonciateur concède le bénéfice de la rapidité, puis renverse immédiatement le raisonnement avec 'néanmoins' pour appuyer sur le danger."
    },
    "isomorphicRetest": {
      "question": "Quel connecteur logique peut remplacer 'néanmoins' dans la phrase précédente sans altérer le sens argumentatif ?",
      "options": [
        {
          "id": "iso_a",
          "text": "Toutefois",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "Par conséquent",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Puisque",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "En outre",
          "isCorrect": false
        }
      ],
      "repairGuide": "'Toutefois', 'cependant', 'pourtant' et 'néanmoins' sont des synonymes stricts exprimant la restriction adversative et la réfutation après concession."
    }
  },
  "fr_l_appel_incitatif": {
    "skillId": "fr_l_appel_incitatif",
    "language": "french",
    "subject": "francais",
    "stream": "toutes_series",
    "unitAr": "Projet 3: L'appel (Le texte exhortatif)",
    "titleAr": "L'appel: structure en trois phases et visée incitative",
    "bloomLevel": "apply",
    "theory": {
      "summary": "L'appel (ou texte exhortatif) vise à pousser le destinataire à l'action immédiate pour changer une situation jugée intolérable ou périlleuse. Il est toujours structuré en trois moments clés: 1) La phase de constat négatif (exposition de la situation critique), 2) La phase d'analyse / culpabilisation (causes et conséquences), 3) La phase d'appel proprement dite (exhortation, verbes d'obligation et modes injonctifs).",
      "keyTakeaways": [
        "Les trois phases canoniques: Constat (Description alarmante) → Analyse (Mise en cause / Urgence) → Appel (Injonction directe à agir).",
        "Moyens grammaticaux de l'injonction: Mode impératif (« Agissons dès aujourd'hui »), Subjonctif à valeur d'ordre (« Qu'on mette fin à ce massacre »), Verbes de modalité déontique (« devoir », « falloir »), et verbes performatifs (« J'appelle », « Nous exhortons »).",
        "Visée pragmatique: Mobiliser, sensibiliser, et transformer le lecteur passif en acteur solidaire."
      ],
      "commonPitfalls": [
        "Confondre le texte argumentatif classique (qui cherche à convaincre l'esprit) avec l'appel (qui ordonne, pousse à un acte physique ou civique urgent)."
      ]
    },
    "practice": {
      "question": "Dans un appel de l'UNESCO pour la protection du patrimoine, quelle phrase correspond exactement à la 'troisième phase' (la phase d'appel / exhortation) ?",
      "options": [
        {
          "id": "opt_a",
          "text": "« Mobilisons-nous et unissons nos efforts sans tarder pour sauvegarder ces trésors ancestraux ! »",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "« De nombreux monuments historiques sont aujourd'hui dégradés par la pollution et l'abandon. »",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "« Cette détérioration s'explique principalement par le manque de crédits alloués à la restauration. »",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "« Le siècle dernier a vu la disparition de centaines de manuscrits rares. »",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "La phrase 'opt_a' utilise l'impératif présent à la première personne du pluriel ('Mobilisons-nous', 'unissons') et l'adverbe d'urgence ('sans tarder'), ce qui caractérise l'exhortation finale."
    },
    "isomorphicRetest": {
      "question": "Quel verbe exprime une injonction d'obligation stricte dans un texte exhortatif ?",
      "options": [
        {
          "id": "iso_a",
          "text": "« Il est impératif que les gouvernements interviennent. »",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "« Les scientifiques estiment que le climat change. »",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "« Il se peut que les citoyens participent à la collecte. »",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "« L'histoire témoigne des grandes victoires passées. »",
          "isCorrect": false
        }
      ],
      "repairGuide": "'Il est impératif que', 'il faut que', 'nous devons' sont les tournures modales obligatoires marquant la nécessité impérieuse de l'acte."
    }
  },
  "eng_ethics_in_business_whistleblowing": {
    "skillId": "eng_ethics_in_business_whistleblowing",
    "language": "english",
    "subject": "anglais",
    "stream": "toutes_series",
    "unitAr": "Unit 1: Ethics in Business (Fight against Corruption)",
    "titleAr": "Ethics in Business: Corruption, Whistleblowing, and Expressing Advice",
    "bloomLevel": "apply",
    "theory": {
      "summary": "This fundamental BAC unit focuses on combating unethical practices in the economy (bribery, embezzlement, money laundering, counterfeit goods, fraud, child labor). Students must master thematic vocabulary and grammatical structures of advice: 'had better + bare infinitive', 'should / ought to', and modal verbs to propose remedies against corruption.",
      "keyTakeaways": [
        "Key Vocabulary: Bribery (giving money illegally), Embezzlement (stealing public funds), Whistleblower (a courageous insider who exposes illegal activity), Smuggling (illegal import/export), Counterfeiting (making fake copies).",
        "Expressing strong recommendation / warning: 'Subject + had better (not) + verb (infinitive without to)' e.g., 'Governments had better enforce stringent anti-corruption laws.'",
        "Expressing advice: 'ought to / should + bare infinitive' e.g., 'Companies ought to adopt strict transparency codes.'"
      ],
      "commonPitfalls": [
        "Adding 'to' after 'had better' (saying *'You had better to stop'* is a major grammatical mistake on the BAC exam; the correct form is 'had better stop').",
        "Confusing 'embezzlement' (misappropriating funds entrusted to you) with 'bribery' (paying someone for a favor)."
      ]
    },
    "practice": {
      "question": "Citizens and NGOs believe corruption is threatening the country's development. Rewrite the following idea using 'had better': « It is strongly advisable for the government to punish dishonest officials severely. »",
      "options": [
        {
          "id": "opt_a",
          "text": "The government had better punish dishonest officials severely.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "The government had better to punish dishonest officials severely.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "The government had better punishing dishonest officials severely.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "The government has better punished dishonest officials severely.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "The rule for 'had better' is: Subject + had better + Bare Infinitive (infinitive without 'to'). Therefore: 'The government had better punish...'. Note that 'had' is always past form even when referring to present or future advice."
    },
    "isomorphicRetest": {
      "question": "Complete the definition: A 'whistleblower' is an employee who:",
      "options": [
        {
          "id": "iso_a",
          "text": "Reports unlawful or unethical practices occurring inside their company or organization to the public or authorities.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "Accepts illegal commissions to facilitate fraudulent commercial transactions.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Manufactures pirated copies of branded consumer products in secret workshops.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "Refuses to pay taxes and transfers capital to offshore tax havens.",
          "isCorrect": false
        }
      ],
      "repairGuide": "A whistleblower sounds the alarm ('blows the whistle') to protect society against corporate fraud, environmental crimes, or bribery."
    }
  },
  "eng_grammar_it_is_high_time_wish": {
    "skillId": "eng_grammar_it_is_high_time_wish",
    "language": "english",
    "subject": "anglais",
    "stream": "toutes_series",
    "unitAr": "Grammar: Expressing Urgent Necessity, Wishes, and Regret",
    "titleAr": "Grammar: 'It's high time + Past Simple' & 'Wish' structures",
    "bloomLevel": "apply",
    "theory": {
      "summary": "A recurring BAC question tests unreal past structures used to express urgency or dissatisfaction with current situations: 1) 'It's high time / It's about time + Subject + Past Simple' (indicating an action that is overdue), 2) 'Wish + Past Simple' (wish about a present situation), 3) 'Wish + Past Perfect' (regret about a past event), and 4) 'Wish + would' (desire for someone else's annoying behavior to change in the future).",
      "keyTakeaways": [
        "It is high time / about time + Subject + Past Simple: 'It is high time governments eradicated tax havens.' (Meaning: They should have done it already!).",
        "Present Wish: 'I wish + Subject + Past Simple' (e.g., 'I wish people were more ethical in business.').",
        "Past Regret: 'I wish + Subject + Past Perfect (had + past participle)' (e.g., 'I wish I had not bought that counterfeit phone yesterday.').",
        "Complaints: 'I wish + Subject + would + verb' (e.g., 'I wish companies would stop advertising harmful products to children.')."
      ],
      "commonPitfalls": [
        "Using the present simple after 'It's high time' (e.g., writing *'It's high time we eradicate'* instead of 'It's high time we eradicated').",
        "Confusing 'had + verb' with 'would + verb' in past regret scenarios."
      ]
    },
    "practice": {
      "question": "Rewrite sentence (b) so that it means the same as sentence (a):\n(a) International bodies ought to enact stricter penalties against money launderers right now.\n(b) It is high time ........................................................................",
      "options": [
        {
          "id": "opt_a",
          "text": "It is high time international bodies enacted stricter penalties against money launderers.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "It is high time international bodies enact stricter penalties against money launderers.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "It is high time international bodies had enacted stricter penalties against money launderers.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "It is high time for international bodies enacting stricter penalties against money launderers.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "Formula: 'It is high time + subject (international bodies) + Past Simple of verb enact (enacted) + complement.' This expresses urgent overdue action."
    },
    "isomorphicRetest": {
      "question": "A company regrets having employed underage workers in their factories in 2022. Which sentence correctly expresses their past regret?",
      "options": [
        {
          "id": "iso_a",
          "text": "We wish we had never employed underage workers in our factories.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "We wish we did not employ underage workers in our factories today.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "We wish we will stop employing underage workers soon.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "We wish we would not employ underage workers in the past.",
          "isCorrect": false
        }
      ],
      "repairGuide": "Regret about an event that already took place in the past (2022) always takes 'wish + Past Perfect (had + V3)'."
    }
  },
  "eng_grammar_provided_that_condition": {
    "skillId": "eng_grammar_provided_that_condition",
    "language": "english",
    "subject": "anglais",
    "stream": "toutes_series",
    "unitAr": "Grammar: Expressing Condition (Provided that, As long as, Unless)",
    "titleAr": "Grammar: Condition connectors ('Provided that', 'As long as', 'Unless')",
    "bloomLevel": "apply",
    "theory": {
      "summary": "These connectors link two clauses where the main event will happen only if the condition is met. 'Provided that' / 'Providing that' and 'As long as' mean 'if and only if' and follow the Type 1 Conditional pattern (Present Simple in the condition clause, Future Simple 'will + verb' in the result clause). 'Unless' means 'if ... not'.",
      "keyTakeaways": [
        "Rule: [Main Clause with Future: Will + Stem] + provided that / as long as + [Condition Clause in Present Simple].",
        "Example: 'The economy will flourish provided that authorities eliminate administrative corruption.'",
        "Unless = If + negative verb: 'Unless companies obey fair competition laws, they will face heavy fines.' = 'If companies do not obey fair competition laws, they will face heavy fines.'"
      ],
      "commonPitfalls": [
        "Putting 'will' directly after 'provided that' or 'as long as' (e.g., *'provided that you will work'* is incorrect; it must be 'provided that you work').",
        "Using a double negative with 'unless' (e.g., *'unless you don't study'* is incorrect; it must be 'unless you study')."
      ]
    },
    "practice": {
      "question": "Combine the two sentences using 'provided that':\nSentence 1: Our enterprise will invest in solar energy.\nSentence 2: The government grants tax exemptions.",
      "options": [
        {
          "id": "opt_a",
          "text": "Our enterprise will invest in solar energy provided that the government grants tax exemptions.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "Our enterprise will invest in solar energy provided that the government will grant tax exemptions.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "Our enterprise invested in solar energy provided that the government would grant tax exemptions.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "Provided that our enterprise will invest in solar energy, the government grants tax exemptions.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "The clause following 'provided that' is the conditional clause and must take the Present Simple tense ('grants'), while the main clause retains the Future Simple ('will invest')."
    },
    "isomorphicRetest": {
      "question": "Rewrite: « If developing nations do not combat bribery, foreign investors will not come. » using 'Unless':",
      "options": [
        {
          "id": "iso_a",
          "text": "Unless developing nations combat bribery, foreign investors will not come.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "Unless developing nations do not combat bribery, foreign investors will not come.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Unless foreign investors will come, developing nations combat bribery.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "Unless developing nations combated bribery, foreign investors would not come.",
          "isCorrect": false
        }
      ],
      "repairGuide": "'Unless' already contains the negative meaning (If not). Therefore, 'If they do not combat' becomes 'Unless they combat'."
    }
  },
  "eng_ancient_civilizations_flourish_fall": {
    "skillId": "eng_ancient_civilizations_flourish_fall",
    "language": "english",
    "subject": "anglais",
    "stream": "lettres_philo_langues_sciences",
    "unitAr": "Unit 2: Ancient Civilizations (Rise, Achievements and Collapse)",
    "titleAr": "Ancient Civilizations: Flourishing, Fall, Passive Transformations & Cause/Effect",
    "bloomLevel": "analyze",
    "theory": {
      "summary": "This unit explores historical achievements (Mesopotamia, Ancient Egypt, Indus Valley, Roman and Islamic civilizations), their collapse due to warfare, climate disasters, or economic decay, and grammatical transformations into the passive voice and cause/effect connectors ('due to', 'because of', 'consequently', 'as a result').",
      "keyTakeaways": [
        "Vocabulary: To flourish / prosper / thrive (prosperer, développer), to collapse / fall / vanish (s'effondrer), irrigation, agriculture, cuneiform writing, monuments, architectural legacy.",
        "Passive Voice in Historical Context: Subject + Verb 'to be' (in the past: was/were) + Past Participle (V3) e.g., 'Pyramids were constructed by skilled Egyptian workers.'",
        "Cause & Effect: 'due to / owing to / because of + Noun Phrase' vs 'because / since + Clause'. Example: 'The Mayan civilization declined due to severe prolonged droughts.'"
      ],
      "commonPitfalls": [
        "Forgetting to agree the verb 'to be' with the new plural subject when changing from active to passive (e.g., *'The temples was built'* instead of 'The temples were built').",
        "Placing a full subject+verb clause after 'due to' without using 'due to the fact that'."
      ]
    },
    "practice": {
      "question": "Transform the sentence into the passive voice:\n« Ancient Sumerians invented the earliest known system of writing in Mesopotamia. »",
      "options": [
        {
          "id": "opt_a",
          "text": "The earliest known system of writing was invented by ancient Sumerians in Mesopotamia.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "The earliest known system of writing were invented by ancient Sumerians in Mesopotamia.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "The earliest known system of writing has been invented by ancient Sumerians in Mesopotamia.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "The earliest known system of writing had invented by ancient Sumerians in Mesopotamia.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) Object 'The earliest known system of writing' is singular → auxiliary 'was'.\n2) Past participle of 'invent' → 'invented'.\n3) Subject placed in agent phrase with 'by' → 'by ancient Sumerians'."
    },
    "isomorphicRetest": {
      "question": "Combine the sentences using 'owing to':\n(1) The Roman empire suffered economic breakdown.\n(2) Continuous internal civil wars caused it.",
      "options": [
        {
          "id": "iso_a",
          "text": "The Roman empire suffered economic breakdown owing to continuous internal civil wars.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "The Roman empire suffered economic breakdown owing to it had civil wars continuously.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "Owing to the Roman empire suffered breakdown, civil wars happened.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "The Roman empire suffered economic breakdown owing to because of civil wars.",
          "isCorrect": false
        }
      ],
      "repairGuide": "'Owing to' must be followed directly by a noun phrase ('continuous internal civil wars') without adding 'because' or an inflected verb clause."
    }
  }
};

export const FOREIGN_LANGUAGES_ALIASES: Record<string, string> = {
  // Existing BAC Mastery canonical skill IDs
  "fr_lp_texte_histoire_temoignage": "fr_texte_histoire_enonciation",
  "en_lp_ancient_civilizations": "eng_ancient_civilizations_flourish_fall",
  "fr_ge_compte_rendu_economique": "fr_compte_rendu_objectif_critique",
  "en_ge_economic_text_comprehension": "eng_ethics_in_business_whistleblowing",
  // Common short aliases
  "french_texte_histoire": "fr_texte_histoire_enonciation",
  "french_compte_rendu": "fr_compte_rendu_objectif_critique",
  "french_debat_idees": "fr_texte_argumentatif_plaidoyer_requisitoire",
  "french_appel": "fr_l_appel_incitatif",
  "english_ethics": "eng_ethics_in_business_whistleblowing",
  "english_high_time": "eng_grammar_it_is_high_time_wish",
  "english_provided_that": "eng_grammar_provided_that_condition",
  "english_civilizations": "eng_ancient_civilizations_flourish_fall",
};

export function getForeignLanguageBundle(skillId: string): ForeignLanguageBundlePayload | null {
  const resolvedId = FOREIGN_LANGUAGES_ALIASES[skillId] || skillId;
  return FOREIGN_LANGUAGES_BUNDLE[resolvedId] || null;
}
