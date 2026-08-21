// Canton awareness — the platform is Swiss to the bone. Offers, dealer
// coverage, and location filters are all canton-scoped. Codes are the official
// two-letter abbreviations; names are localised where they differ.

export type CantonCode =
  | "ZH" | "BE" | "LU" | "UR" | "SZ" | "OW" | "NW" | "GL" | "ZG" | "FR"
  | "SO" | "BS" | "BL" | "SH" | "AR" | "AI" | "SG" | "GR" | "AG" | "TG"
  | "TI" | "VD" | "VS" | "NE" | "GE" | "JU";

export interface Canton {
  code: CantonCode;
  /** Primary German name (default UI). */
  de: string;
  fr: string;
  it: string;
}

export const CANTONS: Canton[] = [
  { code: "ZH", de: "Zürich", fr: "Zurich", it: "Zurigo" },
  { code: "BE", de: "Bern", fr: "Berne", it: "Berna" },
  { code: "LU", de: "Luzern", fr: "Lucerne", it: "Lucerna" },
  { code: "UR", de: "Uri", fr: "Uri", it: "Uri" },
  { code: "SZ", de: "Schwyz", fr: "Schwytz", it: "Svitto" },
  { code: "OW", de: "Obwalden", fr: "Obwald", it: "Obvaldo" },
  { code: "NW", de: "Nidwalden", fr: "Nidwald", it: "Nidvaldo" },
  { code: "GL", de: "Glarus", fr: "Glaris", it: "Glarona" },
  { code: "ZG", de: "Zug", fr: "Zoug", it: "Zugo" },
  { code: "FR", de: "Freiburg", fr: "Fribourg", it: "Friburgo" },
  { code: "SO", de: "Solothurn", fr: "Soleure", it: "Soletta" },
  { code: "BS", de: "Basel-Stadt", fr: "Bâle-Ville", it: "Basilea Città" },
  { code: "BL", de: "Basel-Land", fr: "Bâle-Campagne", it: "Basilea Campagna" },
  { code: "SH", de: "Schaffhausen", fr: "Schaffhouse", it: "Sciaffusa" },
  { code: "AR", de: "Appenzell A.Rh.", fr: "Appenzell Rh.-Ext.", it: "Appenzello Esterno" },
  { code: "AI", de: "Appenzell I.Rh.", fr: "Appenzell Rh.-Int.", it: "Appenzello Interno" },
  { code: "SG", de: "St. Gallen", fr: "Saint-Gall", it: "San Gallo" },
  { code: "GR", de: "Graubünden", fr: "Grisons", it: "Grigioni" },
  { code: "AG", de: "Aargau", fr: "Argovie", it: "Argovia" },
  { code: "TG", de: "Thurgau", fr: "Thurgovie", it: "Turgovia" },
  { code: "TI", de: "Tessin", fr: "Tessin", it: "Ticino" },
  { code: "VD", de: "Waadt", fr: "Vaud", it: "Vaud" },
  { code: "VS", de: "Wallis", fr: "Valais", it: "Vallese" },
  { code: "NE", de: "Neuenburg", fr: "Neuchâtel", it: "Neuchâtel" },
  { code: "GE", de: "Genf", fr: "Genève", it: "Ginevra" },
  { code: "JU", de: "Jura", fr: "Jura", it: "Giura" },
];

const BY_CODE = new Map(CANTONS.map((c) => [c.code, c]));

export function cantonName(code: CantonCode, locale: "de" | "fr" | "it" = "de"): string {
  const c = BY_CODE.get(code);
  return c ? c[locale] : code;
}
