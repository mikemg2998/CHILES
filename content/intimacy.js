/* INTIMIDAD · contenido del diseñador (2026-11-02). Nada de aquí se infiere: cada carta reproduce una relación que una
   persona entregó (DESIGNER_PROVIDED) o que ya estaba aprobada en el repertorio estricto (MIGRATED_APPROVED).
   Entrar en Intimidad no significa desnudez: cada carta declara qué ropa necesita fuera y el motor la compara con el
   estado real de cada jugador. Nada obliga a desnudarse ni a terminar en nada.
   Lo que el diseñador dejó sin decidir queda UNREVIEWED (I14 · I16) y nunca entra en producción. */
import { card } from './schema.js';
const I = o => card({ level: 3, status: 'APPROVED', source: 'DESIGNER_PROVIDED', ...o });
const SKIN = { receiver: ['SKIN_ACCESS'] };
export const INTIMACY = [
  /* §42 · ejemplos del diseñador */
  I({ id: 'I01', family: 'KISS', interactionType: 'MUTUAL', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'lips' }], durations: [40],
    copy: ['Besa a {R} en la boca, despacio y profundo, hasta que acabe el tiempo.', 'Un beso largo con {R}, más lento y más hondo que antes.'] }),
  I({ id: 'I02', family: 'NECK', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'neck' }], durations: [35],
    copy: ['Besa el cuello de {R} por los dos lados: primero uno, luego el otro.'] }),
  /* §43 · GRUPO CORPORAL migrado tal cual (lado · duración · estilo · anatomía · acceso a piel) */
  I({ id: 'I03', family: 'BREASTS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'nipples', anatomy: 'senos' }], allowedSides: ['LEFT'], clothing: SKIN, durations: [25],
    copyBySide: { LEFT: ['Lame despacio el pezón izquierdo de {R}.', 'Con la boca, muy despacio, sobre el pezón izquierdo de {R}.'] }, notes: 'pezón izquierdo + interacción oral lenta + 25 s' }),
  I({ id: 'I04', family: 'BITE', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'innerThighs' }], clothing: SKIN, durations: [30], tags: ['presion'],
    copy: ['Mordisquea la parte interna de los muslos de {R}, apenas apretando.'], notes: 'muslos internos + mordida + 30 s' }),
  I({ id: 'I05', family: 'ABDOMEN', intraLevelIntensity: 'LOW', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'abdomen' }], clothing: SKIN, durations: [40],
    copy: ['Besa el abdomen de {R}, un beso detrás de otro, sin dejar hueco.'], notes: 'abdomen + besos + 40 s' }),
  I({ id: 'I06', family: 'BUTTOCKS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'bothHands' }], receiverRequirements: [{ part: 'buttocks' }], clothing: SKIN, durations: [50],
    copy: ['Masajea las nalgas de {R} con las dos manos, con firmeza.'], notes: 'nalgas + masaje + 50 s' }),
  I({ id: 'I07', family: 'MASSAGE', intraLevelIntensity: 'LOW', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'bothHands' }], receiverRequirements: [{ part: 'backOfLegs' }], clothing: SKIN, durations: [40],
    copy: ['Masajea la parte de atrás de las piernas de {R}, de los muslos a las pantorrillas.'], notes: 'parte posterior de las piernas + masaje + 40 s' }),
  I({ id: 'I08', family: 'BREASTS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'oneHand' }], receiverRequirements: [{ part: 'breasts' }], allowedSides: ['RIGHT'], clothing: SKIN, durations: [30],
    copyBySide: { RIGHT: ['Masajea despacio el seno derecho de {R}.'] }, notes: 'seno derecho + masaje + 30 s' }),
  I({ id: 'I09', family: 'BREASTS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'fingers' }], receiverRequirements: [{ part: 'nipples', anatomy: 'senos' }], allowedSides: ['LEFT'], clothing: SKIN, durations: [20],
    copyBySide: { LEFT: ['Presiona suavemente el pezón izquierdo de {R} entre dos dedos.'] }, notes: 'pezón izquierdo + presión suave + 20 s' }),
  I({ id: 'I10', family: 'BITE', intraLevelIntensity: 'HIGH', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'nipples', anatomy: 'senos' }], allowedSides: ['RIGHT'], clothing: SKIN, durations: [20], tags: ['presion'],
    copyBySide: { RIGHT: ['Mordisquea el pezón derecho de {R} a ratos, sin apretar: muerde, suelta, vuelve.'] }, notes: 'pezón derecho + mordida intermitente + 20 s' }),
  /* THROUGH_BRA · concepto aprobado por el diseñador (2026-11-02): sin camiseta y con brasier puesto, una experiencia propia sobre el
     brasier. No es una versión de una carta de acceso directo: cuando el brasier sale, esta carta deja de existir y entran las otras. */
  I({ id: 'I21', family: 'BREASTS', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'nipples', anatomy: 'senos' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], clothing: { receiver: ['THROUGH_BRA'] }, durations: [25, 30],
    copyBySide: {
      LEFT: ['Con las yemas de los dedos, acaricia muy suave el pezón izquierdo de {R} por encima del brasier.', 'Por encima del brasier, recorre con las yemas el pezón izquierdo de {R}, apenas rozando.'],
      RIGHT: ['Con las yemas de los dedos, acaricia muy suave el pezón derecho de {R} por encima del brasier.', 'Por encima del brasier, recorre con las yemas el pezón derecho de {R}, apenas rozando.'],
      BOTH: ['Con las yemas de los dedos, acaricia muy suave los dos pezones de {R} por encima del brasier.'],
    }, notes: 'THROUGH_BRA: solo con camiseta fuera y brasier puesto (nunca se transforma en acceso directo)' }),
  /* THROUGH_PANTIES · THROUGH_BOXERS · relaciones del diseñador (actualización consolidada 2026-11-02): contacto suave con los dedos
     SOBRE la prenda interior, con el pantalón fuera. Cartas sobre la prenda; nunca versiones de las de acceso directo. */
  I({ id: 'I22', family: 'MANUAL', similarityGroup: 'CLOTHED_TEASE', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'penis' }], clothing: { receiver: ['THROUGH_BOXERS'] }, durations: [30, 40], tags: ['intimo'],
    copy: ['Con las yemas de los dedos, acaricia suavemente el pene de {R} por encima de los calzoncillos.', 'Por encima de los calzoncillos, recorre despacio con los dedos la forma del pene de {R}, sin apretar.'],
    notes: 'THROUGH_BOXERS (diseñador): contacto suave con los dedos sobre los calzoncillos. Solo con pantalón fuera y calzoncillos puestos.' }),
  I({ id: 'I23', family: 'MANUAL', similarityGroup: 'CLOTHED_TEASE', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['THROUGH_PANTIES'] }, durations: [30, 40], tags: ['intimo'],
    copy: ['Con las yemas de los dedos, acaricia suavemente la vulva de {R} por encima de las panties.', 'Por encima de las panties, pasa los dedos despacio sobre la vulva de {R}, apenas presionando.'],
    notes: 'THROUGH_PANTIES (diseñador): contacto suave con los dedos sobre las panties. Solo con pantalón fuera y panties puestas.' }),
  /* I24 · CONCEPTO APROBADO POR EL DISEÑADOR (2026-11-02): pequeños besos / picos por encima de las panties. Requisitos cerrados: labios;
     pantalón fuera y panties puestas (THROUGH_PANTIES); con el pantalón puesto no sale; al quitar las panties deja de ser elegible al
     momento; nunca se convierte en versión directa. PENDIENTE: las zonas («indicadas por el diseñador») no están en ningún mensaje ni
     en el código, y sin zona no hay parte receptora ni frase. No se inventan. */
  I({ id: 'I24', family: 'ORAL', similarityGroup: 'CLOTHED_TEASE', intraLevelIntensity: 'MID', status: 'UNREVIEWED', actorRequirements: [{ part: 'lips' }], receiverRequirements: [], clothing: { receiver: ['THROUGH_PANTIES'] }, durations: [30], tags: ['intimo', 'boca'], copy: [],
    notes: 'Concepto aprobado (2026-11-02): picos sobre las panties, pantalón fuera + panties puestas. PENDIENTE SOLO: zona(s) exactas y frase por zona; nunca llegaron.' }),
  /* THROUGH_TOP · aprobada por el diseñador (Opción A, 2026-11-02): con la camiseta puesta (haya brasier debajo o no) esa es la capa
     exterior accesible; yemas de los dedos sobre el pecho por encima de la camiseta, 30 s, con lado. Al quitar la camiseta deja de
     existir y entran I21 (si bra ON) o las de acceso directo (si bra OFF / NOT_WORN). Nunca se transforma en otra carta. */
  I({ id: 'I25', family: 'BREASTS', similarityGroup: 'CLOTHED_TEASE', intraLevelIntensity: 'LOW', source: 'DESIGNER_APPROVED', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'breasts' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], clothing: { receiver: ['THROUGH_TOP'] }, durations: [30],
    copyBySide: {
      LEFT: ['Con las yemas de los dedos, acaricia muy suave el seno izquierdo de {R} por encima de la camiseta.', 'Por encima de la camiseta, recorre con las yemas el seno izquierdo de {R}, apenas rozando.'],
      RIGHT: ['Con las yemas de los dedos, acaricia muy suave el seno derecho de {R} por encima de la camiseta.', 'Por encima de la camiseta, recorre con las yemas el seno derecho de {R}, apenas rozando.'],
      BOTH: ['Con las yemas de los dedos, acaricia muy suave los dos senos de {R} por encima de la camiseta.'],
    }, notes: 'THROUGH_TOP (diseñador, Opción A): solo con la camiseta puesta como capa exterior sobre el pecho; senos declarados. 30 s.' }),
  /* §44 · ACCESO DIRECTO · relaciones del diseñador, exactamente como se entregaron */
  I({ id: 'I11', family: 'MANUAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'oneHand' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [45, 60, 75], tags: ['intimo'],
    variants: [
      { id: 'vulva', status: 'APPROVED', anatomy: 'vulva', receiverRequirements: [{ part: 'vulva' }], copy: ['Acaricia la vulva de {R} con los dedos, despacio, sin apartarlos.', 'Con la mano sobre la vulva de {R}, muévela despacio; que la mano de {R} te corrija si quiere.'] },
      { id: 'pene', status: 'APPROVED', anatomy: 'pene', receiverRequirements: [{ part: 'penis' }], copy: ['Rodea el pene de {R} con la mano y muévela despacio.', 'Con la mano alrededor del pene de {R}, un ritmo lento y constante.'] },
    ], notes: 'estimulación manual de anatomía íntima (STANDARD)' }),
  I({ id: 'I12', family: 'FEET', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'feet' }], receiverRequirements: [{ part: 'penis' }], clothing: { actor: ['ANY'], receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [45, 60], tags: ['intimo'],
    variants: [
      { id: 'pene', status: 'APPROVED', anatomy: 'pene', receiverRequirements: [{ part: 'penis' }], copy: ['Con los pies, acaricia el pene de {R} despacio.', 'Sujeta el pene de {R} entre los pies y muévelos despacio.'] },
      { id: 'vulva', status: 'UNREVIEWED', anatomy: 'vulva', receiverRequirements: [{ part: 'vulva' }], copy: [], notes: 'El diseñador no concretó si «estimulación mediante pies» incluye vulva. Sin decisión no sale.' },
    ], notes: 'estimulación mediante pies (STANDARD). Los pies de quien actúa tienen que estar descalzos.' }),
  I({ id: 'I13', family: 'ORAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [45, 60, 75], tags: ['intimo', 'boca'],
    variants: [
      { id: 'vulva', status: 'APPROVED', anatomy: 'vulva', receiverRequirements: [{ part: 'vulva' }], copy: ['Lame despacio la vulva de {R}, sin prisa por llegar a nada.', 'Con la boca sobre la vulva de {R}: lengua lenta, sin cambiar de ritmo.'] },
      { id: 'pene', status: 'APPROVED', anatomy: 'pene', receiverRequirements: [{ part: 'penis' }], copy: ['Métete el pene de {R} en la boca y muévete despacio.', 'Con la boca sobre el pene de {R}: lento, sin prisa por llegar a nada.'] },
    ], notes: 'estimulación oral de anatomía íntima (STANDARD)' }),
  I({ id: 'I14', family: 'BITE', intraLevelIntensity: 'MID', status: 'REJECTED', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [], clothing: SKIN, durations: [20], tags: ['presion'], copy: [],
    notes: 'RECHAZADA por el diseñador (2026-11-02): «mordida suave en anatomía específica» no aporta contenido nuevo; muslos (I04), nalgas (I19) y pezón (I10) ya tienen mordisco. No se reemplaza ni se inventa otra zona.' }),
  I({ id: 'I15', family: 'BREATH', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'breath' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [20], tags: ['intimo'],
    variants: [
      { id: 'vulva', status: 'APPROVED', anatomy: 'vulva', receiverRequirements: [{ part: 'vulva' }], copy: ['Respira muy cerca de la vulva de {R}, sin tocar: que note solo el aire y el calor.'] },
      { id: 'pene', status: 'APPROVED', anatomy: 'pene', receiverRequirements: [{ part: 'penis' }], copy: ['Respira muy cerca del pene de {R}, sin tocar: que note solo el aire y el calor.'] },
    ], notes: 'sensación de aire / calor sobre anatomía íntima (STANDARD)' }),
  /* I16 · APROBADA POR EL DISEÑADOR (2026-11-02) como POSITIONAL, DESIGNER_PROVIDED: configuración corporal entre pene y senos, tumbados.
     Requisitos fijados: pene con acceso directo; senos a piel (camiseta y brasier no puestos: OFF o NOT_WORN); se recalcula al quitar
     cualquiera de las dos. Sin variantes, sin combinación procedural. Lo ÚNICO que falta es la escena (la frase): el diseñador nunca la
     escribió (ni en la propuesta del 2026-11-01 ni después), y sin copia una carta no puede salir. En cuanto llegue, status APPROVED. */
  I({ id: 'I16', family: 'BODY', interactionType: 'POSITIONAL', intraLevelIntensity: 'HIGH', status: 'UNREVIEWED', actorRequirements: [{ part: 'penis' }], receiverRequirements: [{ part: 'breasts' }], requiredOrientation: 'LYING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS'] }, durations: [30, 45, 60], tags: ['intimo'], copy: [],
    notes: 'Aprobada por el diseñador (2026-11-02): pene entre senos, tumbados. Requisitos cerrados (senos a piel: top ≠ ON y bra ≠ ON; pene a piel). PENDIENTE SOLO LA ESCENA: falta la frase; sin ella no sale.' }),
  I({ id: 'I17', family: 'BODY', interactionType: 'POSITIONAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'glans' }], receiverRequirements: [{ part: 'nipples', anatomy: 'senos' }], allowedSides: ['LEFT', 'RIGHT'], requiredOrientation: 'FACE',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS'] }, durations: [25], tags: ['intimo'],
    copyBySide: { LEFT: ['Roza el pezón izquierdo de {R} con el glande, despacio.'], RIGHT: ['Roza el pezón derecho de {R} con el glande, despacio.'] }, notes: 'glande y pezones con lateralidad (POSITIONAL)' }),
  I({ id: 'I18', family: 'ORAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30], tags: ['intimo', 'boca'],
    copy: ['Besa la vulva de {R}, despacio, como besarías su boca.'], notes: 'beso sobre vulva (STANDARD)' }),
  I({ id: 'I19', family: 'BITE', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'buttocks' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], clothing: SKIN, durations: [20], tags: ['presion'],
    copyBySide: { LEFT: ['Mordisquea la nalga izquierda de {R}, sin apretar.'], RIGHT: ['Mordisquea la nalga derecha de {R}, sin apretar.'], BOTH: ['Mordisquea las nalgas de {R}, una y luego la otra, sin apretar.'] }, notes: 'mordida suave sobre nalgas (STANDARD)' }),
  I({ id: 'I20', family: 'BODY', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }], requiredOrientation: 'STANDING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['FULL_BODY_ACCESS'] }, durations: [60],
    copy: ['De pie y completamente desnudos, abrazaos y moveos muy despacio, piel con piel.'], notes: 'abrazo de pie completamente desnudos con contacto corporal lento (BODY_TO_BODY)' }),
  /* ======== CLÍTORIS · relaciones del diseñador (2026-11-02), una carta por relación, sin variantes añadidas ========
     Target `clitoris` (nunca se intercambia por vulva). Acceso directo: pantalón y panties fuera / no la lleva. */
  I({ id: 'I26', family: 'MANUAL', similarityGroup: 'INTIMATE_TOUCH', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'fingers' }], receiverRequirements: [{ part: 'clitoris' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo'],
    copy: ['Frota el clítoris de {R} con los dedos, despacio.', 'Con los dedos sobre el clítoris de {R}, frótalo con un ritmo lento y constante.'], notes: 'frotar el clítoris (diseñador): dedos → clítoris, DIRECT' }),
  I({ id: 'I27', family: 'ORAL', similarityGroup: 'ORAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'tongue' }], receiverRequirements: [{ part: 'clitoris' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45, 60], tags: ['intimo', 'boca'],
    copy: ['Lame el clítoris de {R}, despacio y sin cambiar de ritmo.', 'Con la lengua sobre el clítoris de {R}: lento, sin prisa.'], notes: 'lamer el clítoris (diseñador): lengua → clítoris, DIRECT' }),
  I({ id: 'I28', family: 'FEET', similarityGroup: 'INTIMATE_TOUCH', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'feet' }], receiverRequirements: [{ part: 'clitoris' }], clothing: { actor: ['ANY'], receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo'],
    copy: ['Con el pie, roza y estimula el clítoris de {R}, muy despacio.'], notes: 'tocar / estimular el clítoris con los pies (diseñador): pies → clítoris, DIRECT. Como en I12, el requisito «descalzo» está pendiente de decisión (actor ANY).' }),
  I({ id: 'I29', family: 'BODY', interactionType: 'POSITIONAL', similarityGroup: 'BODY_CONTACT', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'glans' }], receiverRequirements: [{ part: 'clitoris' }], requiredOrientation: 'FACE',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo'],
    copy: ['Frota el clítoris de {R} con el glande, despacio, sin entrar.'], notes: 'frotar el clítoris con el glande (diseñador): POSITIONAL de frente; exige pene en quien actúa y vulva en quien recibe; ambos a piel' }),
  /* ======== VAGINA · relaciones del diseñador (2026-11-02). Target `vagina`, DIRECT siempre; nunca THROUGH_PANTIES ========
     Variantes de número de dedos: SOLO las dos que el diseñador dio (2 y 3), sobre el movimiento de entrada / salida. */
  I({ id: 'I30', family: 'MANUAL', similarityGroup: 'INTIMATE_TOUCH', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'oneFinger' }], receiverRequirements: [{ part: 'vagina' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [45, 60], tags: ['intimo'],
    copy: ['Introduce un dedo en la vagina de {R} y muévelo dentro, despacio.'], notes: 'introducir 1 dedo en la vagina y moverlo dentro (diseñador): DIRECT' }),
  I({ id: 'I31', family: 'MANUAL', similarityGroup: 'INTIMATE_TOUCH', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'oneFinger' }], receiverRequirements: [{ part: 'vagina' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [45, 60], tags: ['intimo'],
    variants: [
      { id: 'un-dedo', status: 'APPROVED', actorRequirements: [{ part: 'oneFinger' }], copy: ['Introduce un dedo en la vagina de {R} y muévelo dentro y fuera, despacio.'] },
      { id: 'dos-dedos', status: 'APPROVED', weight: 0.7, actorRequirements: [{ part: 'twoFingers' }], copy: ['Introduce dos dedos en la vagina de {R} y muévelos dentro y fuera, despacio.'] },
      { id: 'tres-dedos', status: 'APPROVED', weight: 0.5, actorRequirements: [{ part: 'threeFingers' }], copy: ['Introduce tres dedos en la vagina de {R} y muévelos dentro y fuera, despacio.'] },
    ], notes: 'introducir 1 dedo con movimiento de entrada / salida (diseñador), con las variantes de 2 y 3 dedos que el diseñador proporcionó. Ninguna otra.' }),
  /* ======== LATE_SESSION · contenido muy tardío (diseñador, 2026-11-02): solo a partir de 35 cartas de Intimidad, peso bajo,
     nunca garantizado, sin progresión automática hacia ellas. POSITIONAL tumbados; pene a piel y vagina a piel. ======== */
  I({ id: 'I32', family: 'BODY', interactionType: 'POSITIONAL', similarityGroup: 'BODY_CONTACT', intraLevelIntensity: 'HIGH', minIntimacyCards: 35, baseWeight: 0.5, actorRequirements: [{ part: 'penis' }], receiverRequirements: [{ part: 'vagina' }], requiredOrientation: 'LYING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [60, 90], tags: ['intimo'],
    copy: ['Introduce el pene en la vagina de {R} muy lentamente.'], notes: 'LATE_SESSION (≥ 35 cartas de Intimidad): introducir el pene en la vagina muy lentamente (diseñador)' }),
  I({ id: 'I33', family: 'BODY', interactionType: 'POSITIONAL', similarityGroup: 'BODY_CONTACT', intraLevelIntensity: 'HIGH', minIntimacyCards: 35, baseWeight: 0.5, actorRequirements: [{ part: 'penis' }], receiverRequirements: [{ part: 'vagina' }], requiredOrientation: 'LYING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [45, 60], tags: ['intimo'],
    copy: ['Deja el pene en la entrada de la vagina de {R} y frótalo ahí, sin entrar.'], notes: 'LATE_SESSION (≥ 35 cartas de Intimidad): dejar el pene en la entrada de la vagina y frotarlo (diseñador)' }),
  /* ======== GLANDE · relaciones del diseñador (2026-11-02). Target `glans` como RECEPTOR (hasta ahora solo era herramienta en I17 / I29).
     DIRECT_SKIN_ACCESS: pantalón y calzoncillos / panties fuera. Sin variantes añadidas. ======== */
  I({ id: 'I34', family: 'MANUAL', similarityGroup: 'INTIMATE_TOUCH', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'fingers' }], receiverRequirements: [{ part: 'glans' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo'],
    copy: ['Desliza suavemente los dedos sobre el glande de {R}.', 'Con los dedos, recorre el glande de {R} muy suave, sin apretar.'], notes: 'deslizar suavemente los dedos sobre el glande (diseñador): dedos → glande, DIRECT' }),
  I({ id: 'I35', family: 'ORAL', similarityGroup: 'ORAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'tongue' }], receiverRequirements: [{ part: 'glans' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo', 'boca'],
    copy: ['Haz círculos con la lengua sobre el glande de {R}, despacio.'], notes: 'círculos con la lengua sobre el glande (diseñador): lengua → glande, DIRECT' }),
  I({ id: 'I36', family: 'BITE', similarityGroup: 'BITE', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'glans' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [20], tags: ['intimo', 'presion'],
    copy: ['Muerde muy, muy suavemente el glande de {R}: apenas los dientes, sin apretar nada.'], notes: 'morder muy, muy suavemente el glande (diseñador): dientes → glande, DIRECT, 20 s' }),
  /* ======== TESTÍCULOS · relaciones del diseñador (2026-11-02). Target `testicles` (nunca se convierte en pene). DIRECT. ======== */
  I({ id: 'I37', family: 'ORAL', similarityGroup: 'ORAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'testicles' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo', 'boca'],
    copy: ['Chupa los testículos de {R}, despacio y con cuidado.'], notes: 'chupar los testículos (diseñador): boca → testículos, DIRECT' }),
  I({ id: 'I38', family: 'CARESS', similarityGroup: 'INTIMATE_TOUCH', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'testicles' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo'],
    copy: ['Acaricia los testículos de {R} con las yemas de los dedos, muy suave.'], notes: 'acariciar los testículos (diseñador): yemas → testículos, DIRECT' }),
  I({ id: 'I39', family: 'MANUAL', similarityGroup: 'PLAYFUL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingers' }], receiverRequirements: [{ part: 'testicles' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30, 45], tags: ['intimo'],
    copy: ['Juega suavemente con los testículos de {R} entre los dedos, sin prisa y sin apretar.'], notes: 'jugar suavemente con los testículos (diseñador): dedos → testículos, DIRECT' }),
  /* NIPPLES INDEPENDIENTE (diseñador, 2026-11-03): cuatro interacciones sobre los pezones / tetillas de quien recibe, para CUALQUIER anatomía
     (requisito real: receiver tiene NIPPLES; nunca pene ni senos ni género). Acceso directo (SKIN_ACCESS): con camiseta puesta no salen; sin brasier,
     camiseta fuera = piel. Sin lateralidad: la frase del diseñador es en plural. Región CHEST; familia NIPPLES (el mordisco, BITE, como I04 / I10). */
  I({ id: 'I40', family: 'NIPPLES', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'nipples' }], clothing: SKIN, durations: [25, 30],
    copy: ['Acaricia suavemente las tetillas de {R} con las yemas de los dedos.'], notes: 'NIPPLES 01 (diseñador): CARESS · FINGERTIPS → NIPPLES · CHEST · DIRECT' }),
  I({ id: 'I41', family: 'NIPPLES', similarityGroup: 'ORAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'tongue' }], receiverRequirements: [{ part: 'nipples' }], clothing: SKIN, durations: [25],
    copy: ['Lame en círculos las tetillas de {R}.'], notes: 'NIPPLES 02 (diseñador): LICK · TONGUE → NIPPLES · CHEST · DIRECT' }),
  I({ id: 'I42', family: 'BITE', similarityGroup: 'BITE', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'nipples' }], clothing: SKIN, durations: [20], tags: ['presion'],
    copy: ['Muerde suavemente las tetillas de {R}.'], notes: 'NIPPLES 03 (diseñador): GENTLE_BITE · MOUTH → NIPPLES · CHEST · DIRECT' }),
  I({ id: 'I43', family: 'NIPPLES', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'nipples' }], clothing: SKIN, durations: [20], tags: ['presion'],
    copy: ['Aprieta suavemente las tetillas de {R} con las yemas de los dedos.'], notes: 'NIPPLES 04 (diseñador): GENTLE_SQUEEZE · FINGERTIPS → NIPPLES · CHEST · DIRECT' }),
  /* ======== EXPANSIÓN CORPORAL V1 (diseñador, 2026-11-03): más cuerpo para Intimidad. Aditiva: nada se borra ni se cambia. Las cartas de masaje
     C01 C06 C08 C51 C15 y el abrazo vestido D10 siguen jugándose en Intimidad por `levels` (reutilización curada), sin copiarlas. ======== */
  // ARMS_HANDS (sin requisito de ropa: manos y dedos siempre a piel)
  I({ id: 'I44', family: 'HANDS', similarityGroup: 'ORAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'fingers' }], durations: [20, 30],
    copy: ['Chupa suavemente los dedos de la mano de {R}.'], notes: 'diseñador: SUCK · MOUTH → FINGERS · ARMS_HANDS' }),
  I({ id: 'I45', family: 'HANDS', similarityGroup: 'LIGHT_KISSING', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'hands' }], durations: [20],
    copy: ['Dale pequeños besos en la mano a {R}.'], notes: 'diseñador: KISS · MOUTH → HANDS · ARMS_HANDS' }),
  // FEET (a piel: calcetines fuera)
  I({ id: 'I46', family: 'FEET', similarityGroup: 'ORAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'toes' }], clothing: SKIN, durations: [20, 30],
    copy: ['Chupa suavemente los dedos de los pies de {R}.'], notes: 'diseñador: SUCK · MOUTH → TOES · FEET · DIRECT' }),
  I({ id: 'I47', family: 'FEET', similarityGroup: 'LIGHT_KISSING', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'feet' }], clothing: SKIN, durations: [20],
    copy: ['Dale pequeños besos en los pies a {R}.'], notes: 'diseñador: KISS · LIPS → FEET · FEET · DIRECT' }),
  I({ id: 'I48', family: 'BITE', similarityGroup: 'BITE', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'feet' }], clothing: SKIN, durations: [20], tags: ['presion'],
    copy: ['Mordisquea suavemente el pie de {R}, en una zona cómoda.'], notes: 'diseñador: GENTLE_BITE · TEETH → FEET · FEET · DIRECT (sin zonas inventadas)' }),
  // HIPS_GLUTES: caderas (target hips, no nalgas), a piel con el pantalón fuera
  I({ id: 'I49', family: 'BITE', similarityGroup: 'BITE', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'hips' }], clothing: SKIN, durations: [20], tags: ['presion'],
    copy: ['Mordisquea suavemente la parte de atrás de la cadera de {R}.'], notes: 'diseñador: GENTLE_BITE · TEETH → HIPS (parte posterior) · HIPS_GLUTES · DIRECT' }),
  // GROIN: ingles (target hipCrease, HIPS_GLUTES; independiente de vulva / pene). Mutua: los dos con las ingles a piel (pantalón y ropa interior fuera).
  I({ id: 'I50', family: 'KISS', interactionType: 'MUTUAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'hipCrease' }],
    clothing: { actor: ['BOTTOM_ACCESS', 'UNDERWEAR_OFF'], receiver: ['SKIN_ACCESS'] }, durations: [30],
    copy: ['Besaos en las ingles lentamente durante 30 segundos.'], notes: 'diseñador (2026-11-03): «Bésense en las ingles lentamente durante 30 segundos.» adaptado a vosotros · KISS · LIPS → HIP_CREASE · HIPS_GLUTES · DIRECT · mutua' }),
  // BACK: masaje localizado (la espalda entera ya existe: C01 reutilizada en Intimidad). Zonas curadas, elegidas por quien recibe; a piel.
  I({ id: 'I51', family: 'MASSAGE', similarityGroup: 'CHOICE', interactionType: 'CHOOSE', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'bothHands' }], receiverRequirements: [{ part: 'shoulders' }, { part: 'back' }, { part: 'lowerBack' }], clothing: SKIN, durations: [45, 60],
    choices: [{ id: 'shoulders', label: 'hombros' }, { id: 'back', label: 'entre los omóplatos' }, { id: 'lowerBack', label: 'zona lumbar' }],
    copy: ['{R} elige una zona de la espalda: hombros, entre los omóplatos o la zona lumbar. Masajéala despacio, a piel.'], note: 'Solo esas tres zonas.', notes: 'diseñador: MASSAGE localizado · HANDS → BACK · BACK · DIRECT; sin producto cartesiano' }),
  // FULL_BODY · BODY_TO_BODY de pie (I20 = abrazo desnudos piel con piel, ya existente). Dos experiencias curadas más, mutuas, con el mismo requisito corporal.
  I({ id: 'I52', family: 'BODY', similarityGroup: 'BODY_CONTACT', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }], requiredOrientation: 'STANDING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['FULL_BODY_ACCESS'] }, durations: [45],
    copy: ['De pie, abrazados cuerpo con cuerpo, besaos despacio sin separaros.'], notes: 'diseñador: BODY_TO_BODY + besos · FULL_BODY · STANDING · mutua' }),
  I({ id: 'I53', family: 'CARESS', similarityGroup: 'BODY_CONTACT', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }], requiredOrientation: 'STANDING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['FULL_BODY_ACCESS'] }, durations: [60],
    copy: ['De pie y abrazados, acariciad despacio el cuerpo del otro con las manos, sin perder el contacto.'], notes: 'diseñador: BODY_TO_BODY + exploración corporal · FULL_BODY · STANDING · mutua; copy sencillo, sin instrucciones anatómicas' }),
  // Abrazo de pie de 30 s (diseñador, 2026-11-03): carta nueva, I20 no cambia. Sin requisito de ropa: vale vestidos o no.
  I({ id: 'I54', family: 'HUG', similarityGroup: 'EMBRACE', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }], requiredOrientation: 'STANDING', durations: [30],
    copy: ['Abrazaos de pie durante 30 segundos, pegando vuestros cuerpos y disfrutando del contacto sin hacer nada más.'], notes: 'diseñador (2026-11-03): «Abrácense de pie durante 30 segundos, pegando sus cuerpos…» adaptado a vosotros · FULL_BODY · BODY_TO_BODY · STANDING' }),
];
