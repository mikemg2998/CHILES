/* POSITIONAL INTERACTION BLUEPRINTS · interacciones cuerpo con cuerpo cuya calidad depende de una configuración concreta
   de los dos cuerpos (pecho contra espalda, caderas contra glúteos, frente con frente, sentarse sobre los muslos…).
   NUNCA se generan por producto cartesiano acción × herramienta × zona: cada una está diseñada y curada a mano, con su
   copy propio. Si una interacción necesita que dos partes del cuerpo estén colocadas de forma específica, tiene que ser
   un blueprint aprobado; si no está aquí, no existe.
   Modelo PositionalInteractionBlueprint:
     id · status APPROVED | UNREVIEWED | REJECTED (solo APPROVED entra al generador) · type 'POSITIONAL'
     action: acción del dado y familia de la acción (BODY_CONTACT · HUG · RUB) · semanticFamily: BODY_TO_BODY
     actorRequirements: BodyRequirement[] ({ part: id de actorTools, anatomy?: 'pene' | 'vulva' }) — quien actúa
     receiverRequirements: BodyRequirement[] ({ part: id de targets, anatomy?: 'pene' | 'vulva' }) — quien recibe
     requiredOrientation?: FACE | BEHIND | LYING | SEATED | STANDING
     allowedLevels · allowedStyles (∩ estilos de la acción; [] = la frase ya lleva su manera) · durationRange [min, max] s
     copyVariants: frases con tokens {P} pareja · {T} zona («la espalda de Ana» / «su espalda») · {T:poss} · {T:bare} · {S} estilo
     weight: multiplicador de frecuencia (1 = normal) · tier EXCELLENT | GOOD | VALID (calidad editorial) · intensity (1–10, opcional)
     notes: para la revisión humana.
   Edición: a mano o con Content Lab (lab/), que exporta este fichero. Una entrada UNREVIEWED nunca se promociona sola.
   Última exportación 2026-11-01. */
