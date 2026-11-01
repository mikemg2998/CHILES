/* REPERTORIO POR ZONA · fuente de verdad de la compatibilidad ACTION × ACTOR TOOL × TARGET.
   Cada zona tiene un repertorio deliberado: alguien revisó cada relación y existe una razón para que salga.
   Pregunta que responde cada entrada: «¿esta acción merece aparecer aquí?» (no «¿es físicamente posible?»).
   status: EXCELLENT (lo que un amante haría sin pensar) · GOOD · VALID (correcta pero menor; pesa poco) · REJECTED (posible,
   pero editorialmente pobre: documentado con motivo, nunca sale) · UNREVIEWED (todo lo que no está aquí: nunca sale).
   Solo EXCELLENT / GOOD / VALID entran al generador. Nada se promociona por inferencia.
   Forma: 'ACTION|tool': 'STATUS' o { status, levels (recorta allowedLevels acción ∩ zona), styles (recorta), notes }.
   preferredStyles: estilos que pesan más cuando hay razón para poner estilo · durationOverrides: ACTION → [min, max] s.
   Las interacciones cuerpo con cuerpo (pecho contra espalda, caderas, frente con frente…) NO están aquí: son blueprints
   posicionales diseñados a mano en positional.js. Edición: a mano o con Content Lab (lab/), que exporta este fichero.
   Pase editorial 2026-11-01: 19 combinaciones rechazadas con motivo (caso de partida: SOPLAR + CLAVÍCULAS), 1 rebajada (SUCK · pecho → VALID), 1 subida (REST · muslos → GOOD). */
