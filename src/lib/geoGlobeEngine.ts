export interface GeoCountryFeature {
  type: 'Feature';
  properties: {
    ADMIN: string;
    NAME?: string;
    ISO_A2?: string;
    ISO_A3?: string;
    CONTINENT: string;
    SUBREGION?: string;
    POP_EST?: number;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any[];
  };
  bbox?: number[];
}

export interface ParsedCountry {
  id: string; // ISO_A3 or fallback unique key
  isoA2: string;
  nameEs: string;
  nameEn: string;
  aliases: string[];
  continentEn: string;
  continentEs: string;
  lat: number;
  lng: number;
  cameraAltitude: number;
  feature: GeoCountryFeature;
}

/**
 * Comprehensive mapping from ISO_A3 / ADMIN to Spanish Country Names & Accepted Aliases.
 */
const COUNTRY_SPANISH_MAP: Record<string, { nameEs: string; aliases?: string[] }> = {
  // América del Sur
  ARG: { nameEs: 'Argentina' },
  BOL: { nameEs: 'Bolivia' },
  BRA: { nameEs: 'Brasil', aliases: ['Brazil'] },
  CHL: { nameEs: 'Chile' },
  COL: { nameEs: 'Colombia' },
  ECU: { nameEs: 'Ecuador' },
  GUY: { nameEs: 'Guyana' },
  PRY: { nameEs: 'Paraguay' },
  PER: { nameEs: 'Perú' },
  SUR: { nameEs: 'Surinam', aliases: ['Suriname'] },
  URY: { nameEs: 'Uruguay' },
  VEN: { nameEs: 'Venezuela' },

  // América del Norte y Central / Caribe
  CAN: { nameEs: 'Canadá' },
  USA: { nameEs: 'Estados Unidos', aliases: ['EEUU', 'EE.UU.', 'USA', 'United States'] },
  MEX: { nameEs: 'México', aliases: ['Mexico'] },
  GTM: { nameEs: 'Guatemala' },
  BLZ: { nameEs: 'Belice', aliases: ['Belize'] },
  HND: { nameEs: 'Honduras' },
  SLV: { nameEs: 'El Salvador', aliases: ['Salvador'] },
  NIC: { nameEs: 'Nicaragua' },
  CRI: { nameEs: 'Costa Rica' },
  PAN: { nameEs: 'Panamá' },
  CUB: { nameEs: 'Cuba' },
  HTI: { nameEs: 'Haití' },
  DOM: { nameEs: 'República Dominicana', aliases: ['Dominicana'] },
  JAM: { nameEs: 'Jamaica' },
  BHS: { nameEs: 'Bahamas', aliases: ['Las Bahamas'] },
  PRI: { nameEs: 'Puerto Rico' },
  TTO: { nameEs: 'Trinidad y Tobago' },
  GRL: { nameEs: 'Groenlandia', aliases: ['Greenland'] },

  // Europa
  ESP: { nameEs: 'España', aliases: ['Espana', 'Spain'] },
  PRT: { nameEs: 'Portugal' },
  FRA: { nameEs: 'Francia', aliases: ['France'] },
  ITA: { nameEs: 'Italia', aliases: ['Italy'] },
  DEU: { nameEs: 'Alemania', aliases: ['Germany'] },
  GBR: { nameEs: 'Reino Unido', aliases: ['Gran Bretaña', 'Inglaterra', 'UK', 'United Kingdom'] },
  IRL: { nameEs: 'Irlanda', aliases: ['Ireland'] },
  ISL: { nameEs: 'Islandia', aliases: ['Iceland'] },
  NOR: { nameEs: 'Noruega', aliases: ['Norway'] },
  SWE: { nameEs: 'Suecia', aliases: ['Sweden'] },
  FIN: { nameEs: 'Finlandia', aliases: ['Finland'] },
  DNK: { nameEs: 'Dinamarca', aliases: ['Denmark'] },
  NLD: { nameEs: 'Países Bajos', aliases: ['Holanda', 'Netherlands'] },
  BEL: { nameEs: 'Bélgica', aliases: ['Belgium'] },
  LUX: { nameEs: 'Luxemburgo' },
  CHE: { nameEs: 'Suiza', aliases: ['Switzerland'] },
  AUT: { nameEs: 'Austria' },
  POL: { nameEs: 'Polonia', aliases: ['Poland'] },
  CZE: { nameEs: 'República Checa', aliases: ['Chequia', 'Czechia'] },
  SVK: { nameEs: 'Eslovaquia', aliases: ['Slovakia'] },
  HUN: { nameEs: 'Hungría', aliases: ['Hungary'] },
  ROU: { nameEs: 'Rumania', aliases: ['Rumanía', 'Romania'] },
  BGR: { nameEs: 'Bulgaria' },
  GRC: { nameEs: 'Grecia', aliases: ['Greece'] },
  ALB: { nameEs: 'Albania' },
  MKD: { nameEs: 'Macedonia del Norte', aliases: ['Macedonia'] },
  SRB: { nameEs: 'Serbia' },
  MNE: { nameEs: 'Montenegro' },
  BIH: { nameEs: 'Bosnia y Herzegovina', aliases: ['Bosnia'] },
  HRV: { nameEs: 'Croacia', aliases: ['Croatia'] },
  SVN: { nameEs: 'Eslovenia', aliases: ['Slovenia'] },
  UKR: { nameEs: 'Ucrania', aliases: ['Ukraine'] },
  BLR: { nameEs: 'Bielorrusia', aliases: ['Belarus'] },
  MDA: { nameEs: 'Moldavia', aliases: ['Moldova'] },
  LTU: { nameEs: 'Lituania', aliases: ['Lithuania'] },
  LVA: { nameEs: 'Letonia', aliases: ['Latvia'] },
  EST: { nameEs: 'Estonia' },
  RUS: { nameEs: 'Rusia', aliases: ['Russia'] },
  CYP: { nameEs: 'Chipre', aliases: ['Cyprus'] },

  // Asia
  TUR: { nameEs: 'Turquía', aliases: ['Turkey'] },
  SYR: { nameEs: 'Siria', aliases: ['Syria'] },
  LBN: { nameEs: 'Líbano', aliases: ['Libano', 'Lebanon'] },
  ISR: { nameEs: 'Israel' },
  PSE: { nameEs: 'Palestina', aliases: ['Palestine'] },
  JOR: { nameEs: 'Jordania', aliases: ['Jordan'] },
  IRQ: { nameEs: 'Irak', aliases: ['Iraq'] },
  IRN: { nameEs: 'Irán', aliases: ['Iran'] },
  SAU: { nameEs: 'Arabia Saudita', aliases: ['Arabia Saudí', 'Saudi Arabia'] },
  YEM: { nameEs: 'Yemen' },
  OMN: { nameEs: 'Omán', aliases: ['Oman'] },
  ARE: { nameEs: 'Emiratos Árabes Unidos', aliases: ['Emiratos Arabes', 'EAU', 'UAE'] },
  QAT: { nameEs: 'Catar', aliases: ['Qatar'] },
  KWT: { nameEs: 'Kuwait' },
  GEO: { nameEs: 'Georgia' },
  ARM: { nameEs: 'Armenia' },
  AZE: { nameEs: 'Azerbaiyán' },
  KAZ: { nameEs: 'Kazajistán', aliases: ['Kazakhstan'] },
  UZB: { nameEs: 'Uzbekistán', aliases: ['Uzbekistan'] },
  TKM: { nameEs: 'Turkmenistán', aliases: ['Turkmenistan'] },
  KGZ: { nameEs: 'Kirguistán', aliases: ['Kyrgyzstan'] },
  TJK: { nameEs: 'Tayikistán', aliases: ['Tajikistan'] },
  AFG: { nameEs: 'Afganistán', aliases: ['Afghanistan'] },
  PAK: { nameEs: 'Pakistán', aliases: ['Pakistan'] },
  IND: { nameEs: 'India' },
  NPL: { nameEs: 'Nepal' },
  BTN: { nameEs: 'Bután', aliases: ['Bhutan'] },
  BGD: { nameEs: 'Bangladés', aliases: ['Bangladesh'] },
  LKA: { nameEs: 'Sri Lanka' },
  MMR: { nameEs: 'Birmania', aliases: ['Myanmar'] },
  THA: { nameEs: 'Tailandia', aliases: ['Thailand'] },
  LAO: { nameEs: 'Laos' },
  VNM: { nameEs: 'Vietnam' },
  KHM: { nameEs: 'Camboya', aliases: ['Cambodia'] },
  MYS: { nameEs: 'Malasia', aliases: ['Malaysia'] },
  IDN: { nameEs: 'Indonesia' },
  PHL: { nameEs: 'Filipinas', aliases: ['Philippines'] },
  BRN: { nameEs: 'Brunéi', aliases: ['Brunei'] },
  TLS: { nameEs: 'Timor Oriental', aliases: ['East Timor'] },
  CHN: { nameEs: 'China' },
  MNG: { nameEs: 'Mongolia' },
  PRK: { nameEs: 'Corea del Norte', aliases: ['North Korea'] },
  KOR: { nameEs: 'Corea del Sur', aliases: ['Corea', 'South Korea'] },
  JPN: { nameEs: 'Japón', aliases: ['Japon', 'Japan'] },
  TWN: { nameEs: 'Taiwán', aliases: ['Taiwan'] },

  // África
  MAR: { nameEs: 'Marruecos', aliases: ['Morocco'] },
  DZA: { nameEs: 'Argelia', aliases: ['Algeria'] },
  TUN: { nameEs: 'Túnez', aliases: ['Tunisia'] },
  LBY: { nameEs: 'Libia', aliases: ['Libya'] },
  EGY: { nameEs: 'Egipto', aliases: ['Egypt'] },
  ESH: { nameEs: 'Sáhara Occidental', aliases: ['Sahara Occidental'] },
  MRT: { nameEs: 'Mauritania' },
  MLI: { nameEs: 'Malí', aliases: ['Mali'] },
  NER: { nameEs: 'Níger', aliases: ['Niger'] },
  TCD: { nameEs: 'Chad' },
  SDN: { nameEs: 'Sudán', aliases: ['Sudan'] },
  SSD: { nameEs: 'Sudán del Sur', aliases: ['South Sudan'] },
  ERI: { nameEs: 'Eritrea' },
  DJI: { nameEs: 'Yibuti', aliases: ['Djibouti'] },
  SOM: { nameEs: 'Somalia' },
  ETH: { nameEs: 'Etiopía', aliases: ['Ethiopia'] },
  SEN: { nameEs: 'Senegal' },
  GMB: { nameEs: 'Gambia' },
  GNB: { nameEs: 'Guinea-Bisáu', aliases: ['Guinea Bisau'] },
  GIN: { nameEs: 'Guinea' },
  SLE: { nameEs: 'Sierra Leona', aliases: ['Sierra Leone'] },
  LBR: { nameEs: 'Liberia' },
  CIV: { nameEs: 'Costa de Marfil', aliases: ['Ivory Coast'] },
  BFA: { nameEs: 'Burkina Faso' },
  GHA: { nameEs: 'Ghana' },
  TGO: { nameEs: 'Togo' },
  BEN: { nameEs: 'Benín', aliases: ['Benin'] },
  NGA: { nameEs: 'Nigeria' },
  CMR: { nameEs: 'Camerún', aliases: ['Cameroon'] },
  CAF: { nameEs: 'República Centroafricana', aliases: ['Centroafricana'] },
  GNQ: { nameEs: 'Guinea Ecuatorial' },
  GAB: { nameEs: 'Gabón', aliases: ['Gabon'] },
  COG: { nameEs: 'República del Congo', aliases: ['Congo'] },
  COD: { nameEs: 'República Democrática del Congo', aliases: ['RD Congo', 'Congo Democrático'] },
  UGA: { nameEs: 'Uganda' },
  KEN: { nameEs: 'Kenia', aliases: ['Kenya'] },
  RWA: { nameEs: 'Ruanda', aliases: ['Rwanda'] },
  BDI: { nameEs: 'Burundi' },
  TZA: { nameEs: 'Tanzania' },
  AGO: { nameEs: 'Angola' },
  ZMB: { nameEs: 'Zambia' },
  MWI: { nameEs: 'Malaui', aliases: ['Malawi'] },
  MOZ: { nameEs: 'Mozambique' },
  ZWE: { nameEs: 'Zimbabue', aliases: ['Zimbabwe'] },
  BWA: { nameEs: 'Botsuana', aliases: ['Botswana'] },
  NAM: { nameEs: 'Namibia' },
  ZAF: { nameEs: 'Sudáfrica', aliases: ['South Africa'] },
  LSO: { nameEs: 'Lesoto', aliases: ['Lesotho'] },
  SWZ: { nameEs: 'Esuatini', aliases: ['Suazilandia', 'Eswatini'] },
  MDG: { nameEs: 'Madagascar' },

  // Oceanía
  AUS: { nameEs: 'Australia' },
  NZL: { nameEs: 'Nueva Zelanda', aliases: ['New Zealand'] },
  PNG: { nameEs: 'Papúa Nueva Guinea', aliases: ['Papua Nueva Guinea'] },
  FJI: { nameEs: 'Fiyi', aliases: ['Fiji'] },
  SLB: { nameEs: 'Islas Salomón', aliases: ['Salomon'] },
  VUT: { nameEs: 'Vanuatu' },
  NCL: { nameEs: 'Nueva Caledonia' },
};

