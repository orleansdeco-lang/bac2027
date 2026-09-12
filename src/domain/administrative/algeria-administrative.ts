/**
 * BAC Mastery — Algerian Administrative Registry
 * Canonical reference for all 58 Algerian Wilayas and their principal communes
 * Grounded in Law No. 19-12 of December 11, 2019 relating to the territorial organization of Algeria.
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

export const ALGERIAN_WILAYAS: Wilaya[] = [
  { code: "01", name_ar: "أدرار", name_fr: "Adrar" },
  { code: "02", name_ar: "الشلف", name_fr: "Chlef" },
  { code: "03", name_ar: "الأغواط", name_fr: "Laghouat" },
  { code: "04", name_ar: "أم البواقي", name_fr: "Oum El Bouaghi" },
  { code: "05", name_ar: "باتنة", name_fr: "Batna" },
  { code: "06", name_ar: "بجاية", name_fr: "Béjaïa" },
  { code: "07", name_ar: "بسكرة", name_fr: "Biskra" },
  { code: "08", name_ar: "بشار", name_fr: "Béchar" },
  { code: "09", name_ar: "البليدة", name_fr: "Blida" },
  { code: "10", name_ar: "البويرة", name_fr: "Bouira" },
  { code: "11", name_ar: "تمنراست", name_fr: "Tamanrasset" },
  { code: "12", name_ar: "تبسة", name_fr: "Tébessa" },
  { code: "13", name_ar: "تلمسان", name_fr: "Tlemcen" },
  { code: "14", name_ar: "تيارت", name_fr: "Tiaret" },
  { code: "15", name_ar: "تيزي وزو", name_fr: "Tizi Ouzou" },
  { code: "16", name_ar: "الجزائر", name_fr: "Alger" },
  { code: "17", name_ar: "الجلفة", name_fr: "Djelfa" },
  { code: "18", name_ar: "جيجل", name_fr: "Jijel" },
  { code: "19", name_ar: "سطيف", name_fr: "Sétif" },
  { code: "20", name_ar: "سعيدة", name_fr: "Saïda" },
  { code: "21", name_ar: "سكيكدة", name_fr: "Skikda" },
  { code: "22", name_ar: "سيدي بلعباس", name_fr: "Sidi Bel Abbès" },
  { code: "23", name_ar: "عنابة", name_fr: "Annaba" },
  { code: "24", name_ar: "قالمة", name_fr: "Guelma" },
  { code: "25", name_ar: "قسنطينة", name_fr: "Constantine" },
  { code: "26", name_ar: "المدية", name_fr: "Médéa" },
  { code: "27", name_ar: "مستغانم", name_fr: "Mostaganem" },
  { code: "28", name_ar: "المسيلة", name_fr: "M'Sila" },
  { code: "29", name_ar: "معسكر", name_fr: "Mascara" },
  { code: "30", name_ar: "ورقلة", name_fr: "Ouargla" },
  { code: "31", name_ar: "وهران", name_fr: "Oran" },
  { code: "32", name_ar: "البيض", name_fr: "El Bayadh" },
  { code: "33", name_ar: "إليزي", name_fr: "Illizi" },
  { code: "34", name_ar: "برج بوعريريج", name_fr: "Bordj Bou Arréridj" },
  { code: "35", name_ar: "بومرداس", name_fr: "Boumerdès" },
  { code: "36", name_ar: "الطارف", name_fr: "El Tarf" },
  { code: "37", name_ar: "تندوف", name_fr: "Tindouf" },
  { code: "38", name_ar: "تيسمسيلت", name_fr: "Tissemsilt" },
  { code: "39", name_ar: "الوادي", name_fr: "El Oued" },
  { code: "40", name_ar: "خنشلة", name_fr: "Khenchela" },
  { code: "41", name_ar: "سوق أهراس", name_fr: "Souk Ahras" },
  { code: "42", name_ar: "تيبازة", name_fr: "Tipaza" },
  { code: "43", name_ar: "ميلة", name_fr: "Mila" },
  { code: "44", name_ar: "عين الدفلى", name_fr: "Aïn Defla" },
  { code: "45", name_ar: "النعامة", name_fr: "Naâma" },
  { code: "46", name_ar: "عين تموشنت", name_fr: "Aïn Témouchent" },
  { code: "47", name_ar: "غرداية", name_fr: "Ghardaïa" },
  { code: "48", name_ar: "غليزان", name_fr: "Relizane" },
  { code: "49", name_ar: "تيميمون", name_fr: "Timimoun" },
  { code: "50", name_ar: "برج باجي مختار", name_fr: "Bordj Badji Mokhtar" },
  { code: "51", name_ar: "أولاد جلال", name_fr: "Ouled Djellal" },
  { code: "52", name_ar: "بني عباس", name_fr: "Béni Abbès" },
  { code: "53", name_ar: "عين صالح", name_fr: "In Salah" },
  { code: "54", name_ar: "عين قزام", name_fr: "In Guezzam" },
  { code: "55", name_ar: "تقرت", name_fr: "Touggourt" },
  { code: "56", name_ar: "جانت", name_fr: "Djanet" },
  { code: "57", name_ar: "المغير", name_fr: "El M'Ghair" },
  { code: "58", name_ar: "المنيعة", name_fr: "El Meniaa" },
];

export const ALGERIAN_COMMUNES: Commune[] = [
  // 01 Adrar
  { code: "0101", wilaya_code: "01", name_ar: "أدرار", name_fr: "Adrar" },
  { code: "0102", wilaya_code: "01", name_ar: "فنوغيل", name_fr: "Fenoughil" },
  { code: "0103", wilaya_code: "01", name_ar: "زاوية كنتة", name_fr: "Zaouiet Kounta" },
  { code: "0104", wilaya_code: "01", name_ar: "رقان", name_fr: "Reggane" },

  // 02 Chlef
  { code: "0201", wilaya_code: "02", name_ar: "الشلف", name_fr: "Chlef" },
  { code: "0202", wilaya_code: "02", name_ar: "تنس", name_fr: "Ténès" },
  { code: "0203", wilaya_code: "02", name_ar: "بوقادير", name_fr: "Boukadir" },
  { code: "0204", wilaya_code: "02", name_ar: "أولاد فارس", name_fr: "Ouled Fares" },
  { code: "0205", wilaya_code: "02", name_ar: "وادي الفضة", name_fr: "Oued Fodda" },
  { code: "0206", wilaya_code: "02", name_ar: "بني حواء", name_fr: "Beni Haoua" },

  // 03 Laghouat
  { code: "0301", wilaya_code: "03", name_ar: "الأغواط", name_fr: "Laghouat" },
  { code: "0302", wilaya_code: "03", name_ar: "أفلو", name_fr: "Aflou" },
  { code: "0303", wilaya_code: "03", name_ar: "عين ماضي", name_fr: "Aïn Madhi" },

  // 04 Oum El Bouaghi
  { code: "0401", wilaya_code: "04", name_ar: "أم البواقي", name_fr: "Oum El Bouaghi" },
  { code: "0402", wilaya_code: "04", name_ar: "عين البيضاء", name_fr: "Aïn Beïda" },
  { code: "0403", wilaya_code: "04", name_ar: "عين مليلة", name_fr: "Aïn M'lila" },

  // 05 Batna
  { code: "0501", wilaya_code: "05", name_ar: "باتنة", name_fr: "Batna" },
  { code: "0502", wilaya_code: "05", name_ar: "بريكة", name_fr: "Barika" },
  { code: "0503", wilaya_code: "05", name_ar: "عين التوتة", name_fr: "Aïn Touta" },
  { code: "0504", wilaya_code: "05", name_ar: "أريس", name_fr: "Arris" },

  // 06 Béjaïa
  { code: "0601", wilaya_code: "06", name_ar: "بجاية", name_fr: "Béjaïa" },
  { code: "0602", wilaya_code: "06", name_ar: "أميزور", name_fr: "Amizour" },
  { code: "0603", wilaya_code: "06", name_ar: "أقبو", name_fr: "Akbou" },
  { code: "0604", wilaya_code: "06", name_ar: "القصر", name_fr: "El Kseur" },

  // 07 Biskra
  { code: "0701", wilaya_code: "07", name_ar: "بسكرة", name_fr: "Biskra" },
  { code: "0702", wilaya_code: "07", name_ar: "طولقة", name_fr: "Tolga" },
  { code: "0703", wilaya_code: "07", name_ar: "سيدي عقبة", name_fr: "Sidi Okba" },

  // 08 Béchar
  { code: "0801", wilaya_code: "08", name_ar: "بشار", name_fr: "Béchar" },
  { code: "0802", wilaya_code: "08", name_ar: "القنادسة", name_fr: "Kenadsa" },
  { code: "0803", wilaya_code: "08", name_ar: "تاغيت", name_fr: "Taghit" },

  // 09 Blida
  { code: "0901", wilaya_code: "09", name_ar: "البليدة", name_fr: "Blida" },
  { code: "0902", wilaya_code: "09", name_ar: "بوفاريك", name_fr: "Boufarik" },
  { code: "0903", wilaya_code: "09", name_ar: "العفرون", name_fr: "El Affroun" },
  { code: "0904", wilaya_code: "09", name_ar: "الأربعاء", name_fr: "Larbaa" },

  // 10 Bouira
  { code: "1001", wilaya_code: "10", name_ar: "البويرة", name_fr: "Bouira" },
  { code: "1002", wilaya_code: "10", name_ar: "الأخضرية", name_fr: "Lakhdaria" },
  { code: "1003", wilaya_code: "10", name_ar: "سور الغزلان", name_fr: "Sour El Ghozlane" },

  // 11 Tamanrasset
  { code: "1101", wilaya_code: "11", name_ar: "تمنراست", name_fr: "Tamanrasset" },
  { code: "1102", wilaya_code: "11", name_ar: "عين أمقل", name_fr: "Abalessa" },

  // 12 Tébessa
  { code: "1201", wilaya_code: "12", name_ar: "تبسة", name_fr: "Tébessa" },
  { code: "1202", wilaya_code: "12", name_ar: "بئر العاتر", name_fr: "Bir El Ater" },
  { code: "1203", wilaya_code: "12", name_ar: "الشريعة", name_fr: "Cheria" },

  // 13 Tlemcen
  { code: "1301", wilaya_code: "13", name_ar: "تلمسان", name_fr: "Tlemcen" },
  { code: "1302", wilaya_code: "13", name_ar: "مغنية", name_fr: "Maghnia" },
  { code: "1303", wilaya_code: "13", name_ar: "الرمشي", name_fr: "Remchi" },
  { code: "1304", wilaya_code: "13", name_ar: "سبدو", name_fr: "Sebdou" },

  // 14 Tiaret
  { code: "1401", wilaya_code: "14", name_ar: "تيارت", name_fr: "Tiaret" },
  { code: "1402", wilaya_code: "14", name_ar: "فرندة", name_fr: "Frenda" },
  { code: "1403", wilaya_code: "14", name_ar: "السوقر", name_fr: "Sougueur" },

  // 15 Tizi Ouzou
  { code: "1501", wilaya_code: "15", name_ar: "تيزي وزو", name_fr: "Tizi Ouzou" },
  { code: "1502", wilaya_code: "15", name_ar: "عزازقة", name_fr: "Azazga" },
  { code: "1503", wilaya_code: "15", name_ar: "ذراع الميزان", name_fr: "Draa El Mizan" },
  { code: "1504", wilaya_code: "15", name_ar: "الأربعاء نايث إيراثن", name_fr: "Larbaâ Nath Irathen" },

  // 16 Alger
  { code: "1601", wilaya_code: "16", name_ar: "الجزائر الوسطى", name_fr: "Alger Centre" },
  { code: "1602", wilaya_code: "16", name_ar: "سيدي امحمد", name_fr: "Sidi M'Hamed" },
  { code: "1603", wilaya_code: "16", name_ar: "باب الوادي", name_fr: "Bab El Oued" },
  { code: "1604", wilaya_code: "16", name_ar: "الحراش", name_fr: "El Harrach" },
  { code: "1605", wilaya_code: "16", name_ar: "القبة", name_fr: "Kouba" },
  { code: "1606", wilaya_code: "16", name_ar: "حيدرة", name_fr: "Hydra" },
  { code: "1607", wilaya_code: "16", name_ar: "بئر مراد رايس", name_fr: "Bir Mourad Raïs" },
  { code: "1608", wilaya_code: "16", name_ar: "الرويبة", name_fr: "Rouïba" },
  { code: "1609", wilaya_code: "16", name_ar: "زرالدة", name_fr: "Zéralda" },
  { code: "1610", wilaya_code: "16", name_ar: "الشراقة", name_fr: "Chéraga" },
  { code: "1611", wilaya_code: "16", name_ar: "باب الزوار", name_fr: "Bab Ezzouar" },

  // 17 Djelfa
  { code: "1701", wilaya_code: "17", name_ar: "الجلفة", name_fr: "Djelfa" },
  { code: "1702", wilaya_code: "17", name_ar: "عين وسارة", name_fr: "Aïn Oussera" },
  { code: "1703", wilaya_code: "17", name_ar: "مسعد", name_fr: "Messaad" },

  // 18 Jijel
  { code: "1801", wilaya_code: "18", name_ar: "جيجل", name_fr: "Jijel" },
  { code: "1802", wilaya_code: "18", name_ar: "الميلية", name_fr: "El Milia" },
  { code: "1803", wilaya_code: "18", name_ar: "طاهير", name_fr: "Taher" },

  // 19 Sétif
  { code: "1901", wilaya_code: "19", name_ar: "سطيف", name_fr: "Sétif" },
  { code: "1902", wilaya_code: "19", name_ar: "العلمة", name_fr: "El Eulma" },
  { code: "1903", wilaya_code: "19", name_ar: "عين ولمان", name_fr: "Aïn Oulmene" },
  { code: "1904", wilaya_code: "19", name_ar: "عين الكبيرة", name_fr: "Aïn Arnat" },

  // 20 Saïda
  { code: "2001", wilaya_code: "20", name_ar: "سعيدة", name_fr: "Saïda" },
  { code: "2002", wilaya_code: "20", name_ar: "يوب", name_fr: "Youb" },

  // 21 Skikda
  { code: "2101", wilaya_code: "21", name_ar: "سكيكدة", name_fr: "Skikda" },
  { code: "2102", wilaya_code: "21", name_ar: "القل", name_fr: "Collo" },
  { code: "2103", wilaya_code: "21", name_ar: "عزابة", name_fr: "Azzaba" },

  // 22 Sidi Bel Abbès
  { code: "2201", wilaya_code: "22", name_ar: "سيدي بلعباس", name_fr: "Sidi Bel Abbès" },
  { code: "2202", wilaya_code: "22", name_ar: "سفيزف", name_fr: "Sfisef" },
  { code: "2203", wilaya_code: "22", name_ar: "تلاغ", name_fr: "Telagh" },

  // 23 Annaba
  { code: "2301", wilaya_code: "23", name_ar: "عنابة", name_fr: "Annaba" },
  { code: "2302", wilaya_code: "23", name_ar: "البوني", name_fr: "El Bouni" },
  { code: "2303", wilaya_code: "23", name_ar: "برحال", name_fr: "Berrahal" },

  // 24 Guelma
  { code: "2401", wilaya_code: "24", name_ar: "قالمة", name_fr: "Guelma" },
  { code: "2402", wilaya_code: "24", name_ar: "وادي الزناتي", name_fr: "Oued Zenati" },

  // 25 Constantine
  { code: "2501", wilaya_code: "25", name_ar: "قسنطينة", name_fr: "Constantine" },
  { code: "2502", wilaya_code: "25", name_ar: "الخروب", name_fr: "El Khroub" },
  { code: "2503", wilaya_code: "25", name_ar: "علي منجلي", name_fr: "Ali Mendjeli" },
  { code: "2504", wilaya_code: "25", name_ar: "حامة بوزيان", name_fr: "Hamma Bouziane" },

  // 26 Médéa
  { code: "2601", wilaya_code: "26", name_ar: "المدية", name_fr: "Médéa" },
  { code: "2602", wilaya_code: "26", name_ar: "البرواقية", name_fr: "Berrouaghia" },
  { code: "2603", wilaya_code: "26", name_ar: "قصر البخاري", name_fr: "Ksar El Boukhari" },

  // 27 Mostaganem
  { code: "2701", wilaya_code: "27", name_ar: "مستغانم", name_fr: "Mostaganem" },
  { code: "2702", wilaya_code: "27", name_ar: "عين تادلس", name_fr: "Aïn Tedeles" },
  { code: "2703", wilaya_code: "27", name_ar: "سيدي علي", name_fr: "Sidi Ali" },

  // 28 M'Sila
  { code: "2801", wilaya_code: "28", name_ar: "المسيلة", name_fr: "M'Sila" },
  { code: "2802", wilaya_code: "28", name_ar: "بوسعادة", name_fr: "Bou Saâda" },
  { code: "2803", wilaya_code: "28", name_ar: "مقرة", name_fr: "Magra" },

  // 29 Mascara
  { code: "2901", wilaya_code: "29", name_ar: "معسكر", name_fr: "Mascara" },
  { code: "2902", wilaya_code: "29", name_ar: "سيق", name_fr: "Sig" },
  { code: "2903", wilaya_code: "29", name_ar: "تيغنيف", name_fr: "Tighennif" },

  // 30 Ouargla
  { code: "3001", wilaya_code: "30", name_ar: "ورقلة", name_fr: "Ouargla" },
  { code: "3002", wilaya_code: "30", name_ar: "حاسي مسعود", name_fr: "Hassi Messaoud" },

  // 31 Oran
  { code: "3101", wilaya_code: "31", name_ar: "وهران", name_fr: "Oran" },
  { code: "3102", wilaya_code: "31", name_ar: "السانية", name_fr: "Es Senia" },
  { code: "3103", wilaya_code: "31", name_ar: "بئر الجير", name_fr: "Bir El Djir" },
  { code: "3104", wilaya_code: "31", name_ar: "عين الترك", name_fr: "Aïn El Turk" },
  { code: "3105", wilaya_code: "31", name_ar: "أرزيو", name_fr: "Arzew" },
  { code: "3106", wilaya_code: "31", name_ar: "بطيوة", name_fr: "Bethioua" },

  // 32 El Bayadh
  { code: "3201", wilaya_code: "32", name_ar: "البيض", name_fr: "El Bayadh" },
  { code: "3202", wilaya_code: "32", name_ar: "الأبيض سيدي الشيخ", name_fr: "El Abiodh Sidi Cheikh" },

  // 33 Illizi
  { code: "3301", wilaya_code: "33", name_ar: "إليزي", name_fr: "Illizi" },
  { code: "3302", wilaya_code: "33", name_ar: "إن أمناس", name_fr: "In Amenas" },

  // 34 Bordj Bou Arréridj
  { code: "3401", wilaya_code: "34", name_ar: "برج بوعريريج", name_fr: "Bordj Bou Arréridj" },
  { code: "3402", wilaya_code: "34", name_ar: "رأس الوادي", name_fr: "Ras El Oued" },

  // 35 Boumerdès
  { code: "3501", wilaya_code: "35", name_ar: "بومرداس", name_fr: "Boumerdès" },
  { code: "3502", wilaya_code: "35", name_ar: "دلس", name_fr: "Dellys" },
  { code: "3503", wilaya_code: "35", name_ar: "برج منايل", name_fr: "Bordj Menaïel" },
  { code: "3504", wilaya_code: "35", name_ar: "خميس الخشنة", name_fr: "Khemis El Khechna" },

  // 36 El Tarf
  { code: "3601", wilaya_code: "36", name_ar: "الطارف", name_fr: "El Tarf" },
  { code: "3602", wilaya_code: "36", name_ar: "القالة", name_fr: "El Kala" },

  // 37 Tindouf
  { code: "3701", wilaya_code: "37", name_ar: "تندوف", name_fr: "Tindouf" },

  // 38 Tissemsilt
  { code: "3801", wilaya_code: "38", name_ar: "تيسمسيلت", name_fr: "Tissemsilt" },
  { code: "3802", wilaya_code: "38", name_ar: "ثنية الحد", name_fr: "Theniet El Had" },

  // 39 El Oued
  { code: "3901", wilaya_code: "39", name_ar: "الوادي", name_fr: "El Oued" },
  { code: "3902", wilaya_code: "39", name_ar: "قمار", name_fr: "Guemar" },
  { code: "3903", wilaya_code: "39", name_ar: "الرقيبة", name_fr: "Robbah" },

  // 40 Khenchela
  { code: "4001", wilaya_code: "40", name_ar: "خنشلة", name_fr: "Khenchela" },
  { code: "4002", wilaya_code: "40", name_ar: "شاشار", name_fr: "Chechar" },
  { code: "4003", wilaya_code: "40", name_ar: "قايس", name_fr: "Kaïs" },

  // 41 Souk Ahras
  { code: "4101", wilaya_code: "41", name_ar: "سوق أهراس", name_fr: "Souk Ahras" },
  { code: "4102", wilaya_code: "41", name_ar: "سدراتة", name_fr: "Sedrata" },

  // 42 Tipaza
  { code: "4201", wilaya_code: "42", name_ar: "تيبازة", name_fr: "Tipaza" },
  { code: "4202", wilaya_code: "42", name_ar: "شرشال", name_fr: "Cherchell" },
  { code: "4203", wilaya_code: "42", name_ar: "القليعة", name_fr: "Koléa" },
  { code: "4204", wilaya_code: "42", name_ar: "بواسماعيل", name_fr: "Bou Ismaïl" },

  // 43 Mila
  { code: "4301", wilaya_code: "43", name_ar: "ميلة", name_fr: "Mila" },
  { code: "4302", wilaya_code: "43", name_ar: "شلغوم العيد", name_fr: "Chelghoum Laïd" },
  { code: "4303", wilaya_code: "43", name_ar: "فرجيوة", name_fr: "Ferdjioua" },

  // 44 Aïn Defla
  { code: "4401", wilaya_code: "44", name_ar: "عين الدفلى", name_fr: "Aïn Defla" },
  { code: "4402", wilaya_code: "44", name_ar: "خميس مليانة", name_fr: "Khemis Miliana" },
  { code: "4403", wilaya_code: "44", name_ar: "مليانة", name_fr: "Miliana" },

  // 45 Naâma
  { code: "4501", wilaya_code: "45", name_ar: "النعامة", name_fr: "Naâma" },
  { code: "4502", wilaya_code: "45", name_ar: "مشرية", name_fr: "Mécheria" },
  { code: "4503", wilaya_code: "45", name_ar: "عين الصفراء", name_fr: "Aïn Sefra" },

  // 46 Aïn Témouchent
  { code: "4601", wilaya_code: "46", name_ar: "عين تموشنت", name_fr: "Aïn Témouchent" },
  { code: "4602", wilaya_code: "46", name_ar: "بني صاف", name_fr: "Béni Saf" },
  { code: "4603", wilaya_code: "46", name_ar: "حمام بوحجر", name_fr: "Hammam Bou Hadjar" },

  // 47 Ghardaïa
  { code: "4701", wilaya_code: "47", name_ar: "غرداية", name_fr: "Ghardaïa" },
  { code: "4702", wilaya_code: "47", name_ar: "القرارة", name_fr: "El Guerrara" },
  { code: "4703", wilaya_code: "47", name_ar: "متليلي", name_fr: "Metlili" },

  // 48 Relizane
  { code: "4801", wilaya_code: "48", name_ar: "غليزان", name_fr: "Relizane" },
  { code: "4802", wilaya_code: "48", name_ar: "وادي ارهيو", name_fr: "Oued Rhiou" },
  { code: "4803", wilaya_code: "48", name_ar: "مازونة", name_fr: "Mazouna" },

  // 49 Timimoun
  { code: "4901", wilaya_code: "49", name_ar: "تيميمون", name_fr: "Timimoun" },
  { code: "4902", wilaya_code: "49", name_ar: "أوقروت", name_fr: "Aougrout" },

  // 50 Bordj Badji Mokhtar
  { code: "5001", wilaya_code: "50", name_ar: "برج باجي مختار", name_fr: "Bordj Badji Mokhtar" },
  { code: "5002", wilaya_code: "50", name_ar: "تيمياوين", name_fr: "Timiaouine" },

  // 51 Ouled Djellal
  { code: "5101", wilaya_code: "51", name_ar: "أولاد جلال", name_fr: "Ouled Djellal" },
  { code: "5102", wilaya_code: "51", name_ar: "سيدي خالد", name_fr: "Sidi Khaled" },

  // 52 Béni Abbès
  { code: "5201", wilaya_code: "52", name_ar: "بني عباس", name_fr: "Béni Abbès" },
  { code: "5202", wilaya_code: "52", name_ar: "كرزاز", name_fr: "Kerzaz" },

  // 53 In Salah
  { code: "5301", wilaya_code: "53", name_ar: "عين صالح", name_fr: "In Salah" },
  { code: "5302", wilaya_code: "53", name_ar: "فقارة الزاوية", name_fr: "Foggaret Ezzaouia" },

  // 54 In Guezzam
  { code: "5401", wilaya_code: "54", name_ar: "عين قزام", name_fr: "In Guezzam" },
  { code: "5402", wilaya_code: "54", name_ar: "تين زواتين", name_fr: "Tin Zaouatine" },

  // 55 Touggourt
  { code: "5501", wilaya_code: "55", name_ar: "تقرت", name_fr: "Touggourt" },
  { code: "5502", wilaya_code: "55", name_ar: "الطيبات", name_fr: "Taibet" },
  { code: "5503", wilaya_code: "55", name_ar: "تماسين", name_fr: "Témacine" },

  // 56 Djanet
  { code: "5601", wilaya_code: "56", name_ar: "جانت", name_fr: "Djanet" },
  { code: "5602", wilaya_code: "56", name_ar: "برج الحواس", name_fr: "Bordj El Haouas" },

  // 57 El M'Ghair
  { code: "5701", wilaya_code: "57", name_ar: "المغير", name_fr: "El M'Ghair" },
  { code: "5702", wilaya_code: "57", name_ar: "جامعة", name_fr: "Djamaa" },

  // 58 El Meniaa
  { code: "5801", wilaya_code: "58", name_ar: "المنيعة", name_fr: "El Meniaa" },
  { code: "5802", wilaya_code: "58", name_ar: "حاسي القارة", name_fr: "Hassi Gara" },
];

/**
 * Helper methods for administrative lookup
 */
export function getAlgerianWilayas(): Wilaya[] {
  return ALGERIAN_WILAYAS;
}

export function getWilayaByCode(code: string): Wilaya | undefined {
  return ALGERIAN_WILAYAS.find((w) => w.code === code);
}

export function getCommunesByWilayaCode(wilayaCode: string): Commune[] {
  return ALGERIAN_COMMUNES.filter((c) => c.wilaya_code === wilayaCode);
}

export function getCommuneByCode(communeCode: string): Commune | undefined {
  return ALGERIAN_COMMUNES.find((c) => c.code === communeCode);
}

export function isValidCommuneForWilaya(wilayaCode: string, communeCode: string): boolean {
  const commune = getCommuneByCode(communeCode);
  return Boolean(commune && commune.wilaya_code === wilayaCode);
}
