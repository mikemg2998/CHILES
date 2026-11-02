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
  I({ id: 'I03', family: 'BREASTS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'mouth' }], receiverRequirements: [{ part: 'nipples' }], allowedSides: ['LEFT'], clothing: SKIN, durations: [25],
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
  I({ id: 'I09', family: 'BREASTS', intraLevelIntensity: 'MID', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'fingers' }], receiverRequirements: [{ part: 'nipples' }], allowedSides: ['LEFT'], clothing: SKIN, durations: [20],
    copyBySide: { LEFT: ['Presiona suavemente el pezón izquierdo de {R} entre dos dedos.'] }, notes: 'pezón izquierdo + presión suave + 20 s' }),
  I({ id: 'I10', family: 'BITE', intraLevelIntensity: 'HIGH', source: 'MIGRATED_APPROVED', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'nipples' }], allowedSides: ['RIGHT'], clothing: SKIN, durations: [20], tags: ['presion'],
    copyBySide: { RIGHT: ['Mordisquea el pezón derecho de {R} a ratos, sin apretar: muerde, suelta, vuelve.'] }, notes: 'pezón derecho + mordida intermitente + 20 s' }),
  /* THROUGH_BRA · concepto aprobado por el diseñador (2026-11-02): sin camiseta y con brasier puesto, una experiencia propia sobre el
     brasier. No es una versión de una carta de acceso directo: cuando el brasier sale, esta carta deja de existir y entran las otras. */
  I({ id: 'I21', family: 'BREASTS', intraLevelIntensity: 'LOW', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'nipples' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], clothing: { receiver: ['THROUGH_BRA'] }, durations: [25, 30],
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
  I({ id: 'I24', family: 'ORAL', similarityGroup: 'CLOTHED_TEASE', intraLevelIntensity: 'MID', status: 'UNREVIEWED', actorRequirements: [{ part: 'lips' }], receiverRequirements: [], clothing: { receiver: ['THROUGH_PANTIES'] }, durations: [30], tags: ['intimo', 'boca'], copy: [],
    notes: '«Pequeños besos/picos sobre las panties en las zonas indicadas por el diseñador»: las zonas no llegaron. Sin zona no hay parte receptora ni copia. Pendiente.' }),
  /* THROUGH_TOP · pedido del diseñador (V4 camiseta + brasier, 2026-11-02): «interacción suave sobre la camiseta en la zona del pecho
     cuando la anatomía correspondiente esté declarada». Con camiseta puesta (haya brasier debajo o no) es la única capa accesible.
     Llegó el estado y la intención, no la interacción (con qué se actúa, sobre qué parte, cuánto dura): sin eso no hay copia. */
  I({ id: 'I25', family: 'BREASTS', similarityGroup: 'CLOTHED_TEASE', intraLevelIntensity: 'LOW', status: 'UNREVIEWED', actorRequirements: [], receiverRequirements: [{ part: 'breasts' }], clothing: { receiver: ['THROUGH_TOP'] }, durations: [25, 30], copy: [],
    notes: 'THROUGH_TOP: solo con la camiseta puesta como capa exterior sobre el pecho (bra ON o NOT_WORN debajo). Falta la interacción del diseñador: herramienta, parte exacta y duración. Pendiente; nunca se transforma en I21 ni en acceso directo.' }),
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
  I({ id: 'I14', family: 'BITE', intraLevelIntensity: 'MID', status: 'UNREVIEWED', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [], clothing: SKIN, durations: [20], tags: ['presion'], copy: [],
    notes: '«Mordida suave en anatomía específica»: el diseñador no indicó qué anatomía. El repertorio estricto rechazó dientes sobre anatomía íntima; nalgas y muslos ya tienen carta propia (I19, I04). Pendiente de decisión.' }),
  I({ id: 'I15', family: 'BREATH', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'breath' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [20], tags: ['intimo'],
    variants: [
      { id: 'vulva', status: 'APPROVED', anatomy: 'vulva', receiverRequirements: [{ part: 'vulva' }], copy: ['Respira muy cerca de la vulva de {R}, sin tocar: que note solo el aire y el calor.'] },
      { id: 'pene', status: 'APPROVED', anatomy: 'pene', receiverRequirements: [{ part: 'penis' }], copy: ['Respira muy cerca del pene de {R}, sin tocar: que note solo el aire y el calor.'] },
    ], notes: 'sensación de aire / calor sobre anatomía íntima (STANDARD)' }),
  I({ id: 'I16', family: 'BODY', interactionType: 'POSITIONAL', intraLevelIntensity: 'HIGH', status: 'UNREVIEWED', actorRequirements: [{ part: 'penis' }], receiverRequirements: [{ part: 'breasts' }], requiredOrientation: 'LYING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['TOP_ACCESS'] }, durations: [30, 45, 60], tags: ['intimo'], copy: [],
    notes: 'Configuración corporal entre pene y senos. Ya estaba UNREVIEWED y sin copia en el sistema anterior (propuesta del diseñador del 2026-11-01); sigue así hasta que el diseñador escriba la copia y decida aprobarla o rechazarla.' }),
  I({ id: 'I17', family: 'BODY', interactionType: 'POSITIONAL', intraLevelIntensity: 'HIGH', actorRequirements: [{ part: 'glans' }], receiverRequirements: [{ part: 'nipples' }], allowedSides: ['LEFT', 'RIGHT'], requiredOrientation: 'FACE',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS'] }, durations: [25], tags: ['intimo'],
    copyBySide: { LEFT: ['Roza el pezón izquierdo de {R} con el glande, despacio.'], RIGHT: ['Roza el pezón derecho de {R} con el glande, despacio.'] }, notes: 'glande y pezones con lateralidad (POSITIONAL)' }),
  I({ id: 'I18', family: 'ORAL', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'lips' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: ['SKIN_ACCESS', 'UNDERWEAR_OFF'] }, durations: [30], tags: ['intimo', 'boca'],
    copy: ['Besa la vulva de {R}, despacio, como besarías su boca.'], notes: 'beso sobre vulva (STANDARD)' }),
  I({ id: 'I19', family: 'BITE', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'teeth' }], receiverRequirements: [{ part: 'buttocks' }], allowedSides: ['LEFT', 'RIGHT', 'BOTH'], clothing: SKIN, durations: [20], tags: ['presion'],
    copyBySide: { LEFT: ['Mordisquea la nalga izquierda de {R}, sin apretar.'], RIGHT: ['Mordisquea la nalga derecha de {R}, sin apretar.'], BOTH: ['Mordisquea las nalgas de {R}, una y luego la otra, sin apretar.'] }, notes: 'mordida suave sobre nalgas (STANDARD)' }),
  I({ id: 'I20', family: 'BODY', interactionType: 'BODY_TO_BODY', intraLevelIntensity: 'MID', actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }], requiredOrientation: 'STANDING',
    clothing: { actor: ['FULL_BODY_ACCESS'], receiver: ['FULL_BODY_ACCESS'] }, durations: [60],
    copy: ['De pie y completamente desnudos, abrazaos y moveos muy despacio, piel con piel.'], notes: 'abrazo de pie completamente desnudos con contacto corporal lento (BODY_TO_BODY)' }),
];
