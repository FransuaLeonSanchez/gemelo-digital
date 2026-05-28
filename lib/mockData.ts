import type { AlertItem, Recommendation, SubIndex } from "./types";

export const mockUser = {
  name: "Fransua",
  email: "fransualeon2004@gmail.com",
  age: 22,
  sex: "Hombre" as const,
  height: 163,
  weight: 63,
  waist: 88,
  city: "Lima Metropolitana",
  history: ["Antecedente familiar de diabetes", "Sedentario"] as string[],
  // Last available labs (mock — adultos jóvenes raramente tienen panel completo).
  labs: {
    fastingGlucose: 102,   // mg/dL  (≥100 = alterada, prediabetes)
    hba1c: 5.6,            // %      (≥5.7 = glucemia alta)
    triglycerides: 158,    // mg/dL  (≥150 = alterada)
    hdl: 41,               // mg/dL  (<40 hombre = alterada)  → 41 NO está alterada
    ldl: 118,              // mg/dL
    bloodPressure: "124/82", // mmHg  (≥130/85 = alterada)
    hrv: 42,               // ms     (bajo–medio)
    restingHR: 74,         // bpm
    // Índice TyG = ln(triglicéridos/2) + ln(glucosa ayunas/2)
    // = ln(79) + ln(51) ≈ 4.37 + 3.93 = 8.30  → riesgo moderado
    tyg: 8.30,
  },
};

// 5 criterios diagnósticos del síndrome metabólico (NCEP-ATP III) — perfil Fransua (hombre)
// Necesita ≥ 3 alterados para diagnóstico positivo.
export const mtsCriteria = [
  { key: "Cintura",       value: "88 cm",     threshold: "≥ 102 cm (hombre)", altered: false },
  { key: "Triglicéridos", value: "158 mg/dL", threshold: "≥ 150 mg/dL",       altered: true  },
  { key: "HDL",           value: "41 mg/dL",  threshold: "< 40 mg/dL (hombre)", altered: false },
  { key: "Presión",       value: "124/82",    threshold: "≥ 130/85 mmHg",      altered: false },
  { key: "Glucosa ayunas",value: "102 mg/dL", threshold: "≥ 100 mg/dL",        altered: true  },
];

// Datos epidemiológicos del Perú para Welcome / educativo
export const peruStats = {
  notHealthy: 73.1,         // % metabólicamente no saludables
  oneAlteration: 87,        // % con al menos 1 alteración
  normalWeightAtRisk: 47.9, // % peso normal pero no saludables
  limaPrevalence: 20.7,     // % síndrome metabólico Lima
  womenVsMen: { women: 26.4, men: 7.2 },
  twinHealthRemission: 71,  // % remisión diabetes en 1 año con gemelo digital
};

// Dispositivos disponibles para emparejar (mock).
export const pairingCatalog = [
  {
    type: "smartwatch" as const,
    name: "Huawei Watch D2",
    description: "HRV, frecuencia, pasos, sueño y presión arterial.",
    color: "#4DA3FF",
  },
  {
    type: "cgm" as const,
    name: "FreeStyle Libre 3",
    description: "Glucosa cada 5 min, sin pinchazo continuo.",
    color: "#1FD0A3",
  },
];

export const subIndices: SubIndex[] = [
  { key: "Glucosa",   weight: 35, value: 58, icon: "droplet",  color: "#4DA3FF" },
  { key: "Actividad", weight: 20, value: 71, icon: "activity", color: "#37D67A" },
  { key: "Sueño",     weight: 20, value: 49, icon: "moon",     color: "#A78BFA" },
  { key: "Estrés",    weight: 15, value: 66, icon: "heart",    color: "#FF5E6C" },
  { key: "Nutrición", weight: 10, value: 54, icon: "leaf",     color: "#1FD0A3" },
];

// Note: higher sub-index value = more burden on that dimension.
// ICM = round(58*.35 + 71*.2 + 49*.2 + 66*.15 + 54*.1) = 59
export const icmToday = 59;

// Glucose curve, 48 points (every 30 min)
export const glucoseDay = [
  92, 90, 88, 91, 96, 110, 138, 152, 141, 120, 108, 101,
  99, 104, 126, 162, 149, 128, 112, 103, 100, 98, 95, 93,
  91, 90, 95, 118, 144, 133, 117, 106, 100, 96, 94,
  92, 90, 89, 90, 92, 95, 98, 101, 99, 96, 94, 92, 91,
];

export const weekICM = [
  { d: "Lun", icm: 64 },
  { d: "Mar", icm: 61 },
  { d: "Mié", icm: 67 },
  { d: "Jue", icm: 58 },
  { d: "Vie", icm: 55 },
  { d: "Sáb", icm: 60 },
  { d: "Hoy", icm: 59 },
];