const CONTINENT_SPANISH_MAP: Record<string, string> = {
  'South America': 'América del Sur',
  'North America': 'América del Norte y Central',
  Europe: 'Europa',
  Asia: 'Asia',
  Africa: 'África',
  Oceania: 'Oceanía',
  Antarctica: 'Antártida',
  'Seven seas (open ocean)': 'Islas Oceánicas',
};

/**
 * Strips accents/diacritics, converts to lowercase, and collapses spaces.
 */
export function normalizeCountryText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates free-text user input against the target country's Spanish name, English name, and aliases.
 */
export function isCountryAnswerCorrect(userInput: string, country: ParsedCountry): boolean {
  const cleanUser = normalizeCountryText(userInput);
  if (!cleanUser || cleanUser.length < 2) return false;

  const candidates = [
    country.nameEs,
    country.nameEn,
    ...country.aliases,
  ].map(normalizeCountryText);

  if (candidates.includes(cleanUser)) return true;

  // Also allow omitting common prefixes like "republica de " or "el "
  const stripPrefix = (s: string) =>
    s.replace(/^(la |el |los |las |republica de |republica del |republica |reino de |islas )/, '').trim();

  const strippedUser = stripPrefix(cleanUser);
  return candidates.some((c) => stripPrefix(c) === strippedUser && strippedUser.length >= 3);
}

