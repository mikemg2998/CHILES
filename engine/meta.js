/* Metadatos multidimensionales de una interacción. Intensidad y explicitud son cosas distintas:
   un masaje firme es intenso y nada explícito; una caricia leve en el clítoris es explícita y poco intensa.
   Se derivan del catálogo (acción, zona, forma, condición) para que todo el contenido los tenga sin etiquetar a mano;
   OVERRIDES corrige los casos donde la derivación se queda corta. */
import { ACTION, ZONE, METHOD, CONDITION } from './catalog.js';

const clamp = (v, a = 1, b = 10) => Math.max(a, Math.min(b, v));
const OVERRIDES = {
  frenteConFrente: { vulnerability: 6 }, mirarse: { vulnerability: 6 },
  susurrar: { proximity: 8, vulnerability: 5 }, enVozAlta: { vulnerability: 8 }, describir: { vulnerability: 7 },
  vendados: { vulnerability: 8 }, ojosCerrados: { vulnerability: 6 }, luzApagada: { vulnerability: 5 },
  apartarRopa: { vulnerability: 6, sexualExplicitness: 5 }, manoBajoRopa: { vulnerability: 6, sexualExplicitness: 5.5 }, desabrochar: { vulnerability: 6, sexualExplicitness: 5.5 },
  nalgada: { physicalIntensity: 8 }, sujetarMunecas: { control: 8, vulnerability: 7 }, sujetarNuca: { control: 8 },
};

/* patrón de interacción: quién hace, quién decide */
export function patternOf(a, c) {
  if (c && c.pattern) return c.pattern;
  return a.pattern || 'GIVE';
}
export const semanticFamilyOf = (a, z) => `${a.family}·${z.family}`;

export function interactionMeta(combo) {
  const a = ACTION[combo.action], z = ZONE[combo.zone], m = combo.method ? METHOD[combo.method] : null, c = combo.cond ? CONDITION[combo.cond] : null;
  const pattern = patternOf(a, c);
  const intimate = z.tags.includes('intimo');
  const explicitFamily = ['bocaIntima', 'manoIntima'].includes(a.family);
  let physicalIntensity = a.intensity + (m && m.dim === 'presion' ? m.mod * 2 : 0) + (a.tags.includes('presion') ? 1 : 0);
  let sexualExplicitness = intimate ? 9 + (explicitFamily ? 1 : 0) : clamp(0.65 * z.intensity + 0.35 * a.intensity - (a.contactType === 'ninguno' ? 1 : 0));
  let vulnerability = (intimate ? 8 : z.tags.includes('sensible') ? 4.5 : 2.5) + (c && c.role === 'interaccion' ? 1.5 : 0) + (a.contactType === 'boca' ? 0.5 : 0);
  let proximity = { cuerpo: 9, boca: 8.5, ninguno: 6.5, mano: 5 }[a.contactType] || 5;
  let reciprocity = { MUTUAL: 9, CHOOSE: 7, GUIDE: 4, DISCOVER: 4, GIVE: 3, RECEIVE: 3, CONTINUE: 5 }[pattern] || 3;
  let control = pattern === 'CHOOSE' ? 2 : pattern === 'GUIDE' ? 8 : a.tags.includes('presion') ? 7 : 5; // 10 = manda quien actúa, 1 = manda quien recibe
  const duration = m && m.seconds ? m.seconds : { breve: 5, normal: 20, sostenible: 45 }[a.durationType] || 20;
  const o = Object.assign({}, OVERRIDES[a.id], c ? OVERRIDES[c.id] : null);
  const dims = { physicalIntensity, sexualExplicitness, vulnerability, proximity, reciprocity, control, duration, ...o };
  for (const k of Object.keys(dims)) if (k !== 'duration') dims[k] = Math.round(clamp(dims[k]) * 10) / 10;
  return { pattern, semanticFamily: semanticFamilyOf(a, z), dims };
}
