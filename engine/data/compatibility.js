/* COMPATIBILITY MATRIX · lista blanca explícita acción + herramienta + zona.
   Una combinación solo puede generarse si está aquí con status APPROVED. Tiers: EXCELLENT (la combinación clásica, lo
   que un amante haría sin pensar) · GOOD · VALID (correcta pero menor) · INVALID (nunca). Sin nivel declarado, la
   combinación vale en allowedLevels(acción) ∩ allowedLevels(zona); con `levels` se recorta. `styles` recorta la
   intersección acción ∩ zona cuando hace falta. `notes` es para la revisión humana.
   ORIGEN: migración 1:1 del catálogo validado a mano por el diseñador (v5). Ninguna combinación íntima se ha añadido por
   inferencia: lo que el modelo podría generar y no está aquí vive en content-review/unreviewed.md con status UNREVIEWED
   y NO entra en el generador hasta que alguien lo apruebe aquí. Para aprobar: añadir la zona a la entrada correspondiente.
   Para rechazar de forma explícita: tier 'INVALID' (queda documentado y deja de aparecer en la cola). */
const E = (action, tool, targets, o = {}) => ({ action, tool, targets, status: 'APPROVED', ...o });
export const COMPATIBILITY = [
    E('CARESS', 'oneHand', {
    forehead: { tier: 'VALID', levels: [1] }, upperArms: { tier: 'GOOD', levels: [1] }, hands: { tier: 'GOOD', levels: [1] }, hair: { tier: 'EXCELLENT', levels: [1] }, shoulders: { tier: 'GOOD', levels: [1, 2] }, fingers: { tier: 'VALID', levels: [1] }, temples: { tier: 'GOOD', levels: [1] }, palms: { tier: 'VALID', levels: [1] }, cheeks: { tier: 'EXCELLENT', levels: [1] }, face: { tier: 'EXCELLENT', levels: [1] }, legs: { tier: 'VALID', levels: [1] }, feet: { tier: 'GOOD', levels: [1] }, wrists: { tier: 'GOOD', levels: [1, 2] }, ankles: 'VALID', back: { tier: 'EXCELLENT', levels: [1, 2] }, nape: { tier: 'GOOD', levels: [1, 2] }, collarbones: { tier: 'GOOD', levels: [1, 2] }, neck: 'EXCELLENT', waist: { tier: 'GOOD', levels: [1, 2] }, poplitealArea: { tier: 'VALID', levels: [2, 3] }, lowerBack: 'GOOD', abdomen: 'EXCELLENT', flanks: 'GOOD', chest: 'GOOD', hips: 'GOOD', outerThighs: 'GOOD', lowerAbdomen: 'EXCELLENT', breasts: 'EXCELLENT', innerThighs: 'EXCELLENT', buttocks: 'EXCELLENT', hipCrease: 'VALID', groin: 'GOOD', nipples: 'GOOD', testicles: 'VALID', vulva: 'EXCELLENT', penis: 'EXCELLENT', clitoris: 'GOOD' }),
    E('BRUSH', 'fingers', {
    upperArms: { tier: 'GOOD', levels: [1] }, legs: { tier: 'VALID', levels: [1] }, wrists: { tier: 'VALID', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, collarbones: { tier: 'GOOD', levels: [1, 2] }, neck: 'EXCELLENT', waist: { tier: 'GOOD', levels: [1, 2] }, poplitealArea: { tier: 'VALID', levels: [2, 3] }, abdomen: 'EXCELLENT', lowerBack: 'GOOD', flanks: 'GOOD', outerThighs: 'GOOD', chest: 'GOOD', hips: 'GOOD', innerThighs: 'EXCELLENT', breasts: 'GOOD', lowerAbdomen: 'GOOD', hipCrease: 'GOOD', groin: 'GOOD' }),
    E('BRUSH', 'fingertips', {
    upperArms: { tier: 'GOOD', levels: [1] }, hands: { tier: 'VALID', levels: [1] }, shoulders: { tier: 'GOOD', levels: [1, 2] }, temples: { tier: 'VALID', levels: [1] }, cheeks: { tier: 'GOOD', levels: [1] }, face: { tier: 'GOOD', levels: [1] }, legs: { tier: 'VALID', levels: [1] }, wrists: { tier: 'GOOD', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, nape: { tier: 'EXCELLENT', levels: [1, 2] }, collarbones: { tier: 'EXCELLENT', levels: [1, 2] }, neck: 'EXCELLENT', ears: { tier: 'VALID', levels: [1, 2] }, waist: { tier: 'GOOD', levels: [1, 2] }, poplitealArea: { tier: 'VALID', levels: [2, 3] }, lowerBack: 'EXCELLENT', abdomen: 'GOOD', flanks: 'EXCELLENT', chest: 'GOOD', outerThighs: 'GOOD', hips: 'GOOD', lowerAbdomen: 'GOOD', breasts: 'GOOD', innerThighs: 'EXCELLENT', hipCrease: 'GOOD', groin: 'GOOD', nipples: 'EXCELLENT', testicles: 'VALID', vulva: 'GOOD', penis: 'GOOD', clitoris: 'GOOD' }),
    E('BRUSH', 'lips', {
    shoulders: { tier: 'GOOD', levels: [2] }, wrists: { tier: 'VALID', levels: [2] }, back: { tier: 'VALID', levels: [2] }, collarbones: { tier: 'EXCELLENT', levels: [2] }, neck: { tier: 'EXCELLENT', levels: [2, 3] }, waist: { tier: 'VALID', levels: [2] }, ears: { tier: 'GOOD', levels: [2] }, lowerBack: 'GOOD', abdomen: 'GOOD', flanks: 'GOOD', lips: 'GOOD', chest: 'GOOD', hips: 'VALID', outerThighs: 'VALID', innerThighs: 'EXCELLENT', breasts: 'EXCELLENT', lowerAbdomen: 'EXCELLENT', buttocks: 'VALID', hipCrease: 'GOOD', groin: 'GOOD', nipples: 'GOOD' }),
    E('BRUSH', 'nails', {
    back: { tier: 'EXCELLENT', levels: [2] }, nape: { tier: 'VALID', levels: [2] }, neck: { tier: 'GOOD', levels: [2, 3] }, lowerBack: 'GOOD', abdomen: 'VALID', flanks: 'GOOD', outerThighs: 'EXCELLENT', chest: 'VALID', innerThighs: 'EXCELLENT', buttocks: 'GOOD' }),
    E('BRUSH', 'nose', {
    nose: 'EXCELLENT', shoulders: { tier: 'VALID', levels: [2] }, back: { tier: 'VALID', levels: [2] }, nape: { tier: 'GOOD', levels: [2] }, collarbones: { tier: 'GOOD', levels: [2] }, neck: { tier: 'EXCELLENT', levels: [2, 3] }, abdomen: 'VALID', flanks: 'VALID', innerThighs: 'GOOD', breasts: 'GOOD' }),
    E('BRUSH', 'oneFinger', {
    upperArms: { tier: 'VALID', levels: [1] }, hands: { tier: 'GOOD', levels: [1] }, shoulders: { tier: 'GOOD', levels: [1, 2] }, palms: { tier: 'EXCELLENT', levels: [1] }, face: { tier: 'GOOD', levels: [1] }, wrists: { tier: 'GOOD', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, collarbones: { tier: 'EXCELLENT', levels: [1, 2] }, waist: { tier: 'VALID', levels: [1, 2] }, ears: { tier: 'VALID', levels: [1, 2] }, abdomen: { tier: 'GOOD', levels: [2] }, lowerBack: { tier: 'GOOD', levels: [2] }, lips: 'EXCELLENT', outerThighs: 'GOOD', chest: { tier: 'VALID', levels: [2] }, hips: 'VALID', breasts: 'GOOD' }),
    E('MASSAGE', 'bothHands', {
    upperArms: { tier: 'GOOD', levels: [1] }, hands: { tier: 'EXCELLENT', levels: [1] }, shoulders: { tier: 'EXCELLENT', levels: [1, 2] }, fingers: { tier: 'VALID', levels: [1] }, calves: { tier: 'GOOD', levels: [1] }, palms: { tier: 'VALID', levels: [1] }, legs: { tier: 'GOOD', levels: [1] }, feet: { tier: 'EXCELLENT', levels: [1] }, ankles: 'VALID', wrists: { tier: 'VALID', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, nape: { tier: 'EXCELLENT', levels: [1, 2] }, neck: 'VALID', lowerBack: 'EXCELLENT', flanks: 'VALID', outerThighs: 'GOOD', hips: 'VALID', chest: 'VALID', buttocks: 'GOOD' }),
    E('MASSAGE', 'fingertips', {
    hair: { tier: 'EXCELLENT', levels: [1] } }),
    E('MASSAGE', 'thumbs', {
    hands: { tier: 'GOOD', levels: [1] }, shoulders: { tier: 'EXCELLENT', levels: [1, 2] }, palms: { tier: 'EXCELLENT', levels: [1] }, temples: { tier: 'VALID', levels: [1] }, feet: { tier: 'EXCELLENT', levels: [1] }, ankles: 'VALID', nape: { tier: 'EXCELLENT', levels: [1, 2] }, lowerBack: { tier: 'GOOD', levels: [2] }, outerThighs: { tier: 'VALID', levels: [2] } }),
    E('REST', 'bothHands', {
    back: { tier: 'EXCELLENT', levels: [1, 2] }, neck: { tier: 'GOOD', levels: [1, 2] }, abdomen: { tier: 'GOOD', levels: [2] }, lowerBack: { tier: 'EXCELLENT', levels: [2] }, flanks: { tier: 'VALID', levels: [2] }, outerThighs: { tier: 'VALID', levels: [2] }, chest: { tier: 'GOOD', levels: [2] } }),
    E('REST', 'oneHand', {
    shoulders: { tier: 'GOOD', levels: [1, 2] }, cheeks: { tier: 'EXCELLENT', levels: [1] }, back: { tier: 'GOOD', levels: [1, 2] }, nape: { tier: 'EXCELLENT', levels: [1, 2] }, neck: { tier: 'GOOD', levels: [1, 2] }, waist: { tier: 'VALID', levels: [1, 2] }, abdomen: { tier: 'EXCELLENT', levels: [2] }, lowerBack: { tier: 'GOOD', levels: [2] }, flanks: { tier: 'VALID', levels: [2] }, chest: { tier: 'EXCELLENT', levels: [2] }, outerThighs: { tier: 'VALID', levels: [2] } }),
    E('KISS', 'lips', {
    forehead: { tier: 'EXCELLENT', levels: [1] }, hands: { tier: 'EXCELLENT', levels: [1] }, shoulders: { tier: 'EXCELLENT', levels: [1, 2] }, temples: { tier: 'VALID', levels: [1] }, cheeks: { tier: 'GOOD', levels: [1] }, wrists: { tier: 'VALID', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, nape: { tier: 'EXCELLENT', levels: [1, 2] }, collarbones: { tier: 'GOOD', levels: [1, 2] }, neck: 'EXCELLENT', ears: { tier: 'EXCELLENT', levels: [1, 2] }, waist: { tier: 'VALID', levels: [1, 2] }, lips: 'EXCELLENT', abdomen: 'GOOD', lowerBack: 'GOOD', flanks: 'VALID', chest: 'GOOD', hips: 'VALID', outerThighs: 'GOOD', breasts: 'EXCELLENT', lowerAbdomen: 'EXCELLENT', innerThighs: 'EXCELLENT', buttocks: 'VALID', hipCrease: 'VALID', groin: 'VALID', nipples: 'GOOD', testicles: 'VALID', vulva: 'EXCELLENT', penis: 'VALID', clitoris: 'VALID' }),
    E('SUCK', 'mouth', {
    shoulders: { tier: 'VALID', levels: [2] }, collarbones: { tier: 'GOOD', levels: [2] }, neck: 'EXCELLENT', flanks: 'VALID', chest: 'GOOD', breasts: 'GOOD', innerThighs: 'GOOD', lowerAbdomen: 'GOOD', nipples: 'EXCELLENT', testicles: 'VALID', penis: 'VALID', vulva: 'VALID', clitoris: 'EXCELLENT', glans: 'EXCELLENT' }),
    E('LICK', 'tongue', {
    breasts: { tier: 'GOOD', levels: [2, 3] }, lowerAbdomen: { tier: 'GOOD', levels: [2, 3] }, innerThighs: { tier: 'EXCELLENT', levels: [2, 3] }, buttocks: { tier: 'VALID', levels: [2, 3] }, hipCrease: 'VALID', groin: 'GOOD', nipples: 'EXCELLENT', testicles: 'VALID', vulva: 'EXCELLENT', penis: 'EXCELLENT', clitoris: 'EXCELLENT', glans: 'GOOD' }),
    E('LICK', 'tongueTip', {
    collarbones: { tier: 'GOOD', levels: [2] }, neck: 'EXCELLENT', ears: { tier: 'EXCELLENT', levels: [2] }, abdomen: 'GOOD', lowerBack: 'VALID', flanks: 'VALID', lips: 'GOOD', chest: 'GOOD', lowerAbdomen: 'EXCELLENT', breasts: 'GOOD', innerThighs: 'GOOD', hipCrease: 'VALID', nipples: 'EXCELLENT' }),
    E('BITE', 'lips', {
    lips: 'EXCELLENT' }),
    E('BITE', 'teeth', {
    shoulders: { tier: 'EXCELLENT', levels: [2] }, nape: { tier: 'GOOD', levels: [2] }, collarbones: { tier: 'GOOD', levels: [2] }, neck: 'EXCELLENT', ears: { tier: 'EXCELLENT', levels: [2] }, waist: { tier: 'VALID', levels: [2] }, lips: 'GOOD', hips: 'VALID', innerThighs: 'GOOD', breasts: 'GOOD', buttocks: 'VALID', hipCrease: 'VALID', nipples: 'VALID' }),
    E('HOVER', 'breath', {
    nape: { tier: 'EXCELLENT', levels: [2] }, collarbones: { tier: 'GOOD', levels: [2] }, neck: 'EXCELLENT', ears: { tier: 'EXCELLENT', levels: [2] }, lips: 'GOOD', breasts: 'GOOD', innerThighs: 'GOOD', lowerAbdomen: 'GOOD', hipCrease: 'VALID', groin: 'VALID', nipples: 'GOOD', vulva: 'EXCELLENT', penis: 'EXCELLENT' }),
    E('HOVER', 'lips', {
    nape: { tier: 'EXCELLENT', levels: [2] }, collarbones: { tier: 'GOOD', levels: [2] }, neck: 'EXCELLENT', ears: { tier: 'GOOD', levels: [2] }, lips: 'EXCELLENT', breasts: 'GOOD', innerThighs: 'GOOD', lowerAbdomen: 'GOOD', hipCrease: 'VALID', groin: 'VALID', nipples: 'GOOD', vulva: 'VALID', penis: 'VALID' }),
    E('BLOW', 'breath', {
    back: { tier: 'VALID', levels: [2] }, nape: { tier: 'EXCELLENT', levels: [2] }, collarbones: { tier: 'GOOD', levels: [2] }, neck: 'EXCELLENT', ears: { tier: 'GOOD', levels: [2] }, abdomen: 'VALID', flanks: 'VALID', lowerAbdomen: 'EXCELLENT', breasts: 'GOOD', innerThighs: 'GOOD' }),
    E('WHISPER', 'voice', {
    ears: { tier: 'EXCELLENT', levels: [2] } }),
    E('HUG', 'arms', {
    shoulders: { tier: 'GOOD', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, waist: { tier: 'EXCELLENT', levels: [1, 2] } }),
    E('HUG', 'body', {
    back: { tier: 'GOOD', levels: [1] }, waist: { tier: 'EXCELLENT', levels: [1] } }),
    E('HOLD_HANDS', 'bothHands', {
    hands: { tier: 'EXCELLENT', levels: [1] }, palms: { tier: 'EXCELLENT', levels: [1] } }),
    E('HOLD_HANDS', 'fingers', {
    hands: { tier: 'EXCELLENT', levels: [1] } }),
    E('HOLD_HANDS', 'lips', {
    hands: { tier: 'EXCELLENT', levels: [1] } }),
    E('BODY_CONTACT', 'body', {
    back: { tier: 'GOOD', levels: [2] }, outerThighs: 'EXCELLENT', chest: 'GOOD' }),
    E('BODY_CONTACT', 'chest', {
    back: { tier: 'EXCELLENT', levels: [2] }, chest: 'EXCELLENT' }),
    E('BODY_CONTACT', 'forehead', {
    forehead: { tier: 'EXCELLENT', levels: [1] } }),
    E('BODY_CONTACT', 'head', {
    shoulders: { tier: 'GOOD', levels: [1, 2] }, chest: { tier: 'EXCELLENT', levels: [2] }, outerThighs: { tier: 'GOOD', levels: [2] } }),
    E('BODY_CONTACT', 'hips', {
    buttocks: 'EXCELLENT' }),
    E('BODY_CONTACT', 'legs', {
    waist: { tier: 'EXCELLENT', levels: [2] } }),
    E('RUB', 'chest', {
    chest: { tier: 'GOOD', levels: [2, 3] }, breasts: { tier: 'GOOD', levels: [2, 3] } }),
    E('RUB', 'hips', {
    buttocks: { tier: 'EXCELLENT', levels: [2, 3] }, groin: 'EXCELLENT' }),
    E('RUB', 'palm', {
    groin: 'EXCELLENT' }),
    E('RUB', 'thigh', {
    innerThighs: { tier: 'GOOD', levels: [2, 3] }, groin: 'EXCELLENT' }),
    E('SQUEEZE', 'oneHand', {
    waist: { tier: 'VALID', levels: [2] }, flanks: 'VALID', hips: 'EXCELLENT', outerThighs: 'GOOD', buttocks: 'EXCELLENT', breasts: 'GOOD', innerThighs: 'VALID' }),
    E('GRIP', 'bothHands', {
    hips: 'EXCELLENT' }),
    E('GRIP', 'oneHand', {
    wrists: { tier: 'GOOD', levels: [2] }, nape: { tier: 'EXCELLENT', levels: [2] } }),
    E('SPANK', 'oneHand', {
    buttocks: 'EXCELLENT' }),
    E('TICKLE', 'fingers', {
    upperArms: { tier: 'GOOD', levels: [1] }, hands: { tier: 'VALID', levels: [1] }, shoulders: { tier: 'VALID', levels: [1, 2] }, back: { tier: 'EXCELLENT', levels: [1, 2] }, abdomen: { tier: 'EXCELLENT', levels: [2] }, lowerBack: { tier: 'VALID', levels: [2] }, outerThighs: { tier: 'GOOD', levels: [2] }, chest: { tier: 'VALID', levels: [2] } }),
    E('HAIR_PLAY', 'fingers', {
    hair: { tier: 'EXCELLENT', levels: [1] } }),
    E('STIMULATE', 'fingers', {
    groin: { tier: 'VALID', levels: [2, 3] }, nipples: { tier: 'GOOD', levels: [2, 3] }, testicles: 'VALID', vulva: 'EXCELLENT', penis: 'EXCELLENT', clitoris: 'EXCELLENT', vagina: 'GOOD', glans: 'GOOD' }),
    E('STIMULATE', 'mouth', {
    nipples: { tier: 'GOOD', levels: [2, 3] }, testicles: 'VALID', vulva: 'GOOD', penis: 'GOOD', clitoris: 'EXCELLENT', glans: 'EXCELLENT' }),
    E('STIMULATE', 'oneHand', {
    penis: 'EXCELLENT', vulva: 'GOOD', clitoris: 'EXCELLENT', glans: 'GOOD' }),
    E('INSERT', 'oneFinger', {
    vagina: 'EXCELLENT' }),
    E('UNCOVER', 'bothHands', {
    shoulders: { tier: 'EXCELLENT', levels: [2] }, back: { tier: 'VALID', levels: [2] }, waist: { tier: 'GOOD', levels: [2] }, abdomen: { tier: 'GOOD', levels: [2, 3] }, lowerBack: { tier: 'VALID', levels: [2] }, hips: { tier: 'GOOD', levels: [2, 3] }, chest: { tier: 'EXCELLENT', levels: [2, 3] }, outerThighs: { tier: 'GOOD', levels: [2, 3] }, breasts: { tier: 'EXCELLENT', levels: [2, 3] }, buttocks: { tier: 'VALID', levels: [2] }, lowerAbdomen: { tier: 'GOOD', levels: [2] } }),
    E('UNCOVER', 'oneHand', {
    back: { tier: 'EXCELLENT', levels: [2] }, waist: { tier: 'GOOD', levels: [2] }, abdomen: { tier: 'EXCELLENT', levels: [2] }, lowerBack: { tier: 'GOOD', levels: [2] }, hips: { tier: 'VALID', levels: [2] }, chest: { tier: 'VALID', levels: [2] }, outerThighs: { tier: 'GOOD', levels: [2] } }),
    E('ADVANCE', 'oneHand', {
    abdomen: 'GOOD', outerThighs: 'GOOD', innerThighs: 'EXCELLENT', lowerAbdomen: 'EXCELLENT' }),
  // --- ampliación curada (no íntima): Cosquillear con la yema de los dedos, acción base del modelo ---
  E('TICKLE', 'fingertips', {
    neck: 'GOOD', nape: 'GOOD', flanks: 'EXCELLENT', abdomen: 'GOOD', feet: { tier: 'GOOD', levels: [1, 2] }, innerThighs: { tier: 'GOOD', levels: [2] }, poplitealArea: { tier: 'VALID', levels: [2] }, armpits: { tier: 'VALID', levels: [2] } }, { notes: 'añadida en la reconstrucción; sin anatomía íntima' }),
  // --- rechazos explícitos documentados (no aparecen en la cola de revisión) ---
  E('BITE', 'teeth', { clitoris: 'INVALID', glans: 'INVALID', testicles: 'INVALID', vagina: 'INVALID', penis: 'INVALID', vulva: 'INVALID', anus: 'INVALID' }, { notes: 'dientes y anatomía íntima: no' }),
  E('SPANK', 'oneHand', { breasts: 'INVALID', face: 'INVALID', cheeks: 'INVALID', vulva: 'INVALID', penis: 'INVALID', testicles: 'INVALID' }, { notes: 'la nalgada solo en glúteos' }),
  E('SQUEEZE', 'oneHand', { neck: 'INVALID', testicles: 'INVALID', clitoris: 'INVALID', glans: 'INVALID' }, { notes: 'presión firme donde no cabe' }),
];
/* ¿puede guiarse con la mano de quien recibe? Patrón GUIDED: solo acciones de mano que se dejan guiar sin perder sentido.
   La posición la decide grammar.js (zona alcanzable por la mano de quien recibe). */
export const GUIDABLE_ACTIONS = ['CARESS', 'BRUSH', 'MASSAGE', 'STIMULATE', 'SQUEEZE', 'RUB', 'TICKLE'];
export const TIER_WEIGHT = { EXCELLENT: 1.6, GOOD: 1, VALID: 0.45, INVALID: 0 };
