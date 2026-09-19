/**
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

export const ALGERIAN_WILAYAS: Wilaya[] = [
  {
    "code": "01",
    "name_ar": "أدرار",
    "name_fr": "Adrar"
  },
  {
    "code": "02",
    "name_ar": "الشلف",
    "name_fr": "Chlef"
  },
  {
    "code": "03",
    "name_ar": "الأغواط",
    "name_fr": "Laghouat"
  },
  {
    "code": "04",
    "name_ar": "أم البواقي",
    "name_fr": "Oum El Bouaghi"
  },
  {
    "code": "05",
    "name_ar": "باتنة",
    "name_fr": "Batna"
  },
  {
    "code": "06",
    "name_ar": "بجاية",
    "name_fr": "Béjaïa"
  },
  {
    "code": "07",
    "name_ar": "بسكرة",
    "name_fr": "Biskra"
  },
  {
    "code": "08",
    "name_ar": "بشار",
    "name_fr": "Béchar"
  },
  {
    "code": "09",
    "name_ar": "البليدة",
    "name_fr": "Blida"
  },
  {
    "code": "10",
    "name_ar": "البويرة",
    "name_fr": "Bouira"
  },
  {
    "code": "11",
    "name_ar": "تمنراست",
    "name_fr": "Tamanrasset"
  },
  {
    "code": "12",
    "name_ar": "تبسة",
    "name_fr": "Tébessa"
  },
  {
    "code": "13",
    "name_ar": "تلمسان",
    "name_fr": "Tlemcen"
  },
  {
    "code": "14",
    "name_ar": "تيارت",
    "name_fr": "Tiaret"
  },
  {
    "code": "15",
    "name_ar": "تيزي وزو",
    "name_fr": "Tizi Ouzou"
  },
  {
    "code": "16",
    "name_ar": "الجزائر",
    "name_fr": "Alger"
  },
  {
    "code": "17",
    "name_ar": "الجلفة",
    "name_fr": "Djelfa"
  },
  {
    "code": "18",
    "name_ar": "جيجل",
    "name_fr": "Jijel"
  },
  {
    "code": "19",
    "name_ar": "سطيف",
    "name_fr": "Sétif"
  },
  {
    "code": "20",
    "name_ar": "سعيدة",
    "name_fr": "Saïda"
  },
  {
    "code": "21",
    "name_ar": "سكيكدة",
    "name_fr": "Skikda"
  },
  {
    "code": "22",
    "name_ar": "سيدي بلعباس",
    "name_fr": "Sidi Bel Abbès"
  },
  {
    "code": "23",
    "name_ar": "عنابة",
    "name_fr": "Annaba"
  },
  {
    "code": "24",
    "name_ar": "قالمة",
    "name_fr": "Guelma"
  },
  {
    "code": "25",
    "name_ar": "قسنطينة",
    "name_fr": "Constantine"
  },
  {
    "code": "26",
    "name_ar": "المدية",
    "name_fr": "Médéa"
  },
  {
    "code": "27",
    "name_ar": "مستغانم",
    "name_fr": "Mostaganem"
  },
  {
    "code": "28",
    "name_ar": "المسيلة",
    "name_fr": "M'sila"
  },
  {
    "code": "29",
    "name_ar": "معسكر",
    "name_fr": "Mascara"
  },
  {
    "code": "30",
    "name_ar": "ورقلة",
    "name_fr": "Ouargla"
  },
  {
    "code": "31",
    "name_ar": "وهران",
    "name_fr": "Oran"
  },
  {
    "code": "32",
    "name_ar": "البيض",
    "name_fr": "El Bayadh"
  },
  {
    "code": "33",
    "name_ar": "إليزي",
    "name_fr": "Illizi"
  },
  {
    "code": "34",
    "name_ar": "برج بوعريريج",
    "name_fr": "Bordj Bou Arreridj"
  },
  {
    "code": "35",
    "name_ar": "بومرداس",
    "name_fr": "Boumerdès"
  },
  {
    "code": "36",
    "name_ar": "الطارف",
    "name_fr": "El Tarf"
  },
  {
    "code": "37",
    "name_ar": "تندوف",
    "name_fr": "Tindouf"
  },
  {
    "code": "38",
    "name_ar": "تيسمسيلت",
    "name_fr": "Tissemsilt"
  },
  {
    "code": "39",
    "name_ar": "الوادي",
    "name_fr": "El Oued"
  },
  {
    "code": "40",
    "name_ar": "خنشلة",
    "name_fr": "Khenchela"
  },
  {
    "code": "41",
    "name_ar": "سوق أهراس",
    "name_fr": "Souk Ahras"
  },
  {
    "code": "42",
    "name_ar": "تيبازة",
    "name_fr": "Tipaza"
  },
  {
    "code": "43",
    "name_ar": "ميلة",
    "name_fr": "Mila"
  },
  {
    "code": "44",
    "name_ar": "عين الدفلى",
    "name_fr": "Aïn Defla"
  },
  {
    "code": "45",
    "name_ar": "النعامة",
    "name_fr": "Naâma"
  },
  {
    "code": "46",
    "name_ar": "عين تموشنت",
    "name_fr": "Aïn Témouchent"
  },
  {
    "code": "47",
    "name_ar": "غرداية",
    "name_fr": "Ghardaïa"
  },
  {
    "code": "48",
    "name_ar": "غليزان",
    "name_fr": "Relizane"
  },
  {
    "code": "49",
    "name_ar": "تيميمون",
    "name_fr": "Timimoun"
  },
  {
    "code": "50",
    "name_ar": "برج باجي مختار",
    "name_fr": "Bordj Badji Mokhtar"
  },
  {
    "code": "51",
    "name_ar": "أولاد جلال",
    "name_fr": "Ouled Djellal"
  },
  {
    "code": "52",
    "name_ar": "بني عباس",
    "name_fr": "Béni Abbès"
  },
  {
    "code": "53",
    "name_ar": "عين صالح",
    "name_fr": "In Salah"
  },
  {
    "code": "54",
    "name_ar": "عين قزام",
    "name_fr": "In Guezzam"
  },
  {
    "code": "55",
    "name_ar": "توقرت",
    "name_fr": "Touggourt"
  },
  {
    "code": "56",
    "name_ar": "جانت",
    "name_fr": "Djanet"
  },
  {
    "code": "57",
    "name_ar": "المغير",
    "name_fr": "El M'Ghair"
  },
  {
    "code": "58",
    "name_ar": "المنيعة",
    "name_fr": "El Meniaa"
  },
  {
    "code": "59",
    "name_ar": "آفلو",
    "name_fr": "Aflou"
  },
  {
    "code": "60",
    "name_ar": "بريكة",
    "name_fr": "Barika"
  },
  {
    "code": "61",
    "name_ar": "القنطرة",
    "name_fr": "El Kantara"
  },
  {
    "code": "62",
    "name_ar": "بئر العاتر",
    "name_fr": "Bir El Ater"
  },
  {
    "code": "63",
    "name_ar": "العريشة",
    "name_fr": "El Aricha"
  },
  {
    "code": "64",
    "name_ar": "قصر الشلالة",
    "name_fr": "Ksar Chellala"
  },
  {
    "code": "65",
    "name_ar": "عين وسارة",
    "name_fr": "Aïn Oussera"
  },
  {
    "code": "66",
    "name_ar": "مسعد",
    "name_fr": "Messaad"
  },
  {
    "code": "67",
    "name_ar": "قصر البخاري",
    "name_fr": "Ksar El Boukhari"
  },
  {
    "code": "68",
    "name_ar": "بوسعادة",
    "name_fr": "Bou Saâda"
  },
  {
    "code": "69",
    "name_ar": "الأبيض سيدي الشيخ",
    "name_fr": "El Abiodh Sidi Cheikh"
  }
];

export const ALGERIAN_COMMUNES: Commune[] = [
  {
    "code": "0101",
    "wilaya_code": "01",
    "name_ar": "أدرار",
    "name_fr": "Adrar"
  },
  {
    "code": "0119",
    "wilaya_code": "01",
    "name_ar": "اقبلي",
    "name_fr": "Akabli"
  },
  {
    "code": "0126",
    "wilaya_code": "01",
    "name_ar": "السبع",
    "name_fr": "Sebaa"
  },
  {
    "code": "0105",
    "wilaya_code": "01",
    "name_ar": "إن زغمير",
    "name_fr": "In Zghmir"
  },
  {
    "code": "0121",
    "wilaya_code": "01",
    "name_ar": "أولاد أحمد تيمي",
    "name_fr": "Ouled Ahmed Timmi"
  },
  {
    "code": "0112",
    "wilaya_code": "01",
    "name_ar": "أولف",
    "name_fr": "Aoulef"
  },
  {
    "code": "0122",
    "wilaya_code": "01",
    "name_ar": "بودة",
    "name_fr": "Bouda"
  },
  {
    "code": "0102",
    "wilaya_code": "01",
    "name_ar": "تامست",
    "name_fr": "Tamest"
  },
  {
    "code": "0114",
    "wilaya_code": "01",
    "name_ar": "تامنطيط",
    "name_fr": "Tamantit"
  },
  {
    "code": "0108",
    "wilaya_code": "01",
    "name_ar": "تسابيت",
    "name_fr": "Tsabit"
  },
  {
    "code": "0106",
    "wilaya_code": "01",
    "name_ar": "تيت",
    "name_fr": "Tit"
  },
  {
    "code": "0113",
    "wilaya_code": "01",
    "name_ar": "تيمقتن",
    "name_fr": "Timekten"
  },
  {
    "code": "0104",
    "wilaya_code": "01",
    "name_ar": "رقان",
    "name_fr": "Reggane"
  },
  {
    "code": "0111",
    "wilaya_code": "01",
    "name_ar": "زاوية كنتة",
    "name_fr": "Zaouiet Kounta"
  },
  {
    "code": "0118",
    "wilaya_code": "01",
    "name_ar": "سالي",
    "name_fr": "Sali"
  },
  {
    "code": "0115",
    "wilaya_code": "01",
    "name_ar": "فنوغيل",
    "name_fr": "Fenoughil"
  },
  {
    "code": "0222",
    "wilaya_code": "02",
    "name_ar": "أبو الحسن",
    "name_fr": "Abou El Hassane"
  },
  {
    "code": "0228",
    "wilaya_code": "02",
    "name_ar": "الأبيض مجاجة",
    "name_fr": "Labiod Medjadja"
  },
  {
    "code": "0227",
    "wilaya_code": "02",
    "name_ar": "الحجاج",
    "name_fr": "El Hadjadj"
  },
  {
    "code": "0220",
    "wilaya_code": "02",
    "name_ar": "الزبوجة",
    "name_fr": "Zeboudja"
  },
  {
    "code": "0224",
    "wilaya_code": "02",
    "name_ar": "الشطية",
    "name_fr": "Chettia"
  },
  {
    "code": "0201",
    "wilaya_code": "02",
    "name_ar": "الشلف",
    "name_fr": "Chlef"
  },
  {
    "code": "0208",
    "wilaya_code": "02",
    "name_ar": "الصبحة",
    "name_fr": "Sobha"
  },
  {
    "code": "0217",
    "wilaya_code": "02",
    "name_ar": "الظهرة",
    "name_fr": "Dahra"
  },
  {
    "code": "0204",
    "wilaya_code": "02",
    "name_ar": "الكريمية",
    "name_fr": "El Karimia"
  },
  {
    "code": "0223",
    "wilaya_code": "02",
    "name_ar": "المرسى",
    "name_fr": "El Marsa"
  },
  {
    "code": "0215",
    "wilaya_code": "02",
    "name_ar": "الهرانفة",
    "name_fr": "Herenfa"
  },
  {
    "code": "0233",
    "wilaya_code": "02",
    "name_ar": "أم الدروع",
    "name_fr": "Oum Drou"
  },
  {
    "code": "0230",
    "wilaya_code": "02",
    "name_ar": "أولاد بن عبد القادر",
    "name_fr": "Ouled Ben Abdelkader"
  },
  {
    "code": "0218",
    "wilaya_code": "02",
    "name_ar": "أولاد عباس",
    "name_fr": "Ouled Abbes"
  },
  {
    "code": "0210",
    "wilaya_code": "02",
    "name_ar": "أولاد فارس",
    "name_fr": "Ouled Fares"
  },
  {
    "code": "0234",
    "wilaya_code": "02",
    "name_ar": "بريرة",
    "name_fr": "Breira"
  },
  {
    "code": "0203",
    "wilaya_code": "02",
    "name_ar": "بنايرية",
    "name_fr": "Benairia"
  },
  {
    "code": "0235",
    "wilaya_code": "02",
    "name_ar": "بني بوعتاب",
    "name_fr": "Beni Bouattab"
  },
  {
    "code": "0207",
    "wilaya_code": "02",
    "name_ar": "بني حواء",
    "name_fr": "Beni Haoua"
  },
  {
    "code": "0213",
    "wilaya_code": "02",
    "name_ar": "بني راشد",
    "name_fr": "Beni Rached"
  },
  {
    "code": "0231",
    "wilaya_code": "02",
    "name_ar": "بوزغاية",
    "name_fr": "Bouzeghaia"
  },
  {
    "code": "0212",
    "wilaya_code": "02",
    "name_ar": "بوقادير",
    "name_fr": "Boukadir"
  },
  {
    "code": "0205",
    "wilaya_code": "02",
    "name_ar": "تاجنة",
    "name_fr": "Tadjena"
  },
  {
    "code": "0206",
    "wilaya_code": "02",
    "name_ar": "تاوقريت",
    "name_fr": "Taougrit"
  },
  {
    "code": "0214",
    "wilaya_code": "02",
    "name_ar": "تلعصة",
    "name_fr": "Talassa"
  },
  {
    "code": "0202",
    "wilaya_code": "02",
    "name_ar": "تنس",
    "name_fr": "Tenes"
  },
  {
    "code": "0209",
    "wilaya_code": "02",
    "name_ar": "حرشون",
    "name_fr": "Harchoun"
  },
  {
    "code": "0219",
    "wilaya_code": "02",
    "name_ar": "سنجاس",
    "name_fr": "Sendjas"
  },
  {
    "code": "0225",
    "wilaya_code": "02",
    "name_ar": "سيدي عبد الرحمن",
    "name_fr": "Sidi Abderrahmane"
  },
  {
    "code": "0211",
    "wilaya_code": "02",
    "name_ar": "سيدي عكاشة",
    "name_fr": "Sidi Akkacha"
  },
  {
    "code": "0232",
    "wilaya_code": "02",
    "name_ar": "عين مران",
    "name_fr": "Ain Merane"
  },
  {
    "code": "0226",
    "wilaya_code": "02",
    "name_ar": "مصدق",
    "name_fr": "Moussadek"
  },
  {
    "code": "0229",
    "wilaya_code": "02",
    "name_ar": "وادي الفضة",
    "name_fr": "Oued Fodda"
  },
  {
    "code": "0221",
    "wilaya_code": "02",
    "name_ar": "وادي سلي",
    "name_fr": "Oued Sly"
  },
  {
    "code": "0216",
    "wilaya_code": "02",
    "name_ar": "وادي قوسين",
    "name_fr": "Oued Goussine"
  },
  {
    "code": "0301",
    "wilaya_code": "03",
    "name_ar": "الأغواط",
    "name_fr": "Laghouat"
  },
  {
    "code": "0323",
    "wilaya_code": "03",
    "name_ar": "الحويطة",
    "name_fr": "El Haouaita"
  },
  {
    "code": "0309",
    "wilaya_code": "03",
    "name_ar": "الخنق",
    "name_fr": "Kheneg"
  },
  {
    "code": "0320",
    "wilaya_code": "03",
    "name_ar": "العسافية",
    "name_fr": "El Assafia"
  },
  {
    "code": "0303",
    "wilaya_code": "03",
    "name_ar": "بن ناصر بن شهرة",
    "name_fr": "Benacer Benchohra"
  },
  {
    "code": "0318",
    "wilaya_code": "03",
    "name_ar": "تاجرونة",
    "name_fr": "Tadjrouna"
  },
  {
    "code": "0308",
    "wilaya_code": "03",
    "name_ar": "تاجموت",
    "name_fr": "Tadjemout"
  },
  {
    "code": "0305",
    "wilaya_code": "03",
    "name_ar": "حاسي الدلاعة",
    "name_fr": "Hassi Delaa"
  },
  {
    "code": "0306",
    "wilaya_code": "03",
    "name_ar": "حاسي الرمل",
    "name_fr": "Hassi R'mel"
  },
  {
    "code": "0304",
    "wilaya_code": "03",
    "name_ar": "سيدي مخلوف",
    "name_fr": "Sidi Makhlouf"
  },
  {
    "code": "0307",
    "wilaya_code": "03",
    "name_ar": "عين ماضي",
    "name_fr": "Ain Madhi"
  },
  {
    "code": "0302",
    "wilaya_code": "03",
    "name_ar": "قصر الحيران",
    "name_fr": "Ksar El Hirane"
  },
  {
    "code": "0407",
    "wilaya_code": "04",
    "name_ar": "البلالة",
    "name_fr": "El Belala"
  },
  {
    "code": "0414",
    "wilaya_code": "04",
    "name_ar": "الجازية",
    "name_fr": "El Djazia"
  },
  {
    "code": "0429",
    "wilaya_code": "04",
    "name_ar": "الحرملية",
    "name_fr": "El Harmilia"
  },
  {
    "code": "0426",
    "wilaya_code": "04",
    "name_ar": "الرحية",
    "name_fr": "Rahia"
  },
  {
    "code": "0418",
    "wilaya_code": "04",
    "name_ar": "الزرق",
    "name_fr": "Zorg"
  },
  {
    "code": "0411",
    "wilaya_code": "04",
    "name_ar": "الضلعة",
    "name_fr": "Dhalaa"
  },
  {
    "code": "0405",
    "wilaya_code": "04",
    "name_ar": "العامرية",
    "name_fr": "El Amiria"
  },
  {
    "code": "0419",
    "wilaya_code": "04",
    "name_ar": "الفجوج بوغرارة سعودي",
    "name_fr": "El Fedjoudj Boughrara Sa"
  },
  {
    "code": "0401",
    "wilaya_code": "04",
    "name_ar": "أم البواقي",
    "name_fr": "Oum El Bouaghi"
  },
  {
    "code": "0410",
    "wilaya_code": "04",
    "name_ar": "أولاد حملة",
    "name_fr": "Ouled Hamla"
  },
  {
    "code": "0420",
    "wilaya_code": "04",
    "name_ar": "أولاد زواي",
    "name_fr": "Ouled Zouai"
  },
  {
    "code": "0428",
    "wilaya_code": "04",
    "name_ar": "أولاد قاسم",
    "name_fr": "Ouled Gacem"
  },
  {
    "code": "0421",
    "wilaya_code": "04",
    "name_ar": "بئر الشهداء",
    "name_fr": "Bir Chouhada"
  },
  {
    "code": "0404",
    "wilaya_code": "04",
    "name_ar": "بحير الشرقي",
    "name_fr": "Behir Chergui"
  },
  {
    "code": "0409",
    "wilaya_code": "04",
    "name_ar": "بريش",
    "name_fr": "Berriche"
  },
  {
    "code": "0417",
    "wilaya_code": "04",
    "name_ar": "سوق نعمان",
    "name_fr": "Souk Naamane"
  },
  {
    "code": "0406",
    "wilaya_code": "04",
    "name_ar": "سيقوس",
    "name_fr": "Sigus"
  },
  {
    "code": "0402",
    "wilaya_code": "04",
    "name_ar": "عين البيضاء",
    "name_fr": "Ain Beida"
  },
  {
    "code": "0415",
    "wilaya_code": "04",
    "name_ar": "عين الديس",
    "name_fr": "Ain Diss"
  },
  {
    "code": "0427",
    "wilaya_code": "04",
    "name_ar": "عين الزيتون",
    "name_fr": "Ain Zitoun"
  },
  {
    "code": "0408",
    "wilaya_code": "04",
    "name_ar": "عين ببوش",
    "name_fr": "Ain Babouche"
  },
  {
    "code": "0425",
    "wilaya_code": "04",
    "name_ar": "عين فكرون",
    "name_fr": "Ain Fekroun"
  },
  {
    "code": "0412",
    "wilaya_code": "04",
    "name_ar": "عين كرشة",
    "name_fr": "Ain Kercha"
  },
  {
    "code": "0403",
    "wilaya_code": "04",
    "name_ar": "عين مليلة",
    "name_fr": "Ain M'lila"
  },
  {
    "code": "0416",
    "wilaya_code": "04",
    "name_ar": "فكيرينة",
    "name_fr": "Fkirina"
  },
  {
    "code": "0422",
    "wilaya_code": "04",
    "name_ar": "قصر الصباحي",
    "name_fr": "Ksar Sbahi"
  },
  {
    "code": "0424",
    "wilaya_code": "04",
    "name_ar": "مسكيانة",
    "name_fr": "Meskiana"
  },
  {
    "code": "0413",
    "wilaya_code": "04",
    "name_ar": "هنشير تومغني",
    "name_fr": "Hanchir Toumghani"
  },
  {
    "code": "0423",
    "wilaya_code": "04",
    "name_ar": "وادي نيني",
    "name_fr": "Oued Nini"
  },
  {
    "code": "0516",
    "wilaya_code": "05",
    "name_ar": "أريس",
    "name_fr": "Arris"
  },
  {
    "code": "0530",
    "wilaya_code": "05",
    "name_ar": "إشمول",
    "name_fr": "Ichemoul"
  },
  {
    "code": "0557",
    "wilaya_code": "05",
    "name_ar": "الحاسي",
    "name_fr": "El Hassi"
  },
  {
    "code": "0525",
    "wilaya_code": "05",
    "name_ar": "الرحبات",
    "name_fr": "Rahbat"
  },
  {
    "code": "0536",
    "wilaya_code": "05",
    "name_ar": "الشمرة",
    "name_fr": "Chemora"
  },
  {
    "code": "0539",
    "wilaya_code": "05",
    "name_ar": "القصبات",
    "name_fr": "Gosbat"
  },
  {
    "code": "0510",
    "wilaya_code": "05",
    "name_ar": "القيقبة",
    "name_fr": "Guigba"
  },
  {
    "code": "0507",
    "wilaya_code": "05",
    "name_ar": "المعذر",
    "name_fr": "El Madher"
  },
  {
    "code": "0520",
    "wilaya_code": "05",
    "name_ar": "أولاد سلام",
    "name_fr": "Ouled Sellem"
  },
  {
    "code": "0553",
    "wilaya_code": "05",
    "name_ar": "أولاد سي سليمان",
    "name_fr": "Ouled Si Slimane"
  },
  {
    "code": "0540",
    "wilaya_code": "05",
    "name_ar": "أولاد عوف",
    "name_fr": "Ouled Aouf"
  },
  {
    "code": "0549",
    "wilaya_code": "05",
    "name_ar": "أولاد فاضل",
    "name_fr": "Ouled Fadel"
  },
  {
    "code": "0511",
    "wilaya_code": "05",
    "name_ar": "إينوغيسن",
    "name_fr": "Inoughissen"
  },
  {
    "code": "0501",
    "wilaya_code": "05",
    "name_ar": "باتنة",
    "name_fr": "Batna"
  },
  {
    "code": "0532",
    "wilaya_code": "05",
    "name_ar": "بني فضالة الحقانية",
    "name_fr": "Beni Foudhala El Hakania"
  },
  {
    "code": "0535",
    "wilaya_code": "05",
    "name_ar": "بوزينة",
    "name_fr": "Bouzina"
  },
  {
    "code": "0560",
    "wilaya_code": "05",
    "name_ar": "بولهيلات",
    "name_fr": "Boulhilat"
  },
  {
    "code": "0541",
    "wilaya_code": "05",
    "name_ar": "بومقر",
    "name_fr": "Boumagueur"
  },
  {
    "code": "0559",
    "wilaya_code": "05",
    "name_ar": "بومية",
    "name_fr": "Boumia"
  },
  {
    "code": "0508",
    "wilaya_code": "05",
    "name_ar": "تازولت",
    "name_fr": "Tazoult"
  },
  {
    "code": "0538",
    "wilaya_code": "05",
    "name_ar": "تاكسلانت",
    "name_fr": "Taxlent"
  },
  {
    "code": "0534",
    "wilaya_code": "05",
    "name_ar": "تالخمت",
    "name_fr": "Talkhamt"
  },
  {
    "code": "0521",
    "wilaya_code": "05",
    "name_ar": "تغرغار",
    "name_fr": "Tigharghar"
  },
  {
    "code": "0544",
    "wilaya_code": "05",
    "name_ar": "تكوت",
    "name_fr": "T Kout"
  },
  {
    "code": "0526",
    "wilaya_code": "05",
    "name_ar": "تيغانمين",
    "name_fr": "Tighanimine"
  },
  {
    "code": "0550",
    "wilaya_code": "05",
    "name_ar": "تيمقاد",
    "name_fr": "Timgad"
  },
  {
    "code": "0547",
    "wilaya_code": "05",
    "name_ar": "ثنية العابد",
    "name_fr": "Teniet El Abed"
  },
  {
    "code": "0513",
    "wilaya_code": "05",
    "name_ar": "جرمة",
    "name_fr": "Djerma"
  },
  {
    "code": "0546",
    "wilaya_code": "05",
    "name_ar": "حيدوسة",
    "name_fr": "Hidoussa"
  },
  {
    "code": "0551",
    "wilaya_code": "05",
    "name_ar": "رأس العيون",
    "name_fr": "Ras El Aioun"
  },
  {
    "code": "0554",
    "wilaya_code": "05",
    "name_ar": "زانة البيضاء",
    "name_fr": "Zanet El Beida"
  },
  {
    "code": "0505",
    "wilaya_code": "05",
    "name_ar": "سريانة",
    "name_fr": "Seriana"
  },
  {
    "code": "0524",
    "wilaya_code": "05",
    "name_ar": "سفيان",
    "name_fr": "Sefiane"
  },
  {
    "code": "0552",
    "wilaya_code": "05",
    "name_ar": "شير",
    "name_fr": "Chir"
  },
  {
    "code": "0545",
    "wilaya_code": "05",
    "name_ar": "عين التوتة",
    "name_fr": "Ain Touta"
  },
  {
    "code": "0519",
    "wilaya_code": "05",
    "name_ar": "عين جاسر",
    "name_fr": "Ain Djasser"
  },
  {
    "code": "0522",
    "wilaya_code": "05",
    "name_ar": "عين ياقوت",
    "name_fr": "Ain Yagout"
  },
  {
    "code": "0512",
    "wilaya_code": "05",
    "name_ar": "عيون العصافير",
    "name_fr": "Ouyoun El Assafir"
  },
  {
    "code": "0502",
    "wilaya_code": "05",
    "name_ar": "غسيرة",
    "name_fr": "Ghassira"
  },
  {
    "code": "0523",
    "wilaya_code": "05",
    "name_ar": "فسديس",
    "name_fr": "Fesdis"
  },
  {
    "code": "0531",
    "wilaya_code": "05",
    "name_ar": "فم الطوب",
    "name_fr": "Foum Toub"
  },
  {
    "code": "0528",
    "wilaya_code": "05",
    "name_ar": "قصر بلزمة",
    "name_fr": "Ksar Bellezma"
  },
  {
    "code": "0517",
    "wilaya_code": "05",
    "name_ar": "كيمل",
    "name_fr": "Kimmel"
  },
  {
    "code": "0561",
    "wilaya_code": "05",
    "name_ar": "لارباع",
    "name_fr": "Larbaa"
  },
  {
    "code": "0558",
    "wilaya_code": "05",
    "name_ar": "لازرو",
    "name_fr": "Lazrou"
  },
  {
    "code": "0527",
    "wilaya_code": "05",
    "name_ar": "لمسان",
    "name_fr": "Lemcene"
  },
  {
    "code": "0504",
    "wilaya_code": "05",
    "name_ar": "مروانة",
    "name_fr": "Merouana"
  },
  {
    "code": "0503",
    "wilaya_code": "05",
    "name_ar": "معافة",
    "name_fr": "Maafa"
  },
  {
    "code": "0506",
    "wilaya_code": "05",
    "name_ar": "منعة",
    "name_fr": "Menaa"
  },
  {
    "code": "0509",
    "wilaya_code": "05",
    "name_ar": "نقاوس",
    "name_fr": "N Gaous"
  },
  {
    "code": "0537",
    "wilaya_code": "05",
    "name_ar": "وادي الشعبة",
    "name_fr": "Oued Chaaba"
  },
  {
    "code": "0548",
    "wilaya_code": "05",
    "name_ar": "وادي الطاقة",
    "name_fr": "Oued Taga"
  },
  {
    "code": "0533",
    "wilaya_code": "05",
    "name_ar": "وادي الماء",
    "name_fr": "Oued El Ma"
  },
  {
    "code": "0624",
    "wilaya_code": "06",
    "name_ar": "أدكار",
    "name_fr": "Adekar"
  },
  {
    "code": "0615",
    "wilaya_code": "06",
    "name_ar": "اغرم",
    "name_fr": "Ighram"
  },
  {
    "code": "0617",
    "wilaya_code": "06",
    "name_ar": "إغيل علي",
    "name_fr": "Ighil-Ali"
  },
  {
    "code": "0625",
    "wilaya_code": "06",
    "name_ar": "أقبو",
    "name_fr": "Akbou"
  },
  {
    "code": "0642",
    "wilaya_code": "06",
    "name_ar": "أكفادو",
    "name_fr": "Akfadou"
  },
  {
    "code": "0643",
    "wilaya_code": "06",
    "name_ar": "الفلاي",
    "name_fr": "Leflaye"
  },
  {
    "code": "0640",
    "wilaya_code": "06",
    "name_ar": "القصر",
    "name_fr": "El Kseur"
  },
  {
    "code": "0616",
    "wilaya_code": "06",
    "name_ar": "أمالو",
    "name_fr": "Amalou"
  },
  {
    "code": "0602",
    "wilaya_code": "06",
    "name_ar": "أميزور",
    "name_fr": "Amizour"
  },
  {
    "code": "0636",
    "wilaya_code": "06",
    "name_ar": "أوزلاقن",
    "name_fr": "Ouzellaguen"
  },
  {
    "code": "0622",
    "wilaya_code": "06",
    "name_ar": "أوقاس",
    "name_fr": "Aokas"
  },
  {
    "code": "0647",
    "wilaya_code": "06",
    "name_ar": "أيت إسماعيل",
    "name_fr": "Ait-Smail"
  },
  {
    "code": "0628",
    "wilaya_code": "06",
    "name_ar": "أيت رزين",
    "name_fr": "Ait R'zine"
  },
  {
    "code": "0601",
    "wilaya_code": "06",
    "name_ar": "بجاية",
    "name_fr": "Bejaia"
  },
  {
    "code": "0634",
    "wilaya_code": "06",
    "name_ar": "برباشة",
    "name_fr": "Barbacha"
  },
  {
    "code": "0623",
    "wilaya_code": "06",
    "name_ar": "بني جليل",
    "name_fr": "Beni Djellil"
  },
  {
    "code": "0635",
    "wilaya_code": "06",
    "name_ar": "بني كسيلة",
    "name_fr": "Beni K'sila"
  },
  {
    "code": "0650",
    "wilaya_code": "06",
    "name_ar": "بني معوش",
    "name_fr": "Benimaouche"
  },
  {
    "code": "0638",
    "wilaya_code": "06",
    "name_ar": "بني مليكش",
    "name_fr": "Beni-Mallikeche"
  },
  {
    "code": "0652",
    "wilaya_code": "06",
    "name_ar": "بو جليل",
    "name_fr": "Boudjellil"
  },
  {
    "code": "0637",
    "wilaya_code": "06",
    "name_ar": "بوحمزة",
    "name_fr": "Bouhamza"
  },
  {
    "code": "0648",
    "wilaya_code": "06",
    "name_ar": "بوخليفة",
    "name_fr": "Boukhelifa"
  },
  {
    "code": "0627",
    "wilaya_code": "06",
    "name_ar": "تازمالت",
    "name_fr": "Tazmalt"
  },
  {
    "code": "0631",
    "wilaya_code": "06",
    "name_ar": "تاسكريوت",
    "name_fr": "Taskriout"
  },
  {
    "code": "0633",
    "wilaya_code": "06",
    "name_ar": "تالة حمزة",
    "name_fr": "Tala Hamza"
  },
  {
    "code": "0646",
    "wilaya_code": "06",
    "name_ar": "تامريجت",
    "name_fr": "Tamridjet"
  },
  {
    "code": "0606",
    "wilaya_code": "06",
    "name_ar": "تامقرة",
    "name_fr": "Tamokra"
  },
  {
    "code": "0604",
    "wilaya_code": "06",
    "name_ar": "تاوريرت إغيل",
    "name_fr": "Taourit Ighil"
  },
  {
    "code": "0619",
    "wilaya_code": "06",
    "name_ar": "توجة",
    "name_fr": "Toudja"
  },
  {
    "code": "0649",
    "wilaya_code": "06",
    "name_ar": "تيزي نبربر",
    "name_fr": "Tizi-N'berber"
  },
  {
    "code": "0611",
    "wilaya_code": "06",
    "name_ar": "تيشي",
    "name_fr": "Tichy"
  },
  {
    "code": "0614",
    "wilaya_code": "06",
    "name_ar": "تيفرة",
    "name_fr": "Tifra"
  },
  {
    "code": "0607",
    "wilaya_code": "06",
    "name_ar": "تيمزريت",
    "name_fr": "Timezrit"
  },
  {
    "code": "0610",
    "wilaya_code": "06",
    "name_ar": "تينبدار",
    "name_fr": "Tinebdar"
  },
  {
    "code": "0644",
    "wilaya_code": "06",
    "name_ar": "خراطة",
    "name_fr": "Kherrata"
  },
  {
    "code": "0620",
    "wilaya_code": "06",
    "name_ar": "درقينة",
    "name_fr": "Darguina"
  },
  {
    "code": "0645",
    "wilaya_code": "06",
    "name_ar": "ذراع القايد",
    "name_fr": "Dra El Caid"
  },
  {
    "code": "0612",
    "wilaya_code": "06",
    "name_ar": "سمعون",
    "name_fr": "Smaoun"
  },
  {
    "code": "0630",
    "wilaya_code": "06",
    "name_ar": "سوق اوفلا",
    "name_fr": "Souk Oufella"
  },
  {
    "code": "0608",
    "wilaya_code": "06",
    "name_ar": "سوق لإثنين",
    "name_fr": "Souk El Tenine"
  },
  {
    "code": "0621",
    "wilaya_code": "06",
    "name_ar": "سيدي عياد",
    "name_fr": "Sidi Ayad"
  },
  {
    "code": "0639",
    "wilaya_code": "06",
    "name_ar": "سيدي عيش",
    "name_fr": "Sidi-Aich"
  },
  {
    "code": "0605",
    "wilaya_code": "06",
    "name_ar": "شلاطة",
    "name_fr": "Chellata"
  },
  {
    "code": "0629",
    "wilaya_code": "06",
    "name_ar": "شميني",
    "name_fr": "Chemini"
  },
  {
    "code": "0626",
    "wilaya_code": "06",
    "name_ar": "صدوق",
    "name_fr": "Seddouk"
  },
  {
    "code": "0632",
    "wilaya_code": "06",
    "name_ar": "طيبان",
    "name_fr": "Tibane"
  },
  {
    "code": "0603",
    "wilaya_code": "06",
    "name_ar": "فرعون",
    "name_fr": "Feraoun"
  },
  {
    "code": "0618",
    "wilaya_code": "06",
    "name_ar": "فناية الماثن",
    "name_fr": "Fenaia Il Maten"
  },
  {
    "code": "0613",
    "wilaya_code": "06",
    "name_ar": "كنديرة",
    "name_fr": "Kendira"
  },
  {
    "code": "0641",
    "wilaya_code": "06",
    "name_ar": "مالبو",
    "name_fr": "Melbou"
  },
  {
    "code": "0609",
    "wilaya_code": "06",
    "name_ar": "مسيسنة",
    "name_fr": "M'cisna"
  },
  {
    "code": "0651",
    "wilaya_code": "06",
    "name_ar": "وادي غير",
    "name_fr": "Oued Ghir"
  },
  {
    "code": "0732",
    "wilaya_code": "07",
    "name_ar": "الحاجب",
    "name_fr": "El Hadjab"
  },
  {
    "code": "0713",
    "wilaya_code": "07",
    "name_ar": "الحوش",
    "name_fr": "El Haouch"
  },
  {
    "code": "0731",
    "wilaya_code": "07",
    "name_ar": "الغروس",
    "name_fr": "El Ghrous"
  },
  {
    "code": "0716",
    "wilaya_code": "07",
    "name_ar": "الفيض",
    "name_fr": "El Feidh"
  },
  {
    "code": "0728",
    "wilaya_code": "07",
    "name_ar": "المزيرعة",
    "name_fr": "Meziraa"
  },
  {
    "code": "0724",
    "wilaya_code": "07",
    "name_ar": "أورلال",
    "name_fr": "Ourlal"
  },
  {
    "code": "0702",
    "wilaya_code": "07",
    "name_ar": "أوماش",
    "name_fr": "Oumache"
  },
  {
    "code": "0727",
    "wilaya_code": "07",
    "name_ar": "برج بن عزوز",
    "name_fr": "Bordj Ben Azzouz"
  },
  {
    "code": "0701",
    "wilaya_code": "07",
    "name_ar": "بسكرة",
    "name_fr": "Biskra"
  },
  {
    "code": "0729",
    "wilaya_code": "07",
    "name_ar": "بوشقرون",
    "name_fr": "Bouchakroun"
  },
  {
    "code": "0733",
    "wilaya_code": "07",
    "name_ar": "خنقة سيدي ناجي",
    "name_fr": "Khenguet Sidi Nadji"
  },
  {
    "code": "0715",
    "wilaya_code": "07",
    "name_ar": "زريبة الوادي",
    "name_fr": "Zeribet El Oued"
  },
  {
    "code": "0711",
    "wilaya_code": "07",
    "name_ar": "سيدي عقبة",
    "name_fr": "Sidi Okba"
  },
  {
    "code": "0704",
    "wilaya_code": "07",
    "name_ar": "شتمة",
    "name_fr": "Chetma"
  },
  {
    "code": "0721",
    "wilaya_code": "07",
    "name_ar": "طولقة",
    "name_fr": "Tolga"
  },
  {
    "code": "0714",
    "wilaya_code": "07",
    "name_ar": "عين الناقة",
    "name_fr": "Ain Naga"
  },
  {
    "code": "0726",
    "wilaya_code": "07",
    "name_ar": "فوغالة",
    "name_fr": "Foughala"
  },
  {
    "code": "0723",
    "wilaya_code": "07",
    "name_ar": "ليشانة",
    "name_fr": "Lichana"
  },
  {
    "code": "0722",
    "wilaya_code": "07",
    "name_ar": "ليوة",
    "name_fr": "Lioua"
  },
  {
    "code": "0730",
    "wilaya_code": "07",
    "name_ar": "مخادمة",
    "name_fr": "Mekhadma"
  },
  {
    "code": "0712",
    "wilaya_code": "07",
    "name_ar": "مشونش",
    "name_fr": "M'chouneche"
  },
  {
    "code": "0725",
    "wilaya_code": "07",
    "name_ar": "مليلي",
    "name_fr": "M'lili"
  },
  {
    "code": "0817",
    "wilaya_code": "08",
    "name_ar": "العبادلة",
    "name_fr": "Abadla"
  },
  {
    "code": "0810",
    "wilaya_code": "08",
    "name_ar": "القنادسة",
    "name_fr": "Kenadsa"
  },
  {
    "code": "0804",
    "wilaya_code": "08",
    "name_ar": "المريجة",
    "name_fr": "Meridja"
  },
  {
    "code": "0801",
    "wilaya_code": "08",
    "name_ar": "بشار",
    "name_fr": "Bechar"
  },
  {
    "code": "0821",
    "wilaya_code": "08",
    "name_ar": "بني ونيف",
    "name_fr": "Beni-Ounif"
  },
  {
    "code": "0815",
    "wilaya_code": "08",
    "name_ar": "بوكايس",
    "name_fr": "Boukais"
  },
  {
    "code": "0813",
    "wilaya_code": "08",
    "name_ar": "تاغيت",
    "name_fr": "Taghit"
  },
  {
    "code": "0802",
    "wilaya_code": "08",
    "name_ar": "عرق فراج",
    "name_fr": "Erg-Ferradj"
  },
  {
    "code": "0806",
    "wilaya_code": "08",
    "name_ar": "لحمر",
    "name_fr": "Lahmar"
  },
  {
    "code": "0809",
    "wilaya_code": "08",
    "name_ar": "مشرع هواري بومدين",
    "name_fr": "Machraa-Houari-Boumediene"
  },
  {
    "code": "0816",
    "wilaya_code": "08",
    "name_ar": "موغل",
    "name_fr": "Mogheul"
  },
  {
    "code": "0921",
    "wilaya_code": "09",
    "name_ar": "الأربعاء",
    "name_fr": "Larbaa"
  },
  {
    "code": "0901",
    "wilaya_code": "09",
    "name_ar": "البليدة",
    "name_fr": "Blida"
  },
  {
    "code": "0902",
    "wilaya_code": "09",
    "name_ar": "الشبلي",
    "name_fr": "Chebli"
  },
  {
    "code": "0908",
    "wilaya_code": "09",
    "name_ar": "الشريعة",
    "name_fr": "Chrea"
  },
  {
    "code": "0911",
    "wilaya_code": "09",
    "name_ar": "الشفة",
    "name_fr": "Chiffa"
  },
  {
    "code": "0914",
    "wilaya_code": "09",
    "name_ar": "الصومعة",
    "name_fr": "Soumaa"
  },
  {
    "code": "0910",
    "wilaya_code": "09",
    "name_ar": "العفرون",
    "name_fr": "El-Affroun"
  },
  {
    "code": "0919",
    "wilaya_code": "09",
    "name_ar": "اولاد سلامة",
    "name_fr": "Ouled Slama"
  },
  {
    "code": "0907",
    "wilaya_code": "09",
    "name_ar": "أولاد يعيش",
    "name_fr": "Ouled Yaich"
  },
  {
    "code": "0913",
    "wilaya_code": "09",
    "name_ar": "بن خليل",
    "name_fr": "Benkhelil"
  },
  {
    "code": "0923",
    "wilaya_code": "09",
    "name_ar": "بني تامو",
    "name_fr": "Beni-Tamou"
  },
  {
    "code": "0925",
    "wilaya_code": "09",
    "name_ar": "بني مراد",
    "name_fr": "Beni Mered"
  },
  {
    "code": "0924",
    "wilaya_code": "09",
    "name_ar": "بوعرفة",
    "name_fr": "Bouarfa"
  },
  {
    "code": "0903",
    "wilaya_code": "09",
    "name_ar": "بوعينان",
    "name_fr": "Bouinan"
  },
  {
    "code": "0920",
    "wilaya_code": "09",
    "name_ar": "بوفاريك",
    "name_fr": "Boufarik"
  },
  {
    "code": "0926",
    "wilaya_code": "09",
    "name_ar": "بوقرة",
    "name_fr": "Bougara"
  },
  {
    "code": "0929",
    "wilaya_code": "09",
    "name_ar": "جبابرة",
    "name_fr": "Djebabra"
  },
  {
    "code": "0912",
    "wilaya_code": "09",
    "name_ar": "حمام ملوان",
    "name_fr": "Hammam Elouane"
  },
  {
    "code": "0917",
    "wilaya_code": "09",
    "name_ar": "صوحان",
    "name_fr": "Souhane"
  },
  {
    "code": "0928",
    "wilaya_code": "09",
    "name_ar": "عين الرمانة",
    "name_fr": "Ain Romana"
  },
  {
    "code": "0927",
    "wilaya_code": "09",
    "name_ar": "قرواو",
    "name_fr": "Guerrouaou"
  },
  {
    "code": "0918",
    "wilaya_code": "09",
    "name_ar": "مفتاح",
    "name_fr": "Meftah"
  },
  {
    "code": "0916",
    "wilaya_code": "09",
    "name_ar": "موزاية",
    "name_fr": "Mouzaia"
  },
  {
    "code": "0904",
    "wilaya_code": "09",
    "name_ar": "وادي العلايق",
    "name_fr": "Oued El Alleug"
  },
  {
    "code": "0922",
    "wilaya_code": "09",
    "name_ar": "وادي جر",
    "name_fr": "Oued Djer"
  },
  {
    "code": "1043",
    "wilaya_code": "10",
    "name_ar": "آث منصور",
    "name_fr": "Ath Mansour"
  },
  {
    "code": "1016",
    "wilaya_code": "10",
    "name_ar": "أعمر",
    "name_fr": "Aomar"
  },
  {
    "code": "1027",
    "wilaya_code": "10",
    "name_ar": "أغبالو",
    "name_fr": "Aghbalou"
  },
  {
    "code": "1013",
    "wilaya_code": "10",
    "name_ar": "الأخضرية",
    "name_fr": "Lakhdaria"
  },
  {
    "code": "1002",
    "wilaya_code": "10",
    "name_ar": "الأسنام",
    "name_fr": "El Asnam"
  },
  {
    "code": "1001",
    "wilaya_code": "10",
    "name_ar": "البويرة",
    "name_fr": "Bouira"
  },
  {
    "code": "1020",
    "wilaya_code": "10",
    "name_ar": "الحاكمية",
    "name_fr": "El-Hakimia"
  },
  {
    "code": "1042",
    "wilaya_code": "10",
    "name_ar": "الحجرة الزرقاء",
    "name_fr": "Hadjera Zerga"
  },
  {
    "code": "1021",
    "wilaya_code": "10",
    "name_ar": "الخبوزية",
    "name_fr": "El Khabouzia"
  },
  {
    "code": "1031",
    "wilaya_code": "10",
    "name_ar": "الدشمية",
    "name_fr": "Dechmia"
  },
  {
    "code": "1019",
    "wilaya_code": "10",
    "name_ar": "العجيبة",
    "name_fr": "El Adjiba"
  },
  {
    "code": "1039",
    "wilaya_code": "10",
    "name_ar": "المعمورة",
    "name_fr": "Maamora"
  },
  {
    "code": "1044",
    "wilaya_code": "10",
    "name_ar": "المقراني",
    "name_fr": "El-Mokrani"
  },
  {
    "code": "1015",
    "wilaya_code": "10",
    "name_ar": "الهاشمية",
    "name_fr": "El Hachimia"
  },
  {
    "code": "1037",
    "wilaya_code": "10",
    "name_ar": "أمشدالة",
    "name_fr": "M Chedallah"
  },
  {
    "code": "1022",
    "wilaya_code": "10",
    "name_ar": "أهل القصر",
    "name_fr": "Ahl El Ksar"
  },
  {
    "code": "1040",
    "wilaya_code": "10",
    "name_ar": "أولاد راشد",
    "name_fr": "Ouled Rached"
  },
  {
    "code": "1008",
    "wilaya_code": "10",
    "name_ar": "أيت لعزيز",
    "name_fr": "Ait Laaziz"
  },
  {
    "code": "1036",
    "wilaya_code": "10",
    "name_ar": "بئر غبالو",
    "name_fr": "Bir Ghbalou"
  },
  {
    "code": "1018",
    "wilaya_code": "10",
    "name_ar": "برج أوخريص",
    "name_fr": "Bordj Okhriss"
  },
  {
    "code": "1033",
    "wilaya_code": "10",
    "name_ar": "بشلول",
    "name_fr": "Bechloul"
  },
  {
    "code": "1023",
    "wilaya_code": "10",
    "name_ar": "بودربالة",
    "name_fr": "Bouderbala"
  },
  {
    "code": "1034",
    "wilaya_code": "10",
    "name_ar": "بوكرم",
    "name_fr": "Boukram"
  },
  {
    "code": "1009",
    "wilaya_code": "10",
    "name_ar": "تاغزوت",
    "name_fr": "Taghzout"
  },
  {
    "code": "1028",
    "wilaya_code": "10",
    "name_ar": "تاقديت",
    "name_fr": "Taguedite"
  },
  {
    "code": "1026",
    "wilaya_code": "10",
    "name_ar": "جباحية",
    "name_fr": "Djebahia"
  },
  {
    "code": "1006",
    "wilaya_code": "10",
    "name_ar": "حنيف",
    "name_fr": "Hanif"
  },
  {
    "code": "1012",
    "wilaya_code": "10",
    "name_ar": "حيزر",
    "name_fr": "Haizer"
  },
  {
    "code": "1007",
    "wilaya_code": "10",
    "name_ar": "ديرة",
    "name_fr": "Dirah"
  },
  {
    "code": "1010",
    "wilaya_code": "10",
    "name_ar": "روراوة",
    "name_fr": "Raouraoua"
  },
  {
    "code": "1032",
    "wilaya_code": "10",
    "name_ar": "ريدان",
    "name_fr": "Ridane"
  },
  {
    "code": "1024",
    "wilaya_code": "10",
    "name_ar": "زبربر",
    "name_fr": "Z'barbar"
  },
  {
    "code": "1030",
    "wilaya_code": "10",
    "name_ar": "سحاريج",
    "name_fr": "Saharidj"
  },
  {
    "code": "1038",
    "wilaya_code": "10",
    "name_ar": "سور الغزلان",
    "name_fr": "Sour El Ghozlane"
  },
  {
    "code": "1004",
    "wilaya_code": "10",
    "name_ar": "سوق الخميس",
    "name_fr": "Souk El Khemis"
  },
  {
    "code": "1017",
    "wilaya_code": "10",
    "name_ar": "شرفة",
    "name_fr": "Chorfa"
  },
  {
    "code": "1029",
    "wilaya_code": "10",
    "name_ar": "عين الترك",
    "name_fr": "Ain Turk"
  },
  {
    "code": "1025",
    "wilaya_code": "10",
    "name_ar": "عين الحجر",
    "name_fr": "Ain El Hadjar"
  },
  {
    "code": "1041",
    "wilaya_code": "10",
    "name_ar": "عين العلوي",
    "name_fr": "Ain Laloui"
  },
  {
    "code": "1035",
    "wilaya_code": "10",
    "name_ar": "عين بسام",
    "name_fr": "Ain-Bessem"
  },
  {
    "code": "1005",
    "wilaya_code": "10",
    "name_ar": "قادرية",
    "name_fr": "Kadiria"
  },
  {
    "code": "1003",
    "wilaya_code": "10",
    "name_ar": "قرومة",
    "name_fr": "Guerrouma"
  },
  {
    "code": "1011",
    "wilaya_code": "10",
    "name_ar": "مزدور",
    "name_fr": "Mezdour"
  },
  {
    "code": "1014",
    "wilaya_code": "10",
    "name_ar": "معلة",
    "name_fr": "Maala"
  },
  {
    "code": "1045",
    "wilaya_code": "10",
    "name_ar": "وادي البردي",
    "name_fr": "Oued El Berdi"
  },
  {
    "code": "1102",
    "wilaya_code": "11",
    "name_ar": "ابلسة",
    "name_fr": "Abelsa"
  },
  {
    "code": "1105",
    "wilaya_code": "11",
    "name_ar": "أدلس",
    "name_fr": "Idles"
  },
  {
    "code": "1106",
    "wilaya_code": "11",
    "name_ar": "تاظروك",
    "name_fr": "Tazrouk"
  },
  {
    "code": "1101",
    "wilaya_code": "11",
    "name_ar": "تمنراست",
    "name_fr": "Tamanrasset"
  },
  {
    "code": "1109",
    "wilaya_code": "11",
    "name_ar": "عين امقل",
    "name_fr": "Ain Amguel"
  },
  {
    "code": "1208",
    "wilaya_code": "12",
    "name_ar": "الحمامات",
    "name_fr": "Hammamet"
  },
  {
    "code": "1206",
    "wilaya_code": "12",
    "name_ar": "الحويجبات",
    "name_fr": "El-Houidjbet"
  },
  {
    "code": "1203",
    "wilaya_code": "12",
    "name_ar": "الشريعة",
    "name_fr": "Cheria"
  },
  {
    "code": "1213",
    "wilaya_code": "12",
    "name_ar": "العقلة",
    "name_fr": "El Ogla"
  },
  {
    "code": "1205",
    "wilaya_code": "12",
    "name_ar": "العوينات",
    "name_fr": "El-Aouinet"
  },
  {
    "code": "1211",
    "wilaya_code": "12",
    "name_ar": "الكويف",
    "name_fr": "El Kouif"
  },
  {
    "code": "1220",
    "wilaya_code": "12",
    "name_ar": "الماء الابيض",
    "name_fr": "El Malabiod"
  },
  {
    "code": "1224",
    "wilaya_code": "12",
    "name_ar": "المريج",
    "name_fr": "El Meridj"
  },
  {
    "code": "1227",
    "wilaya_code": "12",
    "name_ar": "المزرعة",
    "name_fr": "El Mezeraa"
  },
  {
    "code": "1219",
    "wilaya_code": "12",
    "name_ar": "الونزة",
    "name_fr": "Ouenza"
  },
  {
    "code": "1221",
    "wilaya_code": "12",
    "name_ar": "أم علي",
    "name_fr": "Oum Ali"
  },
  {
    "code": "1214",
    "wilaya_code": "12",
    "name_ar": "بئر الذهب",
    "name_fr": "Bir Dheheb"
  },
  {
    "code": "1210",
    "wilaya_code": "12",
    "name_ar": "بئر مقدم",
    "name_fr": "Bir Mokkadem"
  },
  {
    "code": "1226",
    "wilaya_code": "12",
    "name_ar": "بجن",
    "name_fr": "Bedjene"
  },
  {
    "code": "1217",
    "wilaya_code": "12",
    "name_ar": "بكارية",
    "name_fr": "Bekkaria"
  },
  {
    "code": "1218",
    "wilaya_code": "12",
    "name_ar": "بوخضرة",
    "name_fr": "Boukhadra"
  },
  {
    "code": "1225",
    "wilaya_code": "12",
    "name_ar": "بولحاف الدير",
    "name_fr": "Boulhaf Dyr"
  },
  {
    "code": "1201",
    "wilaya_code": "12",
    "name_ar": "تبسة",
    "name_fr": "Tebessa"
  },
  {
    "code": "1222",
    "wilaya_code": "12",
    "name_ar": "ثليجان",
    "name_fr": "Telidjen"
  },
  {
    "code": "1204",
    "wilaya_code": "12",
    "name_ar": "سطح قنطيس",
    "name_fr": "Stah Guentis"
  },
  {
    "code": "1207",
    "wilaya_code": "12",
    "name_ar": "صفصاف الوسرى",
    "name_fr": "Saf Saf El Ouesra"
  },
  {
    "code": "1223",
    "wilaya_code": "12",
    "name_ar": "عين الزرقاء",
    "name_fr": "Ain Zerga"
  },
  {
    "code": "1216",
    "wilaya_code": "12",
    "name_ar": "قريقر",
    "name_fr": "Guorriguer"
  },
  {
    "code": "1212",
    "wilaya_code": "12",
    "name_ar": "مرسط",
    "name_fr": "Morsott"
  },
  {
    "code": "1326",
    "wilaya_code": "13",
    "name_ar": "الحناية",
    "name_fr": "Hennaya"
  },
  {
    "code": "1304",
    "wilaya_code": "13",
    "name_ar": "الرمشي",
    "name_fr": "Remchi"
  },
  {
    "code": "1329",
    "wilaya_code": "13",
    "name_ar": "السواحلية",
    "name_fr": "Souahlia"
  },
  {
    "code": "1308",
    "wilaya_code": "13",
    "name_ar": "السواني",
    "name_fr": "Souani"
  },
  {
    "code": "1321",
    "wilaya_code": "13",
    "name_ar": "العزايل",
    "name_fr": "Azail"
  },
  {
    "code": "1307",
    "wilaya_code": "13",
    "name_ar": "الغزوات",
    "name_fr": "Ghazaouet"
  },
  {
    "code": "1305",
    "wilaya_code": "13",
    "name_ar": "الفحول",
    "name_fr": "El Fehoul"
  },
  {
    "code": "1346",
    "wilaya_code": "13",
    "name_ar": "أولاد رياح",
    "name_fr": "Ouled Riyah"
  },
  {
    "code": "1313",
    "wilaya_code": "13",
    "name_ar": "أولاد ميمون",
    "name_fr": "Ouled Mimoun"
  },
  {
    "code": "1318",
    "wilaya_code": "13",
    "name_ar": "باب العسة",
    "name_fr": "Bab El Assa"
  },
  {
    "code": "1324",
    "wilaya_code": "13",
    "name_ar": "بن سكران",
    "name_fr": "Bensekrane"
  },
  {
    "code": "1342",
    "wilaya_code": "13",
    "name_ar": "بني بهدل",
    "name_fr": "Beni Bahdel"
  },
  {
    "code": "1338",
    "wilaya_code": "13",
    "name_ar": "بني بوسعيد",
    "name_fr": "Beni Boussaid"
  },
  {
    "code": "1348",
    "wilaya_code": "13",
    "name_ar": "بني خلاد",
    "name_fr": "Beni Khellad"
  },
  {
    "code": "1317",
    "wilaya_code": "13",
    "name_ar": "بني سنوس",
    "name_fr": "Beni Snous"
  },
  {
    "code": "1352",
    "wilaya_code": "13",
    "name_ar": "بني صميل",
    "name_fr": "Beni Smiel"
  },
  {
    "code": "1302",
    "wilaya_code": "13",
    "name_ar": "بني مستر",
    "name_fr": "Beni Mester"
  },
  {
    "code": "1336",
    "wilaya_code": "13",
    "name_ar": "بني وارسوس",
    "name_fr": "Beni Ouarsous"
  },
  {
    "code": "1347",
    "wilaya_code": "13",
    "name_ar": "بوحلو",
    "name_fr": "Bouhlou"
  },
  {
    "code": "1301",
    "wilaya_code": "13",
    "name_ar": "تلمسان",
    "name_fr": "Tlemcen"
  },
  {
    "code": "1345",
    "wilaya_code": "13",
    "name_ar": "تيانت",
    "name_fr": "Tianet"
  },
  {
    "code": "1323",
    "wilaya_code": "13",
    "name_ar": "تيرني بني هديل",
    "name_fr": "Terny Beni Hediel"
  },
  {
    "code": "1309",
    "wilaya_code": "13",
    "name_ar": "جبالة",
    "name_fr": "Djebala"
  },
  {
    "code": "1328",
    "wilaya_code": "13",
    "name_ar": "حمام بوغرارة",
    "name_fr": "Hammam Boughrara"
  },
  {
    "code": "1319",
    "wilaya_code": "13",
    "name_ar": "دار يغمراسن",
    "name_fr": "Dar Yaghmoracen"
  },
  {
    "code": "1316",
    "wilaya_code": "13",
    "name_ar": "زناتة",
    "name_fr": "Zenata"
  },
  {
    "code": "1335",
    "wilaya_code": "13",
    "name_ar": "سبدو",
    "name_fr": "Sebdou"
  },
  {
    "code": "1322",
    "wilaya_code": "13",
    "name_ar": "سبعة شيوخ",
    "name_fr": "Sebbaa Chioukh"
  },
  {
    "code": "1333",
    "wilaya_code": "13",
    "name_ar": "سوق الثلاثاء",
    "name_fr": "Souk Tleta"
  },
  {
    "code": "1334",
    "wilaya_code": "13",
    "name_ar": "سيدي العبدلي",
    "name_fr": "Sidi Abdelli"
  },
  {
    "code": "1337",
    "wilaya_code": "13",
    "name_ar": "سيدي مجاهد",
    "name_fr": "Sidi Medjahed"
  },
  {
    "code": "1350",
    "wilaya_code": "13",
    "name_ar": "شتوان",
    "name_fr": "Chetouane"
  },
  {
    "code": "1306",
    "wilaya_code": "13",
    "name_ar": "صبرة",
    "name_fr": "Sabra"
  },
  {
    "code": "1314",
    "wilaya_code": "13",
    "name_ar": "عمير",
    "name_fr": "Amieur"
  },
  {
    "code": "1353",
    "wilaya_code": "13",
    "name_ar": "عين الكبيرة",
    "name_fr": "Ain Kebira"
  },
  {
    "code": "1325",
    "wilaya_code": "13",
    "name_ar": "عين النحالة",
    "name_fr": "Ain Nehala"
  },
  {
    "code": "1303",
    "wilaya_code": "13",
    "name_ar": "عين تالوت",
    "name_fr": "Ain Tellout"
  },
  {
    "code": "1349",
    "wilaya_code": "13",
    "name_ar": "عين غرابة",
    "name_fr": "Ain Ghoraba"
  },
  {
    "code": "1331",
    "wilaya_code": "13",
    "name_ar": "عين فتاح",
    "name_fr": "Ain Fetah"
  },
  {
    "code": "1312",
    "wilaya_code": "13",
    "name_ar": "عين فزة",
    "name_fr": "Ain Fezza"
  },
  {
    "code": "1315",
    "wilaya_code": "13",
    "name_ar": "عين يوسف",
    "name_fr": "Ain Youcef"
  },
  {
    "code": "1320",
    "wilaya_code": "13",
    "name_ar": "فلاوسن",
    "name_fr": "Fellaoucene"
  },
  {
    "code": "1339",
    "wilaya_code": "13",
    "name_ar": "مرسى بن مهيدي",
    "name_fr": "Marsa Ben M'hidi"
  },
  {
    "code": "1330",
    "wilaya_code": "13",
    "name_ar": "مسيردة الفواقة",
    "name_fr": "M'sirda Fouaga"
  },
  {
    "code": "1327",
    "wilaya_code": "13",
    "name_ar": "مغنية",
    "name_fr": "Maghnia"
  },
  {
    "code": "1351",
    "wilaya_code": "13",
    "name_ar": "منصورة",
    "name_fr": "Mansourah"
  },
  {
    "code": "1340",
    "wilaya_code": "13",
    "name_ar": "ندرومة",
    "name_fr": "Nedroma"
  },
  {
    "code": "1344",
    "wilaya_code": "13",
    "name_ar": "هنين",
    "name_fr": "Honnaine"
  },
  {
    "code": "1311",
    "wilaya_code": "13",
    "name_ar": "وادي الخضر",
    "name_fr": "Oued Lakhdar"
  },
  {
    "code": "1414",
    "wilaya_code": "14",
    "name_ar": "الرحوية",
    "name_fr": "Rahouia"
  },
  {
    "code": "1411",
    "wilaya_code": "14",
    "name_ar": "السبت",
    "name_fr": "Sebt"
  },
  {
    "code": "1425",
    "wilaya_code": "14",
    "name_ar": "السبعين",
    "name_fr": "Sebaine"
  },
  {
    "code": "1416",
    "wilaya_code": "14",
    "name_ar": "السوقر",
    "name_fr": "Sougueur"
  },
  {
    "code": "1441",
    "wilaya_code": "14",
    "name_ar": "الفايجة",
    "name_fr": "Faidja"
  },
  {
    "code": "1431",
    "wilaya_code": "14",
    "name_ar": "الناظورة",
    "name_fr": "Nadorah"
  },
  {
    "code": "1420",
    "wilaya_code": "14",
    "name_ar": "النعيمة",
    "name_fr": "Naima"
  },
  {
    "code": "1432",
    "wilaya_code": "14",
    "name_ar": "تاقدمت",
    "name_fr": "Tagdempt"
  },
  {
    "code": "1437",
    "wilaya_code": "14",
    "name_ar": "تخمرت",
    "name_fr": "Takhemaret"
  },
  {
    "code": "1426",
    "wilaya_code": "14",
    "name_ar": "توسنينة",
    "name_fr": "Tousnina"
  },
  {
    "code": "1401",
    "wilaya_code": "14",
    "name_ar": "تيارت",
    "name_fr": "Tiaret"
  },
  {
    "code": "1442",
    "wilaya_code": "14",
    "name_ar": "تيدة",
    "name_fr": "Tidda"
  },
  {
    "code": "1419",
    "wilaya_code": "14",
    "name_ar": "جبيلات الرصفاء",
    "name_fr": "Djebilet Rosfa"
  },
  {
    "code": "1424",
    "wilaya_code": "14",
    "name_ar": "جيلالي بن عمار",
    "name_fr": "Djillali Ben Amar"
  },
  {
    "code": "1413",
    "wilaya_code": "14",
    "name_ar": "دحموني",
    "name_fr": "Dahmouni"
  },
  {
    "code": "1417",
    "wilaya_code": "14",
    "name_ar": "سي عبد الغني",
    "name_fr": "Si Abdelghani"
  },
  {
    "code": "1407",
    "wilaya_code": "14",
    "name_ar": "سيدي بختي",
    "name_fr": "Sidi Bakhti"
  },
  {
    "code": "1423",
    "wilaya_code": "14",
    "name_ar": "سيدي حسني",
    "name_fr": "Sidi Hosni"
  },
  {
    "code": "1438",
    "wilaya_code": "14",
    "name_ar": "سيدي عبد الرحمن",
    "name_fr": "Sidi Abderrahmane"
  },
  {
    "code": "1404",
    "wilaya_code": "14",
    "name_ar": "سيدي علي ملال",
    "name_fr": "Sidi Ali Mellal"
  },
  {
    "code": "1436",
    "wilaya_code": "14",
    "name_ar": "شحيمة",
    "name_fr": "Chehaima"
  },
  {
    "code": "1418",
    "wilaya_code": "14",
    "name_ar": "عين الحديد",
    "name_fr": "Ain El Hadid"
  },
  {
    "code": "1406",
    "wilaya_code": "14",
    "name_ar": "عين الذهب",
    "name_fr": "Ain Deheb"
  },
  {
    "code": "1403",
    "wilaya_code": "14",
    "name_ar": "عين بوشقيف",
    "name_fr": "Ain Bouchekif"
  },
  {
    "code": "1405",
    "wilaya_code": "14",
    "name_ar": "عين دزاريت",
    "name_fr": "Ain Dzarit"
  },
  {
    "code": "1428",
    "wilaya_code": "14",
    "name_ar": "عين كرمس",
    "name_fr": "Ain Kermes"
  },
  {
    "code": "1427",
    "wilaya_code": "14",
    "name_ar": "فرندة",
    "name_fr": "Frenda"
  },
  {
    "code": "1422",
    "wilaya_code": "14",
    "name_ar": "قرطوفة",
    "name_fr": "Guertoufa"
  },
  {
    "code": "1410",
    "wilaya_code": "14",
    "name_ar": "مادنة",
    "name_fr": "Madna"
  },
  {
    "code": "1402",
    "wilaya_code": "14",
    "name_ar": "مدروسة",
    "name_fr": "Medroussa"
  },
  {
    "code": "1408",
    "wilaya_code": "14",
    "name_ar": "مدريسة",
    "name_fr": "Medrissa"
  },
  {
    "code": "1434",
    "wilaya_code": "14",
    "name_ar": "مشرع الصفا",
    "name_fr": "Mechraa Safa"
  },
  {
    "code": "1421",
    "wilaya_code": "14",
    "name_ar": "مغيلة",
    "name_fr": "Meghila"
  },
  {
    "code": "1412",
    "wilaya_code": "14",
    "name_ar": "ملاكو",
    "name_fr": "Mellakou"
  },
  {
    "code": "1415",
    "wilaya_code": "14",
    "name_ar": "مهدية",
    "name_fr": "Mahdia"
  },
  {
    "code": "1433",
    "wilaya_code": "14",
    "name_ar": "وادي ليلي",
    "name_fr": "Oued Lilli"
  },
  {
    "code": "1560",
    "wilaya_code": "15",
    "name_ar": "إبودرارن",
    "name_fr": "Iboudrarene"
  },
  {
    "code": "1531",
    "wilaya_code": "15",
    "name_ar": "أبي يوسف",
    "name_fr": "Abi-Youcef"
  },
  {
    "code": "1537",
    "wilaya_code": "15",
    "name_ar": "أزفون",
    "name_fr": "Azeffoun"
  },
  {
    "code": "1566",
    "wilaya_code": "15",
    "name_ar": "أسي يوسف",
    "name_fr": "Assi-Youcef"
  },
  {
    "code": "1520",
    "wilaya_code": "15",
    "name_ar": "إعــكورن",
    "name_fr": "Yakourene"
  },
  {
    "code": "1553",
    "wilaya_code": "15",
    "name_ar": "أغريب",
    "name_fr": "Aghribs"
  },
  {
    "code": "1517",
    "wilaya_code": "15",
    "name_ar": "إفــرحــونان",
    "name_fr": "Iferhounene"
  },
  {
    "code": "1554",
    "wilaya_code": "15",
    "name_ar": "إفليـــسن",
    "name_fr": "Iflissen"
  },
  {
    "code": "1503",
    "wilaya_code": "15",
    "name_ar": "اقبيل",
    "name_fr": "Akbil"
  },
  {
    "code": "1544",
    "wilaya_code": "15",
    "name_ar": "أقرو",
    "name_fr": "Akerrou"
  },
  {
    "code": "1561",
    "wilaya_code": "15",
    "name_ar": "أقني قغران",
    "name_fr": "Agouni-Gueghrane"
  },
  {
    "code": "1521",
    "wilaya_code": "15",
    "name_ar": "الأربعــاء ناث إيراثن",
    "name_fr": "Larbaa Nath Irathen"
  },
  {
    "code": "1563",
    "wilaya_code": "15",
    "name_ar": "إمســوحال",
    "name_fr": "Imsouhal"
  },
  {
    "code": "1542",
    "wilaya_code": "15",
    "name_ar": "أيت أومالو",
    "name_fr": "Ait-Oumalou"
  },
  {
    "code": "1565",
    "wilaya_code": "15",
    "name_ar": "أيت بــوادو",
    "name_fr": "Ait Bouaddou"
  },
  {
    "code": "1530",
    "wilaya_code": "15",
    "name_ar": "أيت بومهدي",
    "name_fr": "Ait Boumahdi"
  },
  {
    "code": "1567",
    "wilaya_code": "15",
    "name_ar": "أيت تودرت",
    "name_fr": "Ait-Toudert"
  },
  {
    "code": "1558",
    "wilaya_code": "15",
    "name_ar": "أيت خليلي",
    "name_fr": "Ait Khellili"
  },
  {
    "code": "1513",
    "wilaya_code": "15",
    "name_ar": "أيت شافع",
    "name_fr": "Ait-Chafaa"
  },
  {
    "code": "1535",
    "wilaya_code": "15",
    "name_ar": "أيت عقـواشة",
    "name_fr": "Ait Aggouacha"
  },
  {
    "code": "1539",
    "wilaya_code": "15",
    "name_ar": "أيت عيسى ميمون",
    "name_fr": "Ait-Aissa-Mimoun"
  },
  {
    "code": "1528",
    "wilaya_code": "15",
    "name_ar": "أيت محمود",
    "name_fr": "Ait-Mahmoud"
  },
  {
    "code": "1556",
    "wilaya_code": "15",
    "name_ar": "أيت يحي موسى",
    "name_fr": "Ait Yahia Moussa"
  },
  {
    "code": "1527",
    "wilaya_code": "15",
    "name_ar": "أيت يحيى",
    "name_fr": "Ait-Yahia"
  },
  {
    "code": "1549",
    "wilaya_code": "15",
    "name_ar": "إيجــار",
    "name_fr": "Idjeur"
  },
  {
    "code": "1507",
    "wilaya_code": "15",
    "name_ar": "إيرجـــن",
    "name_fr": "Irdjen"
  },
  {
    "code": "1541",
    "wilaya_code": "15",
    "name_ar": "إيفيغاء",
    "name_fr": "Ifigha"
  },
  {
    "code": "1519",
    "wilaya_code": "15",
    "name_ar": "إيلولة أومـــالو",
    "name_fr": "Illoula Oumalou"
  },
  {
    "code": "1533",
    "wilaya_code": "15",
    "name_ar": "إيلـيــلتـن",
    "name_fr": "Illilten"
  },
  {
    "code": "1532",
    "wilaya_code": "15",
    "name_ar": "بني دوالة",
    "name_fr": "Beni-Douala"
  },
  {
    "code": "1516",
    "wilaya_code": "15",
    "name_ar": "بنــــي زمنزار",
    "name_fr": "Beni Zmenzer"
  },
  {
    "code": "1546",
    "wilaya_code": "15",
    "name_ar": "بني زيكــي",
    "name_fr": "Beni-Zikki"
  },
  {
    "code": "1515",
    "wilaya_code": "15",
    "name_ar": "بني عيسي",
    "name_fr": "Beni-Aissi"
  },
  {
    "code": "1552",
    "wilaya_code": "15",
    "name_ar": "بني يني",
    "name_fr": "Beni-Yenni"
  },
  {
    "code": "1555",
    "wilaya_code": "15",
    "name_ar": "بوجيمة",
    "name_fr": "Boudjima"
  },
  {
    "code": "1534",
    "wilaya_code": "15",
    "name_ar": "بوزقــن",
    "name_fr": "Bouzeguene"
  },
  {
    "code": "1540",
    "wilaya_code": "15",
    "name_ar": "بوغني",
    "name_fr": "Boghni"
  },
  {
    "code": "1512",
    "wilaya_code": "15",
    "name_ar": "بونوح",
    "name_fr": "Bounouh"
  },
  {
    "code": "1564",
    "wilaya_code": "15",
    "name_ar": "تادمايت",
    "name_fr": "Tadmait"
  },
  {
    "code": "1543",
    "wilaya_code": "15",
    "name_ar": "تيرمتين",
    "name_fr": "Tirmitine"
  },
  {
    "code": "1522",
    "wilaya_code": "15",
    "name_ar": "تيزي راشد",
    "name_fr": "Tizi-Rached"
  },
  {
    "code": "1511",
    "wilaya_code": "15",
    "name_ar": "تيزي غنيف",
    "name_fr": "Tizi-Gheniff"
  },
  {
    "code": "1551",
    "wilaya_code": "15",
    "name_ar": "تيزي نثلاثة",
    "name_fr": "Tizi N'tleta"
  },
  {
    "code": "1501",
    "wilaya_code": "15",
    "name_ar": "تيزي وزو",
    "name_fr": "Tizi-Ouzou"
  },
  {
    "code": "1538",
    "wilaya_code": "15",
    "name_ar": "تيقـزيرت",
    "name_fr": "Tigzirt"
  },
  {
    "code": "1508",
    "wilaya_code": "15",
    "name_ar": "تيمـيزار",
    "name_fr": "Timizart"
  },
  {
    "code": "1510",
    "wilaya_code": "15",
    "name_ar": "ذراع الميزان",
    "name_fr": "Draa-El-Mizan"
  },
  {
    "code": "1547",
    "wilaya_code": "15",
    "name_ar": "ذراع بن خدة",
    "name_fr": "Draa-Ben-Khedda"
  },
  {
    "code": "1523",
    "wilaya_code": "15",
    "name_ar": "زكري",
    "name_fr": "Zekri"
  },
  {
    "code": "1557",
    "wilaya_code": "15",
    "name_ar": "سوق الاثنين",
    "name_fr": "Souk-El-Tenine"
  },
  {
    "code": "1559",
    "wilaya_code": "15",
    "name_ar": "سيدي نعمان",
    "name_fr": "Sidi Namane"
  },
  {
    "code": "1505",
    "wilaya_code": "15",
    "name_ar": "صوامـــع",
    "name_fr": "Souama"
  },
  {
    "code": "1518",
    "wilaya_code": "15",
    "name_ar": "عزازقة",
    "name_fr": "Azazga"
  },
  {
    "code": "1502",
    "wilaya_code": "15",
    "name_ar": "عين الحمام",
    "name_fr": "Ain-El-Hammam"
  },
  {
    "code": "1525",
    "wilaya_code": "15",
    "name_ar": "عين الزاوية",
    "name_fr": "Ain-Zaouia"
  },
  {
    "code": "1504",
    "wilaya_code": "15",
    "name_ar": "فريحة",
    "name_fr": "Freha"
  },
  {
    "code": "1514",
    "wilaya_code": "15",
    "name_ar": "فريقات",
    "name_fr": "Frikat"
  },
  {
    "code": "1509",
    "wilaya_code": "15",
    "name_ar": "ماكودة",
    "name_fr": "Makouda"
  },
  {
    "code": "1506",
    "wilaya_code": "15",
    "name_ar": "مشطراس",
    "name_fr": "Mechtras"
  },
  {
    "code": "1529",
    "wilaya_code": "15",
    "name_ar": "معـــاتقة",
    "name_fr": "Maatkas"
  },
  {
    "code": "1550",
    "wilaya_code": "15",
    "name_ar": "مقــلع",
    "name_fr": "Mekla"
  },
  {
    "code": "1526",
    "wilaya_code": "15",
    "name_ar": "مكيرة",
    "name_fr": "M'kira"
  },
  {
    "code": "1562",
    "wilaya_code": "15",
    "name_ar": "ميزرانـــة",
    "name_fr": "Mizrana"
  },
  {
    "code": "1548",
    "wilaya_code": "15",
    "name_ar": "واسيف",
    "name_fr": "Ouacif"
  },
  {
    "code": "1536",
    "wilaya_code": "15",
    "name_ar": "واضية",
    "name_fr": "Ouadhias"
  },
  {
    "code": "1524",
    "wilaya_code": "15",
    "name_ar": "واقنون",
    "name_fr": "Ouaguenoun"
  },
  {
    "code": "1545",
    "wilaya_code": "15",
    "name_ar": "يطــافن",
    "name_fr": "Yatafene"
  },
  {
    "code": "1622",
    "wilaya_code": "16",
    "name_ar": "ابن عكنون",
    "name_fr": "Ben Aknoun"
  },
  {
    "code": "1610",
    "wilaya_code": "16",
    "name_ar": "الابيار",
    "name_fr": "El Biar"
  },
  {
    "code": "1601",
    "wilaya_code": "16",
    "name_ar": "الجزائر الوسطى",
    "name_fr": "Alger Centre"
  },
  {
    "code": "1613",
    "wilaya_code": "16",
    "name_ar": "الحراش",
    "name_fr": "El Harrach"
  },
  {
    "code": "1624",
    "wilaya_code": "16",
    "name_ar": "الحمامات",
    "name_fr": "Hammamet"
  },
  {
    "code": "1656",
    "wilaya_code": "16",
    "name_ar": "الخرايسية",
    "name_fr": "Khraissia"
  },
  {
    "code": "1620",
    "wilaya_code": "16",
    "name_ar": "الدار البيضاء",
    "name_fr": "Dar El Beida"
  },
  {
    "code": "1653",
    "wilaya_code": "16",
    "name_ar": "الدرارية",
    "name_fr": "Draria"
  },
  {
    "code": "1654",
    "wilaya_code": "16",
    "name_ar": "الدويرة",
    "name_fr": "Douira"
  },
  {
    "code": "1625",
    "wilaya_code": "16",
    "name_ar": "الرايس حميدو",
    "name_fr": "Rais Hamidou"
  },
  {
    "code": "1648",
    "wilaya_code": "16",
    "name_ar": "الرحمانية",
    "name_fr": "Rahmania"
  },
  {
    "code": "1642",
    "wilaya_code": "16",
    "name_ar": "الرويبة",
    "name_fr": "Rouiba"
  },
  {
    "code": "1657",
    "wilaya_code": "16",
    "name_ar": "السحاولة",
    "name_fr": "Sehaoula"
  },
  {
    "code": "1650",
    "wilaya_code": "16",
    "name_ar": "الشراقة",
    "name_fr": "Cheraga"
  },
  {
    "code": "1652",
    "wilaya_code": "16",
    "name_ar": "العاشور",
    "name_fr": "El Achour"
  },
  {
    "code": "1618",
    "wilaya_code": "16",
    "name_ar": "القبة",
    "name_fr": "Kouba"
  },
  {
    "code": "1607",
    "wilaya_code": "16",
    "name_ar": "القصبة",
    "name_fr": "Casbah"
  },
  {
    "code": "1633",
    "wilaya_code": "16",
    "name_ar": "الكاليتوس",
    "name_fr": "Les Eucalyptus"
  },
  {
    "code": "1629",
    "wilaya_code": "16",
    "name_ar": "المحمدية",
    "name_fr": "Mohammadia"
  },
  {
    "code": "1603",
    "wilaya_code": "16",
    "name_ar": "المدنية",
    "name_fr": "El Madania"
  },
  {
    "code": "1627",
    "wilaya_code": "16",
    "name_ar": "المرادية",
    "name_fr": "El Mouradia"
  },
  {
    "code": "1640",
    "wilaya_code": "16",
    "name_ar": "المرسى",
    "name_fr": "El Marsa"
  },
  {
    "code": "1647",
    "wilaya_code": "16",
    "name_ar": "المعالمة",
    "name_fr": "Maalma"
  },
  {
    "code": "1631",
    "wilaya_code": "16",
    "name_ar": "المغارية",
    "name_fr": "El Magharia"
  },
  {
    "code": "1636",
    "wilaya_code": "16",
    "name_ar": "اولاد شبل",
    "name_fr": "Ouled Chebel"
  },
  {
    "code": "1651",
    "wilaya_code": "16",
    "name_ar": "اولاد فايت",
    "name_fr": "Ouled Fayet"
  },
  {
    "code": "1621",
    "wilaya_code": "16",
    "name_ar": "باب الزوار",
    "name_fr": "Bab Ezzouar"
  },
  {
    "code": "1605",
    "wilaya_code": "16",
    "name_ar": "باب الوادي",
    "name_fr": "Bab El Oued"
  },
  {
    "code": "1655",
    "wilaya_code": "16",
    "name_ar": "بابا حسن",
    "name_fr": "Baba Hassen"
  },
  {
    "code": "1634",
    "wilaya_code": "16",
    "name_ar": "بئر توتة",
    "name_fr": "Bir Touta"
  },
  {
    "code": "1612",
    "wilaya_code": "16",
    "name_ar": "بئر خادم",
    "name_fr": "Birkhadem"
  },
  {
    "code": "1609",
    "wilaya_code": "16",
    "name_ar": "بئر مراد رايس",
    "name_fr": "Bir Mourad Rais"
  },
  {
    "code": "1619",
    "wilaya_code": "16",
    "name_ar": "باش جراح",
    "name_fr": "Bachedjerah"
  },
  {
    "code": "1614",
    "wilaya_code": "16",
    "name_ar": "براقي",
    "name_fr": "Baraki"
  },
  {
    "code": "1639",
    "wilaya_code": "16",
    "name_ar": "برج البحري",
    "name_fr": "Bordj El Bahri"
  },
  {
    "code": "1630",
    "wilaya_code": "16",
    "name_ar": "برج الكيفان",
    "name_fr": "Bordj El Kiffan"
  },
  {
    "code": "1632",
    "wilaya_code": "16",
    "name_ar": "بني مسوس",
    "name_fr": "Beni Messous"
  },
  {
    "code": "1616",
    "wilaya_code": "16",
    "name_ar": "بوروبة",
    "name_fr": "Bourouba"
  },
  {
    "code": "1611",
    "wilaya_code": "16",
    "name_ar": "بوزريعة",
    "name_fr": "Bouzareah"
  },
  {
    "code": "1606",
    "wilaya_code": "16",
    "name_ar": "بولوغين بن زيري",
    "name_fr": "Bologhine Ibnou Ziri"
  },
  {
    "code": "1635",
    "wilaya_code": "16",
    "name_ar": "تسالة المرجة",
    "name_fr": "Tessala El Merdja"
  },
  {
    "code": "1626",
    "wilaya_code": "16",
    "name_ar": "جسر قسنطينة",
    "name_fr": "Djasr Kasentina"
  },
  {
    "code": "1617",
    "wilaya_code": "16",
    "name_ar": "حسين داي",
    "name_fr": "Hussein Dey"
  },
  {
    "code": "1628",
    "wilaya_code": "16",
    "name_ar": "حيدرة",
    "name_fr": "Hydra"
  },
  {
    "code": "1623",
    "wilaya_code": "16",
    "name_ar": "دالي ابراهيم",
    "name_fr": "Dely Ibrahim"
  },
  {
    "code": "1643",
    "wilaya_code": "16",
    "name_ar": "رغاية",
    "name_fr": "Reghaia"
  },
  {
    "code": "1646",
    "wilaya_code": "16",
    "name_ar": "زرالدة",
    "name_fr": "Zeralda"
  },
  {
    "code": "1645",
    "wilaya_code": "16",
    "name_ar": "سطاوالي",
    "name_fr": "Staoueli"
  },
  {
    "code": "1649",
    "wilaya_code": "16",
    "name_ar": "سويدانية",
    "name_fr": "Souidania"
  },
  {
    "code": "1602",
    "wilaya_code": "16",
    "name_ar": "سيدي امحمد",
    "name_fr": "Sidi M'hamed"
  },
  {
    "code": "1637",
    "wilaya_code": "16",
    "name_ar": "سيدي موسى",
    "name_fr": "Sidi Moussa"
  },
  {
    "code": "1644",
    "wilaya_code": "16",
    "name_ar": "عين بنيان",
    "name_fr": "Ain Benian"
  },
  {
    "code": "1638",
    "wilaya_code": "16",
    "name_ar": "عين طاية",
    "name_fr": "Ain Taya"
  },
  {
    "code": "1604",
    "wilaya_code": "16",
    "name_ar": "محمد بلوزداد",
    "name_fr": "Mohamed Belouzdad"
  },
  {
    "code": "1641",
    "wilaya_code": "16",
    "name_ar": "هراوة",
    "name_fr": "Herraoua"
  },
  {
    "code": "1615",
    "wilaya_code": "16",
    "name_ar": "وادي السمار",
    "name_fr": "Oued Smar"
  },
  {
    "code": "1608",
    "wilaya_code": "16",
    "name_ar": "وادي قريش",
    "name_fr": "Oued Koriche"
  },
  {
    "code": "1714",
    "wilaya_code": "17",
    "name_ar": "الادريسية",
    "name_fr": "El Idrissia"
  },
  {
    "code": "1701",
    "wilaya_code": "17",
    "name_ar": "الجلفة",
    "name_fr": "Djelfa"
  },
  {
    "code": "1726",
    "wilaya_code": "17",
    "name_ar": "الشارف",
    "name_fr": "Charef"
  },
  {
    "code": "1703",
    "wilaya_code": "17",
    "name_ar": "القديد",
    "name_fr": "El Guedid"
  },
  {
    "code": "1727",
    "wilaya_code": "17",
    "name_ar": "بن يعقوب",
    "name_fr": "Benyagoub"
  },
  {
    "code": "1736",
    "wilaya_code": "17",
    "name_ar": "تعظميت",
    "name_fr": "Taadmit"
  },
  {
    "code": "1716",
    "wilaya_code": "17",
    "name_ar": "حاسي العش",
    "name_fr": "Hassi El Euch"
  },
  {
    "code": "1704",
    "wilaya_code": "17",
    "name_ar": "حاسي بحبح",
    "name_fr": "Hassi Bahbah"
  },
  {
    "code": "1725",
    "wilaya_code": "17",
    "name_ar": "دار الشيوخ",
    "name_fr": "Dar Chioukh"
  },
  {
    "code": "1715",
    "wilaya_code": "17",
    "name_ar": "دويس",
    "name_fr": "Douis"
  },
  {
    "code": "1728",
    "wilaya_code": "17",
    "name_ar": "زعفران",
    "name_fr": "Zaafrane"
  },
  {
    "code": "1710",
    "wilaya_code": "17",
    "name_ar": "زكار",
    "name_fr": "Zaccar"
  },
  {
    "code": "1712",
    "wilaya_code": "17",
    "name_ar": "سيدي بايزيد",
    "name_fr": "Sidi Baizid"
  },
  {
    "code": "1730",
    "wilaya_code": "17",
    "name_ar": "عين الإبل",
    "name_fr": "Ain El Ibel"
  },
  {
    "code": "1723",
    "wilaya_code": "17",
    "name_ar": "عين الشهداء",
    "name_fr": "Ain Chouhada"
  },
  {
    "code": "1705",
    "wilaya_code": "17",
    "name_ar": "عين معبد",
    "name_fr": "Ain Maabed"
  },
  {
    "code": "1702",
    "wilaya_code": "17",
    "name_ar": "مجبارة",
    "name_fr": "Moudjebara"
  },
  {
    "code": "1713",
    "wilaya_code": "17",
    "name_ar": "مليليحة",
    "name_fr": "M'liliha"
  },
  {
    "code": "1802",
    "wilaya_code": "18",
    "name_ar": "أراقن سويسي",
    "name_fr": "Erraguene Souissi"
  },
  {
    "code": "1806",
    "wilaya_code": "18",
    "name_ar": "الامير عبد القادر",
    "name_fr": "Emir Abdelkader"
  },
  {
    "code": "1825",
    "wilaya_code": "18",
    "name_ar": "الجمعة بني حبيبي",
    "name_fr": "Djemaa Beni Habibi"
  },
  {
    "code": "1811",
    "wilaya_code": "18",
    "name_ar": "السطارة",
    "name_fr": "Settara"
  },
  {
    "code": "1808",
    "wilaya_code": "18",
    "name_ar": "الشحنة",
    "name_fr": "Chahna"
  },
  {
    "code": "1807",
    "wilaya_code": "18",
    "name_ar": "الشقفة",
    "name_fr": "Chekfa"
  },
  {
    "code": "1805",
    "wilaya_code": "18",
    "name_ar": "الطاهير",
    "name_fr": "Taher"
  },
  {
    "code": "1812",
    "wilaya_code": "18",
    "name_ar": "العنصر",
    "name_fr": "El Ancer"
  },
  {
    "code": "1803",
    "wilaya_code": "18",
    "name_ar": "العوانة",
    "name_fr": "El Aouana"
  },
  {
    "code": "1820",
    "wilaya_code": "18",
    "name_ar": "القنار نشفي",
    "name_fr": "El Kennar Nouchfi"
  },
  {
    "code": "1809",
    "wilaya_code": "18",
    "name_ar": "الميلية",
    "name_fr": "El Milia"
  },
  {
    "code": "1827",
    "wilaya_code": "18",
    "name_ar": "أولاد رابح",
    "name_fr": "Ouled Rabah"
  },
  {
    "code": "1821",
    "wilaya_code": "18",
    "name_ar": "أولاد يحيى خدروش",
    "name_fr": "Ouled Yahia Khadrouch"
  },
  {
    "code": "1826",
    "wilaya_code": "18",
    "name_ar": "برج الطهر",
    "name_fr": "Bordj T'har"
  },
  {
    "code": "1822",
    "wilaya_code": "18",
    "name_ar": "بودريعة بني ياجيس",
    "name_fr": "Boudria Beniyadjis"
  },
  {
    "code": "1816",
    "wilaya_code": "18",
    "name_ar": "بوراوي بلهادف",
    "name_fr": "Bouraoui Belhadef"
  },
  {
    "code": "1819",
    "wilaya_code": "18",
    "name_ar": "بوسيف أولاد عسكر",
    "name_fr": "Boussif Ouled Askeur"
  },
  {
    "code": "1824",
    "wilaya_code": "18",
    "name_ar": "تاكسنة",
    "name_fr": "Texenna"
  },
  {
    "code": "1801",
    "wilaya_code": "18",
    "name_ar": "جيجل",
    "name_fr": "Jijel"
  },
  {
    "code": "1817",
    "wilaya_code": "18",
    "name_ar": "جيملة",
    "name_fr": "Djimla"
  },
  {
    "code": "1823",
    "wilaya_code": "18",
    "name_ar": "خيري واد عجول",
    "name_fr": "Khiri Oued Adjoul"
  },
  {
    "code": "1804",
    "wilaya_code": "18",
    "name_ar": "زيامة منصورية",
    "name_fr": "Ziama Mansouriah"
  },
  {
    "code": "1818",
    "wilaya_code": "18",
    "name_ar": "سلمى بن زيادة",
    "name_fr": "Selma Benziada"
  },
  {
    "code": "1813",
    "wilaya_code": "18",
    "name_ar": "سيدي عبد العزيز",
    "name_fr": "Sidi Abdelaziz"
  },
  {
    "code": "1810",
    "wilaya_code": "18",
    "name_ar": "سيدي معروف",
    "name_fr": "Sidi Marouf"
  },
  {
    "code": "1815",
    "wilaya_code": "18",
    "name_ar": "غبالة",
    "name_fr": "Ghebala"
  },
  {
    "code": "1814",
    "wilaya_code": "18",
    "name_ar": "قاوس",
    "name_fr": "Kaous"
  },
  {
    "code": "1828",
    "wilaya_code": "18",
    "name_ar": "وجانة",
    "name_fr": "Oudjana"
  },
  {
    "code": "1960",
    "wilaya_code": "19",
    "name_ar": "التلة",
    "name_fr": "Tella"
  },
  {
    "code": "1911",
    "wilaya_code": "19",
    "name_ar": "الحامة",
    "name_fr": "Hamma"
  },
  {
    "code": "1915",
    "wilaya_code": "19",
    "name_ar": "الدهامشة",
    "name_fr": "Dehamcha"
  },
  {
    "code": "1923",
    "wilaya_code": "19",
    "name_ar": "الرصفة",
    "name_fr": "Rosfa"
  },
  {
    "code": "1958",
    "wilaya_code": "19",
    "name_ar": "الطاية",
    "name_fr": "Taya"
  },
  {
    "code": "1920",
    "wilaya_code": "19",
    "name_ar": "العلمة",
    "name_fr": "El Eulma"
  },
  {
    "code": "1959",
    "wilaya_code": "19",
    "name_ar": "الولجة",
    "name_fr": "El-Ouldja"
  },
  {
    "code": "1937",
    "wilaya_code": "19",
    "name_ar": "أوريسيا",
    "name_fr": "El Ouricia"
  },
  {
    "code": "1910",
    "wilaya_code": "19",
    "name_ar": "أولاد تبان",
    "name_fr": "Ouled Tebben"
  },
  {
    "code": "1904",
    "wilaya_code": "19",
    "name_ar": "أولاد سي أحمد",
    "name_fr": "Ouled Si Ahmed"
  },
  {
    "code": "1947",
    "wilaya_code": "19",
    "name_ar": "أولاد صابر",
    "name_fr": "Ouled Sabor"
  },
  {
    "code": "1924",
    "wilaya_code": "19",
    "name_ar": "أولاد عدوان",
    "name_fr": "Ouled Addouane"
  },
  {
    "code": "1954",
    "wilaya_code": "19",
    "name_ar": "ايت تيزي",
    "name_fr": "Ait-Tizi"
  },
  {
    "code": "1951",
    "wilaya_code": "19",
    "name_ar": "أيت نوال مزادة",
    "name_fr": "Ait Naoual Mezada"
  },
  {
    "code": "1916",
    "wilaya_code": "19",
    "name_ar": "بابور",
    "name_fr": "Babor"
  },
  {
    "code": "1908",
    "wilaya_code": "19",
    "name_ar": "بئر العرش",
    "name_fr": "Bir-El-Arch"
  },
  {
    "code": "1934",
    "wilaya_code": "19",
    "name_ar": "بئر حدادة",
    "name_fr": "Bir Haddada"
  },
  {
    "code": "1931",
    "wilaya_code": "19",
    "name_ar": "بازر سكرة",
    "name_fr": "Bazer-Sakra"
  },
  {
    "code": "1925",
    "wilaya_code": "19",
    "name_ar": "بلاعة",
    "name_fr": "Bellaa"
  },
  {
    "code": "1909",
    "wilaya_code": "19",
    "name_ar": "بني شبانة",
    "name_fr": "Beni Chebana"
  },
  {
    "code": "1903",
    "wilaya_code": "19",
    "name_ar": "بني عزيز",
    "name_fr": "Beni-Aziz"
  },
  {
    "code": "1944",
    "wilaya_code": "19",
    "name_ar": "بني فودة",
    "name_fr": "Beni Fouda"
  },
  {
    "code": "1946",
    "wilaya_code": "19",
    "name_ar": "بني موحلي",
    "name_fr": "Beni-Mouhli"
  },
  {
    "code": "1922",
    "wilaya_code": "19",
    "name_ar": "بني ورتيلان",
    "name_fr": "Beni Ourtilane"
  },
  {
    "code": "1953",
    "wilaya_code": "19",
    "name_ar": "بني وسين",
    "name_fr": "Beni Oussine"
  },
  {
    "code": "1919",
    "wilaya_code": "19",
    "name_ar": "بوسلام",
    "name_fr": "Bousselam"
  },
  {
    "code": "1905",
    "wilaya_code": "19",
    "name_ar": "بوطالب",
    "name_fr": "Boutaleb"
  },
  {
    "code": "1930",
    "wilaya_code": "19",
    "name_ar": "بوعنداس",
    "name_fr": "Bouandas"
  },
  {
    "code": "1943",
    "wilaya_code": "19",
    "name_ar": "بوقاعة",
    "name_fr": "Bougaa"
  },
  {
    "code": "1929",
    "wilaya_code": "19",
    "name_ar": "بيضاء برج",
    "name_fr": "Beidha Bordj"
  },
  {
    "code": "1945",
    "wilaya_code": "19",
    "name_ar": "تاشودة",
    "name_fr": "Tachouda"
  },
  {
    "code": "1942",
    "wilaya_code": "19",
    "name_ar": "تالة إيفاسن",
    "name_fr": "Tala-Ifacene"
  },
  {
    "code": "1938",
    "wilaya_code": "19",
    "name_ar": "تيزي نبشار",
    "name_fr": "Tizi N'bechar"
  },
  {
    "code": "1921",
    "wilaya_code": "19",
    "name_ar": "جميلة",
    "name_fr": "Djemila"
  },
  {
    "code": "1936",
    "wilaya_code": "19",
    "name_ar": "حربيل",
    "name_fr": "Harbil"
  },
  {
    "code": "1932",
    "wilaya_code": "19",
    "name_ar": "حمام السخنة",
    "name_fr": "Hamam Soukhna"
  },
  {
    "code": "1950",
    "wilaya_code": "19",
    "name_ar": "حمام قرقور",
    "name_fr": "Hammam Guergour"
  },
  {
    "code": "1907",
    "wilaya_code": "19",
    "name_ar": "ذراع قبيلة",
    "name_fr": "Draa-Kebila"
  },
  {
    "code": "1935",
    "wilaya_code": "19",
    "name_ar": "سرج الغول",
    "name_fr": "Serdj-El-Ghoul"
  },
  {
    "code": "1901",
    "wilaya_code": "19",
    "name_ar": "سطيف",
    "name_fr": "Setif"
  },
  {
    "code": "1939",
    "wilaya_code": "19",
    "name_ar": "صالح باي",
    "name_fr": "Salah Bey"
  },
  {
    "code": "1927",
    "wilaya_code": "19",
    "name_ar": "عموشة",
    "name_fr": "Amoucha"
  },
  {
    "code": "1926",
    "wilaya_code": "19",
    "name_ar": "عين أرنات",
    "name_fr": "Ain Arnat"
  },
  {
    "code": "1940",
    "wilaya_code": "19",
    "name_ar": "عين أزال",
    "name_fr": "Ain Azel"
  },
  {
    "code": "1918",
    "wilaya_code": "19",
    "name_ar": "عين الحجر",
    "name_fr": "Ain Lahdjar"
  },
  {
    "code": "1906",
    "wilaya_code": "19",
    "name_ar": "عين الروى",
    "name_fr": "Ain-Roua"
  },
  {
    "code": "1949",
    "wilaya_code": "19",
    "name_ar": "عين السبت",
    "name_fr": "Ain-Sebt"
  },
  {
    "code": "1902",
    "wilaya_code": "19",
    "name_ar": "عين الكبيرة",
    "name_fr": "Ain El Kebira"
  },
  {
    "code": "1914",
    "wilaya_code": "19",
    "name_ar": "عين عباسة",
    "name_fr": "Ain Abessa"
  },
  {
    "code": "1913",
    "wilaya_code": "19",
    "name_ar": "عين لقراج",
    "name_fr": "Ain-Legradj"
  },
  {
    "code": "1928",
    "wilaya_code": "19",
    "name_ar": "عين ولمان",
    "name_fr": "Ain Oulmene"
  },
  {
    "code": "1917",
    "wilaya_code": "19",
    "name_ar": "قجال",
    "name_fr": "Guidjel"
  },
  {
    "code": "1952",
    "wilaya_code": "19",
    "name_ar": "قصر الابطال",
    "name_fr": "Kasr El Abtal"
  },
  {
    "code": "1948",
    "wilaya_code": "19",
    "name_ar": "قلال",
    "name_fr": "Guellal"
  },
  {
    "code": "1956",
    "wilaya_code": "19",
    "name_ar": "قلتة زرقاء",
    "name_fr": "Guelta Zerka"
  },
  {
    "code": "1941",
    "wilaya_code": "19",
    "name_ar": "قنزات",
    "name_fr": "Guenzet"
  },
  {
    "code": "1955",
    "wilaya_code": "19",
    "name_ar": "ماوكلان",
    "name_fr": "Maouaklane"
  },
  {
    "code": "1933",
    "wilaya_code": "19",
    "name_ar": "مزلوق",
    "name_fr": "Mezloug"
  },
  {
    "code": "1912",
    "wilaya_code": "19",
    "name_ar": "معاوية",
    "name_fr": "Maaouia"
  },
  {
    "code": "1957",
    "wilaya_code": "19",
    "name_ar": "واد البارد",
    "name_fr": "Oued El Bared"
  },
  {
    "code": "2010",
    "wilaya_code": "20",
    "name_ar": "الحساسنة",
    "name_fr": "El Hassasna"
  },
  {
    "code": "2011",
    "wilaya_code": "20",
    "name_ar": "المعمورة",
    "name_fr": "Maamora"
  },
  {
    "code": "2014",
    "wilaya_code": "20",
    "name_ar": "أولاد إبراهيم",
    "name_fr": "Ouled Brahim"
  },
  {
    "code": "2004",
    "wilaya_code": "20",
    "name_ar": "أولاد خالد",
    "name_fr": "Ouled Khaled"
  },
  {
    "code": "2015",
    "wilaya_code": "20",
    "name_ar": "تيرسين",
    "name_fr": "Tircine"
  },
  {
    "code": "2002",
    "wilaya_code": "20",
    "name_ar": "دوي ثابت",
    "name_fr": "Doui Thabet"
  },
  {
    "code": "2001",
    "wilaya_code": "20",
    "name_ar": "سعيدة",
    "name_fr": "Saida"
  },
  {
    "code": "2012",
    "wilaya_code": "20",
    "name_ar": "سيدي احمد",
    "name_fr": "Sidi Ahmed"
  },
  {
    "code": "2009",
    "wilaya_code": "20",
    "name_ar": "سيدي بوبكر",
    "name_fr": "Sidi Boubekeur"
  },
  {
    "code": "2008",
    "wilaya_code": "20",
    "name_ar": "سيدي عمر",
    "name_fr": "Sidi Amar"
  },
  {
    "code": "2003",
    "wilaya_code": "20",
    "name_ar": "عين الحجر",
    "name_fr": "Ain El Hadjar"
  },
  {
    "code": "2013",
    "wilaya_code": "20",
    "name_ar": "عين السخونة",
    "name_fr": "Ain Sekhouna"
  },
  {
    "code": "2016",
    "wilaya_code": "20",
    "name_ar": "عين السلطان",
    "name_fr": "Ain Soltane"
  },
  {
    "code": "2005",
    "wilaya_code": "20",
    "name_ar": "مولاي العربي",
    "name_fr": "Moulay Larbi"
  },
  {
    "code": "2007",
    "wilaya_code": "20",
    "name_ar": "هونت",
    "name_fr": "Hounet"
  },
  {
    "code": "2006",
    "wilaya_code": "20",
    "name_ar": "يوب",
    "name_fr": "Youb"
  },
  {
    "code": "2103",
    "wilaya_code": "21",
    "name_ar": "الحدائق",
    "name_fr": "El Hadaiek"
  },
  {
    "code": "2116",
    "wilaya_code": "21",
    "name_ar": "الحروش",
    "name_fr": "El Arrouch"
  },
  {
    "code": "2115",
    "wilaya_code": "21",
    "name_ar": "الزيتونة",
    "name_fr": "Zitouna"
  },
  {
    "code": "2109",
    "wilaya_code": "21",
    "name_ar": "السبت",
    "name_fr": "Es Sebt"
  },
  {
    "code": "2131",
    "wilaya_code": "21",
    "name_ar": "الشرايع",
    "name_fr": "Cheraia"
  },
  {
    "code": "2133",
    "wilaya_code": "21",
    "name_ar": "الغدير",
    "name_fr": "El Ghedir"
  },
  {
    "code": "2110",
    "wilaya_code": "21",
    "name_ar": "القل",
    "name_fr": "Collo"
  },
  {
    "code": "2112",
    "wilaya_code": "21",
    "name_ar": "الكركرة",
    "name_fr": "Kerkara"
  },
  {
    "code": "2138",
    "wilaya_code": "21",
    "name_ar": "المرسى",
    "name_fr": "El Marsa"
  },
  {
    "code": "2135",
    "wilaya_code": "21",
    "name_ar": "الولجة بولبلوط",
    "name_fr": "Ouldja Boulbalout"
  },
  {
    "code": "2128",
    "wilaya_code": "21",
    "name_ar": "أم الطوب",
    "name_fr": "Oum Toub"
  },
  {
    "code": "2118",
    "wilaya_code": "21",
    "name_ar": "أولاد حبابة",
    "name_fr": "Ouled Habbaba"
  },
  {
    "code": "2113",
    "wilaya_code": "21",
    "name_ar": "أولاد عطية",
    "name_fr": "Ouled Attia"
  },
  {
    "code": "2107",
    "wilaya_code": "21",
    "name_ar": "بكوش لخضر",
    "name_fr": "Bekkouche Lakhdar"
  },
  {
    "code": "2108",
    "wilaya_code": "21",
    "name_ar": "بن عزوز",
    "name_fr": "Ben Azzouz"
  },
  {
    "code": "2124",
    "wilaya_code": "21",
    "name_ar": "بني بشير",
    "name_fr": "Beni Bechir"
  },
  {
    "code": "2111",
    "wilaya_code": "21",
    "name_ar": "بني زيد",
    "name_fr": "Beni Zid"
  },
  {
    "code": "2121",
    "wilaya_code": "21",
    "name_ar": "بني ولبان",
    "name_fr": "Beni Oulbane"
  },
  {
    "code": "2134",
    "wilaya_code": "21",
    "name_ar": "بوشطاطة",
    "name_fr": "Bouchetata"
  },
  {
    "code": "2129",
    "wilaya_code": "21",
    "name_ar": "بين الويدان",
    "name_fr": "Bin El Ouiden"
  },
  {
    "code": "2126",
    "wilaya_code": "21",
    "name_ar": "تمالوس",
    "name_fr": "Tamalous"
  },
  {
    "code": "2105",
    "wilaya_code": "21",
    "name_ar": "جندل سعدي محمد",
    "name_fr": "Djendel Saadi Mohamed"
  },
  {
    "code": "2137",
    "wilaya_code": "21",
    "name_ar": "حمادي كرومة",
    "name_fr": "Hammadi Krouma"
  },
  {
    "code": "2136",
    "wilaya_code": "21",
    "name_ar": "خناق مايو",
    "name_fr": "Khenag Maoune"
  },
  {
    "code": "2123",
    "wilaya_code": "21",
    "name_ar": "رمضان جمال",
    "name_fr": "Ramdane Djamel"
  },
  {
    "code": "2117",
    "wilaya_code": "21",
    "name_ar": "زردازة",
    "name_fr": "Zerdezas"
  },
  {
    "code": "2101",
    "wilaya_code": "21",
    "name_ar": "سكيكدة",
    "name_fr": "Skikda"
  },
  {
    "code": "2119",
    "wilaya_code": "21",
    "name_ar": "سيدي مزغيش",
    "name_fr": "Sidi Mezghiche"
  },
  {
    "code": "2125",
    "wilaya_code": "21",
    "name_ar": "صالح بو الشعور",
    "name_fr": "Salah Bouchaour"
  },
  {
    "code": "2104",
    "wilaya_code": "21",
    "name_ar": "عزابة",
    "name_fr": "Azzaba"
  },
  {
    "code": "2122",
    "wilaya_code": "21",
    "name_ar": "عين بوزيان",
    "name_fr": "Ain Bouziane"
  },
  {
    "code": "2102",
    "wilaya_code": "21",
    "name_ar": "عين زويت",
    "name_fr": "Ain Zouit"
  },
  {
    "code": "2106",
    "wilaya_code": "21",
    "name_ar": "عين شرشار",
    "name_fr": "Ain Charchar"
  },
  {
    "code": "2127",
    "wilaya_code": "21",
    "name_ar": "عين قشرة",
    "name_fr": "Ain Kechra"
  },
  {
    "code": "2130",
    "wilaya_code": "21",
    "name_ar": "فلفلة",
    "name_fr": "Filfila"
  },
  {
    "code": "2132",
    "wilaya_code": "21",
    "name_ar": "قنواع",
    "name_fr": "Kanoua"
  },
  {
    "code": "2120",
    "wilaya_code": "21",
    "name_ar": "مجاز الدشيش",
    "name_fr": "Emjez Edchich"
  },
  {
    "code": "2114",
    "wilaya_code": "21",
    "name_ar": "وادي الزهور",
    "name_fr": "Oued Zhour"
  },
  {
    "code": "2219",
    "wilaya_code": "22",
    "name_ar": "الحصيبة",
    "name_fr": "El Hacaiba"
  },
  {
    "code": "2239",
    "wilaya_code": "22",
    "name_ar": "السهالة الثورة",
    "name_fr": "Sehala Thaoura"
  },
  {
    "code": "2232",
    "wilaya_code": "22",
    "name_ar": "الضاية",
    "name_fr": "Dhaya"
  },
  {
    "code": "2212",
    "wilaya_code": "22",
    "name_ar": "العمارنة",
    "name_fr": "Amarnas"
  },
  {
    "code": "2248",
    "wilaya_code": "22",
    "name_ar": "بئر الحمام",
    "name_fr": "Bir El Hammam"
  },
  {
    "code": "2209",
    "wilaya_code": "22",
    "name_ar": "بضرابين المقراني",
    "name_fr": "Bedrabine El Mokrani"
  },
  {
    "code": "2242",
    "wilaya_code": "22",
    "name_ar": "بلعربي",
    "name_fr": "Belarbi"
  },
  {
    "code": "2245",
    "wilaya_code": "22",
    "name_ar": "بن باديس",
    "name_fr": "Ben Badis"
  },
  {
    "code": "2251",
    "wilaya_code": "22",
    "name_ar": "بن عشيبة شلية",
    "name_fr": "Benachiba Chelia"
  },
  {
    "code": "2238",
    "wilaya_code": "22",
    "name_ar": "بوجبهة البرج",
    "name_fr": "Boudjebaa El Bordj"
  },
  {
    "code": "2207",
    "wilaya_code": "22",
    "name_ar": "بوخنفيس",
    "name_fr": "Boukhanefis"
  },
  {
    "code": "2249",
    "wilaya_code": "22",
    "name_ar": "تاودموت",
    "name_fr": "Taoudmout"
  },
  {
    "code": "2202",
    "wilaya_code": "22",
    "name_ar": "تسالة",
    "name_fr": "Tessala"
  },
  {
    "code": "2244",
    "wilaya_code": "22",
    "name_ar": "تغاليمت",
    "name_fr": "Teghalimet"
  },
  {
    "code": "2211",
    "wilaya_code": "22",
    "name_ar": "تفسور",
    "name_fr": "Tefessour"
  },
  {
    "code": "2205",
    "wilaya_code": "22",
    "name_ar": "تلاغ",
    "name_fr": "Telagh"
  },
  {
    "code": "2213",
    "wilaya_code": "22",
    "name_ar": "تلموني",
    "name_fr": "Tilmouni"
  },
  {
    "code": "2217",
    "wilaya_code": "22",
    "name_ar": "تنيرة",
    "name_fr": "Tenira"
  },
  {
    "code": "2252",
    "wilaya_code": "22",
    "name_ar": "حاسي دحو",
    "name_fr": "Hassi Dahou"
  },
  {
    "code": "2220",
    "wilaya_code": "22",
    "name_ar": "حاسي زهانة",
    "name_fr": "Hassi Zahana"
  },
  {
    "code": "2223",
    "wilaya_code": "22",
    "name_ar": "راس الماء",
    "name_fr": "Ras El Ma"
  },
  {
    "code": "2250",
    "wilaya_code": "22",
    "name_ar": "رجم دموش",
    "name_fr": "Redjem Demouche"
  },
  {
    "code": "2233",
    "wilaya_code": "22",
    "name_ar": "زروالة",
    "name_fr": "Zerouala"
  },
  {
    "code": "2229",
    "wilaya_code": "22",
    "name_ar": "سفيزف",
    "name_fr": "Sfisef"
  },
  {
    "code": "2203",
    "wilaya_code": "22",
    "name_ar": "سيدي ابراهيم",
    "name_fr": "Sidi Brahim"
  },
  {
    "code": "2201",
    "wilaya_code": "22",
    "name_ar": "سيدي بلعباس",
    "name_fr": "Sidi Bel-Abbes"
  },
  {
    "code": "2241",
    "wilaya_code": "22",
    "name_ar": "سيدي حمادوش",
    "name_fr": "Sidi Hamadouche"
  },
  {
    "code": "2227",
    "wilaya_code": "22",
    "name_ar": "سيدي خالد",
    "name_fr": "Sidi Khaled"
  },
  {
    "code": "2236",
    "wilaya_code": "22",
    "name_ar": "سيدي دحو الزاير",
    "name_fr": "Sidi Dahou Zairs"
  },
  {
    "code": "2235",
    "wilaya_code": "22",
    "name_ar": "سيدي شعيب",
    "name_fr": "Sidi Chaib"
  },
  {
    "code": "2246",
    "wilaya_code": "22",
    "name_ar": "سيدي علي بن يوب",
    "name_fr": "Sidi Ali Benyoub"
  },
  {
    "code": "2208",
    "wilaya_code": "22",
    "name_ar": "سيدي علي بوسيدي",
    "name_fr": "Sidi Ali Boussidi"
  },
  {
    "code": "2214",
    "wilaya_code": "22",
    "name_ar": "سيدي لحسن",
    "name_fr": "Sidi Lahcene"
  },
  {
    "code": "2240",
    "wilaya_code": "22",
    "name_ar": "سيدي يعقوب",
    "name_fr": "Sidi Yacoub"
  },
  {
    "code": "2247",
    "wilaya_code": "22",
    "name_ar": "شيطوان البلايلة",
    "name_fr": "Chetouane Belaila"
  },
  {
    "code": "2221",
    "wilaya_code": "22",
    "name_ar": "طابية",
    "name_fr": "Tabia"
  },
  {
    "code": "2230",
    "wilaya_code": "22",
    "name_ar": "عين أدن",
    "name_fr": "Ain- Adden"
  },
  {
    "code": "2228",
    "wilaya_code": "22",
    "name_ar": "عين البرد",
    "name_fr": "Ain El Berd"
  },
  {
    "code": "2215",
    "wilaya_code": "22",
    "name_ar": "عين الثريد",
    "name_fr": "Ain Thrid"
  },
  {
    "code": "2224",
    "wilaya_code": "22",
    "name_ar": "عين تندمين",
    "name_fr": "Ain Tindamine"
  },
  {
    "code": "2225",
    "wilaya_code": "22",
    "name_ar": "عين قادة",
    "name_fr": "Ain Kada"
  },
  {
    "code": "2234",
    "wilaya_code": "22",
    "name_ar": "لمطار",
    "name_fr": "Lamtar"
  },
  {
    "code": "2210",
    "wilaya_code": "22",
    "name_ar": "مرحوم",
    "name_fr": "Marhoum"
  },
  {
    "code": "2222",
    "wilaya_code": "22",
    "name_ar": "مرين",
    "name_fr": "Merine"
  },
  {
    "code": "2206",
    "wilaya_code": "22",
    "name_ar": "مزاورو",
    "name_fr": "Mezaourou"
  },
  {
    "code": "2226",
    "wilaya_code": "22",
    "name_ar": "مسيد",
    "name_fr": "M'cid"
  },
  {
    "code": "2204",
    "wilaya_code": "22",
    "name_ar": "مصطفى بن ابراهيم",
    "name_fr": "Mostefa Ben Brahim"
  },
  {
    "code": "2216",
    "wilaya_code": "22",
    "name_ar": "مكدرة",
    "name_fr": "Makedra"
  },
  {
    "code": "2218",
    "wilaya_code": "22",
    "name_ar": "مولاي سليسن",
    "name_fr": "Moulay Slissen"
  },
  {
    "code": "2237",
    "wilaya_code": "22",
    "name_ar": "وادي السبع",
    "name_fr": "Oued Sebaa"
  },
  {
    "code": "2231",
    "wilaya_code": "22",
    "name_ar": "وادي تاوريرة",
    "name_fr": "Oued Taourira"
  },
  {
    "code": "2243",
    "wilaya_code": "22",
    "name_ar": "وادي سفيون",
    "name_fr": "Oued Sefioun"
  },
  {
    "code": "2305",
    "wilaya_code": "23",
    "name_ar": "البوني",
    "name_fr": "El Bouni"
  },
  {
    "code": "2312",
    "wilaya_code": "23",
    "name_ar": "التريعات",
    "name_fr": "Treat"
  },
  {
    "code": "2303",
    "wilaya_code": "23",
    "name_ar": "الحجار",
    "name_fr": "El Hadjar"
  },
  {
    "code": "2307",
    "wilaya_code": "23",
    "name_ar": "الشرفة",
    "name_fr": "Cheurfa"
  },
  {
    "code": "2304",
    "wilaya_code": "23",
    "name_ar": "العلمة",
    "name_fr": "El Eulma"
  },
  {
    "code": "2302",
    "wilaya_code": "23",
    "name_ar": "برحال",
    "name_fr": "Berrahal"
  },
  {
    "code": "2308",
    "wilaya_code": "23",
    "name_ar": "سرايدي",
    "name_fr": "Seraidi"
  },
  {
    "code": "2311",
    "wilaya_code": "23",
    "name_ar": "سيدي عمار",
    "name_fr": "Sidi Amar"
  },
  {
    "code": "2310",
    "wilaya_code": "23",
    "name_ar": "شطايبي",
    "name_fr": "Chetaibi"
  },
  {
    "code": "2301",
    "wilaya_code": "23",
    "name_ar": "عنابة",
    "name_fr": "Annaba"
  },
  {
    "code": "2309",
    "wilaya_code": "23",
    "name_ar": "عين الباردة",
    "name_fr": "Ain El Berda"
  },
  {
    "code": "2306",
    "wilaya_code": "23",
    "name_ar": "واد العنب",
    "name_fr": "Oued El Aneb"
  },
  {
    "code": "2409",
    "wilaya_code": "24",
    "name_ar": "الدهوارة",
    "name_fr": "Dahouara"
  },
  {
    "code": "2428",
    "wilaya_code": "24",
    "name_ar": "الركنية",
    "name_fr": "Roknia"
  },
  {
    "code": "2420",
    "wilaya_code": "24",
    "name_ar": "الفجوج",
    "name_fr": "El Fedjoudj"
  },
  {
    "code": "2421",
    "wilaya_code": "24",
    "name_ar": "برج صباط",
    "name_fr": "Bordj Sabath"
  },
  {
    "code": "2410",
    "wilaya_code": "24",
    "name_ar": "بلخير",
    "name_fr": "Belkheir"
  },
  {
    "code": "2411",
    "wilaya_code": "24",
    "name_ar": "بن جراح",
    "name_fr": "Bendjarah"
  },
  {
    "code": "2416",
    "wilaya_code": "24",
    "name_ar": "بني مزلين",
    "name_fr": "Beni Mezline"
  },
  {
    "code": "2417",
    "wilaya_code": "24",
    "name_ar": "بوحشانة",
    "name_fr": "Bou Hachana"
  },
  {
    "code": "2412",
    "wilaya_code": "24",
    "name_ar": "بوحمدان",
    "name_fr": "Bou Hamdane"
  },
  {
    "code": "2425",
    "wilaya_code": "24",
    "name_ar": "بوشقوف",
    "name_fr": "Bouchegouf"
  },
  {
    "code": "2403",
    "wilaya_code": "24",
    "name_ar": "بوعاتي محمود",
    "name_fr": "Bouati Mahmoud"
  },
  {
    "code": "2431",
    "wilaya_code": "24",
    "name_ar": "بومهرة أحمد",
    "name_fr": "Boumahra Ahmed"
  },
  {
    "code": "2405",
    "wilaya_code": "24",
    "name_ar": "تاملوكة",
    "name_fr": "Tamlouka"
  },
  {
    "code": "2434",
    "wilaya_code": "24",
    "name_ar": "جبالة الخميسي",
    "name_fr": "Djeballah Khemissi"
  },
  {
    "code": "2422",
    "wilaya_code": "24",
    "name_ar": "حمام النبايل",
    "name_fr": "Hammam N'bail"
  },
  {
    "code": "2419",
    "wilaya_code": "24",
    "name_ar": "حمام دباغ",
    "name_fr": "Hammam Debagh"
  },
  {
    "code": "2408",
    "wilaya_code": "24",
    "name_ar": "رأس العقبة",
    "name_fr": "Ras El Agba"
  },
  {
    "code": "2429",
    "wilaya_code": "24",
    "name_ar": "سلاوة عنونة",
    "name_fr": "Sellaoua Announa"
  },
  {
    "code": "2423",
    "wilaya_code": "24",
    "name_ar": "عين العربي",
    "name_fr": "Ain Larbi"
  },
  {
    "code": "2414",
    "wilaya_code": "24",
    "name_ar": "عين بن بيضاء",
    "name_fr": "Ain Ben Beida"
  },
  {
    "code": "2432",
    "wilaya_code": "24",
    "name_ar": "عين رقادة",
    "name_fr": "Ain Regada"
  },
  {
    "code": "2407",
    "wilaya_code": "24",
    "name_ar": "عين صندل",
    "name_fr": "Ain Sandel"
  },
  {
    "code": "2413",
    "wilaya_code": "24",
    "name_ar": "عين مخلوف",
    "name_fr": "Ain Makhlouf"
  },
  {
    "code": "2401",
    "wilaya_code": "24",
    "name_ar": "قالمة",
    "name_fr": "Guelma"
  },
  {
    "code": "2418",
    "wilaya_code": "24",
    "name_ar": "قلعة بوصبع",
    "name_fr": "Guelaat Bou Sbaa"
  },
  {
    "code": "2415",
    "wilaya_code": "24",
    "name_ar": "لخزارة",
    "name_fr": "Khezaras"
  },
  {
    "code": "2430",
    "wilaya_code": "24",
    "name_ar": "مجاز الصفاء",
    "name_fr": "Medjez Sfa"
  },
  {
    "code": "2424",
    "wilaya_code": "24",
    "name_ar": "مجاز عمار",
    "name_fr": "Medjez Amar"
  },
  {
    "code": "2402",
    "wilaya_code": "24",
    "name_ar": "نشماية",
    "name_fr": "Nechmaya"
  },
  {
    "code": "2427",
    "wilaya_code": "24",
    "name_ar": "هواري بومدين",
    "name_fr": "Houari Boumedienne"
  },
  {
    "code": "2426",
    "wilaya_code": "24",
    "name_ar": "هيليوبوليس",
    "name_fr": "Heliopolis"
  },
  {
    "code": "2404",
    "wilaya_code": "24",
    "name_ar": "وادي الزناتي",
    "name_fr": "Oued Zenati"
  },
  {
    "code": "2433",
    "wilaya_code": "24",
    "name_ar": "وادي الشحم",
    "name_fr": "Oued Cheham"
  },
  {
    "code": "2406",
    "wilaya_code": "24",
    "name_ar": "وادي فراغة",
    "name_fr": "Oued Ferragha"
  },
  {
    "code": "2503",
    "wilaya_code": "25",
    "name_ar": "ابن باديس",
    "name_fr": "Ben Badis"
  },
  {
    "code": "2512",
    "wilaya_code": "25",
    "name_ar": "ابن زياد",
    "name_fr": "Ibn Ziad"
  },
  {
    "code": "2506",
    "wilaya_code": "25",
    "name_ar": "الخروب",
    "name_fr": "El Khroub"
  },
  {
    "code": "2509",
    "wilaya_code": "25",
    "name_ar": "أولاد رحمون",
    "name_fr": "Ouled Rahmoun"
  },
  {
    "code": "2508",
    "wilaya_code": "25",
    "name_ar": "بني حميدان",
    "name_fr": "Beni Hamidane"
  },
  {
    "code": "2511",
    "wilaya_code": "25",
    "name_ar": "بوجريو مسعود",
    "name_fr": "Messaoud Boudjeriou"
  },
  {
    "code": "2502",
    "wilaya_code": "25",
    "name_ar": "حامة بوزيان",
    "name_fr": "Hamma Bouziane"
  },
  {
    "code": "2505",
    "wilaya_code": "25",
    "name_ar": "ديدوش مراد",
    "name_fr": "Didouche Mourad"
  },
  {
    "code": "2504",
    "wilaya_code": "25",
    "name_ar": "زيغود يوسف",
    "name_fr": "Zighoud Youcef"
  },
  {
    "code": "2510",
    "wilaya_code": "25",
    "name_ar": "عين السمارة",
    "name_fr": "Ain Smara"
  },
  {
    "code": "2507",
    "wilaya_code": "25",
    "name_ar": "عين عبيد",
    "name_fr": "Ain Abid"
  },
  {
    "code": "2501",
    "wilaya_code": "25",
    "name_ar": "قسنطينة",
    "name_fr": "Constantine"
  },
  {
    "code": "2647",
    "wilaya_code": "26",
    "name_ar": "البرواقية",
    "name_fr": "Berrouaghia"
  },
  {
    "code": "2616",
    "wilaya_code": "26",
    "name_ar": "الحمدانية",
    "name_fr": "El Hamdania"
  },
  {
    "code": "2653",
    "wilaya_code": "26",
    "name_ar": "الحوضان",
    "name_fr": "El Haoudane"
  },
  {
    "code": "2620",
    "wilaya_code": "26",
    "name_ar": "الربعية",
    "name_fr": "Rebaia"
  },
  {
    "code": "2634",
    "wilaya_code": "26",
    "name_ar": "الزبيرية",
    "name_fr": "Zoubiria"
  },
  {
    "code": "2633",
    "wilaya_code": "26",
    "name_ar": "السواقي",
    "name_fr": "Souagui"
  },
  {
    "code": "2636",
    "wilaya_code": "26",
    "name_ar": "العزيزية",
    "name_fr": "El Azizia"
  },
  {
    "code": "2607",
    "wilaya_code": "26",
    "name_ar": "العمارية",
    "name_fr": "El Omaria"
  },
  {
    "code": "2605",
    "wilaya_code": "26",
    "name_ar": "العيساوية",
    "name_fr": "Aissaouia"
  },
  {
    "code": "2609",
    "wilaya_code": "26",
    "name_ar": "القلب الكبير",
    "name_fr": "El Guelbelkebir"
  },
  {
    "code": "2601",
    "wilaya_code": "26",
    "name_ar": "المدية",
    "name_fr": "Medea"
  },
  {
    "code": "2612",
    "wilaya_code": "26",
    "name_ar": "أولاد إبراهيم",
    "name_fr": "Ouled Brahim"
  },
  {
    "code": "2627",
    "wilaya_code": "26",
    "name_ar": "أولاد بوعشرة",
    "name_fr": "Ouled Bouachra"
  },
  {
    "code": "2606",
    "wilaya_code": "26",
    "name_ar": "أولاد دايد",
    "name_fr": "Ouled Deid"
  },
  {
    "code": "2656",
    "wilaya_code": "26",
    "name_ar": "بئر بن عابد",
    "name_fr": "Bir Ben Laabed"
  },
  {
    "code": "2624",
    "wilaya_code": "26",
    "name_ar": "بعطة",
    "name_fr": "Baata"
  },
  {
    "code": "2630",
    "wilaya_code": "26",
    "name_ar": "بن شكاو",
    "name_fr": "Ben Chicao"
  },
  {
    "code": "2646",
    "wilaya_code": "26",
    "name_ar": "بني سليمان",
    "name_fr": "Beni Slimane"
  },
  {
    "code": "2619",
    "wilaya_code": "26",
    "name_ar": "بوسكن",
    "name_fr": "Bouskene"
  },
  {
    "code": "2621",
    "wilaya_code": "26",
    "name_ar": "بوشراحيل",
    "name_fr": "Bouchrahil"
  },
  {
    "code": "2659",
    "wilaya_code": "26",
    "name_ar": "بوعيشون",
    "name_fr": "Bouaichoune"
  },
  {
    "code": "2652",
    "wilaya_code": "26",
    "name_ar": "تابلاط",
    "name_fr": "Tablat"
  },
  {
    "code": "2615",
    "wilaya_code": "26",
    "name_ar": "تمسقيدة",
    "name_fr": "Tamesguida"
  },
  {
    "code": "2613",
    "wilaya_code": "26",
    "name_ar": "تيزي مهدي",
    "name_fr": "Tizi Mahdi"
  },
  {
    "code": "2645",
    "wilaya_code": "26",
    "name_ar": "ثلاث دوائر",
    "name_fr": "Tletat Ed Douair"
  },
  {
    "code": "2637",
    "wilaya_code": "26",
    "name_ar": "جواب",
    "name_fr": "Djouab"
  },
  {
    "code": "2660",
    "wilaya_code": "26",
    "name_ar": "حناشة",
    "name_fr": "Hannacha"
  },
  {
    "code": "2663",
    "wilaya_code": "26",
    "name_ar": "خمس جوامع",
    "name_fr": "Khams Djouamaa"
  },
  {
    "code": "2654",
    "wilaya_code": "26",
    "name_ar": "ذراع السمار",
    "name_fr": "Draa Esmar"
  },
  {
    "code": "2661",
    "wilaya_code": "26",
    "name_ar": "سدراية",
    "name_fr": "Sedraya"
  },
  {
    "code": "2648",
    "wilaya_code": "26",
    "name_ar": "سغوان",
    "name_fr": "Seghouane"
  },
  {
    "code": "2644",
    "wilaya_code": "26",
    "name_ar": "سي المحجوب",
    "name_fr": "Si Mahdjoub"
  },
  {
    "code": "2655",
    "wilaya_code": "26",
    "name_ar": "سيدي الربيع",
    "name_fr": "Sidi Rabie"
  },
  {
    "code": "2628",
    "wilaya_code": "26",
    "name_ar": "سيدي زهار",
    "name_fr": "Sidi Zahar"
  },
  {
    "code": "2614",
    "wilaya_code": "26",
    "name_ar": "سيدي زيان",
    "name_fr": "Sidi Ziane"
  },
  {
    "code": "2626",
    "wilaya_code": "26",
    "name_ar": "سيدي نعمان",
    "name_fr": "Sidi Naamane"
  },
  {
    "code": "2643",
    "wilaya_code": "26",
    "name_ar": "عوامري",
    "name_fr": "Ouamri"
  },
  {
    "code": "2662",
    "wilaya_code": "26",
    "name_ar": "مجبر",
    "name_fr": "Medjebar"
  },
  {
    "code": "2611",
    "wilaya_code": "26",
    "name_ar": "مزغنة",
    "name_fr": "Mezerana"
  },
  {
    "code": "2639",
    "wilaya_code": "26",
    "name_ar": "مغراوة",
    "name_fr": "Maghraoua"
  },
  {
    "code": "2650",
    "wilaya_code": "26",
    "name_ar": "ميهوب",
    "name_fr": "Mihoub"
  },
  {
    "code": "2629",
    "wilaya_code": "26",
    "name_ar": "وادي حربيل",
    "name_fr": "Oued Harbil"
  },
  {
    "code": "2602",
    "wilaya_code": "26",
    "name_ar": "وزرة",
    "name_fr": "Ouzera"
  },
  {
    "code": "2732",
    "wilaya_code": "27",
    "name_ar": "الحسيان (بني ياحي",
    "name_fr": "Hassiane"
  },
  {
    "code": "2724",
    "wilaya_code": "27",
    "name_ar": "السوافلية",
    "name_fr": "Souaflia"
  },
  {
    "code": "2731",
    "wilaya_code": "27",
    "name_ar": "الطواهرية",
    "name_fr": "Touahria"
  },
  {
    "code": "2725",
    "wilaya_code": "27",
    "name_ar": "أولاد بوغالم",
    "name_fr": "Ouled Boughalem"
  },
  {
    "code": "2726",
    "wilaya_code": "27",
    "name_ar": "أولاد مع الله",
    "name_fr": "Ouled-Maalah"
  },
  {
    "code": "2713",
    "wilaya_code": "27",
    "name_ar": "بن عبد المالك رمضان",
    "name_fr": "Benabdelmalek Ramdane"
  },
  {
    "code": "2719",
    "wilaya_code": "27",
    "name_ar": "بوقيراط",
    "name_fr": "Bouguirat"
  },
  {
    "code": "2729",
    "wilaya_code": "27",
    "name_ar": "تزقايت",
    "name_fr": "Tazgait"
  },
  {
    "code": "2706",
    "wilaya_code": "27",
    "name_ar": "حاسي ماماش",
    "name_fr": "Hassi Mameche"
  },
  {
    "code": "2714",
    "wilaya_code": "27",
    "name_ar": "حجاج",
    "name_fr": "Hadjadj"
  },
  {
    "code": "2718",
    "wilaya_code": "27",
    "name_ar": "خضرة",
    "name_fr": "Khadra"
  },
  {
    "code": "2711",
    "wilaya_code": "27",
    "name_ar": "خير الدين",
    "name_fr": "Kheir-Eddine"
  },
  {
    "code": "2704",
    "wilaya_code": "27",
    "name_ar": "ستيدية",
    "name_fr": "Stidia"
  },
  {
    "code": "2708",
    "wilaya_code": "27",
    "name_ar": "سور",
    "name_fr": "Sour"
  },
  {
    "code": "2710",
    "wilaya_code": "27",
    "name_ar": "سيدي بلعطار",
    "name_fr": "Sidi Belaattar"
  },
  {
    "code": "2712",
    "wilaya_code": "27",
    "name_ar": "سيدي علي",
    "name_fr": "Sidi Ali"
  },
  {
    "code": "2716",
    "wilaya_code": "27",
    "name_ar": "سيدي لخضر",
    "name_fr": "Sidi-Lakhdar"
  },
  {
    "code": "2720",
    "wilaya_code": "27",
    "name_ar": "سيرات",
    "name_fr": "Sirat"
  },
  {
    "code": "2730",
    "wilaya_code": "27",
    "name_ar": "صفصاف",
    "name_fr": "Safsaf"
  },
  {
    "code": "2702",
    "wilaya_code": "27",
    "name_ar": "صيادة",
    "name_fr": "Sayada"
  },
  {
    "code": "2717",
    "wilaya_code": "27",
    "name_ar": "عشعاشة",
    "name_fr": "Achaacha"
  },
  {
    "code": "2728",
    "wilaya_code": "27",
    "name_ar": "عين بودينار",
    "name_fr": "Ain-Boudinar"
  },
  {
    "code": "2707",
    "wilaya_code": "27",
    "name_ar": "عين تادلس",
    "name_fr": "Ain-Tedles"
  },
  {
    "code": "2721",
    "wilaya_code": "27",
    "name_ar": "عين سيدي الشريف",
    "name_fr": "Ain-Sidi Cherif"
  },
  {
    "code": "2705",
    "wilaya_code": "27",
    "name_ar": "عين نويسي",
    "name_fr": "Ain-Nouissy"
  },
  {
    "code": "2703",
    "wilaya_code": "27",
    "name_ar": "فرناقة",
    "name_fr": "Fornaka"
  },
  {
    "code": "2722",
    "wilaya_code": "27",
    "name_ar": "ماسرة",
    "name_fr": "Mesra"
  },
  {
    "code": "2727",
    "wilaya_code": "27",
    "name_ar": "مزغران",
    "name_fr": "Mazagran"
  },
  {
    "code": "2701",
    "wilaya_code": "27",
    "name_ar": "مستغانم",
    "name_fr": "Mostaganem"
  },
  {
    "code": "2723",
    "wilaya_code": "27",
    "name_ar": "منصورة",
    "name_fr": "Mansourah"
  },
  {
    "code": "2715",
    "wilaya_code": "27",
    "name_ar": "نكمارية",
    "name_fr": "Nekmaria"
  },
  {
    "code": "2709",
    "wilaya_code": "27",
    "name_ar": "وادي الخير",
    "name_fr": "Oued El Kheir"
  },
  {
    "code": "2840",
    "wilaya_code": "28",
    "name_ar": "السوامع",
    "name_fr": "Souamaa"
  },
  {
    "code": "2801",
    "wilaya_code": "28",
    "name_ar": "المسيلة",
    "name_fr": "M'sila"
  },
  {
    "code": "2806",
    "wilaya_code": "28",
    "name_ar": "المطارفة",
    "name_fr": "M'tarfa"
  },
  {
    "code": "2802",
    "wilaya_code": "28",
    "name_ar": "المعاضيد",
    "name_fr": "Maadid"
  },
  {
    "code": "2804",
    "wilaya_code": "28",
    "name_ar": "أولاد دراج",
    "name_fr": "Ouled Derradj"
  },
  {
    "code": "2814",
    "wilaya_code": "28",
    "name_ar": "أولاد عدي لقبالة",
    "name_fr": "Ouled Addi Guebala"
  },
  {
    "code": "2810",
    "wilaya_code": "28",
    "name_ar": "أولاد ماضي",
    "name_fr": "Ouled Madhi"
  },
  {
    "code": "2828",
    "wilaya_code": "28",
    "name_ar": "أولاد منصور",
    "name_fr": "Ouled Mansour"
  },
  {
    "code": "2812",
    "wilaya_code": "28",
    "name_ar": "برهوم",
    "name_fr": "Berhoum"
  },
  {
    "code": "2815",
    "wilaya_code": "28",
    "name_ar": "بلعايبة",
    "name_fr": "Belaiba"
  },
  {
    "code": "2845",
    "wilaya_code": "28",
    "name_ar": "بني يلمان",
    "name_fr": "Beni Ilmane"
  },
  {
    "code": "2831",
    "wilaya_code": "28",
    "name_ar": "بوطي السايح",
    "name_fr": "Bouti Sayeh"
  },
  {
    "code": "2805",
    "wilaya_code": "28",
    "name_ar": "تارمونت",
    "name_fr": "Tarmount"
  },
  {
    "code": "2803",
    "wilaya_code": "28",
    "name_ar": "حمام الضلعة",
    "name_fr": "Hammam Dalaa"
  },
  {
    "code": "2832",
    "wilaya_code": "28",
    "name_ar": "خطوطي سد الجير",
    "name_fr": "Khettouti Sed-El-Jir"
  },
  {
    "code": "2830",
    "wilaya_code": "28",
    "name_ar": "دهاهنة",
    "name_fr": "Dehahna"
  },
  {
    "code": "2816",
    "wilaya_code": "28",
    "name_ar": "سيدي عيسى",
    "name_fr": "Sidi Aissa"
  },
  {
    "code": "2818",
    "wilaya_code": "28",
    "name_ar": "سيدي هجرس",
    "name_fr": "Sidi Hadjeres"
  },
  {
    "code": "2809",
    "wilaya_code": "28",
    "name_ar": "شلال",
    "name_fr": "Chellal"
  },
  {
    "code": "2817",
    "wilaya_code": "28",
    "name_ar": "عين الحجل",
    "name_fr": "Ain El Hadjel"
  },
  {
    "code": "2813",
    "wilaya_code": "28",
    "name_ar": "عين الخضراء",
    "name_fr": "Ain Khadra"
  },
  {
    "code": "2829",
    "wilaya_code": "28",
    "name_ar": "معاريف",
    "name_fr": "Maarif"
  },
  {
    "code": "2811",
    "wilaya_code": "28",
    "name_ar": "مقرة",
    "name_fr": "Magra"
  },
  {
    "code": "2819",
    "wilaya_code": "28",
    "name_ar": "ونوغة",
    "name_fr": "Ouanougha"
  },
  {
    "code": "2917",
    "wilaya_code": "29",
    "name_ar": "البرج",
    "name_fr": "El Bordj"
  },
  {
    "code": "2907",
    "wilaya_code": "29",
    "name_ar": "الحشم",
    "name_fr": "El Hachem"
  },
  {
    "code": "2947",
    "wilaya_code": "29",
    "name_ar": "السهايلية",
    "name_fr": "Sehailia"
  },
  {
    "code": "2943",
    "wilaya_code": "29",
    "name_ar": "الشرفاء",
    "name_fr": "Chorfa"
  },
  {
    "code": "2928",
    "wilaya_code": "29",
    "name_ar": "العلايمية",
    "name_fr": "Alaimia"
  },
  {
    "code": "2934",
    "wilaya_code": "29",
    "name_ar": "الغمري",
    "name_fr": "El Ghomri"
  },
  {
    "code": "2940",
    "wilaya_code": "29",
    "name_ar": "القرط",
    "name_fr": "El Keurt"
  },
  {
    "code": "2938",
    "wilaya_code": "29",
    "name_ar": "القطنة",
    "name_fr": "El Gueitena"
  },
  {
    "code": "2929",
    "wilaya_code": "29",
    "name_ar": "القعدة",
    "name_fr": "El Gaada"
  },
  {
    "code": "2939",
    "wilaya_code": "29",
    "name_ar": "المأمونية",
    "name_fr": "El Mamounia"
  },
  {
    "code": "2931",
    "wilaya_code": "29",
    "name_ar": "المحمدية",
    "name_fr": "Mohammadia"
  },
  {
    "code": "2914",
    "wilaya_code": "29",
    "name_ar": "المطمور",
    "name_fr": "Matemore"
  },
  {
    "code": "2921",
    "wilaya_code": "29",
    "name_ar": "المنور",
    "name_fr": "El Menaouer"
  },
  {
    "code": "2919",
    "wilaya_code": "29",
    "name_ar": "بنيان",
    "name_fr": "Benian"
  },
  {
    "code": "2902",
    "wilaya_code": "29",
    "name_ar": "بوحنيفية",
    "name_fr": "Bouhanifia"
  },
  {
    "code": "2937",
    "wilaya_code": "29",
    "name_ar": "بوهني",
    "name_fr": "Bou Henni"
  },
  {
    "code": "2903",
    "wilaya_code": "29",
    "name_ar": "تيزي",
    "name_fr": "Tizi"
  },
  {
    "code": "2906",
    "wilaya_code": "29",
    "name_ar": "تيغنيف",
    "name_fr": "Tighennif"
  },
  {
    "code": "2904",
    "wilaya_code": "29",
    "name_ar": "حسين",
    "name_fr": "Hacine"
  },
  {
    "code": "2920",
    "wilaya_code": "29",
    "name_ar": "خلوية",
    "name_fr": "Khalouia"
  },
  {
    "code": "2944",
    "wilaya_code": "29",
    "name_ar": "رأس عين عميروش",
    "name_fr": "Ras El Ain Amirouche"
  },
  {
    "code": "2909",
    "wilaya_code": "29",
    "name_ar": "زلامطة",
    "name_fr": "Zelamta"
  },
  {
    "code": "2930",
    "wilaya_code": "29",
    "name_ar": "زهانة",
    "name_fr": "Zahana"
  },
  {
    "code": "2935",
    "wilaya_code": "29",
    "name_ar": "سجرارة",
    "name_fr": "Sedjerara"
  },
  {
    "code": "2916",
    "wilaya_code": "29",
    "name_ar": "سيدي بوسعيد",
    "name_fr": "Sidi Boussaid"
  },
  {
    "code": "2946",
    "wilaya_code": "29",
    "name_ar": "سيدي عبد الجبار",
    "name_fr": "Sidi Abdeldjebar"
  },
  {
    "code": "2932",
    "wilaya_code": "29",
    "name_ar": "سيدي عبد المومن",
    "name_fr": "Sidi Abdelmoumene"
  },
  {
    "code": "2908",
    "wilaya_code": "29",
    "name_ar": "سيدي قادة",
    "name_fr": "Sidi Kada"
  },
  {
    "code": "2926",
    "wilaya_code": "29",
    "name_ar": "سيق",
    "name_fr": "Sig"
  },
  {
    "code": "2927",
    "wilaya_code": "29",
    "name_ar": "عقاز",
    "name_fr": "Oggaz"
  },
  {
    "code": "2923",
    "wilaya_code": "29",
    "name_ar": "عوف",
    "name_fr": "Aouf"
  },
  {
    "code": "2925",
    "wilaya_code": "29",
    "name_ar": "عين أفرص",
    "name_fr": "Ain Frass"
  },
  {
    "code": "2924",
    "wilaya_code": "29",
    "name_ar": "عين فارس",
    "name_fr": "Ain Fares"
  },
  {
    "code": "2911",
    "wilaya_code": "29",
    "name_ar": "عين فراح",
    "name_fr": "Ain Ferah"
  },
  {
    "code": "2918",
    "wilaya_code": "29",
    "name_ar": "عين فكان",
    "name_fr": "Ain Fekan"
  },
  {
    "code": "2941",
    "wilaya_code": "29",
    "name_ar": "غروس",
    "name_fr": "Gharrous"
  },
  {
    "code": "2912",
    "wilaya_code": "29",
    "name_ar": "غريس",
    "name_fr": "Ghriss"
  },
  {
    "code": "2933",
    "wilaya_code": "29",
    "name_ar": "فراقيق",
    "name_fr": "Ferraguig"
  },
  {
    "code": "2913",
    "wilaya_code": "29",
    "name_ar": "فروحة",
    "name_fr": "Froha"
  },
  {
    "code": "2942",
    "wilaya_code": "29",
    "name_ar": "قرجوم",
    "name_fr": "Guerdjoum"
  },
  {
    "code": "2915",
    "wilaya_code": "29",
    "name_ar": "ماقضة",
    "name_fr": "Makhda"
  },
  {
    "code": "2905",
    "wilaya_code": "29",
    "name_ar": "ماوسة",
    "name_fr": "Maoussa"
  },
  {
    "code": "2901",
    "wilaya_code": "29",
    "name_ar": "معسكر",
    "name_fr": "Mascara"
  },
  {
    "code": "2936",
    "wilaya_code": "29",
    "name_ar": "مقطع الدوز",
    "name_fr": "Mocta-Douz"
  },
  {
    "code": "2945",
    "wilaya_code": "29",
    "name_ar": "نسمط",
    "name_fr": "Nesmot"
  },
  {
    "code": "2910",
    "wilaya_code": "29",
    "name_ar": "وادي الأبطال",
    "name_fr": "Oued El Abtal"
  },
  {
    "code": "2922",
    "wilaya_code": "29",
    "name_ar": "وادي التاغية",
    "name_fr": "Oued Taria"
  },
  {
    "code": "3021",
    "wilaya_code": "30",
    "name_ar": "البرمة",
    "name_fr": "El Borma"
  },
  {
    "code": "3005",
    "wilaya_code": "30",
    "name_ar": "الرويسات",
    "name_fr": "Rouissat"
  },
  {
    "code": "3003",
    "wilaya_code": "30",
    "name_ar": "انقوسة",
    "name_fr": "N'goussa"
  },
  {
    "code": "3012",
    "wilaya_code": "30",
    "name_ar": "حاسي بن عبد الله",
    "name_fr": "Hassi Ben Abdellah"
  },
  {
    "code": "3004",
    "wilaya_code": "30",
    "name_ar": "حاسي مسعود",
    "name_fr": "Hassi Messaoud"
  },
  {
    "code": "3011",
    "wilaya_code": "30",
    "name_ar": "سيدي خويلد",
    "name_fr": "Sidi Khouiled"
  },
  {
    "code": "3002",
    "wilaya_code": "30",
    "name_ar": "عين البيضاء",
    "name_fr": "Ain Beida"
  },
  {
    "code": "3001",
    "wilaya_code": "30",
    "name_ar": "ورقلة",
    "name_fr": "Ouargla"
  },
  {
    "code": "3106",
    "wilaya_code": "31",
    "name_ar": "أرزيو",
    "name_fr": "Arzew"
  },
  {
    "code": "3118",
    "wilaya_code": "31",
    "name_ar": "البراية",
    "name_fr": "El Braya"
  },
  {
    "code": "3105",
    "wilaya_code": "31",
    "name_ar": "السانية",
    "name_fr": "Es Senia"
  },
  {
    "code": "3110",
    "wilaya_code": "31",
    "name_ar": "العنصر",
    "name_fr": "El Ancor"
  },
  {
    "code": "3117",
    "wilaya_code": "31",
    "name_ar": "الكرمة",
    "name_fr": "El Kerma"
  },
  {
    "code": "3115",
    "wilaya_code": "31",
    "name_ar": "المرسى الكبير",
    "name_fr": "Mers El Kebir"
  },
  {
    "code": "3103",
    "wilaya_code": "31",
    "name_ar": "بئر الجير",
    "name_fr": "Bir El Djir"
  },
  {
    "code": "3107",
    "wilaya_code": "31",
    "name_ar": "بطيوة",
    "name_fr": "Bethioua"
  },
  {
    "code": "3120",
    "wilaya_code": "31",
    "name_ar": "بن فريحة",
    "name_fr": "Ben Freha"
  },
  {
    "code": "3124",
    "wilaya_code": "31",
    "name_ar": "بوتليليس",
    "name_fr": "Boutlelis"
  },
  {
    "code": "3116",
    "wilaya_code": "31",
    "name_ar": "بوسفر",
    "name_fr": "Bousfer"
  },
  {
    "code": "3114",
    "wilaya_code": "31",
    "name_ar": "بوفاتيس",
    "name_fr": "Boufatis"
  },
  {
    "code": "3119",
    "wilaya_code": "31",
    "name_ar": "حاسي بن عقبة",
    "name_fr": "Hassi Ben Okba"
  },
  {
    "code": "3104",
    "wilaya_code": "31",
    "name_ar": "حاسي بونيف",
    "name_fr": "Hassi Bounif"
  },
  {
    "code": "3121",
    "wilaya_code": "31",
    "name_ar": "حاسي مفسوخ",
    "name_fr": "Hassi Mefsoukh"
  },
  {
    "code": "3113",
    "wilaya_code": "31",
    "name_ar": "سيدي الشحمي",
    "name_fr": "Sidi Chami"
  },
  {
    "code": "3122",
    "wilaya_code": "31",
    "name_ar": "سيدي بن يبقى",
    "name_fr": "Sidi Ben Yebka"
  },
  {
    "code": "3112",
    "wilaya_code": "31",
    "name_ar": "طفراوي",
    "name_fr": "Tafraoui"
  },
  {
    "code": "3126",
    "wilaya_code": "31",
    "name_ar": "عين البية",
    "name_fr": "Ain Biya"
  },
  {
    "code": "3109",
    "wilaya_code": "31",
    "name_ar": "عين الترك",
    "name_fr": "Ain Turk"
  },
  {
    "code": "3125",
    "wilaya_code": "31",
    "name_ar": "عين الكرمة",
    "name_fr": "Ain Kerma"
  },
  {
    "code": "3102",
    "wilaya_code": "31",
    "name_ar": "قديل",
    "name_fr": "Gdyel"
  },
  {
    "code": "3108",
    "wilaya_code": "31",
    "name_ar": "مرسى الحجاج",
    "name_fr": "Marsat El Hadjadj"
  },
  {
    "code": "3123",
    "wilaya_code": "31",
    "name_ar": "مسرغين",
    "name_fr": "Messerghin"
  },
  {
    "code": "3111",
    "wilaya_code": "31",
    "name_ar": "وادي تليلات",
    "name_fr": "Oued Tlelat"
  },
  {
    "code": "3101",
    "wilaya_code": "31",
    "name_ar": "وهران",
    "name_fr": "Oran"
  },
  {
    "code": "3201",
    "wilaya_code": "32",
    "name_ar": "البيض",
    "name_fr": "El Bayadh"
  },
  {
    "code": "3211",
    "wilaya_code": "32",
    "name_ar": "الخيثر",
    "name_fr": "El Kheiter"
  },
  {
    "code": "3217",
    "wilaya_code": "32",
    "name_ar": "الشقيق",
    "name_fr": "Cheguig"
  },
  {
    "code": "3205",
    "wilaya_code": "32",
    "name_ar": "الغاسول",
    "name_fr": "Ghassoul"
  },
  {
    "code": "3212",
    "wilaya_code": "32",
    "name_ar": "الكاف الأحمر",
    "name_fr": "Kef El Ahmar"
  },
  {
    "code": "3204",
    "wilaya_code": "32",
    "name_ar": "بريزينة",
    "name_fr": "Brezina"
  },
  {
    "code": "3206",
    "wilaya_code": "32",
    "name_ar": "بوعلام",
    "name_fr": "Boualem"
  },
  {
    "code": "3210",
    "wilaya_code": "32",
    "name_ar": "بوقطب",
    "name_fr": "Bougtoub"
  },
  {
    "code": "3220",
    "wilaya_code": "32",
    "name_ar": "توسمولين",
    "name_fr": "Tousmouline"
  },
  {
    "code": "3202",
    "wilaya_code": "32",
    "name_ar": "رقاصة",
    "name_fr": "Rogassa"
  },
  {
    "code": "3203",
    "wilaya_code": "32",
    "name_ar": "ستيتن",
    "name_fr": "Stitten"
  },
  {
    "code": "3221",
    "wilaya_code": "32",
    "name_ar": "سيدي سليمان",
    "name_fr": "Sidi Slimane"
  },
  {
    "code": "3222",
    "wilaya_code": "32",
    "name_ar": "سيدي طيفور",
    "name_fr": "Sidi Tiffour"
  },
  {
    "code": "3218",
    "wilaya_code": "32",
    "name_ar": "سيدي عامر",
    "name_fr": "Sidi Ameur"
  },
  {
    "code": "3215",
    "wilaya_code": "32",
    "name_ar": "كراكدة",
    "name_fr": "Krakda"
  },
  {
    "code": "3306",
    "wilaya_code": "33",
    "name_ar": "إن أمناس",
    "name_fr": "In Amenas"
  },
  {
    "code": "3301",
    "wilaya_code": "33",
    "name_ar": "إيليزي",
    "name_fr": "Illizi"
  },
  {
    "code": "3304",
    "wilaya_code": "33",
    "name_ar": "برج عمر إدريس",
    "name_fr": "Bordj Omar Driss"
  },
  {
    "code": "3303",
    "wilaya_code": "33",
    "name_ar": "دبداب",
    "name_fr": "Debdeb"
  },
  {
    "code": "3411",
    "wilaya_code": "34",
    "name_ar": "الحمادية",
    "name_fr": "Elhammadia"
  },
  {
    "code": "3433",
    "wilaya_code": "34",
    "name_ar": "الرابطة",
    "name_fr": "Rabta"
  },
  {
    "code": "3427",
    "wilaya_code": "34",
    "name_ar": "العش",
    "name_fr": "El Euch"
  },
  {
    "code": "3428",
    "wilaya_code": "34",
    "name_ar": "العناصر",
    "name_fr": "El Annasseur"
  },
  {
    "code": "3422",
    "wilaya_code": "34",
    "name_ar": "القصور",
    "name_fr": "Ksour"
  },
  {
    "code": "3425",
    "wilaya_code": "34",
    "name_ar": "القلة",
    "name_fr": "Colla"
  },
  {
    "code": "3416",
    "wilaya_code": "34",
    "name_ar": "الماين",
    "name_fr": "El Main"
  },
  {
    "code": "3404",
    "wilaya_code": "34",
    "name_ar": "المنصورة",
    "name_fr": "Mansoura"
  },
  {
    "code": "3405",
    "wilaya_code": "34",
    "name_ar": "المهير",
    "name_fr": "El M'hir"
  },
  {
    "code": "3407",
    "wilaya_code": "34",
    "name_ar": "الياشير",
    "name_fr": "El Achir"
  },
  {
    "code": "3417",
    "wilaya_code": "34",
    "name_ar": "أولاد أبراهم",
    "name_fr": "Ouled Brahem"
  },
  {
    "code": "3418",
    "wilaya_code": "34",
    "name_ar": "أولاد دحمان",
    "name_fr": "Ouled Dahmane"
  },
  {
    "code": "3423",
    "wilaya_code": "34",
    "name_ar": "أولاد سيدي ابراهيم",
    "name_fr": "Ouled Sidi-Brahim"
  },
  {
    "code": "3431",
    "wilaya_code": "34",
    "name_ar": "بئر قاصد علي",
    "name_fr": "Bir Kasdali"
  },
  {
    "code": "3409",
    "wilaya_code": "34",
    "name_ar": "برج الغدير",
    "name_fr": "Bordj Ghedir"
  },
  {
    "code": "3401",
    "wilaya_code": "34",
    "name_ar": "برج بوعريرج",
    "name_fr": "Bordj Bou Arreridj"
  },
  {
    "code": "3403",
    "wilaya_code": "34",
    "name_ar": "برج زمورة",
    "name_fr": "Bordj Zemmoura"
  },
  {
    "code": "3412",
    "wilaya_code": "34",
    "name_ar": "بليمور",
    "name_fr": "Belimour"
  },
  {
    "code": "3406",
    "wilaya_code": "34",
    "name_ar": "بن داود",
    "name_fr": "Ben Daoud"
  },
  {
    "code": "3429",
    "wilaya_code": "34",
    "name_ar": "تسامرت",
    "name_fr": "Tassamert"
  },
  {
    "code": "3424",
    "wilaya_code": "34",
    "name_ar": "تفرق",
    "name_fr": "Tefreg"
  },
  {
    "code": "3421",
    "wilaya_code": "34",
    "name_ar": "تقلعيت",
    "name_fr": "Taglait"
  },
  {
    "code": "3426",
    "wilaya_code": "34",
    "name_ar": "تيكستار",
    "name_fr": "Tixter"
  },
  {
    "code": "3414",
    "wilaya_code": "34",
    "name_ar": "ثنية النصر",
    "name_fr": "Teniet En Nasr"
  },
  {
    "code": "3415",
    "wilaya_code": "34",
    "name_ar": "جعافرة",
    "name_fr": "Djaafra"
  },
  {
    "code": "3434",
    "wilaya_code": "34",
    "name_ar": "حرازة",
    "name_fr": "Haraza"
  },
  {
    "code": "3419",
    "wilaya_code": "34",
    "name_ar": "حسناوة",
    "name_fr": "Hasnaoua"
  },
  {
    "code": "3420",
    "wilaya_code": "34",
    "name_ar": "خليل",
    "name_fr": "Khelil"
  },
  {
    "code": "3402",
    "wilaya_code": "34",
    "name_ar": "رأس الوادي",
    "name_fr": "Ras El Oued"
  },
  {
    "code": "3410",
    "wilaya_code": "34",
    "name_ar": "سيدي أمبارك",
    "name_fr": "Sidi-Embarek"
  },
  {
    "code": "3408",
    "wilaya_code": "34",
    "name_ar": "عين تاغروت",
    "name_fr": "Ain Taghrout"
  },
  {
    "code": "3430",
    "wilaya_code": "34",
    "name_ar": "عين تسرة",
    "name_fr": "Ain Tesra"
  },
  {
    "code": "3432",
    "wilaya_code": "34",
    "name_ar": "غيلاسة",
    "name_fr": "Ghailasa"
  },
  {
    "code": "3413",
    "wilaya_code": "34",
    "name_ar": "مجانة",
    "name_fr": "Medjana"
  },
  {
    "code": "3504",
    "wilaya_code": "35",
    "name_ar": "أعفير",
    "name_fr": "Afir"
  },
  {
    "code": "3521",
    "wilaya_code": "35",
    "name_ar": "الاربعطاش",
    "name_fr": "Larbatache"
  },
  {
    "code": "3515",
    "wilaya_code": "35",
    "name_ar": "الثنية",
    "name_fr": "Thenia"
  },
  {
    "code": "3538",
    "wilaya_code": "35",
    "name_ar": "الخروبة",
    "name_fr": "El Kharrouba"
  },
  {
    "code": "3508",
    "wilaya_code": "35",
    "name_ar": "الناصرية",
    "name_fr": "Naciria"
  },
  {
    "code": "3526",
    "wilaya_code": "35",
    "name_ar": "أولاد عيسى",
    "name_fr": "Ouled Aissa"
  },
  {
    "code": "3520",
    "wilaya_code": "35",
    "name_ar": "أولاد موسى",
    "name_fr": "Ouled Moussa"
  },
  {
    "code": "3533",
    "wilaya_code": "35",
    "name_ar": "أولاد هداج",
    "name_fr": "Ouled Hedadj"
  },
  {
    "code": "3505",
    "wilaya_code": "35",
    "name_ar": "برج منايل",
    "name_fr": "Bordj Menaiel"
  },
  {
    "code": "3506",
    "wilaya_code": "35",
    "name_ar": "بغلية",
    "name_fr": "Baghlia"
  },
  {
    "code": "3527",
    "wilaya_code": "35",
    "name_ar": "بن شود",
    "name_fr": "Ben Choud"
  },
  {
    "code": "3530",
    "wilaya_code": "35",
    "name_ar": "بني عمران",
    "name_fr": "Beni Amrane"
  },
  {
    "code": "3502",
    "wilaya_code": "35",
    "name_ar": "بودواو",
    "name_fr": "Boudouaou"
  },
  {
    "code": "3532",
    "wilaya_code": "35",
    "name_ar": "بودواو البحري",
    "name_fr": "Boudouaou El Bahri"
  },
  {
    "code": "3522",
    "wilaya_code": "35",
    "name_ar": "بوزقزة قدارة",
    "name_fr": "Bouzegza Keddara"
  },
  {
    "code": "3501",
    "wilaya_code": "35",
    "name_ar": "بومرداس",
    "name_fr": "Boumerdes"
  },
  {
    "code": "3525",
    "wilaya_code": "35",
    "name_ar": "تاورقة",
    "name_fr": "Taourga"
  },
  {
    "code": "3513",
    "wilaya_code": "35",
    "name_ar": "تيجلابين",
    "name_fr": "Tidjelabine"
  },
  {
    "code": "3518",
    "wilaya_code": "35",
    "name_ar": "تيمزريت",
    "name_fr": "Timezrit"
  },
  {
    "code": "3509",
    "wilaya_code": "35",
    "name_ar": "جنات",
    "name_fr": "Djinet"
  },
  {
    "code": "3536",
    "wilaya_code": "35",
    "name_ar": "حمادي",
    "name_fr": "Hammedi"
  },
  {
    "code": "3537",
    "wilaya_code": "35",
    "name_ar": "خميس الخشنة",
    "name_fr": "Khemis El Khechna"
  },
  {
    "code": "3528",
    "wilaya_code": "35",
    "name_ar": "دلس",
    "name_fr": "Dellys"
  },
  {
    "code": "3511",
    "wilaya_code": "35",
    "name_ar": "زموري",
    "name_fr": "Zemmouri"
  },
  {
    "code": "3531",
    "wilaya_code": "35",
    "name_ar": "سوق الحد",
    "name_fr": "Souk El Had"
  },
  {
    "code": "3512",
    "wilaya_code": "35",
    "name_ar": "سي مصطفى",
    "name_fr": "Si Mustapha"
  },
  {
    "code": "3507",
    "wilaya_code": "35",
    "name_ar": "سيدي داود",
    "name_fr": "Sidi Daoud"
  },
  {
    "code": "3514",
    "wilaya_code": "35",
    "name_ar": "شعبة العامر",
    "name_fr": "Chabet El Ameur"
  },
  {
    "code": "3529",
    "wilaya_code": "35",
    "name_ar": "عمال",
    "name_fr": "Ammal"
  },
  {
    "code": "3519",
    "wilaya_code": "35",
    "name_ar": "قورصو",
    "name_fr": "Corso"
  },
  {
    "code": "3535",
    "wilaya_code": "35",
    "name_ar": "لقاطة",
    "name_fr": "Leghata"
  },
  {
    "code": "3510",
    "wilaya_code": "35",
    "name_ar": "يسر",
    "name_fr": "Isser"
  },
  {
    "code": "3616",
    "wilaya_code": "36",
    "name_ar": "البسباس",
    "name_fr": "Besbes"
  },
  {
    "code": "3613",
    "wilaya_code": "36",
    "name_ar": "الذرعـان",
    "name_fr": "Drean"
  },
  {
    "code": "3620",
    "wilaya_code": "36",
    "name_ar": "الزيتونة",
    "name_fr": "Zitouna"
  },
  {
    "code": "3609",
    "wilaya_code": "36",
    "name_ar": "السوارخ",
    "name_fr": "Souarekh"
  },
  {
    "code": "3612",
    "wilaya_code": "36",
    "name_ar": "الشافية",
    "name_fr": "Chefia"
  },
  {
    "code": "3618",
    "wilaya_code": "36",
    "name_ar": "الشط",
    "name_fr": "Echatt"
  },
  {
    "code": "3601",
    "wilaya_code": "36",
    "name_ar": "الطارف",
    "name_fr": "El Tarf"
  },
  {
    "code": "3607",
    "wilaya_code": "36",
    "name_ar": "العيون",
    "name_fr": "El Aioun"
  },
  {
    "code": "3605",
    "wilaya_code": "36",
    "name_ar": "القالة",
    "name_fr": "El Kala"
  },
  {
    "code": "3611",
    "wilaya_code": "36",
    "name_ar": "بحيرة الطيور",
    "name_fr": "Lac Des Oiseaux"
  },
  {
    "code": "3610",
    "wilaya_code": "36",
    "name_ar": "بريحان",
    "name_fr": "Berrihane"
  },
  {
    "code": "3603",
    "wilaya_code": "36",
    "name_ar": "بن مهيدي",
    "name_fr": "Ben M Hidi"
  },
  {
    "code": "3608",
    "wilaya_code": "36",
    "name_ar": "بوثلجة",
    "name_fr": "Bouteldja"
  },
  {
    "code": "3602",
    "wilaya_code": "36",
    "name_ar": "بوحجار",
    "name_fr": "Bouhadjar"
  },
  {
    "code": "3604",
    "wilaya_code": "36",
    "name_ar": "بوقوس",
    "name_fr": "Bougous"
  },
  {
    "code": "3623",
    "wilaya_code": "36",
    "name_ar": "حمام بني صالح",
    "name_fr": "Hammam Beni Salah"
  },
  {
    "code": "3624",
    "wilaya_code": "36",
    "name_ar": "رمل السوق",
    "name_fr": "Raml Souk"
  },
  {
    "code": "3619",
    "wilaya_code": "36",
    "name_ar": "زريزر",
    "name_fr": "Zerizer"
  },
  {
    "code": "3615",
    "wilaya_code": "36",
    "name_ar": "شبيطة مختار",
    "name_fr": "Chebaita Mokhtar"
  },
  {
    "code": "3614",
    "wilaya_code": "36",
    "name_ar": "شحاني",
    "name_fr": "Chihani"
  },
  {
    "code": "3617",
    "wilaya_code": "36",
    "name_ar": "عصفور",
    "name_fr": "Asfour"
  },
  {
    "code": "3606",
    "wilaya_code": "36",
    "name_ar": "عين العسل",
    "name_fr": "Ain El Assel"
  },
  {
    "code": "3621",
    "wilaya_code": "36",
    "name_ar": "عين الكرمة",
    "name_fr": "Ain Kerma"
  },
  {
    "code": "3622",
    "wilaya_code": "36",
    "name_ar": "وادي الزيتون",
    "name_fr": "Oued Zitoun"
  },
  {
    "code": "3702",
    "wilaya_code": "37",
    "name_ar": "أم العسل",
    "name_fr": "Oum El Assel"
  },
  {
    "code": "3701",
    "wilaya_code": "37",
    "name_ar": "تندوف",
    "name_fr": "Tindouf"
  },
  {
    "code": "3816",
    "wilaya_code": "38",
    "name_ar": "الأربعاء",
    "name_fr": "Larbaa"
  },
  {
    "code": "3804",
    "wilaya_code": "38",
    "name_ar": "الأزهرية",
    "name_fr": "Lazharia"
  },
  {
    "code": "3810",
    "wilaya_code": "38",
    "name_ar": "العيون",
    "name_fr": "Layoune"
  },
  {
    "code": "3817",
    "wilaya_code": "38",
    "name_ar": "المعاصم",
    "name_fr": "Maacem"
  },
  {
    "code": "3807",
    "wilaya_code": "38",
    "name_ar": "الملعب",
    "name_fr": "Melaab"
  },
  {
    "code": "3814",
    "wilaya_code": "38",
    "name_ar": "اليوسفية",
    "name_fr": "Youssoufia"
  },
  {
    "code": "3812",
    "wilaya_code": "38",
    "name_ar": "أولاد بسام",
    "name_fr": "Ouled Bessam"
  },
  {
    "code": "3809",
    "wilaya_code": "38",
    "name_ar": "برج الأمير عبد القادر",
    "name_fr": "Bordj El Emir Abdelkader"
  },
  {
    "code": "3802",
    "wilaya_code": "38",
    "name_ar": "برج بونعامة",
    "name_fr": "Bordj Bounaama"
  },
  {
    "code": "3805",
    "wilaya_code": "38",
    "name_ar": "بني شعيب",
    "name_fr": "Beni Chaib"
  },
  {
    "code": "3822",
    "wilaya_code": "38",
    "name_ar": "بني لحسن",
    "name_fr": "Beni Lahcene"
  },
  {
    "code": "3821",
    "wilaya_code": "38",
    "name_ar": "بوقائد",
    "name_fr": "Boucaid"
  },
  {
    "code": "3819",
    "wilaya_code": "38",
    "name_ar": "تملاحت",
    "name_fr": "Tamellahet"
  },
  {
    "code": "3801",
    "wilaya_code": "38",
    "name_ar": "تيسمسيلت",
    "name_fr": "Tissemsilt"
  },
  {
    "code": "3803",
    "wilaya_code": "38",
    "name_ar": "ثنية الاحد",
    "name_fr": "Theniet El Had"
  },
  {
    "code": "3811",
    "wilaya_code": "38",
    "name_ar": "خميستي",
    "name_fr": "Khemisti"
  },
  {
    "code": "3808",
    "wilaya_code": "38",
    "name_ar": "سيدي العنتري",
    "name_fr": "Sidi Lantri"
  },
  {
    "code": "3815",
    "wilaya_code": "38",
    "name_ar": "سيدي بوتوشنت",
    "name_fr": "Sidi Boutouchent"
  },
  {
    "code": "3820",
    "wilaya_code": "38",
    "name_ar": "سيدي سليمان",
    "name_fr": "Sidi Slimane"
  },
  {
    "code": "3818",
    "wilaya_code": "38",
    "name_ar": "سيدي عابد",
    "name_fr": "Sidi Abed"
  },
  {
    "code": "3813",
    "wilaya_code": "38",
    "name_ar": "عماري",
    "name_fr": "Ammari"
  },
  {
    "code": "3806",
    "wilaya_code": "38",
    "name_ar": "لرجام",
    "name_fr": "Lardjem"
  },
  {
    "code": "3904",
    "wilaya_code": "39",
    "name_ar": "البياضة",
    "name_fr": "Bayadha"
  },
  {
    "code": "3909",
    "wilaya_code": "39",
    "name_ar": "الحمراية",
    "name_fr": "Hamraia"
  },
  {
    "code": "3911",
    "wilaya_code": "39",
    "name_ar": "الدبيلة",
    "name_fr": "Debila"
  },
  {
    "code": "3902",
    "wilaya_code": "39",
    "name_ar": "الرباح",
    "name_fr": "Robbah"
  },
  {
    "code": "3908",
    "wilaya_code": "39",
    "name_ar": "الرقيبة",
    "name_fr": "Reguiba"
  },
  {
    "code": "3914",
    "wilaya_code": "39",
    "name_ar": "الطالب العربي",
    "name_fr": "Taleb Larbi"
  },
  {
    "code": "3917",
    "wilaya_code": "39",
    "name_ar": "الطريفاوي",
    "name_fr": "Trifaoui"
  },
  {
    "code": "3925",
    "wilaya_code": "39",
    "name_ar": "العقلة",
    "name_fr": "El Ogla"
  },
  {
    "code": "3918",
    "wilaya_code": "39",
    "name_ar": "المقرن",
    "name_fr": "Magrane"
  },
  {
    "code": "3905",
    "wilaya_code": "39",
    "name_ar": "النخلة",
    "name_fr": "Nakhla"
  },
  {
    "code": "3901",
    "wilaya_code": "39",
    "name_ar": "الوادي",
    "name_fr": "El-Oued"
  },
  {
    "code": "3926",
    "wilaya_code": "39",
    "name_ar": "اميه وانسة",
    "name_fr": "Mih Ouansa"
  },
  {
    "code": "3919",
    "wilaya_code": "39",
    "name_ar": "بن قشة",
    "name_fr": "Ben Guecha"
  },
  {
    "code": "3910",
    "wilaya_code": "39",
    "name_ar": "تغزوت",
    "name_fr": "Taghzout"
  },
  {
    "code": "3913",
    "wilaya_code": "39",
    "name_ar": "حاسي خليفة",
    "name_fr": "Hassi Khalifa"
  },
  {
    "code": "3912",
    "wilaya_code": "39",
    "name_ar": "حساني عبد الكريم",
    "name_fr": "Hassani Abdelkrim"
  },
  {
    "code": "3915",
    "wilaya_code": "39",
    "name_ar": "دوار الماء",
    "name_fr": "Douar El Maa"
  },
  {
    "code": "3916",
    "wilaya_code": "39",
    "name_ar": "سيدي عون",
    "name_fr": "Sidi Aoun"
  },
  {
    "code": "3906",
    "wilaya_code": "39",
    "name_ar": "قمار",
    "name_fr": "Guemar"
  },
  {
    "code": "3907",
    "wilaya_code": "39",
    "name_ar": "كوينين",
    "name_fr": "Kouinine"
  },
  {
    "code": "3903",
    "wilaya_code": "39",
    "name_ar": "وادي العلندة",
    "name_fr": "Oued El Alenda"
  },
  {
    "code": "3920",
    "wilaya_code": "39",
    "name_ar": "ورماس",
    "name_fr": "Ourmes"
  },
  {
    "code": "4005",
    "wilaya_code": "40",
    "name_ar": "الحامة",
    "name_fr": "El Hamma"
  },
  {
    "code": "4010",
    "wilaya_code": "40",
    "name_ar": "الرميلة",
    "name_fr": "Remila"
  },
  {
    "code": "4017",
    "wilaya_code": "40",
    "name_ar": "المحمل",
    "name_fr": "El Mahmal"
  },
  {
    "code": "4009",
    "wilaya_code": "40",
    "name_ar": "الولجة",
    "name_fr": "El Oueldja"
  },
  {
    "code": "4015",
    "wilaya_code": "40",
    "name_ar": "انسيغة",
    "name_fr": "Ensigha"
  },
  {
    "code": "4016",
    "wilaya_code": "40",
    "name_ar": "أولاد رشاش",
    "name_fr": "Ouled Rechache"
  },
  {
    "code": "4013",
    "wilaya_code": "40",
    "name_ar": "بابار",
    "name_fr": "Babar"
  },
  {
    "code": "4004",
    "wilaya_code": "40",
    "name_ar": "بغاي",
    "name_fr": "Baghai"
  },
  {
    "code": "4008",
    "wilaya_code": "40",
    "name_ar": "بوحمامة",
    "name_fr": "Bouhmama"
  },
  {
    "code": "4007",
    "wilaya_code": "40",
    "name_ar": "تاوزيانت",
    "name_fr": "Taouzianat"
  },
  {
    "code": "4012",
    "wilaya_code": "40",
    "name_ar": "جلال",
    "name_fr": "Djellal"
  },
  {
    "code": "4001",
    "wilaya_code": "40",
    "name_ar": "خنشلة",
    "name_fr": "Khenchela"
  },
  {
    "code": "4020",
    "wilaya_code": "40",
    "name_ar": "خيران",
    "name_fr": "Khirane"
  },
  {
    "code": "4011",
    "wilaya_code": "40",
    "name_ar": "ششار",
    "name_fr": "Chechar"
  },
  {
    "code": "4021",
    "wilaya_code": "40",
    "name_ar": "شلية",
    "name_fr": "Chelia"
  },
  {
    "code": "4014",
    "wilaya_code": "40",
    "name_ar": "طامزة",
    "name_fr": "Tamza"
  },
  {
    "code": "4006",
    "wilaya_code": "40",
    "name_ar": "عين الطويلة",
    "name_fr": "Ain Touila"
  },
  {
    "code": "4003",
    "wilaya_code": "40",
    "name_ar": "قايس",
    "name_fr": "Kais"
  },
  {
    "code": "4002",
    "wilaya_code": "40",
    "name_ar": "متوسة",
    "name_fr": "M'toussa"
  },
  {
    "code": "4018",
    "wilaya_code": "40",
    "name_ar": "مصارة",
    "name_fr": "M'sara"
  },
  {
    "code": "4019",
    "wilaya_code": "40",
    "name_ar": "يابوس",
    "name_fr": "Yabous"
  },
  {
    "code": "4110",
    "wilaya_code": "41",
    "name_ar": "الحدادة",
    "name_fr": "Haddada"
  },
  {
    "code": "4103",
    "wilaya_code": "41",
    "name_ar": "الحنانشة",
    "name_fr": "Hanencha"
  },
  {
    "code": "4111",
    "wilaya_code": "41",
    "name_ar": "الخضارة",
    "name_fr": "Khedara"
  },
  {
    "code": "4109",
    "wilaya_code": "41",
    "name_ar": "الدريعة",
    "name_fr": "Drea"
  },
  {
    "code": "4122",
    "wilaya_code": "41",
    "name_ar": "الراقوبة",
    "name_fr": "Ragouba"
  },
  {
    "code": "4107",
    "wilaya_code": "41",
    "name_ar": "الزعرورية",
    "name_fr": "Zaarouria"
  },
  {
    "code": "4126",
    "wilaya_code": "41",
    "name_ar": "الزوابي",
    "name_fr": "Zouabi"
  },
  {
    "code": "4112",
    "wilaya_code": "41",
    "name_ar": "المراهنة",
    "name_fr": "Merahna"
  },
  {
    "code": "4104",
    "wilaya_code": "41",
    "name_ar": "المشروحة",
    "name_fr": "Machroha"
  },
  {
    "code": "4116",
    "wilaya_code": "41",
    "name_ar": "أم العظايم",
    "name_fr": "Oum El Adhaim"
  },
  {
    "code": "4105",
    "wilaya_code": "41",
    "name_ar": "أولاد إدريس",
    "name_fr": "Ouled Driss"
  },
  {
    "code": "4113",
    "wilaya_code": "41",
    "name_ar": "أولاد مومن",
    "name_fr": "Ouled Moumen"
  },
  {
    "code": "4114",
    "wilaya_code": "41",
    "name_ar": "بئر بوحوش",
    "name_fr": "Bir Bouhouche"
  },
  {
    "code": "4108",
    "wilaya_code": "41",
    "name_ar": "تاورة",
    "name_fr": "Taoura"
  },
  {
    "code": "4125",
    "wilaya_code": "41",
    "name_ar": "ترقالت",
    "name_fr": "Terraguelt"
  },
  {
    "code": "4106",
    "wilaya_code": "41",
    "name_ar": "تيفاش",
    "name_fr": "Tiffech"
  },
  {
    "code": "4123",
    "wilaya_code": "41",
    "name_ar": "خميسة",
    "name_fr": "Khemissa"
  },
  {
    "code": "4121",
    "wilaya_code": "41",
    "name_ar": "سافل الويدان",
    "name_fr": "Safel El Ouiden"
  },
  {
    "code": "4102",
    "wilaya_code": "41",
    "name_ar": "سدراتة",
    "name_fr": "Sedrata"
  },
  {
    "code": "4101",
    "wilaya_code": "41",
    "name_ar": "سوق أهراس",
    "name_fr": "Souk Ahras"
  },
  {
    "code": "4120",
    "wilaya_code": "41",
    "name_ar": "سيدي فرج",
    "name_fr": "Sidi Fredj"
  },
  {
    "code": "4117",
    "wilaya_code": "41",
    "name_ar": "عين الزانة",
    "name_fr": "Ain Zana"
  },
  {
    "code": "4118",
    "wilaya_code": "41",
    "name_ar": "عين سلطان",
    "name_fr": "Ain Soltane"
  },
  {
    "code": "4115",
    "wilaya_code": "41",
    "name_ar": "مداوروش",
    "name_fr": "M'daourouche"
  },
  {
    "code": "4124",
    "wilaya_code": "41",
    "name_ar": "وادي الكبريت",
    "name_fr": "Oued Kebrit"
  },
  {
    "code": "4119",
    "wilaya_code": "41",
    "name_ar": "ويلان",
    "name_fr": "Ouillen"
  },
  {
    "code": "4227",
    "wilaya_code": "42",
    "name_ar": "أحمر العين",
    "name_fr": "Ahmer El Ain"
  },
  {
    "code": "4210",
    "wilaya_code": "42",
    "name_ar": "أغبال",
    "name_fr": "Aghbal"
  },
  {
    "code": "4203",
    "wilaya_code": "42",
    "name_ar": "الأرهاط",
    "name_fr": "Larhat"
  },
  {
    "code": "4236",
    "wilaya_code": "42",
    "name_ar": "الحطاطبة",
    "name_fr": "Attatba"
  },
  {
    "code": "4223",
    "wilaya_code": "42",
    "name_ar": "الداموس",
    "name_fr": "Damous"
  },
  {
    "code": "4216",
    "wilaya_code": "42",
    "name_ar": "الشعيبة",
    "name_fr": "Chaiba"
  },
  {
    "code": "4235",
    "wilaya_code": "42",
    "name_ar": "القليعة",
    "name_fr": "Kolea"
  },
  {
    "code": "4215",
    "wilaya_code": "42",
    "name_ar": "الناظور",
    "name_fr": "Nador"
  },
  {
    "code": "4241",
    "wilaya_code": "42",
    "name_ar": "بني ميلك",
    "name_fr": "Beni Mileuk"
  },
  {
    "code": "4226",
    "wilaya_code": "42",
    "name_ar": "بواسماعيل",
    "name_fr": "Bou Ismail"
  },
  {
    "code": "4205",
    "wilaya_code": "42",
    "name_ar": "بورقيقة",
    "name_fr": "Bourkika"
  },
  {
    "code": "4230",
    "wilaya_code": "42",
    "name_ar": "بوهارون",
    "name_fr": "Bou Haroun"
  },
  {
    "code": "4201",
    "wilaya_code": "42",
    "name_ar": "تيبازة",
    "name_fr": "Tipaza"
  },
  {
    "code": "4242",
    "wilaya_code": "42",
    "name_ar": "حجرة النص",
    "name_fr": "Hadjret Ennous"
  },
  {
    "code": "4212",
    "wilaya_code": "42",
    "name_ar": "حجوط",
    "name_fr": "Hadjout"
  },
  {
    "code": "4206",
    "wilaya_code": "42",
    "name_ar": "خميستي",
    "name_fr": "Khemisti"
  },
  {
    "code": "4204",
    "wilaya_code": "42",
    "name_ar": "دواودة",
    "name_fr": "Douaouda"
  },
  {
    "code": "4234",
    "wilaya_code": "42",
    "name_ar": "سيدي راشد",
    "name_fr": "Sidi Rached"
  },
  {
    "code": "4240",
    "wilaya_code": "42",
    "name_ar": "سيدي سميان",
    "name_fr": "Sidi Semiane"
  },
  {
    "code": "4213",
    "wilaya_code": "42",
    "name_ar": "سيدي عامر",
    "name_fr": "Sidi-Amar"
  },
  {
    "code": "4232",
    "wilaya_code": "42",
    "name_ar": "سيدي غيلاس",
    "name_fr": "Sidi Ghiles"
  },
  {
    "code": "4222",
    "wilaya_code": "42",
    "name_ar": "شرشال",
    "name_fr": "Cherchell"
  },
  {
    "code": "4217",
    "wilaya_code": "42",
    "name_ar": "عين تاقورايت",
    "name_fr": "Ain Tagourait"
  },
  {
    "code": "4225",
    "wilaya_code": "42",
    "name_ar": "فوكة",
    "name_fr": "Fouka"
  },
  {
    "code": "4214",
    "wilaya_code": "42",
    "name_ar": "قوراية",
    "name_fr": "Gouraya"
  },
  {
    "code": "4224",
    "wilaya_code": "42",
    "name_ar": "مراد",
    "name_fr": "Merad"
  },
  {
    "code": "4233",
    "wilaya_code": "42",
    "name_ar": "مسلمون",
    "name_fr": "Messelmoun"
  },
  {
    "code": "4202",
    "wilaya_code": "42",
    "name_ar": "مناصر",
    "name_fr": "Menaceur"
  },
  {
    "code": "4311",
    "wilaya_code": "43",
    "name_ar": "أحمد راشدي",
    "name_fr": "Ahmed Rachedi"
  },
  {
    "code": "4322",
    "wilaya_code": "43",
    "name_ar": "اعميرة اراس",
    "name_fr": "Amira Arres"
  },
  {
    "code": "4306",
    "wilaya_code": "43",
    "name_ar": "التلاغمة",
    "name_fr": "Teleghma"
  },
  {
    "code": "4315",
    "wilaya_code": "43",
    "name_ar": "الرواشد",
    "name_fr": "Rouached"
  },
  {
    "code": "4332",
    "wilaya_code": "43",
    "name_ar": "الشيقارة",
    "name_fr": "Chigara"
  },
  {
    "code": "4329",
    "wilaya_code": "43",
    "name_ar": "العياضي برباس",
    "name_fr": "El Ayadi Barbes"
  },
  {
    "code": "4317",
    "wilaya_code": "43",
    "name_ar": "القرارم قوقة",
    "name_fr": "Grarem Gouga"
  },
  {
    "code": "4312",
    "wilaya_code": "43",
    "name_ar": "أولاد اخلوف",
    "name_fr": "Ouled Khalouf"
  },
  {
    "code": "4309",
    "wilaya_code": "43",
    "name_ar": "بن يحي عبد الرحمن",
    "name_fr": "Benyahia Abderrahmane"
  },
  {
    "code": "4314",
    "wilaya_code": "43",
    "name_ar": "بوحاتم",
    "name_fr": "Bouhatem"
  },
  {
    "code": "4308",
    "wilaya_code": "43",
    "name_ar": "تاجنانت",
    "name_fr": "Tadjenanet"
  },
  {
    "code": "4323",
    "wilaya_code": "43",
    "name_ar": "ترعي باينان",
    "name_fr": "Terrai Bainen"
  },
  {
    "code": "4316",
    "wilaya_code": "43",
    "name_ar": "تسالة لمطاعي",
    "name_fr": "Tassala Lematai"
  },
  {
    "code": "4319",
    "wilaya_code": "43",
    "name_ar": "تسدان حدادة",
    "name_fr": "Tassadane Haddada"
  },
  {
    "code": "4313",
    "wilaya_code": "43",
    "name_ar": "تيبرقنت",
    "name_fr": "Tiberguent"
  },
  {
    "code": "4324",
    "wilaya_code": "43",
    "name_ar": "حمالة",
    "name_fr": "Hamala"
  },
  {
    "code": "4320",
    "wilaya_code": "43",
    "name_ar": "دراحي بوصلاح",
    "name_fr": "Derrahi Bousselah"
  },
  {
    "code": "4328",
    "wilaya_code": "43",
    "name_ar": "زغاية",
    "name_fr": "Zeghaia"
  },
  {
    "code": "4327",
    "wilaya_code": "43",
    "name_ar": "سيدي خليفة",
    "name_fr": "Sidi Khelifa"
  },
  {
    "code": "4318",
    "wilaya_code": "43",
    "name_ar": "سيدي مروان",
    "name_fr": "Sidi Merouane"
  },
  {
    "code": "4303",
    "wilaya_code": "43",
    "name_ar": "شلغوم العيد",
    "name_fr": "Chelghoum Laid"
  },
  {
    "code": "4330",
    "wilaya_code": "43",
    "name_ar": "عين البيضاء أحريش",
    "name_fr": "Ain Beida Harriche"
  },
  {
    "code": "4325",
    "wilaya_code": "43",
    "name_ar": "عين التين",
    "name_fr": "Ain Tine"
  },
  {
    "code": "4305",
    "wilaya_code": "43",
    "name_ar": "عين الملوك",
    "name_fr": "Ain Mellouk"
  },
  {
    "code": "4302",
    "wilaya_code": "43",
    "name_ar": "فرجيوة",
    "name_fr": "Ferdjioua"
  },
  {
    "code": "4326",
    "wilaya_code": "43",
    "name_ar": "مشيرة",
    "name_fr": "El Mechira"
  },
  {
    "code": "4301",
    "wilaya_code": "43",
    "name_ar": "ميلة",
    "name_fr": "Mila"
  },
  {
    "code": "4321",
    "wilaya_code": "43",
    "name_ar": "مينار زارزة",
    "name_fr": "Minar Zarza"
  },
  {
    "code": "4304",
    "wilaya_code": "43",
    "name_ar": "وادي العثمانية",
    "name_fr": "Oued Athmenia"
  },
  {
    "code": "4310",
    "wilaya_code": "43",
    "name_ar": "وادي النجاء",
    "name_fr": "Oued Endja"
  },
  {
    "code": "4307",
    "wilaya_code": "43",
    "name_ar": "وادي سقان",
    "name_fr": "Oued Seguen"
  },
  {
    "code": "4331",
    "wilaya_code": "43",
    "name_ar": "يحي بني قشة",
    "name_fr": "Yahia Beniguecha"
  },
  {
    "code": "4418",
    "wilaya_code": "44",
    "name_ar": "الحسانية",
    "name_fr": "Hassania"
  },
  {
    "code": "4427",
    "wilaya_code": "44",
    "name_ar": "الحسينية",
    "name_fr": "Hoceinia"
  },
  {
    "code": "4416",
    "wilaya_code": "44",
    "name_ar": "الروينة",
    "name_fr": "Rouina"
  },
  {
    "code": "4408",
    "wilaya_code": "44",
    "name_ar": "العامرة",
    "name_fr": "El-Amra"
  },
  {
    "code": "4411",
    "wilaya_code": "44",
    "name_ar": "العبادية",
    "name_fr": "El-Abadia"
  },
  {
    "code": "4410",
    "wilaya_code": "44",
    "name_ar": "العطاف",
    "name_fr": "El-Attaf"
  },
  {
    "code": "4434",
    "wilaya_code": "44",
    "name_ar": "الماين",
    "name_fr": "El-Maine"
  },
  {
    "code": "4430",
    "wilaya_code": "44",
    "name_ar": "المخاطرية",
    "name_fr": "Mekhatria"
  },
  {
    "code": "4419",
    "wilaya_code": "44",
    "name_ar": "بئر ولد خليفة",
    "name_fr": "Bir-Ould-Khelifa"
  },
  {
    "code": "4428",
    "wilaya_code": "44",
    "name_ar": "بربوش",
    "name_fr": "Birbouche"
  },
  {
    "code": "4422",
    "wilaya_code": "44",
    "name_ar": "برج الأمير خالد",
    "name_fr": "Bordj-Emir-Khaled"
  },
  {
    "code": "4431",
    "wilaya_code": "44",
    "name_ar": "بطحية",
    "name_fr": "Bathia"
  },
  {
    "code": "4436",
    "wilaya_code": "44",
    "name_ar": "بلعاص",
    "name_fr": "Belaas"
  },
  {
    "code": "4425",
    "wilaya_code": "44",
    "name_ar": "بن علال",
    "name_fr": "Ben Allal"
  },
  {
    "code": "4409",
    "wilaya_code": "44",
    "name_ar": "بوراشد",
    "name_fr": "Bourached"
  },
  {
    "code": "4403",
    "wilaya_code": "44",
    "name_ar": "بومدفع",
    "name_fr": "Boumedfaa"
  },
  {
    "code": "4432",
    "wilaya_code": "44",
    "name_ar": "تاشتة زقاغة",
    "name_fr": "Tacheta Zegagha"
  },
  {
    "code": "4435",
    "wilaya_code": "44",
    "name_ar": "تبركانين",
    "name_fr": "Tiberkanine"
  },
  {
    "code": "4407",
    "wilaya_code": "44",
    "name_ar": "جليدة",
    "name_fr": "Djelida"
  },
  {
    "code": "4429",
    "wilaya_code": "44",
    "name_ar": "جمعة أولاد الشيخ",
    "name_fr": "Djemaa Ouled Cheikh"
  },
  {
    "code": "4412",
    "wilaya_code": "44",
    "name_ar": "جندل",
    "name_fr": "Djendel"
  },
  {
    "code": "4405",
    "wilaya_code": "44",
    "name_ar": "حمام ريغة",
    "name_fr": "Hammam-Righa"
  },
  {
    "code": "4404",
    "wilaya_code": "44",
    "name_ar": "خميس مليانة",
    "name_fr": "Khemis-Miliana"
  },
  {
    "code": "4417",
    "wilaya_code": "44",
    "name_ar": "زدين",
    "name_fr": "Zeddine"
  },
  {
    "code": "4424",
    "wilaya_code": "44",
    "name_ar": "سيدي الأخضر",
    "name_fr": "Sidi-Lakhdar"
  },
  {
    "code": "4421",
    "wilaya_code": "44",
    "name_ar": "طارق بن زياد",
    "name_fr": "Tarik-Ibn-Ziad"
  },
  {
    "code": "4406",
    "wilaya_code": "44",
    "name_ar": "عريب",
    "name_fr": "Arib"
  },
  {
    "code": "4414",
    "wilaya_code": "44",
    "name_ar": "عين الاشياخ",
    "name_fr": "Ain-Lechiakh"
  },
  {
    "code": "4426",
    "wilaya_code": "44",
    "name_ar": "عين البنيان",
    "name_fr": "Ain-Benian"
  },
  {
    "code": "4423",
    "wilaya_code": "44",
    "name_ar": "عين التركي",
    "name_fr": "Ain-Torki"
  },
  {
    "code": "4401",
    "wilaya_code": "44",
    "name_ar": "عين الدفلى",
    "name_fr": "Ain-Defla"
  },
  {
    "code": "4420",
    "wilaya_code": "44",
    "name_ar": "عين السلطان",
    "name_fr": "Ain-Soltane"
  },
  {
    "code": "4433",
    "wilaya_code": "44",
    "name_ar": "عين بويحيى",
    "name_fr": "Ain-Bouyahia"
  },
  {
    "code": "4402",
    "wilaya_code": "44",
    "name_ar": "مليانة",
    "name_fr": "Miliana"
  },
  {
    "code": "4415",
    "wilaya_code": "44",
    "name_ar": "واد الجمعة",
    "name_fr": "Oued Djemaa"
  },
  {
    "code": "4413",
    "wilaya_code": "44",
    "name_ar": "وادي الشرفاء",
    "name_fr": "Oued Chorfa"
  },
  {
    "code": "4512",
    "wilaya_code": "45",
    "name_ar": "البيوض",
    "name_fr": "El Biodh"
  },
  {
    "code": "4511",
    "wilaya_code": "45",
    "name_ar": "القصدير",
    "name_fr": "Kasdir"
  },
  {
    "code": "4502",
    "wilaya_code": "45",
    "name_ar": "المشرية",
    "name_fr": "Mecheria"
  },
  {
    "code": "4501",
    "wilaya_code": "45",
    "name_ar": "النعامة",
    "name_fr": "Naama"
  },
  {
    "code": "4504",
    "wilaya_code": "45",
    "name_ar": "تيوت",
    "name_fr": "Tiout"
  },
  {
    "code": "4508",
    "wilaya_code": "45",
    "name_ar": "جنين بورزق",
    "name_fr": "Djenienne Bourezg"
  },
  {
    "code": "4505",
    "wilaya_code": "45",
    "name_ar": "سفيسيفة",
    "name_fr": "Sfissifa"
  },
  {
    "code": "4507",
    "wilaya_code": "45",
    "name_ar": "عسلة",
    "name_fr": "Asla"
  },
  {
    "code": "4503",
    "wilaya_code": "45",
    "name_ar": "عين الصفراء",
    "name_fr": "Ain Sefra"
  },
  {
    "code": "4509",
    "wilaya_code": "45",
    "name_ar": "عين بن خليل",
    "name_fr": "Ain Ben Khelil"
  },
  {
    "code": "4506",
    "wilaya_code": "45",
    "name_ar": "مغرار",
    "name_fr": "Moghrar"
  },
  {
    "code": "4510",
    "wilaya_code": "45",
    "name_ar": "مكمن بن عمار",
    "name_fr": "Makmen Ben Amar"
  },
  {
    "code": "4607",
    "wilaya_code": "46",
    "name_ar": "أغلال",
    "name_fr": "Aghlal"
  },
  {
    "code": "4627",
    "wilaya_code": "46",
    "name_ar": "الأمير عبد القادر",
    "name_fr": "Emir Abdelkader"
  },
  {
    "code": "4621",
    "wilaya_code": "46",
    "name_ar": "الحساسنة",
    "name_fr": "Hassasna"
  },
  {
    "code": "4619",
    "wilaya_code": "46",
    "name_ar": "العامرية",
    "name_fr": "El Amria"
  },
  {
    "code": "4614",
    "wilaya_code": "46",
    "name_ar": "المالح",
    "name_fr": "El Maleh"
  },
  {
    "code": "4628",
    "wilaya_code": "46",
    "name_ar": "المساعيد",
    "name_fr": "El Messaid"
  },
  {
    "code": "4622",
    "wilaya_code": "46",
    "name_ar": "أولاد الكيحل",
    "name_fr": "Ouled Kihal"
  },
  {
    "code": "4617",
    "wilaya_code": "46",
    "name_ar": "أولاد بوجمعة",
    "name_fr": "Ouled Boudjemaa"
  },
  {
    "code": "4623",
    "wilaya_code": "46",
    "name_ar": "بني صاف",
    "name_fr": "Beni Saf"
  },
  {
    "code": "4605",
    "wilaya_code": "46",
    "name_ar": "بوزجار",
    "name_fr": "Bouzedjar"
  },
  {
    "code": "4608",
    "wilaya_code": "46",
    "name_ar": "تارقة",
    "name_fr": "Terga"
  },
  {
    "code": "4610",
    "wilaya_code": "46",
    "name_ar": "تامزورة",
    "name_fr": "Tamzoura"
  },
  {
    "code": "4620",
    "wilaya_code": "46",
    "name_ar": "حاسي الغلة",
    "name_fr": "Hassi El Ghella"
  },
  {
    "code": "4604",
    "wilaya_code": "46",
    "name_ar": "حمام بوحجر",
    "name_fr": "Hammam Bou Hadjar"
  },
  {
    "code": "4612",
    "wilaya_code": "46",
    "name_ar": "سيدي بن عدة",
    "name_fr": "Sidi Ben Adda"
  },
  {
    "code": "4615",
    "wilaya_code": "46",
    "name_ar": "سيدي بومدين",
    "name_fr": "Sidi Boumediene"
  },
  {
    "code": "4624",
    "wilaya_code": "46",
    "name_ar": "سيدي صافي",
    "name_fr": "Sidi Safi"
  },
  {
    "code": "4626",
    "wilaya_code": "46",
    "name_ar": "سيدي ورياش",
    "name_fr": "Sidi Ouriache"
  },
  {
    "code": "4602",
    "wilaya_code": "46",
    "name_ar": "شعبة اللحم",
    "name_fr": "Chaabat El Ham"
  },
  {
    "code": "4611",
    "wilaya_code": "46",
    "name_ar": "شنتوف",
    "name_fr": "Chentouf"
  },
  {
    "code": "4613",
    "wilaya_code": "46",
    "name_ar": "عقب الليل",
    "name_fr": "Aoubellil"
  },
  {
    "code": "4609",
    "wilaya_code": "46",
    "name_ar": "عين الأربعاء",
    "name_fr": "Ain El Arbaa"
  },
  {
    "code": "4618",
    "wilaya_code": "46",
    "name_ar": "عين الطلبة",
    "name_fr": "Ain Tolba"
  },
  {
    "code": "4603",
    "wilaya_code": "46",
    "name_ar": "عين الكيحل",
    "name_fr": "Ain Kihal"
  },
  {
    "code": "4601",
    "wilaya_code": "46",
    "name_ar": "عين تموشنت",
    "name_fr": "Ain Temouchent"
  },
  {
    "code": "4616",
    "wilaya_code": "46",
    "name_ar": "وادي الصباح",
    "name_fr": "Oued Sebbah"
  },
  {
    "code": "4606",
    "wilaya_code": "46",
    "name_ar": "وادي برقش",
    "name_fr": "Oued Berkeche"
  },
  {
    "code": "4625",
    "wilaya_code": "46",
    "name_ar": "ولهاصة الغرابة",
    "name_fr": "Oulhaca El Gheraba"
  },
  {
    "code": "4707",
    "wilaya_code": "47",
    "name_ar": "العطف",
    "name_fr": "El Atteuf"
  },
  {
    "code": "4706",
    "wilaya_code": "47",
    "name_ar": "القرارة",
    "name_fr": "El Guerrara"
  },
  {
    "code": "4713",
    "wilaya_code": "47",
    "name_ar": "المنصورة",
    "name_fr": "Mansoura"
  },
  {
    "code": "4704",
    "wilaya_code": "47",
    "name_ar": "بريان",
    "name_fr": "Berriane"
  },
  {
    "code": "4710",
    "wilaya_code": "47",
    "name_ar": "بونورة",
    "name_fr": "Bounoura"
  },
  {
    "code": "4708",
    "wilaya_code": "47",
    "name_ar": "زلفانة",
    "name_fr": "Zelfana"
  },
  {
    "code": "4709",
    "wilaya_code": "47",
    "name_ar": "سبسب",
    "name_fr": "Sebseb"
  },
  {
    "code": "4703",
    "wilaya_code": "47",
    "name_ar": "ضاية بن ضحوة",
    "name_fr": "Dhayet Bendhahoua"
  },
  {
    "code": "4701",
    "wilaya_code": "47",
    "name_ar": "غرداية",
    "name_fr": "Ghardaia"
  },
  {
    "code": "4705",
    "wilaya_code": "47",
    "name_ar": "متليلي",
    "name_fr": "Metlili"
  },
  {
    "code": "4833",
    "wilaya_code": "48",
    "name_ar": "الحاسي",
    "name_fr": "El Hassi"
  },
  {
    "code": "4807",
    "wilaya_code": "48",
    "name_ar": "الحمادنة",
    "name_fr": "El H'madna"
  },
  {
    "code": "4827",
    "wilaya_code": "48",
    "name_ar": "الرمكة",
    "name_fr": "Ramka"
  },
  {
    "code": "4815",
    "wilaya_code": "48",
    "name_ar": "القطار",
    "name_fr": "El-Guettar"
  },
  {
    "code": "4823",
    "wilaya_code": "48",
    "name_ar": "القلعة",
    "name_fr": "Kalaa"
  },
  {
    "code": "4817",
    "wilaya_code": "48",
    "name_ar": "المطمر",
    "name_fr": "El-Matmar"
  },
  {
    "code": "4836",
    "wilaya_code": "48",
    "name_ar": "الولجة",
    "name_fr": "El Ouldja"
  },
  {
    "code": "4838",
    "wilaya_code": "48",
    "name_ar": "أولاد سيدي الميهوب",
    "name_fr": "Ouled Sidi Mihoub"
  },
  {
    "code": "4805",
    "wilaya_code": "48",
    "name_ar": "أولاد يعيش",
    "name_fr": "Ouled Aiche"
  },
  {
    "code": "4803",
    "wilaya_code": "48",
    "name_ar": "بلعسل بوزقزة",
    "name_fr": "Belaassel Bouzagza"
  },
  {
    "code": "4835",
    "wilaya_code": "48",
    "name_ar": "بن داود",
    "name_fr": "Bendaoud"
  },
  {
    "code": "4813",
    "wilaya_code": "48",
    "name_ar": "بني درقن",
    "name_fr": "Beni Dergoun"
  },
  {
    "code": "4830",
    "wilaya_code": "48",
    "name_ar": "بني زنطيس",
    "name_fr": "Beni Zentis"
  },
  {
    "code": "4814",
    "wilaya_code": "48",
    "name_ar": "جديوية",
    "name_fr": "Djidiouia"
  },
  {
    "code": "4834",
    "wilaya_code": "48",
    "name_ar": "حد الشكالة",
    "name_fr": "Had Echkalla"
  },
  {
    "code": "4816",
    "wilaya_code": "48",
    "name_ar": "حمري",
    "name_fr": "Hamri"
  },
  {
    "code": "4832",
    "wilaya_code": "48",
    "name_ar": "دار بن عبد الله",
    "name_fr": "Dar Ben Abdelah"
  },
  {
    "code": "4812",
    "wilaya_code": "48",
    "name_ar": "زمورة",
    "name_fr": "Zemmoura"
  },
  {
    "code": "4831",
    "wilaya_code": "48",
    "name_ar": "سوق الحد",
    "name_fr": "Souk El Had"
  },
  {
    "code": "4808",
    "wilaya_code": "48",
    "name_ar": "سيدي أمحمد بن علي",
    "name_fr": "Sidi M'hamed Benali"
  },
  {
    "code": "4818",
    "wilaya_code": "48",
    "name_ar": "سيدي امحمد بن عودة",
    "name_fr": "Sidi M'hamed Benaouda"
  },
  {
    "code": "4810",
    "wilaya_code": "48",
    "name_ar": "سيدي خطاب",
    "name_fr": "Sidi Khettab"
  },
  {
    "code": "4804",
    "wilaya_code": "48",
    "name_ar": "سيدي سعادة",
    "name_fr": "Sidi Saada"
  },
  {
    "code": "4806",
    "wilaya_code": "48",
    "name_ar": "سيدي لزرق",
    "name_fr": "Sidi Lazreg"
  },
  {
    "code": "4811",
    "wilaya_code": "48",
    "name_ar": "عمي موسى",
    "name_fr": "Ammi Moussa"
  },
  {
    "code": "4824",
    "wilaya_code": "48",
    "name_ar": "عين الرحمة",
    "name_fr": "Ain Rahma"
  },
  {
    "code": "4819",
    "wilaya_code": "48",
    "name_ar": "عين طارق",
    "name_fr": "Ain-Tarek"
  },
  {
    "code": "4801",
    "wilaya_code": "48",
    "name_ar": "غليزان",
    "name_fr": "Relizane"
  },
  {
    "code": "4829",
    "wilaya_code": "48",
    "name_ar": "لحلاف",
    "name_fr": "Lahlef"
  },
  {
    "code": "4822",
    "wilaya_code": "48",
    "name_ar": "مازونة",
    "name_fr": "Mazouna"
  },
  {
    "code": "4809",
    "wilaya_code": "48",
    "name_ar": "مديونة",
    "name_fr": "Mediouna"
  },
  {
    "code": "4837",
    "wilaya_code": "48",
    "name_ar": "مرجة سيدي عابد",
    "name_fr": "Merdja Sidi Abed"
  },
  {
    "code": "4828",
    "wilaya_code": "48",
    "name_ar": "منداس",
    "name_fr": "Mendes"
  },
  {
    "code": "4826",
    "wilaya_code": "48",
    "name_ar": "وادي الجمعة",
    "name_fr": "Oued El Djemaa"
  },
  {
    "code": "4820",
    "wilaya_code": "48",
    "name_ar": "وادي السلام",
    "name_fr": "Oued Essalem"
  },
  {
    "code": "4802",
    "wilaya_code": "48",
    "name_ar": "وادي رهيو",
    "name_fr": "Oued-Rhiou"
  },
  {
    "code": "4821",
    "wilaya_code": "48",
    "name_ar": "واريزان",
    "name_fr": "Ouarizane"
  },
  {
    "code": "4825",
    "wilaya_code": "48",
    "name_ar": "يلل",
    "name_fr": "Yellel"
  },
  {
    "code": "4907",
    "wilaya_code": "49",
    "name_ar": "المطارفة",
    "name_fr": "Metarfa"
  },
  {
    "code": "4908",
    "wilaya_code": "49",
    "name_ar": "أوقروت",
    "name_fr": "Aougrout"
  },
  {
    "code": "4904",
    "wilaya_code": "49",
    "name_ar": "أولاد السعيد",
    "name_fr": "Ouled Said"
  },
  {
    "code": "4910",
    "wilaya_code": "49",
    "name_ar": "أولاد عيسى",
    "name_fr": "Ouled Aissa"
  },
  {
    "code": "4905",
    "wilaya_code": "49",
    "name_ar": "تنركوك",
    "name_fr": "Tinerkouk"
  },
  {
    "code": "4901",
    "wilaya_code": "49",
    "name_ar": "تيميمون",
    "name_fr": "Timimoun"
  },
  {
    "code": "4906",
    "wilaya_code": "49",
    "name_ar": "دلدول",
    "name_fr": "Deldoul"
  },
  {
    "code": "4902",
    "wilaya_code": "49",
    "name_ar": "شروين",
    "name_fr": "Charouine"
  },
  {
    "code": "4909",
    "wilaya_code": "49",
    "name_ar": "طالمين",
    "name_fr": "Talmine"
  },
  {
    "code": "4903",
    "wilaya_code": "49",
    "name_ar": "قصر قدور",
    "name_fr": "Ksar Kaddour"
  },
  {
    "code": "5001",
    "wilaya_code": "50",
    "name_ar": "برج باجي مختار",
    "name_fr": "Bordj Badji Mokhtar"
  },
  {
    "code": "5002",
    "wilaya_code": "50",
    "name_ar": "تيمياوين",
    "name_fr": "Timiaouine"
  },
  {
    "code": "5105",
    "wilaya_code": "51",
    "name_ar": "الدوسن",
    "name_fr": "Doucen"
  },
  {
    "code": "5106",
    "wilaya_code": "51",
    "name_ar": "الشعيبة",
    "name_fr": "Chaiba"
  },
  {
    "code": "5101",
    "wilaya_code": "51",
    "name_ar": "أولاد جلال",
    "name_fr": "Ouled Djellal"
  },
  {
    "code": "5103",
    "wilaya_code": "51",
    "name_ar": "بسباس",
    "name_fr": "Besbes"
  },
  {
    "code": "5102",
    "wilaya_code": "51",
    "name_ar": "رأس الميعاد",
    "name_fr": "Ras El Miad"
  },
  {
    "code": "5104",
    "wilaya_code": "51",
    "name_ar": "سيدي خالد",
    "name_fr": "Sidi Khaled"
  },
  {
    "code": "5205",
    "wilaya_code": "52",
    "name_ar": "إقلي",
    "name_fr": "Igli"
  },
  {
    "code": "5209",
    "wilaya_code": "52",
    "name_ar": "القصابي",
    "name_fr": "Ksabi"
  },
  {
    "code": "5207",
    "wilaya_code": "52",
    "name_ar": "الواتة",
    "name_fr": "El Ouata"
  },
  {
    "code": "5202",
    "wilaya_code": "52",
    "name_ar": "أولاد خضير",
    "name_fr": "Ouled-Khodeir"
  },
  {
    "code": "5204",
    "wilaya_code": "52",
    "name_ar": "بن يخلف",
    "name_fr": "Beni-Ikhlef"
  },
  {
    "code": "5201",
    "wilaya_code": "52",
    "name_ar": "بني عباس",
    "name_fr": "Beni-Abbes"
  },
  {
    "code": "5210",
    "wilaya_code": "52",
    "name_ar": "تامترت",
    "name_fr": "Tamtert"
  },
  {
    "code": "5206",
    "wilaya_code": "52",
    "name_ar": "تبلبالة",
    "name_fr": "Tabelbala"
  },
  {
    "code": "5203",
    "wilaya_code": "52",
    "name_ar": "تيمودي",
    "name_fr": "Timoudi"
  },
  {
    "code": "5208",
    "wilaya_code": "52",
    "name_ar": "كرزاز",
    "name_fr": "Kerzaz"
  },
  {
    "code": "5302",
    "wilaya_code": "53",
    "name_ar": "إينغر",
    "name_fr": "Inghar"
  },
  {
    "code": "5301",
    "wilaya_code": "53",
    "name_ar": "عين صالح",
    "name_fr": "Ain Salah"
  },
  {
    "code": "5303",
    "wilaya_code": "53",
    "name_ar": "فقارة الزوى",
    "name_fr": "Foggaret Ezzoua"
  },
  {
    "code": "5402",
    "wilaya_code": "54",
    "name_ar": "تين زواتين",
    "name_fr": "Tin Zouatine"
  },
  {
    "code": "5401",
    "wilaya_code": "54",
    "name_ar": "عين قزام",
    "name_fr": "Ain Guezzam"
  },
  {
    "code": "5507",
    "wilaya_code": "55",
    "name_ar": "الحجيرة",
    "name_fr": "El-Hadjira"
  },
  {
    "code": "5505",
    "wilaya_code": "55",
    "name_ar": "الزاوية العابدية",
    "name_fr": "Zaouia El Abidia"
  },
  {
    "code": "5508",
    "wilaya_code": "55",
    "name_ar": "الطيبات",
    "name_fr": "Taibet"
  },
  {
    "code": "5513",
    "wilaya_code": "55",
    "name_ar": "العالية",
    "name_fr": "El Alia"
  },
  {
    "code": "5512",
    "wilaya_code": "55",
    "name_ar": "المقارين",
    "name_fr": "Megarine"
  },
  {
    "code": "5511",
    "wilaya_code": "55",
    "name_ar": "المنقر",
    "name_fr": "M'naguer"
  },
  {
    "code": "5504",
    "wilaya_code": "55",
    "name_ar": "النزلة",
    "name_fr": "Nezla"
  },
  {
    "code": "5502",
    "wilaya_code": "55",
    "name_ar": "بلدة اعمر",
    "name_fr": "Blidet Amor"
  },
  {
    "code": "5510",
    "wilaya_code": "55",
    "name_ar": "بن ناصر",
    "name_fr": "Benaceur"
  },
  {
    "code": "5503",
    "wilaya_code": "55",
    "name_ar": "تبسبست",
    "name_fr": "Tebesbest"
  },
  {
    "code": "5501",
    "wilaya_code": "55",
    "name_ar": "تقرت",
    "name_fr": "Touggourt"
  },
  {
    "code": "5509",
    "wilaya_code": "55",
    "name_ar": "تماسين",
    "name_fr": "Temacine"
  },
  {
    "code": "5506",
    "wilaya_code": "55",
    "name_ar": "سيدي سليمان",
    "name_fr": "Sidi Slimane"
  },
  {
    "code": "5602",
    "wilaya_code": "56",
    "name_ar": "برج الحواس",
    "name_fr": "Bordj El Haouass"
  },
  {
    "code": "5601",
    "wilaya_code": "56",
    "name_ar": "جانت",
    "name_fr": "Djanet"
  },
  {
    "code": "5703",
    "wilaya_code": "57",
    "name_ar": "المرارة",
    "name_fr": "M'rara"
  },
  {
    "code": "5701",
    "wilaya_code": "57",
    "name_ar": "المغير",
    "name_fr": "El-M'ghaier"
  },
  {
    "code": "5707",
    "wilaya_code": "57",
    "name_ar": "أم الطيور",
    "name_fr": "Oum Touyour"
  },
  {
    "code": "5705",
    "wilaya_code": "57",
    "name_ar": "تندلة",
    "name_fr": "Tenedla"
  },
  {
    "code": "5706",
    "wilaya_code": "57",
    "name_ar": "جامعة",
    "name_fr": "Djamaa"
  },
  {
    "code": "5702",
    "wilaya_code": "57",
    "name_ar": "سطيل",
    "name_fr": "Still"
  },
  {
    "code": "5704",
    "wilaya_code": "57",
    "name_ar": "سيدي خليل",
    "name_fr": "Sidi Khelil"
  },
  {
    "code": "5708",
    "wilaya_code": "57",
    "name_ar": "سيدي عمران",
    "name_fr": "Sidi Amrane"
  },
  {
    "code": "5801",
    "wilaya_code": "58",
    "name_ar": "المنيعة",
    "name_fr": "El Meniaa"
  },
  {
    "code": "5802",
    "wilaya_code": "58",
    "name_ar": "حاسي الفحل",
    "name_fr": "Hassi Fehal"
  },
  {
    "code": "5803",
    "wilaya_code": "58",
    "name_ar": "حاسي القارة",
    "name_fr": "Hassi Gara"
  },
  {
    "code": "0319",
    "wilaya_code": "59",
    "name_ar": "أفلو",
    "name_fr": "Aflou"
  },
  {
    "code": "0312",
    "wilaya_code": "59",
    "name_ar": "البيضاء",
    "name_fr": "El Beidha"
  },
  {
    "code": "0315",
    "wilaya_code": "59",
    "name_ar": "الحاج مشري",
    "name_fr": "Hadj Mechri"
  },
  {
    "code": "0314",
    "wilaya_code": "59",
    "name_ar": "الغيشة",
    "name_fr": "El Ghicha"
  },
  {
    "code": "0313",
    "wilaya_code": "59",
    "name_ar": "بريدة",
    "name_fr": "Brida"
  },
  {
    "code": "0317",
    "wilaya_code": "59",
    "name_ar": "تاويالة",
    "name_fr": "Taouiala"
  },
  {
    "code": "0316",
    "wilaya_code": "59",
    "name_ar": "سبقاق",
    "name_fr": "Sebgag"
  },
  {
    "code": "0324",
    "wilaya_code": "59",
    "name_ar": "سيدي بوزيد",
    "name_fr": "Sidi Bouzid"
  },
  {
    "code": "0311",
    "wilaya_code": "59",
    "name_ar": "عين سيدي علي",
    "name_fr": "Ain Sidi Ali"
  },
  {
    "code": "0310",
    "wilaya_code": "59",
    "name_ar": "قلتة سيدي سعد",
    "name_fr": "Gueltat Sidi Saad"
  },
  {
    "code": "0321",
    "wilaya_code": "59",
    "name_ar": "وادي مرة",
    "name_fr": "Oued Morra"
  },
  {
    "code": "0322",
    "wilaya_code": "59",
    "name_ar": "وادي مزي",
    "name_fr": "Oued M'zi"
  },
  {
    "code": "0543",
    "wilaya_code": "60",
    "name_ar": "الجزار",
    "name_fr": "Djezzar"
  },
  {
    "code": "0555",
    "wilaya_code": "60",
    "name_ar": "إمدوكل",
    "name_fr": "M Doukal"
  },
  {
    "code": "0556",
    "wilaya_code": "60",
    "name_ar": "أولاد عمار",
    "name_fr": "Ouled Ammar"
  },
  {
    "code": "0542",
    "wilaya_code": "60",
    "name_ar": "بريكة",
    "name_fr": "Barika"
  },
  {
    "code": "0514",
    "wilaya_code": "60",
    "name_ar": "بيطام",
    "name_fr": "Bitam"
  },
  {
    "code": "0518",
    "wilaya_code": "60",
    "name_ar": "تيلاطو",
    "name_fr": "Tilatou"
  },
  {
    "code": "0529",
    "wilaya_code": "60",
    "name_ar": "سقانة",
    "name_fr": "Seggana"
  },
  {
    "code": "0515",
    "wilaya_code": "60",
    "name_ar": "عزيل عبد القادر",
    "name_fr": "Azil Abedelkader"
  },
  {
    "code": "0717",
    "wilaya_code": "61",
    "name_ar": "القنطرة",
    "name_fr": "El Kantara"
  },
  {
    "code": "0719",
    "wilaya_code": "61",
    "name_ar": "الوطاية",
    "name_fr": "El Outaya"
  },
  {
    "code": "0703",
    "wilaya_code": "61",
    "name_ar": "برانيس",
    "name_fr": "Branis"
  },
  {
    "code": "0720",
    "wilaya_code": "61",
    "name_ar": "جمورة",
    "name_fr": "Djemorah"
  },
  {
    "code": "0718",
    "wilaya_code": "61",
    "name_ar": "عين زعطوط",
    "name_fr": "Ain Zaatout"
  },
  {
    "code": "1215",
    "wilaya_code": "62",
    "name_ar": "العقلة المالحة",
    "name_fr": "El Ogla El Malha"
  },
  {
    "code": "1202",
    "wilaya_code": "62",
    "name_ar": "بئر العاتر",
    "name_fr": "Bir-El-Ater"
  },
  {
    "code": "1228",
    "wilaya_code": "62",
    "name_ar": "فركان",
    "name_fr": "Ferkane"
  },
  {
    "code": "1209",
    "wilaya_code": "62",
    "name_ar": "نقرين",
    "name_fr": "Negrine"
  },
  {
    "code": "1343",
    "wilaya_code": "63",
    "name_ar": "البويهي",
    "name_fr": "Bouihi"
  },
  {
    "code": "1332",
    "wilaya_code": "63",
    "name_ar": "العريشة",
    "name_fr": "El Aricha"
  },
  {
    "code": "1310",
    "wilaya_code": "63",
    "name_ar": "القور",
    "name_fr": "El Gor"
  },
  {
    "code": "1341",
    "wilaya_code": "63",
    "name_ar": "سيدي الجيلالي",
    "name_fr": "Sidi Djillali"
  },
  {
    "code": "1430",
    "wilaya_code": "64",
    "name_ar": "الرشايقة",
    "name_fr": "Rechaiga"
  },
  {
    "code": "1440",
    "wilaya_code": "64",
    "name_ar": "بوقرة",
    "name_fr": "Bougara"
  },
  {
    "code": "1435",
    "wilaya_code": "64",
    "name_ar": "حمادية",
    "name_fr": "Hamadia"
  },
  {
    "code": "1409",
    "wilaya_code": "64",
    "name_ar": "زمالة الأمير عبد القادر",
    "name_fr": "Zmalet El Emir Abdelkade"
  },
  {
    "code": "1439",
    "wilaya_code": "64",
    "name_ar": "سرغين",
    "name_fr": "Serghine"
  },
  {
    "code": "1429",
    "wilaya_code": "64",
    "name_ar": "قصر الشلالة",
    "name_fr": "Ksar Chellala"
  },
  {
    "code": "1711",
    "wilaya_code": "65",
    "name_ar": "الخميس",
    "name_fr": "El Khemis"
  },
  {
    "code": "1732",
    "wilaya_code": "65",
    "name_ar": "بنهار",
    "name_fr": "Benhar"
  },
  {
    "code": "1709",
    "wilaya_code": "65",
    "name_ar": "بويرة الأحداب",
    "name_fr": "Bouira Lahdab"
  },
  {
    "code": "1708",
    "wilaya_code": "65",
    "name_ar": "بيرين",
    "name_fr": "Birine"
  },
  {
    "code": "1733",
    "wilaya_code": "65",
    "name_ar": "حاسي فدول",
    "name_fr": "Hassi Fedoul"
  },
  {
    "code": "1720",
    "wilaya_code": "65",
    "name_ar": "حد الصحاري",
    "name_fr": "Had Sahary"
  },
  {
    "code": "1719",
    "wilaya_code": "65",
    "name_ar": "سيدي لعجال",
    "name_fr": "Sidi Laadjel"
  },
  {
    "code": "1735",
    "wilaya_code": "65",
    "name_ar": "عين فقه",
    "name_fr": "Ain Fekka"
  },
  {
    "code": "1731",
    "wilaya_code": "65",
    "name_ar": "عين وسارة",
    "name_fr": "Aïn Oussera"
  },
  {
    "code": "1721",
    "wilaya_code": "65",
    "name_ar": "قرنيني",
    "name_fr": "Guernini"
  },
  {
    "code": "1724",
    "wilaya_code": "66",
    "name_ar": "أم العظام",
    "name_fr": "Oum Laadham"
  },
  {
    "code": "1729",
    "wilaya_code": "66",
    "name_ar": "دلدول",
    "name_fr": "Deldoul"
  },
  {
    "code": "1706",
    "wilaya_code": "66",
    "name_ar": "سد الرحال",
    "name_fr": "Sed Rahal"
  },
  {
    "code": "1722",
    "wilaya_code": "66",
    "name_ar": "سلمانة",
    "name_fr": "Selmana"
  },
  {
    "code": "1734",
    "wilaya_code": "66",
    "name_ar": "عمورة",
    "name_fr": "Amourah"
  },
  {
    "code": "1707",
    "wilaya_code": "66",
    "name_ar": "فيض البطمة",
    "name_fr": "Faidh El Botma"
  },
  {
    "code": "1718",
    "wilaya_code": "66",
    "name_ar": "قطارة",
    "name_fr": "Guettara"
  },
  {
    "code": "1717",
    "wilaya_code": "66",
    "name_ar": "مسعد",
    "name_fr": "Messaad"
  },
  {
    "code": "2664",
    "wilaya_code": "67",
    "name_ar": "السانق",
    "name_fr": "Saneg"
  },
  {
    "code": "2638",
    "wilaya_code": "67",
    "name_ar": "الشهبونية",
    "name_fr": "Chabounia"
  },
  {
    "code": "2657",
    "wilaya_code": "67",
    "name_ar": "العوينات",
    "name_fr": "El Ouinet"
  },
  {
    "code": "2617",
    "wilaya_code": "67",
    "name_ar": "الكاف الاخضر",
    "name_fr": "Kef Lakhdar"
  },
  {
    "code": "2642",
    "wilaya_code": "67",
    "name_ar": "أم الجليل",
    "name_fr": "Oum El Djellil"
  },
  {
    "code": "2603",
    "wilaya_code": "67",
    "name_ar": "أولاد امعرف",
    "name_fr": "Ouled Emaaraf"
  },
  {
    "code": "2658",
    "wilaya_code": "67",
    "name_ar": "أولاد عنتر",
    "name_fr": "Ouled Antar"
  },
  {
    "code": "2622",
    "wilaya_code": "67",
    "name_ar": "أولاد هلال",
    "name_fr": "Ouled Hellal"
  },
  {
    "code": "2610",
    "wilaya_code": "67",
    "name_ar": "بوعيش",
    "name_fr": "Bouaiche"
  },
  {
    "code": "2625",
    "wilaya_code": "67",
    "name_ar": "بوغار",
    "name_fr": "Boghar"
  },
  {
    "code": "2651",
    "wilaya_code": "67",
    "name_ar": "بوغزول",
    "name_fr": "Boughzoul"
  },
  {
    "code": "2623",
    "wilaya_code": "67",
    "name_ar": "تفراوت",
    "name_fr": "Tafraout"
  },
  {
    "code": "2608",
    "wilaya_code": "67",
    "name_ar": "دراق",
    "name_fr": "Derrag"
  },
  {
    "code": "2631",
    "wilaya_code": "67",
    "name_ar": "سيدي دامد",
    "name_fr": "Sidi Demed"
  },
  {
    "code": "2618",
    "wilaya_code": "67",
    "name_ar": "شلالة العذاورة",
    "name_fr": "Chelalet El Adhaoura"
  },
  {
    "code": "2640",
    "wilaya_code": "67",
    "name_ar": "شنيقل",
    "name_fr": "Cheniguel"
  },
  {
    "code": "2632",
    "wilaya_code": "67",
    "name_ar": "عزيز",
    "name_fr": "Aziz"
  },
  {
    "code": "2641",
    "wilaya_code": "67",
    "name_ar": "عين اقصير",
    "name_fr": "Ain Ouksir"
  },
  {
    "code": "2604",
    "wilaya_code": "67",
    "name_ar": "عين بوسيف",
    "name_fr": "Ain Boucif"
  },
  {
    "code": "2635",
    "wilaya_code": "67",
    "name_ar": "قصر البخاري",
    "name_fr": "Ksar El Boukhari"
  },
  {
    "code": "2649",
    "wilaya_code": "67",
    "name_ar": "مفاتحة",
    "name_fr": "M'fatha"
  },
  {
    "code": "2826",
    "wilaya_code": "68",
    "name_ar": "الحوامد",
    "name_fr": "El Houamed"
  },
  {
    "code": "2827",
    "wilaya_code": "68",
    "name_ar": "الهامل",
    "name_fr": "El Hamel"
  },
  {
    "code": "2842",
    "wilaya_code": "68",
    "name_ar": "امجدل",
    "name_fr": "Medjedel"
  },
  {
    "code": "2825",
    "wilaya_code": "68",
    "name_ar": "أولاد سليمان",
    "name_fr": "Ouled Slimane"
  },
  {
    "code": "2821",
    "wilaya_code": "68",
    "name_ar": "أولاد سيدي ابراهيم",
    "name_fr": "Ouled Sidi Brahim"
  },
  {
    "code": "2836",
    "wilaya_code": "68",
    "name_ar": "بئر فضة",
    "name_fr": "Bir Foda"
  },
  {
    "code": "2835",
    "wilaya_code": "68",
    "name_ar": "بن زوه",
    "name_fr": "Benzouh"
  },
  {
    "code": "2824",
    "wilaya_code": "68",
    "name_ar": "بن سرور",
    "name_fr": "Ben Srour"
  },
  {
    "code": "2820",
    "wilaya_code": "68",
    "name_ar": "بوسعادة",
    "name_fr": "Bou Saada"
  },
  {
    "code": "2823",
    "wilaya_code": "68",
    "name_ar": "تامسة",
    "name_fr": "Tamsa"
  },
  {
    "code": "2847",
    "wilaya_code": "68",
    "name_ar": "جبل مساعد",
    "name_fr": "Djebel Messaad"
  },
  {
    "code": "2807",
    "wilaya_code": "68",
    "name_ar": "خبانة",
    "name_fr": "Khoubana"
  },
  {
    "code": "2833",
    "wilaya_code": "68",
    "name_ar": "زرزور",
    "name_fr": "Zarzour"
  },
  {
    "code": "2843",
    "wilaya_code": "68",
    "name_ar": "سليم",
    "name_fr": "Slim"
  },
  {
    "code": "2822",
    "wilaya_code": "68",
    "name_ar": "سيدي عامر",
    "name_fr": "Sidi Ameur"
  },
  {
    "code": "2838",
    "wilaya_code": "68",
    "name_ar": "سيدي محمد",
    "name_fr": "Sidi M'hamed"
  },
  {
    "code": "2844",
    "wilaya_code": "68",
    "name_ar": "عين الريش",
    "name_fr": "Ain Rich"
  },
  {
    "code": "2841",
    "wilaya_code": "68",
    "name_ar": "عين الملح",
    "name_fr": "Ain El Melh"
  },
  {
    "code": "2837",
    "wilaya_code": "68",
    "name_ar": "عين فارس",
    "name_fr": "Ain Fares"
  },
  {
    "code": "2834",
    "wilaya_code": "68",
    "name_ar": "محمد بوضياف",
    "name_fr": "Mohamed Boudiaf"
  },
  {
    "code": "2808",
    "wilaya_code": "68",
    "name_ar": "مسيف",
    "name_fr": "M'cif"
  },
  {
    "code": "2839",
    "wilaya_code": "68",
    "name_ar": "مناعة",
    "name_fr": "Menaa"
  },
  {
    "code": "2846",
    "wilaya_code": "68",
    "name_ar": "ولتام",
    "name_fr": "Oulteme"
  },
  {
    "code": "3209",
    "wilaya_code": "69",
    "name_ar": "اربوات",
    "name_fr": "Arbaouat"
  },
  {
    "code": "3207",
    "wilaya_code": "69",
    "name_ar": "الأبيض سيدي الشيخ",
    "name_fr": "Labiodh Sidi Cheikh"
  },
  {
    "code": "3216",
    "wilaya_code": "69",
    "name_ar": "البنود",
    "name_fr": "El Bnoud"
  },
  {
    "code": "3219",
    "wilaya_code": "69",
    "name_ar": "المحرة",
    "name_fr": "El Mehara"
  },
  {
    "code": "3213",
    "wilaya_code": "69",
    "name_ar": "بوسمغون",
    "name_fr": "Boussemghoun"
  },
  {
    "code": "3214",
    "wilaya_code": "69",
    "name_ar": "شلالة",
    "name_fr": "Chellala"
  },
  {
    "code": "3208",
    "wilaya_code": "69",
    "name_ar": "عين العراك",
    "name_fr": "Ain El Orak"
  }
];

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