export const recommendations: Recommendation[] = [
  {
    tag: "Nutrición",
    color: "#1FD0A3",
    title: "Cambia el arroz por quinua en el almuerzo",
    reason:
      "Tu pico de glucosa de hoy llegó a 162 mg/dL tras el almuerzo. La quinua tiene menor carga glucémica.",
  },
  {
    tag: "Actividad",
    color: "#37D67A",
    title: "Camina 20 min después de cenar",
    reason:
      "Llevas 3 días bajo tu meta de 7,000 pasos. Caminar tras comer baja el pico postprandial.",
  },
  {
    tag: "Sueño",
    color: "#A78BFA",
    title: "Acuéstate antes de medianoche hoy",
    reason:
      "Dormiste 5h 40min. Tu sueño corto está elevando tu estrés metabólico.",
  },
];

export const alerts: AlertItem[] = [
  {
    icon: "alert-triangle",
    color: "#FF5E6C",
    title: "Pico de glucosa detectado",
    body: "Llegaste a 162 mg/dL tras el almuerzo (14:00).",
    time: "Hace 2 h",
  },
  {
    icon: "moon",
    color: "#A78BFA",
    title: "Dormiste poco",
    body: "5h 40min anoche. Tu estrés metabólico subió.",
    time: "Hoy 7:00",
  },
  {
    icon: "sparkles",
    color: "#1FD0A3",
    title: "Nueva recomendación",
    body: "Cambia el arroz por quinua en el almuerzo.",
    time: "Hoy 7:00",
  },
];

export const detectedMeal = {
  name: "Arroz con pollo + ensalada",
  load: "Alta" as const,
  carbs: 78,
  kcal: 540,
  predictedPeak: 158,
  predictedMinutes: 60,
};

export const projection5y = {
  current: 23,
  withPlan: 11,
  noChange: [23, 29, 36, 42, 48],
  plan: [23, 19, 15, 13, 11],
};

export const devices = [
  { name: "Sensor CGM (glucosa)", connected: true, icon: "droplet" },
  { name: "Smartwatch (HRV, pasos, sueño)", connected: true, icon: "watch" },
  { name: "Báscula inteligente", connected: false, icon: "scale" },
];

export const weekMetrics = [
  { label: "Tiempo en rango", value: "68%", sub: "meta 70%", color: "#4DA3FF" },
  { label: "Pasos / día",     value: "6,420", sub: "meta 7,000", color: "#37D67A" },
  { label: "Sueño promedio",  value: "6.1 h", sub: "meta 7 h",   color: "#A78BFA" },
  { label: "Picos altos",     value: "9",     sub: "esta semana", color: "#FFB23E" },
];

// Mini-historial por sub-índice (7 días)
export const subIndexHistory: Record<string, number[]> = {
  Glucosa:   [62, 60, 64, 58, 55, 60, 58],
  Actividad: [55, 60, 50, 65, 80, 75, 71],
  Sueño:     [60, 55, 65, 50, 45, 52, 49],
  Estrés:    [58, 62, 68, 60, 55, 64, 66],
  Nutrición: [62, 58, 65, 60, 50, 55, 54],
};

export const subIndexInfo: Record<
  string,
  { what: string; tips: string[] }
> = {
  Glucosa: {
    what:
      "Tu glucosa muestra cómo tu cuerpo maneja el azúcar. Picos frecuentes desgastan tu sensibilidad a la insulina.",
    tips: [
      "Empieza el almuerzo con verduras antes que carbohidratos.",
      "Camina 10–15 min después de cada comida principal.",
      "Reduce bebidas azucaradas; prefiere agua con limón.",
    ],
  },
  Actividad: {
    what:
      "Moverte a diario mejora cómo tus músculos absorben la glucosa y baja la presión arterial.",
    tips: [
      "Apunta a 7,000 pasos al día.",
      "Sube escaleras en vez del ascensor cuando puedas.",
      "2 sesiones de fuerza por semana ayudan a tu cintura.",
    ],
  },
  Sueño: {
    what:
      "Dormir menos de 7h eleva tu resistencia a la insulina y el cortisol al día siguiente.",
    tips: [
      "Apaga pantallas 30 min antes de dormir.",
      "Acuéstate antes de medianoche.",
      "Si te despiertas, evita el celular y respira lento.",
    ],
  },
  Estrés: {
    what:
      "El estrés crónico mantiene altos los niveles de cortisol, que sube tu glucosa aunque no comas.",
    tips: [
      "5 min de respiración 4-7-8 al mediodía.",
      "Camina al aire libre en horas de luz.",
      "Limita el café después de las 4 p.m.",
    ],
  },
  Nutrición: {
    what:
      "La carga glucémica de tus platos define qué tan alto sube tu azúcar después de comer.",
    tips: [
      "Cambia arroz blanco por quinua o arroz integral.",
      "Incluye proteína magra en cada comida principal.",
      "Acompaña los carbos con grasa buena (palta, oliva).",
    ],
  },
};