/**
 * Computes the visual center (lat, lng) and appropriate camera altitude of a GeoJSON polygon/multipolygon
 * by picking its largest polygon ring so countries with overseas islands center on their main territory.
 */
export function computeFeatureCenterAndAltitude(feature: GeoCountryFeature): {
  lat: number;
  lng: number;
  altitude: number;
} {
  const geom = feature.geometry;
  let bestRing: number[][] = [];
  let maxAreaApprox = -1;

  const evaluateRing = (ring: number[][]) => {
    if (!ring || ring.length === 0) return;
    let minLng = 180;
    let maxLng = -180;
    let minLat = 90;
    let maxLat = -90;
    for (const pt of ring) {
      const lng = pt[0];
      const lat = pt[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    const area = (maxLng - minLng) * (maxLat - minLat);
    if (area > maxAreaApprox) {
      maxAreaApprox = area;
      bestRing = ring;
    }
  };

  if (geom.type === 'Polygon') {
    evaluateRing(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (poly && poly[0]) evaluateRing(poly[0]);
    }
  }

  if (bestRing.length === 0) {
    return { lat: 0, lng: 0, altitude: 1.5 };
  }

  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;
  let sumLat = 0;
  let sumLng = 0;

  for (const pt of bestRing) {
    const lng = pt[0];
    const lat = pt[1];
    sumLng += lng;
    sumLat += lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const lat = (minLat + maxLat) / 2 || sumLat / bestRing.length;
  const lng = (minLng + maxLng) / 2 || sumLng / bestRing.length;
  const span = Math.max(maxLat - minLat, maxLng - minLng);

  // Calculate smooth zoom altitude proportional to country size
  let altitude = 1.05;
  if (span > 45) altitude = 1.65;
  else if (span > 25) altitude = 1.35;
  else if (span > 12) altitude = 1.05;
  else if (span > 5) altitude = 0.82;
  else altitude = 0.68;

  return { lat, lng, altitude };
}

/**
 * Parses raw GeoJSON features into playable countries (excluding Antarctica and unrecognized territories).
 */
export function parseGeoJsonCountries(features: GeoCountryFeature[]): ParsedCountry[] {
  const parsed: ParsedCountry[] = [];
  const usedIds = new Set<string>();

  for (const feature of features) {
    if (!feature.properties) continue;
    const props = feature.properties;
    const continentEn = props.CONTINENT || 'Europe';
    if (continentEn === 'Antarctica' || props.ISO_A3 === 'ATA') continue;

    const rawIso =
      props.ISO_A3 && props.ISO_A3 !== '-99'
        ? props.ISO_A3
        : props.ADM0_A3 || props.GU_A3 || props.SOV_A3 || props.ADMIN;

    if (!rawIso || usedIds.has(rawIso)) continue;

    // Skip non-playable disputed areas like Northern Cyprus or Somaliland unless mapped
    const mapped = COUNTRY_SPANISH_MAP[rawIso];
    const nameEn = props.ADMIN || props.NAME || rawIso;

    // Include all mapped countries (165+ sovereign nations) or clean ADMIN names
    if (!mapped && (nameEn.includes('Cyprus') || nameEn.includes('Somaliland') || nameEn.includes('Siachen'))) {
      continue;
    }

    usedIds.add(rawIso);
    const { lat, lng, altitude } = computeFeatureCenterAndAltitude(feature);

    parsed.push({
      id: rawIso,
      isoA2: props.ISO_A2 && props.ISO_A2 !== '-99' ? props.ISO_A2 : '',
      nameEs: mapped?.nameEs || nameEn,
      nameEn,
      aliases: mapped?.aliases || [],
      continentEn,
      continentEs: CONTINENT_SPANISH_MAP[continentEn] || continentEn,
      lat,
      lng,
      cameraAltitude: altitude,
      feature,
    });
  }

  return parsed;
}

/**
 * Generates 4 multiple-choice options: 1 correct country + 3 random distractors from the SAME continent.
 */
export function generateSameContinentOptions(
  target: ParsedCountry,
  allCountries: ParsedCountry[]
): ParsedCountry[] {
  const sameContinent = allCountries.filter(
    (c) => c.id !== target.id && c.continentEn === target.continentEn
  );

  const pool =
    sameContinent.length >= 3
      ? sameContinent
      : allCountries.filter((c) => c.id !== target.id);

  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const distractors = shuffledPool.slice(0, 3);

  return [target, ...distractors].sort(() => Math.random() - 0.5);
}