export const REVIEWED_AT = '2026-11-01';
export const REPERTOIRE = {
  // el cabello
  hair: {
    preferredStyles: ['SLOW'],
    durationOverrides: { MASSAGE: [30, 120], CARESS: [30, 90] },
    approvedActions: {
      'CARESS|oneHand': { status: 'EXCELLENT', levels: [1] },
      'HAIR_PLAY|fingers': { status: 'EXCELLENT', levels: [1] },
      'MASSAGE|fingertips': { status: 'EXCELLENT', levels: [1] },
    },
  },
  // la frente
  forehead: {
    preferredStyles: ['SOFT'],
    durationOverrides: { KISS: [15, 20] },
    approvedActions: {
      'KISS|lips': { status: 'EXCELLENT', levels: [1] },
      'CARESS|oneHand': { status: 'VALID', levels: [1] },
    },
  },
  // las sienes
  temples: {
    preferredStyles: ['SLOW'],
    approvedActions: {
      'CARESS|oneHand': { status: 'GOOD', levels: [1] },
      'BRUSH|fingertips': { status: 'VALID', levels: [1] },
      'KISS|lips': { status: 'VALID', levels: [1] },
      'MASSAGE|thumbs': { status: 'VALID', levels: [1] },
    },
  },
  // las mejillas
  cheeks: {
    preferredStyles: ['SOFT'],
    durationOverrides: { KISS: [15, 20] },
    approvedActions: {
      'CARESS|oneHand': { status: 'EXCELLENT', levels: [1] },
      'REST|oneHand': { status: 'EXCELLENT', levels: [1] },
      'BRUSH|fingertips': { status: 'GOOD', levels: [1] },
      'KISS|lips': { status: 'GOOD', levels: [1] },
    },
    rejectedActions: {
      'SPANK|oneHand': 'la nalgada solo en glúteos',
    },
  },
  // el rostro
  face: {
    preferredStyles: ['SOFT'],
    approvedActions: {
      'CARESS|oneHand': { status: 'EXCELLENT', levels: [1] },
      'BRUSH|fingertips': { status: 'GOOD', levels: [1] },
      'BRUSH|oneFinger': { status: 'GOOD', levels: [1] },
    },
    rejectedActions: {
      'SPANK|oneHand': 'la nalgada solo en glúteos',
    },
  },
  // la nariz
  nose: {
    approvedActions: {
      'BRUSH|nose': 'EXCELLENT',
    },
  },
  // las orejas
  ears: {
    preferredStyles: ['SOFT', 'INTERMITTENT'],
    approvedActions: {
      'BITE|teeth': { status: 'EXCELLENT', levels: [2] },
      'HOVER|breath': { status: 'EXCELLENT', levels: [2] },
      'KISS|lips': { status: 'EXCELLENT', levels: [1, 2] },
      'LICK|tongueTip': { status: 'EXCELLENT', levels: [2] },
      'WHISPER|voice': { status: 'EXCELLENT', levels: [2] },
      'BLOW|breath': { status: 'GOOD', levels: [2] },
      'BRUSH|lips': { status: 'GOOD', levels: [2] },
      'HOVER|lips': { status: 'GOOD', levels: [2] },
      'BRUSH|fingertips': { status: 'VALID', levels: [1, 2] },
      'BRUSH|oneFinger': { status: 'VALID', levels: [1, 2] },
    },
  },
  // los labios
  lips: {
    preferredStyles: ['SLOW'],
    durationOverrides: { KISS: [15, 60], BITE: [15, 15] },
    approvedActions: {
      'BITE|lips': 'EXCELLENT',
      'BRUSH|oneFinger': 'EXCELLENT',
      'HOVER|lips': 'EXCELLENT',
      'KISS|lips': 'EXCELLENT',
      'BITE|teeth': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'HOVER|breath': 'GOOD',
      'LICK|tongueTip': 'GOOD',
    },
  },
  // el cuello
  neck: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'BITE|teeth': 'EXCELLENT',
      'BLOW|breath': 'EXCELLENT',
      'BRUSH|fingers': 'EXCELLENT',
      'BRUSH|fingertips': 'EXCELLENT',
      'BRUSH|lips': { status: 'EXCELLENT', levels: [2, 3] },
      'BRUSH|nose': { status: 'EXCELLENT', levels: [2, 3] },
      'CARESS|oneHand': 'EXCELLENT',
      'HOVER|breath': 'EXCELLENT',
      'HOVER|lips': 'EXCELLENT',
      'KISS|lips': 'EXCELLENT',
      'LICK|tongueTip': 'EXCELLENT',
      'SUCK|mouth': 'EXCELLENT',
      'BRUSH|nails': { status: 'GOOD', levels: [2, 3] },
      'REST|bothHands': { status: 'GOOD', levels: [1, 2] },
      'REST|oneHand': { status: 'GOOD', levels: [1, 2] },
      'TICKLE|fingertips': 'GOOD',
      'MASSAGE|bothHands': 'VALID',
    },
    rejectedActions: {
      'SQUEEZE|oneHand': 'presión firme donde no cabe',
    },
  },
  // la nuca
  nape: {
    preferredStyles: ['SLOW'],
    approvedActions: {
      'BLOW|breath': { status: 'EXCELLENT', levels: [2] },
      'BRUSH|fingertips': { status: 'EXCELLENT', levels: [1, 2] },
      'GRIP|oneHand': { status: 'EXCELLENT', levels: [2] },
      'HOVER|breath': { status: 'EXCELLENT', levels: [2] },
      'HOVER|lips': { status: 'EXCELLENT', levels: [2] },
      'KISS|lips': { status: 'EXCELLENT', levels: [1, 2] },
      'MASSAGE|bothHands': { status: 'EXCELLENT', levels: [1, 2] },
      'MASSAGE|thumbs': { status: 'EXCELLENT', levels: [1, 2] },
      'REST|oneHand': { status: 'EXCELLENT', levels: [1, 2] },
      'BITE|teeth': { status: 'GOOD', levels: [2] },
      'BRUSH|nose': { status: 'GOOD', levels: [2] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1, 2] },
      'TICKLE|fingertips': 'GOOD',
      'BRUSH|nails': { status: 'VALID', levels: [2] },
    },
  },
  // los hombros
  shoulders: {
    preferredStyles: ['FIRM', 'SLOW'],
    durationOverrides: { MASSAGE: [30, 120] },
    approvedActions: {
      'BITE|teeth': { status: 'EXCELLENT', levels: [2] },
      'KISS|lips': { status: 'EXCELLENT', levels: [1, 2] },
      'MASSAGE|bothHands': { status: 'EXCELLENT', levels: [1, 2] },
      'MASSAGE|thumbs': { status: 'EXCELLENT', levels: [1, 2] },
      'UNCOVER|bothHands': { status: 'EXCELLENT', levels: [2] },
      'BRUSH|fingertips': { status: 'GOOD', levels: [1, 2] },
      'BRUSH|lips': { status: 'GOOD', levels: [2] },
      'BRUSH|oneFinger': { status: 'GOOD', levels: [1, 2] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1, 2] },
      'REST|oneHand': { status: 'GOOD', levels: [1, 2] },
      'BRUSH|nose': { status: 'VALID', levels: [2] },
    },
    rejectedActions: {
      'SUCK|mouth': 'succionar los hombros: no es un gesto que merezca salir',
      'TICKLE|fingers': 'tamborilear sobre los hombros: no es juego ni caricia',
    },
  },
  // las clavículas
  collarbones: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'BRUSH|fingertips': { status: 'EXCELLENT', levels: [1, 2] },
      'BRUSH|lips': { status: 'EXCELLENT', levels: [2] },
      'BRUSH|oneFinger': { status: 'EXCELLENT', levels: [1, 2] },
      'BITE|teeth': { status: 'GOOD', levels: [2] },
      'BRUSH|fingers': { status: 'GOOD', levels: [1, 2] },
      'BRUSH|nose': { status: 'GOOD', levels: [2] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1, 2] },
      'HOVER|breath': { status: 'GOOD', levels: [2] },
      'HOVER|lips': { status: 'GOOD', levels: [2] },
      'KISS|lips': { status: 'GOOD', levels: [1, 2] },
      'LICK|tongueTip': { status: 'GOOD', levels: [2] },
    },
    rejectedActions: {
      'BLOW|breath': 'soplar sobre un hueso: técnicamente posible, editorialmente pobre (caso real: «Sopla sobre las clavículas…»)',
      'SUCK|mouth': 'succionar piel fina sobre hueso: no es un gesto que merezca salir',
    },
  },
  // la espalda
  back: {
    preferredStyles: ['SLOW', 'FIRM'],
    durationOverrides: { MASSAGE: [30, 120], CARESS: [20, 60] },
    approvedActions: {
      'BRUSH|fingers': { status: 'EXCELLENT', levels: [1, 2] },
      'BRUSH|fingertips': { status: 'EXCELLENT', levels: [1, 2] },
      'BRUSH|nails': { status: 'EXCELLENT', levels: [2] },
      'BRUSH|oneFinger': { status: 'EXCELLENT', levels: [1, 2] },
      'CARESS|oneHand': { status: 'EXCELLENT', levels: [1, 2] },
      'KISS|lips': { status: 'EXCELLENT', levels: [1, 2] },
      'MASSAGE|bothHands': { status: 'EXCELLENT', levels: [1, 2] },
      'REST|bothHands': { status: 'EXCELLENT', levels: [1, 2] },
      'TICKLE|fingers': { status: 'EXCELLENT', levels: [1, 2] },
      'UNCOVER|oneHand': { status: 'EXCELLENT', levels: [2] },
      'REST|oneHand': { status: 'GOOD', levels: [1, 2] },
      'BRUSH|lips': { status: 'VALID', levels: [2] },
      'BRUSH|nose': { status: 'VALID', levels: [2] },
      'UNCOVER|bothHands': { status: 'VALID', levels: [2] },
    },
    rejectedActions: {
      'BLOW|breath': 'soplar sobre la espalda no construye nada: la anticipación va en nuca, cuello, orejas y bajo vientre',
    },
  },
  // la zona lumbar
  lowerBack: {
    preferredStyles: ['FIRM', 'SLOW'],
    approvedActions: {
      'BRUSH|fingertips': 'EXCELLENT',
      'MASSAGE|bothHands': 'EXCELLENT',
      'REST|bothHands': { status: 'EXCELLENT', levels: [2] },
      'BRUSH|fingers': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'BRUSH|nails': 'GOOD',
      'BRUSH|oneFinger': { status: 'GOOD', levels: [2] },
      'CARESS|oneHand': 'GOOD',
      'KISS|lips': 'GOOD',
      'MASSAGE|thumbs': { status: 'GOOD', levels: [2] },
      'REST|oneHand': { status: 'GOOD', levels: [2] },
      'UNCOVER|oneHand': { status: 'GOOD', levels: [2] },
      'LICK|tongueTip': 'VALID',
      'UNCOVER|bothHands': { status: 'VALID', levels: [2] },
    },
    rejectedActions: {
      'TICKLE|fingers': 'tamborilear en la zona lumbar: gesto hueco',
    },
  },
  // el pecho
  chest: {
    approvedActions: {
      'REST|oneHand': { status: 'EXCELLENT', levels: [2] },
      'UNCOVER|bothHands': { status: 'EXCELLENT', levels: [2, 3] },
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'KISS|lips': 'GOOD',
      'LICK|tongueTip': 'GOOD',
      'REST|bothHands': { status: 'GOOD', levels: [2] },
      'BRUSH|nails': 'VALID',
      'BRUSH|oneFinger': { status: 'VALID', levels: [2] },
      'MASSAGE|bothHands': 'VALID',
      'SUCK|mouth': 'VALID',
      'TICKLE|fingers': { status: 'VALID', levels: [2] },
      'UNCOVER|oneHand': { status: 'VALID', levels: [2] },
    },
  },
  // el abdomen
  abdomen: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'BRUSH|fingers': 'EXCELLENT',
      'CARESS|oneHand': 'EXCELLENT',
      'REST|oneHand': { status: 'EXCELLENT', levels: [2] },
      'TICKLE|fingers': { status: 'EXCELLENT', levels: [2] },
      'UNCOVER|oneHand': { status: 'EXCELLENT', levels: [2] },
      'ADVANCE|oneHand': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'BRUSH|oneFinger': { status: 'GOOD', levels: [2] },
      'KISS|lips': 'GOOD',
      'LICK|tongueTip': 'GOOD',
      'REST|bothHands': { status: 'GOOD', levels: [2] },
      'TICKLE|fingertips': 'GOOD',
      'UNCOVER|bothHands': { status: 'GOOD', levels: [2, 3] },
      'BRUSH|nails': 'VALID',
    },
    rejectedActions: {
      'BLOW|breath': 'soplar sobre el abdomen: gesto plano; la anticipación va en el bajo vientre',
      'BRUSH|nose': 'la nariz sobre el abdomen: forzado',
    },
  },
  // el bajo vientre
  lowerAbdomen: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'ADVANCE|oneHand': 'EXCELLENT',
      'BLOW|breath': 'EXCELLENT',
      'BRUSH|lips': 'EXCELLENT',
      'CARESS|oneHand': 'EXCELLENT',
      'KISS|lips': 'EXCELLENT',
      'LICK|tongueTip': 'EXCELLENT',
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'HOVER|breath': 'GOOD',
      'HOVER|lips': 'GOOD',
      'LICK|tongue': { status: 'GOOD', levels: [2, 3] },
      'SUCK|mouth': 'GOOD',
      'UNCOVER|bothHands': { status: 'GOOD', levels: [2] },
    },
  },
  // la cintura
  waist: {
    approvedActions: {
      'BRUSH|fingers': { status: 'GOOD', levels: [1, 2] },
      'BRUSH|fingertips': { status: 'GOOD', levels: [1, 2] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1, 2] },
      'UNCOVER|bothHands': { status: 'GOOD', levels: [2] },
      'UNCOVER|oneHand': { status: 'GOOD', levels: [2] },
      'BRUSH|lips': { status: 'VALID', levels: [2] },
      'BRUSH|oneFinger': { status: 'VALID', levels: [1, 2] },
      'KISS|lips': { status: 'VALID', levels: [1, 2] },
      'REST|oneHand': { status: 'VALID', levels: [1, 2] },
      'SQUEEZE|oneHand': { status: 'VALID', levels: [2] },
    },
    rejectedActions: {
      'BITE|teeth': 'mordisquear la cintura: hueso y piel tensa',
    },
  },
  // los costados
  flanks: {
    preferredStyles: ['SOFT'],
    approvedActions: {
      'BRUSH|fingertips': 'EXCELLENT',
      'TICKLE|fingertips': 'EXCELLENT',
      'BRUSH|fingers': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'BRUSH|nails': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'KISS|lips': 'VALID',
      'LICK|tongueTip': 'VALID',
    },
    rejectedActions: {
      'BLOW|breath': 'soplar en los costados: gesto plano',
      'BRUSH|nose': 'la nariz en los costados: forzado',
      'MASSAGE|bothHands': 'masajear los costados: zona de baja tolerancia a la presión',
      'REST|bothHands': 'apoyar las manos en los costados: postura rara',
      'REST|oneHand': 'apoyar la mano en un costado: postura rara',
      'SQUEEZE|oneHand': 'apretar los costados se convierte en cosquillas',
      'SUCK|mouth': 'succionar los costados: incómodo, sin recorrido',
    },
  },
  // las caderas
  hips: {
    preferredStyles: ['FIRM'],
    approvedActions: {
      'GRIP|bothHands': 'EXCELLENT',
      'SQUEEZE|oneHand': 'EXCELLENT',
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'UNCOVER|bothHands': { status: 'GOOD', levels: [2, 3] },
      'BRUSH|lips': 'VALID',
      'BRUSH|oneFinger': 'VALID',
      'KISS|lips': 'VALID',
      'MASSAGE|bothHands': 'VALID',
      'UNCOVER|oneHand': { status: 'VALID', levels: [2] },
    },
    rejectedActions: {
      'BITE|teeth': 'mordisquear las caderas: hueso',
    },
  },
  // los senos
  breasts: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'BRUSH|lips': 'EXCELLENT',
      'CARESS|oneHand': 'EXCELLENT',
      'KISS|lips': 'EXCELLENT',
      'UNCOVER|bothHands': { status: 'EXCELLENT', levels: [2, 3] },
      'BITE|teeth': 'GOOD',
      'BLOW|breath': 'GOOD',
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'BRUSH|nose': 'GOOD',
      'BRUSH|oneFinger': 'GOOD',
      'HOVER|breath': 'GOOD',
      'HOVER|lips': 'GOOD',
      'LICK|tongue': { status: 'GOOD', levels: [2, 3] },
      'LICK|tongueTip': 'GOOD',
      'SQUEEZE|oneHand': 'GOOD',
      'SUCK|mouth': 'GOOD',
    },
    rejectedActions: {
      'SPANK|oneHand': 'la nalgada solo en glúteos',
    },
  },
  // los pezones
  nipples: {
    preferredStyles: ['SOFT', 'INTERMITTENT'],
    durationOverrides: { SUCK: [15, 45], STIMULATE: [15, 45], LICK: [15, 30] },
    approvedActions: {
      'BRUSH|fingertips': 'EXCELLENT',
      'LICK|tongue': 'EXCELLENT',
      'LICK|tongueTip': 'EXCELLENT',
      'SUCK|mouth': 'EXCELLENT',
      'BRUSH|lips': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'HOVER|breath': 'GOOD',
      'HOVER|lips': 'GOOD',
      'KISS|lips': 'GOOD',
      'STIMULATE|fingers': { status: 'GOOD', levels: [2, 3] },
      'STIMULATE|mouth': { status: 'GOOD', levels: [2, 3] },
      'BITE|teeth': 'VALID',
    },
  },
  // los brazos
  upperArms: {
    approvedActions: {
      'BRUSH|fingers': { status: 'GOOD', levels: [1] },
      'BRUSH|fingertips': { status: 'GOOD', levels: [1] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1] },
      'MASSAGE|bothHands': { status: 'GOOD', levels: [1] },
      'TICKLE|fingers': { status: 'GOOD', levels: [1] },
      'BRUSH|oneFinger': { status: 'VALID', levels: [1] },
    },
  },
  // los antebrazos
  forearms: {
    approvedActions: {
    },
  },
  // las manos
  hands: {
    preferredStyles: ['SLOW'],
    durationOverrides: { KISS: [15, 20] },
    approvedActions: {
      'HOLD_HANDS|bothHands': { status: 'EXCELLENT', levels: [1] },
      'HOLD_HANDS|fingers': { status: 'EXCELLENT', levels: [1] },
      'HOLD_HANDS|lips': { status: 'EXCELLENT', levels: [1] },
      'KISS|lips': { status: 'EXCELLENT', levels: [1] },
      'MASSAGE|bothHands': { status: 'EXCELLENT', levels: [1] },
      'BRUSH|oneFinger': { status: 'GOOD', levels: [1] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1] },
      'MASSAGE|thumbs': { status: 'GOOD', levels: [1] },
      'BRUSH|fingertips': { status: 'VALID', levels: [1] },
      'TICKLE|fingers': { status: 'VALID', levels: [1] },
    },
  },
  // las palmas de las manos
  palms: {
    approvedActions: {
      'BRUSH|oneFinger': { status: 'EXCELLENT', levels: [1] },
      'HOLD_HANDS|bothHands': { status: 'EXCELLENT', levels: [1] },
      'MASSAGE|thumbs': { status: 'EXCELLENT', levels: [1] },
      'CARESS|oneHand': { status: 'VALID', levels: [1] },
      'MASSAGE|bothHands': { status: 'VALID', levels: [1] },
    },
  },
  // los dedos
  fingers: {
    approvedActions: {
      'CARESS|oneHand': { status: 'VALID', levels: [1] },
      'MASSAGE|bothHands': { status: 'VALID', levels: [1] },
    },
  },
  // las muñecas
  wrists: {
    preferredStyles: ['SOFT'],
    approvedActions: {
      'BRUSH|fingertips': { status: 'GOOD', levels: [1, 2] },
      'BRUSH|oneFinger': { status: 'GOOD', levels: [1, 2] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1, 2] },
      'GRIP|oneHand': { status: 'GOOD', levels: [2] },
      'BRUSH|fingers': { status: 'VALID', levels: [1, 2] },
      'BRUSH|lips': { status: 'VALID', levels: [2] },
      'KISS|lips': { status: 'VALID', levels: [1, 2] },
    },
    rejectedActions: {
      'MASSAGE|bothHands': 'masajear las muñecas con las dos manos: forzado',
    },
  },
  // las axilas
  armpits: {
    preferredStyles: ['SOFT'],
    approvedActions: {
      'TICKLE|fingertips': { status: 'VALID', levels: [2] },
    },
  },
  // los muslos
  outerThighs: {
    approvedActions: {
      'BRUSH|nails': 'EXCELLENT',
      'ADVANCE|oneHand': 'GOOD',
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'BRUSH|oneFinger': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'KISS|lips': 'GOOD',
      'MASSAGE|bothHands': 'GOOD',
      'REST|oneHand': { status: 'GOOD', levels: [2] },
      'SQUEEZE|oneHand': 'GOOD',
      'TICKLE|fingers': { status: 'GOOD', levels: [2] },
      'UNCOVER|bothHands': { status: 'GOOD', levels: [2, 3] },
      'UNCOVER|oneHand': { status: 'GOOD', levels: [2] },
      'BRUSH|lips': 'VALID',
      'MASSAGE|thumbs': { status: 'VALID', levels: [2] },
      'REST|bothHands': { status: 'VALID', levels: [2] },
    },
  },
  // la parte interna de los muslos
  innerThighs: {
    preferredStyles: ['SLOW'],
    approvedActions: {
      'ADVANCE|oneHand': 'EXCELLENT',
      'BRUSH|fingers': 'EXCELLENT',
      'BRUSH|fingertips': 'EXCELLENT',
      'BRUSH|lips': 'EXCELLENT',
      'BRUSH|nails': 'EXCELLENT',
      'CARESS|oneHand': 'EXCELLENT',
      'KISS|lips': 'EXCELLENT',
      'LICK|tongue': { status: 'EXCELLENT', levels: [2, 3] },
      'BITE|teeth': 'GOOD',
      'BLOW|breath': 'GOOD',
      'BRUSH|nose': 'GOOD',
      'HOVER|breath': 'GOOD',
      'HOVER|lips': 'GOOD',
      'LICK|tongueTip': 'GOOD',
      'SUCK|mouth': 'GOOD',
      'TICKLE|fingertips': { status: 'GOOD', levels: [2] },
      'SQUEEZE|oneHand': 'VALID',
    },
  },
  // las piernas
  legs: {
    approvedActions: {
      'MASSAGE|bothHands': { status: 'GOOD', levels: [1] },
      'BRUSH|fingers': { status: 'VALID', levels: [1] },
      'BRUSH|fingertips': { status: 'VALID', levels: [1] },
      'CARESS|oneHand': { status: 'VALID', levels: [1] },
    },
  },
  // la parte de atrás de las rodillas
  poplitealArea: {
    preferredStyles: ['SOFT'],
    approvedActions: {
      'BRUSH|fingers': { status: 'VALID', levels: [2, 3] },
      'BRUSH|fingertips': { status: 'VALID', levels: [2, 3] },
      'CARESS|oneHand': { status: 'VALID', levels: [2, 3] },
      'TICKLE|fingertips': { status: 'VALID', levels: [2] },
    },
  },
  // las pantorrillas
  calves: {
    approvedActions: {
      'MASSAGE|bothHands': { status: 'GOOD', levels: [1] },
    },
  },
  // los tobillos
  ankles: {
    approvedActions: {
      'MASSAGE|bothHands': 'VALID',
      'MASSAGE|thumbs': 'VALID',
    },
    rejectedActions: {
      'CARESS|oneHand': 'acariciar los tobillos: relleno',
    },
  },
  // los pies
  feet: {
    preferredStyles: ['FIRM'],
    durationOverrides: { MASSAGE: [30, 120] },
    approvedActions: {
      'MASSAGE|bothHands': { status: 'EXCELLENT', levels: [1] },
      'MASSAGE|thumbs': { status: 'EXCELLENT', levels: [1] },
      'CARESS|oneHand': { status: 'GOOD', levels: [1] },
      'TICKLE|fingertips': { status: 'GOOD', levels: [1, 2] },
    },
  },
  // los dedos de los pies
  toes: {
    approvedActions: {
    },
  },
  // los glúteos
  buttocks: {
    preferredStyles: ['FIRM'],
    approvedActions: {
      'CARESS|oneHand': 'EXCELLENT',
      'SPANK|oneHand': 'EXCELLENT',
      'SQUEEZE|oneHand': 'EXCELLENT',
      'BRUSH|nails': 'GOOD',
      'MASSAGE|bothHands': 'GOOD',
      'BITE|teeth': 'VALID',
      'BRUSH|lips': 'VALID',
      'KISS|lips': 'VALID',
      'LICK|tongue': { status: 'VALID', levels: [2, 3] },
      'UNCOVER|bothHands': { status: 'VALID', levels: [2] },
    },
  },
  // las ingles
  hipCrease: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'BITE|teeth': 'VALID',
      'CARESS|oneHand': 'VALID',
      'HOVER|breath': 'VALID',
      'HOVER|lips': 'VALID',
      'KISS|lips': 'VALID',
      'LICK|tongue': 'VALID',
      'LICK|tongueTip': 'VALID',
    },
  },
  // la entrepierna
  groin: {
    preferredStyles: ['SLOW'],
    durationOverrides: { RUB: [20, 60] },
    approvedActions: {
      'RUB|palm': 'EXCELLENT',
      'BRUSH|fingers': 'GOOD',
      'BRUSH|fingertips': 'GOOD',
      'BRUSH|lips': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'LICK|tongue': 'GOOD',
      'HOVER|breath': 'VALID',
      'HOVER|lips': 'VALID',
      'KISS|lips': 'VALID',
      'STIMULATE|fingers': { status: 'VALID', levels: [2, 3] },
    },
  },
  // la vulva · anatomía vulva · solo Intimidad
  vulva: {
    preferredStyles: ['SLOW', 'SOFT'],
    approvedActions: {
      'CARESS|oneHand': 'EXCELLENT',
      'HOVER|breath': 'EXCELLENT',
      'KISS|lips': 'EXCELLENT',
      'LICK|tongue': 'EXCELLENT',
      'STIMULATE|fingers': 'EXCELLENT',
      'BRUSH|fingertips': 'GOOD',
      'STIMULATE|mouth': 'GOOD',
      'STIMULATE|oneHand': 'GOOD',
      'HOVER|lips': 'VALID',
      'SUCK|mouth': 'VALID',
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
      'SPANK|oneHand': 'la nalgada solo en glúteos',
    },
  },
  // el clítoris · anatomía vulva · solo Intimidad
  clitoris: {
    preferredStyles: ['SLOW', 'SOFT', 'INTERMITTENT'],
    durationOverrides: { SUCK: [20, 75], STIMULATE: [20, 90] },
    approvedActions: {
      'LICK|tongue': 'EXCELLENT',
      'STIMULATE|fingers': 'EXCELLENT',
      'STIMULATE|mouth': 'EXCELLENT',
      'STIMULATE|oneHand': 'EXCELLENT',
      'SUCK|mouth': 'EXCELLENT',
      'BRUSH|fingertips': 'GOOD',
      'CARESS|oneHand': 'GOOD',
      'KISS|lips': 'VALID',
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
      'SQUEEZE|oneHand': 'presión firme donde no cabe',
    },
  },
  // la vagina · anatomía vulva · solo Intimidad
  vagina: {
    preferredStyles: ['SLOW'],
    approvedActions: {
      'INSERT|oneFinger': 'EXCELLENT',
      'STIMULATE|fingers': 'GOOD',
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
    },
  },
  // el pene · anatomía pene · solo Intimidad
  penis: {
    preferredStyles: ['SLOW', 'FIRM'],
    approvedActions: {
      'CARESS|oneHand': 'EXCELLENT',
      'HOVER|breath': 'EXCELLENT',
      'LICK|tongue': 'EXCELLENT',
      'STIMULATE|fingers': 'EXCELLENT',
      'STIMULATE|oneHand': 'EXCELLENT',
      'BRUSH|fingertips': 'GOOD',
      'STIMULATE|mouth': 'GOOD',
      'HOVER|lips': 'VALID',
      'KISS|lips': 'VALID',
      'SUCK|mouth': 'VALID',
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
      'SPANK|oneHand': 'la nalgada solo en glúteos',
    },
  },
  // el glande · anatomía pene · solo Intimidad
  glans: {
    preferredStyles: ['SLOW', 'SOFT'],
    durationOverrides: { SUCK: [20, 60], STIMULATE: [15, 60] },
    approvedActions: {
      'STIMULATE|mouth': 'EXCELLENT',
      'SUCK|mouth': 'EXCELLENT',
      'LICK|tongue': 'GOOD',
      'STIMULATE|fingers': 'GOOD',
      'STIMULATE|oneHand': 'GOOD',
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
      'SQUEEZE|oneHand': 'presión firme donde no cabe',
    },
  },
  // los testículos · anatomía pene · solo Intimidad
  testicles: {
    preferredStyles: ['SOFT'],
    durationOverrides: { SUCK: [15, 30] },
    approvedActions: {
      'BRUSH|fingertips': 'VALID',
      'CARESS|oneHand': 'VALID',
      'KISS|lips': 'VALID',
      'LICK|tongue': 'VALID',
      'STIMULATE|fingers': 'VALID',
      'STIMULATE|mouth': 'VALID',
      'SUCK|mouth': 'VALID',
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
      'SPANK|oneHand': 'la nalgada solo en glúteos',
      'SQUEEZE|oneHand': 'presión firme donde no cabe',
    },
  },
  // el ano · solo Intimidad
  anus: {
    approvedActions: {
    },
    rejectedActions: {
      'BITE|teeth': 'dientes y anatomía íntima: no',
    },
  },
};
/* ¿puede guiarse con la mano de quien recibe? Patrón GUIDED: solo acciones de mano que se dejan guiar sin perder sentido. */
export const GUIDABLE_ACTIONS = ['CARESS', 'BRUSH', 'MASSAGE', 'STIMULATE', 'SQUEEZE', 'RUB', 'TICKLE'];
/* peso de cada clasificación en la elección (REJECTED y UNREVIEWED no existen para el generador) */
export const STATUS_WEIGHT = { EXCELLENT: 1.6, GOOD: 1, VALID: 0.45, REJECTED: 0, UNREVIEWED: 0 };
export const APPROVED_STATUSES = ['EXCELLENT', 'GOOD', 'VALID'];
export const ALL_STATUSES = ['EXCELLENT', 'GOOD', 'VALID', 'REJECTED', 'UNREVIEWED'];
