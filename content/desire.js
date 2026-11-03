/* DESEO V1 · 14 cartas del diseñador (2026-11-02). Regla del nivel: CON ROPA. Ninguna carta exige ropa fuera ni la
   cambia; lo que se hace, se hace vestidos. Deseo en banda alta NO es Intimidad: el nivel lo cambia la pareja.
   D07 (experiencia sensorial con los dedos) es del diseñador: dedos, ritmo lento, ojos cerrados, 40 s, lateralidad de mano. */
import { card } from './schema.js';
const D = o => card({ level: 2, status: 'APPROVED', source: 'DESIGNER_PROVIDED', clothing: { actor: ['CLOTHED'], receiver: ['CLOTHED'] }, ...o });
export const DESIRE = [
  D({ id: 'D01', family: 'KISS', interactionType: 'MUTUAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'lips' }], durations: [60],
    playConstraints: ['FREE', 'NO_HANDS', 'ONE_HAND_EACH', 'ACTOR_NO_HANDS', 'RECEIVER_NO_HANDS', 'ONE_HAND_TOTAL'],
    copy: ['Besaos sin lengua durante un minuto', 'Un minuto de besos sin lengua con {R}'] }),
  D({ id: 'D02', family: 'MASSAGE', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'bothHands' }], receiverRequirements: [{ part: 'outerThighs' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], durations: [40],
    copyBySide: {
      LEFT: ['Masajea el muslo izquierdo de {R} con las dos manos.'],
      RIGHT: ['Masajea el muslo derecho de {R} con las dos manos.'],
      BOTH: ['Masajea los muslos de {R}, primero uno y luego el otro.'],
    } }),
  D({ id: 'D03', family: 'BUTTOCKS', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'oneHand' }], receiverRequirements: [{ part: 'buttocks' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], durations: [30],
    copyBySide: {
      LEFT: ['Aprieta y acaricia la nalga izquierda de {R}, alternando una cosa y otra.'],
      RIGHT: ['Aprieta y acaricia la nalga derecha de {R}, alternando una cosa y otra.'],
      BOTH: ['Aprieta y acaricia las nalgas de {R}, alternando una cosa y otra.'],
    } }),
  D({ id: 'D04', family: 'FEET', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'fingers' }], receiverRequirements: [{ part: 'toes' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], durations: [25],
    copyBySide: {
      LEFT: ['Aprieta y juega con los dedos del pie izquierdo de {R}, uno a uno.'],
      RIGHT: ['Aprieta y juega con los dedos del pie derecho de {R}, uno a uno.'],
      BOTH: ['Aprieta y juega con los dedos de los pies de {R}, uno a uno.'],
    } }),
  D({ id: 'D05', family: 'CARESS', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'wholeBody' }], durations: [45],
    copy: ['{R} cierra los ojos. Recorre despacio con las yemas de los dedos distintas partes de su cuerpo; {R} solo se concentra en sentirlo.'],
    notes: 'Reescrita por el diseñador (2026-11-03). Antes: besos en el cuello por lados.' }),
  D({ id: 'D06', family: 'ABDOMEN', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'lowerAbdomen' }], durations: [30],
    copy: ['Da picos en el bajo vientre de {R}, por encima de la ropa.', 'Picos cortos en el bajo vientre de {R}, sin apartar la ropa.'] }),
  D({ id: 'D07', family: 'HANDS', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'fingers' }, { part: 'hands' }], allowedSides: ['LEFT', 'RIGHT'], durations: [40],
    copyBySide: {
      LEFT: ['{R} cierra los ojos y te da su mano izquierda. Recorre despacio cada uno de sus dedos con las yemas de los tuyos.', '{R} cierra los ojos. Toma su mano izquierda y pasa las yemas de tus dedos por los suyos, uno a uno, muy despacio.'],
      RIGHT: ['{R} cierra los ojos y te da su mano derecha. Recorre despacio cada uno de sus dedos con las yemas de los tuyos.', '{R} cierra los ojos. Toma su mano derecha y pasa las yemas de tus dedos por los suyos, uno a uno, muy despacio.'],
    }, notes: 'Experiencia sensorial con los dedos (diseñador): dedos de la mano, ritmo lento, receptor con ojos cerrados, 40 s, lateralidad de mano.' }),
  D({ id: 'D08', family: 'BREASTS', intraLevelIntensity: 'HIGH', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'oneHand' }], receiverRequirements: [{ part: 'breasts' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], durations: [30],
    copyBySide: {
      LEFT: ['Acaricia el seno izquierdo de {R} con la mano, por encima de la ropa.'],
      RIGHT: ['Acaricia el seno derecho de {R} con la mano, por encima de la ropa.'],
      BOTH: ['Acaricia los senos de {R} con las manos, por encima de la ropa.'],
    }, notes: 'Migrada de CARESS|oneHand|breasts (EXCELLENT en el repertorio estricto). Solo si quien recibe declaró senos.' }),
  D({ id: 'D09', family: 'EARS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'ears' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], durations: [30],
    variants: [
      { id: 'kiss', status: 'APPROVED', copyBySide: { LEFT: ['Besa a {R} justo detrás de la oreja izquierda.'], RIGHT: ['Besa a {R} justo detrás de la oreja derecha.'], BOTH: ['Besa a {R} detrás de una oreja y luego de la otra.'] } },
      { id: 'bite', status: 'APPROVED', copyBySide: { LEFT: ['Mordisquea el lóbulo de la oreja izquierda de {R}, apenas apretando.'], RIGHT: ['Mordisquea el lóbulo de la oreja derecha de {R}, apenas apretando.'], BOTH: ['Mordisquea los lóbulos de {R}, una oreja y luego la otra, apenas apretando.'] }, tags: ['presion'] },
      { id: 'breath', status: 'APPROVED', copyBySide: { LEFT: ['Respira muy cerca de la oreja izquierda de {R}, sin tocar.'], RIGHT: ['Respira muy cerca de la oreja derecha de {R}, sin tocar.'], BOTH: ['Respira muy cerca de una oreja de {R} y luego de la otra, sin tocar.'] } },
    ], notes: 'Variantes migradas del repertorio estricto de orejas: KISS|lips, BITE|teeth y HOVER|breath (EXCELLENT). Nada inventado.' }),
  D({ id: 'D10', levels: [2, 3], family: 'HUG', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }], requiredOrientation: 'STANDING', durations: [50],
    copy: ['De pie, abraza a {R} cuerpo con cuerpo y respirad despacio hasta que acabe el tiempo.'] }),
  D({ id: 'D11', family: 'ABDOMEN', interactionType: 'PATH', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'abdomen' }], durations: [30, 40], path: { from: 'arriba', to: 'abajo' },
    copy: ['Recorre despacio el abdomen de {R} con la punta de los dedos, de arriba abajo, sin salirte del abdomen.'],
    notes: 'Trayecto en producción: de arriba abajo (mismo patrón que C04). Si el diseñador tiene otro trayecto aprobado, se cambia aquí.' }),
  D({ id: 'D12', family: 'KISS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'back' }], durations: [30],
    variants: [
      { id: 'down', status: 'APPROVED', copy: ['Da picos por la espalda de {R}, de la nuca hacia abajo.'] },
      { id: 'across', status: 'APPROVED', copy: ['Da picos por la espalda de {R}, de un hombro al otro.'] },
    ], notes: 'Con ropa. Migrada de KISS|lips|back (EXCELLENT); la variación es el trayecto.' }),
  D({ id: 'D13', family: 'CARESS', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'face' }], durations: [30],
    variants: [
      { id: 'one', status: 'APPROVED', copy: ['Acaricia el rostro de {R} con las yemas de una mano.'] },
      { id: 'both', status: 'APPROVED', copy: ['Acaricia el rostro de {R} con las yemas de las dos manos a la vez.'] },
    ] }),
  D({ id: 'D14', family: 'BUTTOCKS', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'body' }, { part: 'oneHand' }], receiverRequirements: [{ part: 'wholeBody' }, { part: 'buttocks' }], requiredOrientation: 'STANDING', durations: [30, 45],
    copy: ['De pie, abraza a {R} y acaricia sus nalgas mientras tanto.'] }),
];
