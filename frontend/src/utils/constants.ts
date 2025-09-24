export const API_URL = "https://gliner-medical.switzerlandnorth.cloudapp.azure.com/api";

export const DEV_ENVIRONMENT = "development";

export const EMPTY_STRING = "";

export const backendNotAvailableMessage =
  "The backend service is unavailable. \n Please try again, or contact support if the issue persists.";

export const LOCAL_STORAGE_KEYS = {
  ID_TOKEN: "idToken",
  USER_OPTIONS: "UserOptions",
  USER_PROFILE: "UserProfile",
};

export const tooltips = {
  text: "Enter the text you want to analyze for named entities.",
  labels:
    "Specify the types of entities you want to detect (e.g., PERSON, LOCATION, ORGANIZATION, DATE). Separate multiple labels with commas.",
  threshold:
    "Set the minimum confidence score (0.0 to 1.0) required for an entity to be included in the results. Higher values mean more precise but potentially fewer detections.",
  multiLabeling:
    "Allow the same text span to be assigned multiple labels simultaneously.",
  model:
    "Choose between Contrastive GLiNER (more accurate, slower) and Regular GLiNER (faster, good accuracy).",
  trainingConsent:
    "Allow your submitted text to be used for improving future models. Your text will be stored anonymously and used only for training purposes.",
};

export const text_placeholder =
  "Your throat is a tube that carries food to your esophagus and air to your windpipe and larynx (also called the voice box). The technical name for the throat is pharynx. You can have a sore throat for many reasons. Often, colds and flu cause sore throats. Other causes can include: Allergies Mononucleosis Smoking Strep throat Tonsillitis an infection in the tonsils Treatment depends on the cause. Sucking on lozenges, drinking lots of liquids, and gargling may ease the pain. Overthecounter pain relievers can also help, but children should not take aspirin.";
export const entity_types_placeholder =
  "BODY PART, DISEASE, TREATMENT, DRUG, AGE GROUP";

export const thresholdSliderMarks = [
  { value: 0.1, label: "0.1" },
  { value: 0.3, label: "0.3" },
  { value: 0.5, label: "0.5" },
  { value: 0.7, label: "0.7" },
  { value: 0.9, label: "0.9" },
];

export const entityColorPalette = [
  { main: "#3b82f6", light: "#dbeafe", lighter: "#eff6ff", dark: "#1d4ed8" }, // blue
  { main: "#10b981", light: "#dcfce7", lighter: "#f0fdf4", dark: "#059669" }, // emerald
  { main: "#8b5cf6", light: "#e9d5ff", lighter: "#faf5ff", dark: "#7c3aed" }, // purple
  { main: "#f97316", light: "#fed7aa", lighter: "#fff7ed", dark: "#ea580c" }, // orange
  { main: "#eab308", light: "#fef3c7", lighter: "#fffbeb", dark: "#ca8a04" }, // yellow
  { main: "#06b6d4", light: "#a5f3fc", lighter: "#ecfeff", dark: "#0891b2" }, // cyan
  { main: "#84cc16", light: "#dcfce7", lighter: "#f7fee7", dark: "#65a30d" }, // lime
  { main: "#f43f5e", light: "#fecdd3", lighter: "#fff1f2", dark: "#e11d48" }, // rose
  { main: "#6366f1", light: "#c7d2fe", lighter: "#eef2ff", dark: "#4f46e5" }, // indigo
  { main: "#14b8a6", light: "#99f6e4", lighter: "#f0fdfa", dark: "#0d9488" }, // teal
  { main: "#a855f7", light: "#ddd6fe", lighter: "#f5f3ff", dark: "#9333ea" }, // violet
  { main: "#ec4899", light: "#f9a8d4", lighter: "#fdf2f8", dark: "#db2777" }, // pink
  { main: "#5f71ff", light: "#adb6fa", lighter: "#d6d9f6", dark: "#3d53ff" }, // slate
  { main: "#f59e0b", light: "#fed7aa", lighter: "#fffbeb", dark: "#d97706" }, // amber
  { main: "#22c55e", light: "#bbf7d0", lighter: "#f0fdf4", dark: "#16a34a" }, // green
];