const B = (o) => Object.assign({ status: 'UNREVIEWED', type: 'POSITIONAL', semanticFamily: 'BODY_TO_BODY', requiredOrientation: null, allowedStyles: [], weight: 1, tier: null, intensity: null, copyVariants: [], notes: null }, o);
export const POSITIONAL = [
  B({ id: 'forehead-to-forehead', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'forehead' }], receiverRequirements: [{ part: 'forehead' }], requiredOrientation: 'FACE', allowedLevels: [1], durationRange: [20, 60],
    copyVariants: ['Apoya tu frente en la de {P} y respirad un momento así', 'Frente con frente con {P}, con los ojos cerrados, hasta que respiréis al mismo ritmo'] }),
  B({ id: 'head-on-shoulder', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'GOOD',
    actorRequirements: [{ part: 'head' }], receiverRequirements: [{ part: 'shoulders' }], requiredOrientation: 'SEATED', allowedLevels: [1, 2], durationRange: [20, 90],
    copyVariants: ['Apoya tu cabeza sobre {T} y quédate ahí un momento', 'Déjate caer sobre el hombro de {P} y quédate ahí, sin hacer nada más'] }),
  B({ id: 'head-on-chest', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'head' }], receiverRequirements: [{ part: 'chest' }], requiredOrientation: 'LYING', allowedLevels: [2], durationRange: [20, 90],
    copyVariants: ['Apoya tu cabeza sobre {T} y quédate ahí un momento', 'Tumbados, apoya la cabeza en el pecho de {P} y escucha cómo late'] }),
  B({ id: 'head-on-thighs', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'GOOD',
    actorRequirements: [{ part: 'head' }], receiverRequirements: [{ part: 'outerThighs' }], requiredOrientation: 'SEATED', allowedLevels: [2], durationRange: [20, 90],
    copyVariants: ['Apoya tu cabeza sobre {T} y quédate ahí un momento', 'Túmbate con la cabeza en el regazo de {P} y deja que haga lo que quiera con tu pelo'] }),
  B({ id: 'hug-arms-waist', status: 'APPROVED', action: 'HUG', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'arms' }], receiverRequirements: [{ part: 'waist' }], requiredOrientation: 'FACE', allowedLevels: [1, 2], durationRange: [20, 90],
    copyVariants: ['Abraza a {P} rodeando {T:bare}', 'Abraza a {P} rodeando {T:bare} y quédate así hasta que respiréis al mismo ritmo'] }),
  B({ id: 'hug-arms-shoulders', status: 'APPROVED', action: 'HUG', tier: 'GOOD',
    actorRequirements: [{ part: 'arms' }], receiverRequirements: [{ part: 'shoulders' }], requiredOrientation: 'FACE', allowedLevels: [1, 2], durationRange: [20, 90],
    copyVariants: ['Abraza a {P} rodeando {T:bare}', 'Rodea los hombros de {P} con los brazos y atrae su cabeza hacia tu cuello'] }),
  B({ id: 'hug-from-behind', status: 'APPROVED', action: 'HUG', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'arms' }], receiverRequirements: [{ part: 'back' }], requiredOrientation: 'BEHIND', allowedLevels: [1, 2], durationRange: [20, 90],
    copyVariants: ['Abraza a {P} por detrás, con tu pecho pegado a su espalda', 'Abraza a {P} por detrás y quédate así hasta que respiréis al mismo ritmo'] }),
  B({ id: 'hug-sway-standing', status: 'APPROVED', action: 'HUG', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'waist' }], requiredOrientation: 'STANDING', allowedLevels: [1], durationRange: [30, 90],
    copyVariants: ['Abraza a {P} y meceos de lado a lado, de pie', 'De pie, abraza a {P} por la cintura y bailad muy despacio, sin música'] }),
  B({ id: 'chest-to-back', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'chest' }], receiverRequirements: [{ part: 'back' }], requiredOrientation: 'BEHIND', allowedLevels: [2], durationRange: [20, 90],
    copyVariants: ['Pega tu pecho a {T}', 'Ponte detrás de {P}, pega tu pecho a su espalda y quédate así, sin hablar'] }),
  B({ id: 'chest-to-chest', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'chest' }], receiverRequirements: [{ part: 'chest' }], requiredOrientation: 'FACE', allowedLevels: [2], durationRange: [20, 90],
    copyVariants: ['Pega tu pecho al de {P} y quedaos así, sin hablar', 'Pecho contra pecho con {P}, de pie o tumbados, hasta notar el corazón del otro'] }),
  B({ id: 'hips-to-buttocks', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'hips' }], receiverRequirements: [{ part: 'buttocks' }], requiredOrientation: 'BEHIND', allowedLevels: [2, 3], durationRange: [20, 60],
    copyVariants: ['Ponte detrás de {P} y pega tus caderas a {T:poss}', 'Ponte detrás de {P}, pega tus caderas a sus glúteos y quédate así, sin moverte'] }),
  B({ id: 'sit-on-thighs', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'outerThighs' }], requiredOrientation: 'SEATED', allowedLevels: [2, 3], durationRange: [20, 90],
    copyVariants: ['Siéntate sobre los muslos de {P}, de frente', 'Siéntate a horcajadas sobre los muslos de {P} y quédate así, mirándole de cerca'] }),
  B({ id: 'weight-on-chest', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'GOOD',
    actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'chest' }], requiredOrientation: 'LYING', allowedLevels: [2, 3], durationRange: [20, 60],
    copyVariants: ['Apoya todo tu peso sobre {T}, tumbados, y quédate así un momento', 'Tumbados de frente, déjate caer sobre {P} con todo tu peso y no te muevas'] }),
  B({ id: 'weight-on-back', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'GOOD',
    actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'back' }], requiredOrientation: 'LYING', allowedLevels: [2], durationRange: [20, 60],
    copyVariants: ['Apoya todo tu peso sobre {T}, tumbados, y quédate así un momento', 'Con {P} tumbado boca abajo, túmbate encima y deja que note todo tu peso'] }),
  B({ id: 'legs-around-waist', status: 'APPROVED', action: 'BODY_CONTACT', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'legs' }], receiverRequirements: [{ part: 'waist' }], requiredOrientation: 'FACE', allowedLevels: [2, 3], durationRange: [20, 60],
    copyVariants: ['Rodea la cintura de {P} con tus piernas y acerca su cuerpo al tuyo', 'Sentados de frente, rodea la cintura de {P} con las piernas y no le dejes alejarse'] }),
  B({ id: 'rub-hips-buttocks', status: 'APPROVED', action: 'RUB', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'hips' }], receiverRequirements: [{ part: 'buttocks' }], requiredOrientation: 'BEHIND', allowedLevels: [2, 3], allowedStyles: ['SLOW', 'FIRM'], durationRange: [20, 60],
    copyVariants: ['Pégate a la espalda de {P} y mueve {S} tus caderas contra {T:poss}', 'Desde atrás, pega tus caderas a {T} y muévelas {S}, sin separarte'] }),
  B({ id: 'rub-hips-groin', status: 'APPROVED', action: 'RUB', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'hips' }], receiverRequirements: [{ part: 'groin' }], requiredOrientation: 'LYING', allowedLevels: [2, 3], allowedStyles: ['SLOW', 'FIRM', 'FAST'], durationRange: [20, 60],
    copyVariants: ['Tumbados de frente, frota {S} tus caderas contra {T}', 'Tumbados, mueve {S} tus caderas contra las de {P}, con la ropa puesta'] }),
  B({ id: 'rub-thigh-innerThighs', status: 'APPROVED', action: 'RUB', tier: 'GOOD',
    actorRequirements: [{ part: 'thigh' }], receiverRequirements: [{ part: 'innerThighs' }], requiredOrientation: 'FACE', allowedLevels: [2, 3], allowedStyles: ['SLOW'], durationRange: [15, 45],
    copyVariants: ['Desliza {S} tu muslo contra {T}', 'Mete tu muslo entre los de {P} y muévelo {S} contra la parte interna'] }),
  B({ id: 'rub-thigh-groin', status: 'APPROVED', action: 'RUB', tier: 'EXCELLENT',
    actorRequirements: [{ part: 'thigh' }], receiverRequirements: [{ part: 'groin' }], requiredOrientation: 'FACE', allowedLevels: [2, 3], allowedStyles: ['SLOW', 'FIRM'], durationRange: [15, 60],
    copyVariants: ['Desliza {S} tu muslo contra {T}', 'Presiona {S} tu muslo contra {T} y muévelo un poco, sin separarlo'] }),
  B({ id: 'rub-chest-chest', status: 'APPROVED', action: 'RUB', tier: 'GOOD',
    actorRequirements: [{ part: 'chest' }], receiverRequirements: [{ part: 'chest' }], requiredOrientation: 'LYING', allowedLevels: [2, 3], allowedStyles: ['SLOW'], durationRange: [15, 60],
    copyVariants: ['Tumbados de frente, frota {S} tu pecho contra el de {P}', 'Piel con piel, mueve {S} tu pecho contra el de {P}'] }),
  B({ id: 'rub-chest-breasts', status: 'APPROVED', action: 'RUB', tier: 'GOOD',
    actorRequirements: [{ part: 'chest' }], receiverRequirements: [{ part: 'breasts' }], requiredOrientation: 'LYING', allowedLevels: [2, 3], allowedStyles: ['SLOW'], durationRange: [15, 60],
    copyVariants: ['Tumbados de frente, frota {S} tu pecho contra {T}', 'Piel con piel, mueve {S} tu pecho contra los senos de {P}'] }),
  B({ id: 'penis-between-breasts', status: 'UNREVIEWED', action: 'RUB', tier: null,
    actorRequirements: [{ part: 'penis', anatomy: 'pene' }], receiverRequirements: [{ part: 'breasts' }], requiredOrientation: 'LYING', allowedLevels: [3], allowedStyles: ['SLOW', 'FIRM'], durationRange: [20, 60],
    copyVariants: [],
    notes: 'Propuesta del diseñador 2026-11-01. Cuerpo con cuerpo: anatomía con pene de quien actúa sobre los senos de quien recibe. Nivel Intimidad. Pendiente: copy, duración, estilo, peso y decisión APROBAR / RECHAZAR.' }), // SIN COPY: redactar antes de aprobar
];
export const POSITIONAL_BY_ID = Object.fromEntries(POSITIONAL.map(b => [b.id, b]));
export const BLUEPRINT_STATUSES = ['APPROVED', 'UNREVIEWED', 'REJECTED'];
export const ORIENTATIONS = ['FACE', 'BEHIND', 'LYING', 'SEATED', 'STANDING'];
