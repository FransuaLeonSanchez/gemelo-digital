export type Mood = "happy" | "neutral" | "tired";

export type ScreenId =
  | "login"
  | "welcome"
  | "splash"
  | "createTwin"
  | "customize"
  | "profileForm"
  | "pairDevice"
  | "processing"
  | "home"
  | "twin"
  | "log"
  | "progress"
  | "projection"
  | "recommendations"
  | "subIndex"
  | "alerts"
  | "doctor"
  | "profile";

export interface PairedDevice {
  name: string;
  model: string;
  type: "smartwatch" | "cgm" | "scale";
}

export type SubIndexKey = "Glucosa" | "Actividad" | "Sueño" | "Estrés" | "Nutrición";

export interface SubIndex {
  key: SubIndexKey;
  weight: number;
  value: number;
  icon: string;
  color: string;
}

export interface Recommendation {
  tag: string;
  color: string;
  title: string;
  reason: string;
}

export interface AlertItem {
  icon: string;
  color: string;
  title: string;
  body: string;
  time: string;
}

export interface TwinAppearance {
  skinTone: number;
  hair: "corto" | "largo" | "recogido" | "rizado";
  glasses: boolean;
  presentation: "femenina" | "masculina" | "neutra";
}
