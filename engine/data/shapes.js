/* SENTENCE SHAPES · plantillas del Human Text Realizer, por acción. Varias estructuras por familia para que la variedad
   sea real y no una coletilla pegada. Tokens: {T} zona («el cuello de Ana» o «su cuello» si ya se nombró a la pareja) ·
   {T:bare} «el cuello» · {T:poss} «su cuello» · {P} pareja · {TOOL} herramienta solo si NO es obvia para la acción ·
   {TOOL!} siempre · {S} hueco del estilo como adverbio (desaparece si no hay estilo) · si la plantilla no lleva {S}, el
   estilo entra como cláusula final (stylePos 'clause') o no entra (stylePos 'none').
   Filtros: tools · notTools · targets · notTargets · tags/notTags (de la zona) · styles ('none' = solo sin estilo | lista) ·
   levels · w peso · fixed: gesto cerrado que ya lleva su manera (no admite estilo ni guía). */
const S = (t, o = {}) => Object.assign({ t, w: 1, stylePos: t.includes('{S}') ? 'adv' : 'clause' }, o);
const F = (t, o = {}) => S(t, { fixed: true, stylePos: 'none', ...o }); // gesto cerrado
export const SHAPES = {
  CARESS: [
    S('Acaricia {S} {T} {TOOL}'), S('Acaricia {S} {T} {TOOL}, de arriba abajo', { tags: ['largo'], w: 0.7 }),
    S('Pasa {S} la mano por {T}', { tools: ['oneHand'], notTags: ['intimo'], w: 0.8 }), S('Recorre {S} {T} con la palma abierta', { tools: ['palm'], tags: ['largo'] }),
    S('Acaricia {T} {TOOL}, sin buscar nada más', { stylePos: 'none', levels: [1], w: 0.5 }),
    S('Deja la mano sobre {T} y acarícia{T:pron} {S}', { tools: ['oneHand'], styles: ['SOFT', 'INTERMITTENT', 'SLOW'], w: 0.6 }),
  ],
  BRUSH: [
    S('Roza {S} {T} {TOOL!}', { tools: ['fingertips', 'nose'] }), S('Roza {S} {T} con los labios', { tools: ['lips'], notTargets: ['lips'] }), F('Roza los labios de {P} con los tuyos, apenas tocando', { tools: ['lips'], targets: ['lips'] }), S('Recorre {S} {T} con la punta de los dedos', { tools: ['fingers'], tags: ['largo'] }), S('Roza {S} {T} con la punta de los dedos', { tools: ['fingers'], notTags: ['largo'] }),
    S('Recorre {S} {T} {TOOL!}', { tools: ['fingertips', 'lips', 'nails'], tags: ['largo'], w: 0.8 }), S('Pasa {S} las uñas por {T}', { tools: ['nails'] }),
    S('Roza {T} con los labios, apenas tocando', { tools: ['lips'], notTargets: ['lips'], styles: 'none' }), S('Recorre {T} con la punta de la nariz, apenas tocando', { tools: ['nose'], notTargets: ['nose'], styles: 'none' }),
    F('Roza la nariz de {P} con la tuya', { tools: ['nose'], targets: ['nose'] }),
    S('Dibuja {S} formas con un dedo sobre {T}', { tools: ['oneFinger'], notTargets: ['lips', 'ears', 'collarbones', 'wrists'] }), S('Recorre {S} el contorno de {T} con un solo dedo', { tools: ['oneFinger'], targets: ['lips', 'ears', 'collarbones', 'wrists', 'face', 'shoulders', 'hips', 'breasts', 'waist', 'outerThighs', 'hands'] }),
    F('Escribe tu nombre con un dedo sobre {T} y que {P} lo adivine', { tools: ['oneFinger'], targets: ['back', 'upperArms', 'outerThighs', 'abdomen', 'palms', 'chest', 'lowerBack'], w: 0.6 }),
    S('Con la yema de los dedos, recorre {S} {T} de un lado a otro', { tools: ['fingertips'], tags: ['largo'], w: 0.6 }),
  ],
  MASSAGE: [
    S('Masajea {S} {T} {TOOL}'), S('Masajea {S} {T} {TOOL}, en pequeños círculos', { notTargets: ['hair', 'hands', 'fingers'], w: 0.7 }),
    S('Presiona {S} {T} con los pulgares', { tools: ['thumbs'] }), S('Masajea el cuero cabelludo de {P} con las yemas, {S:clause}', { tools: ['fingertips'], targets: ['hair'], stylePos: 'clause' }),
    S('Masajea {T} {TOOL}, buscando dónde está más cargado', { targets: ['shoulders', 'back', 'nape', 'lowerBack', 'feet', 'neck'], styles: 'none', w: 0.8 }),
    S('Sostén las manos de {P} entre las tuyas y masajea {S} cada dedo', { tools: ['bothHands'], targets: ['hands'], w: 0.7 }), S('Sostén los pies de {P} entre tus manos y masajea {S} cada dedo', { tools: ['bothHands'], targets: ['feet'], w: 0.7 }),
  ],
  REST: [
    S('Apoya la mano sobre {T}, sin moverla', { tools: ['oneHand'] }), S('Deja la mano quieta sobre {T} y nota cómo respira {P}', { tools: ['oneHand'], targets: ['chest', 'abdomen', 'back', 'lowerBack', 'flanks'], w: 0.8 }),
    S('Frota tus manos hasta calentarlas y apóyalas sobre {T}', { tools: ['bothHands'] }), S('Pon la mano sobre {T} y déjala ahí, con todo su peso', { tools: ['oneHand'], notTargets: ['cheeks', 'neck'], w: 0.6 }),
  ],
  KISS: [
    S('Besa {S} {T}'), S('Da pequeños besos en {T}', { styles: ['INTERMITTENT'], notTargets: ['lips'] }), S('Da pequeños besos en {T}', { styles: 'none', notTargets: ['lips'], w: 0.5 }),
    S('Besa {T}, uno detrás de otro, sin dejar hueco', { tags: ['largo'], styles: ['INTERMITTENT', 'SLOW'], stylePos: 'none', w: 0.6 }),
    S('Besa a {P} en la boca, despacio y profundo', { targets: ['lips'], styles: 'none', stylePos: 'none' }), S('Besa {S} a {P} en la boca', { targets: ['lips'], styles: ['SLOW', 'SOFT'] }),
    F('Besa a {P} justo detrás de la oreja', { targets: ['ears'] }), S('Besa {S} {T} y quédate ahí un segundo antes de separarte', { notTargets: ['lips'], styles: ['SLOW', 'SOFT'], w: 0.6 }),
    S('Recorre {T} a besos, {S:clause}', { tags: ['largo'], stylePos: 'clause', w: 0.7 }),
  ],
  SUCK: [
    S('Chupa {S} {T}', { notTags: ['par'] }), S('Chupa {S} {T}', { tags: ['par'], w: 0.7 }), S('Chupa {S} {T}, alternando un lado y otro', { tags: ['par'], styles: ['SLOW', 'SOFT'], w: 0.6 }),
    S('Besa {T} succionando un poco la piel', { notTags: ['intimo'], styles: 'none' }), S('Besa {S} {T}, succionando un poco la piel', { notTags: ['intimo'], styles: ['SLOW', 'SOFT'], w: 0.6 }),
    S('Métete {T:bare} de {P} en la boca y chupa {S}', { targets: ['nipples', 'glans', 'clitoris', 'testicles'], w: 0.7 }),
  ],
  LICK: [
    S('Lame {S} {T}', { tools: ['tongue'] }), S('Recorre {S} {T} con la punta de la lengua', { tools: ['tongueTip'] }), S('Roza {S} {T} con la punta de la lengua', { tools: ['tongueTip'], targets: ['lips', 'ears', 'neck', 'nipples', 'collarbones'] }),
    S('Lame {T} {S}, de abajo arriba', { tools: ['tongue'], tags: ['largo'], w: 0.5 }), S('Lame {S} {T} y sopla después sobre la piel húmeda', { tools: ['tongue'], notTags: ['intimo'], styles: ['SLOW', 'SOFT'], w: 0.6 }),
  ],
  BITE: [
    S('Mordisquea {S} {T}', { tools: ['teeth'] }), S('Mordisquea {T}, apenas apretando', { tools: ['teeth'], styles: 'none', w: 0.7 }), S('Atrapa {T} entre los dientes, sin apretar, y suelta', { tools: ['teeth'], targets: ['ears', 'lips', 'nipples', 'neck'], styles: 'none', w: 0.6 }),
    F('Atrapa el labio inferior de {P} entre los tuyos', { tools: ['lips'], targets: ['lips'] }),
  ],
  HOVER: [
    F('Acércate a {T} hasta casi rozar, y quédate ahí un momento', { tools: ['lips'] }), F('Acerca los labios a {T} sin llegar a tocar, y que {P} note solo la cercanía', { tools: ['lips'], notTargets: ['lips'], w: 0.7 }),
    F('Respira muy cerca de {T}, sin tocar', { tools: ['breath'] }), F('Deja que {P} sienta tu respiración sobre {T:poss}, sin que la piel se toque', { tools: ['breath'], w: 0.7 }),
  ],
  BLOW: [ S('Sopla {S} sobre {T}, muy cerca de la piel'), S('Sopla {S} sobre {T}, recorriéndo{T:pron}', { tags: ['largo'], w: 0.6 }) ],
  WHISPER: [ F('Susurra algo a {P} al oído'), F('Acércate al oído de {P} y dile en voz muy baja algo que solo sea para hoy', { w: 0.6 }), F('Susurra a {P} al oído qué es lo que más te gusta de este momento', { w: 0.6 }) ],
  // HUG y BODY_CONTACT: cuerpo con cuerpo → su copy vive en cada blueprint de positional.js
  HOLD_HANDS: [
    F('Entrelaza tus dedos con los de {P}', { tools: ['fingers'] }), F('Toma las dos manos de {P} entre las tuyas y quédate así un momento', { tools: ['bothHands'], targets: ['hands'] }),
    F('Pon tus palmas contra las de {P} y empujad un poco, notando la fuerza del otro', { tools: ['bothHands'], targets: ['palms'] }),
    F('Besa la palma de la mano de {P} y ciérrale los dedos sobre el beso', { tools: ['lips'] }),
  ],
  RUB: [ // caderas, muslo y pecho contra el cuerpo: blueprints posicionales; aquí solo la palma
    S('Frota {S} {T} con la palma de la mano, por encima de la ropa', { tools: ['palm'] }), S('Apoya la palma sobre {T}, por encima de la ropa, y frótala {S}', { tools: ['palm'], w: 0.6 }),
  ],
  SQUEEZE: [ S('Aprieta {S} {T} con la mano'), S('Agarra {T} y apriéta{T:pron} {S}, soltando poco a poco', { w: 0.6 }) ],
  GRIP: [
    F('Sujeta las caderas de {P} con las dos manos y acércalas a ti', { tools: ['bothHands'], targets: ['hips'] }), F('Sujeta el cabello de {P} desde la nuca y acerca su boca a la tuya', { tools: ['oneHand'], targets: ['nape'] }),
    F('Sujeta las muñecas de {P} con una mano y mantenlas quietas un momento', { tools: ['oneHand'], targets: ['wrists'] }),
  ],
  SPANK: [ F('Da una nalgada en {T}'), F('Da una nalgada en {T} y deja la mano ahí, apoyada', { w: 0.6 }) ],
  TICKLE: [
    S('Tamborilea {S} con los dedos sobre {T}, como si tocaras el piano', { tools: ['fingers'] }), S('Haz cosquillas {S} en {T} con la yema de los dedos', { tools: ['fingertips'] }),
    S('Pasa la yema de los dedos por {T} hasta que a {P} se le escape la risa', { tools: ['fingertips'], styles: 'none', w: 0.7 }),
  ],
  HAIR_PLAY: [ S('Juega {S} con el cabello de {P}'), S('Peina {S} el cabello de {P} con los dedos'), S('Pasa los dedos por el cabello de {P}, {S:clause}', { stylePos: 'clause', w: 0.7 }) ],
  STIMULATE: [
    S('Estimula {S} {T} con los dedos', { tools: ['fingers'] }), S('Acaricia {S} {T} con los dedos, sin apartarlos', { tools: ['fingers'], w: 0.7 }),
    S('Estimula {S} {T} con la boca', { tools: ['mouth'] }), S('Estimula {S} {T} con la lengua', { tools: ['tongue'] }),
    S('Masturba {S} a {P}, centrándote en {T:bare}', { tools: ['oneHand'] }), S('Rodea {T} con la mano y muévela {S}', { tools: ['oneHand'], targets: ['penis'], w: 0.8 }),
  ],
  INSERT: [ S('Introduce {S} un dedo en {T}'), S('Introduce {S} un dedo en {T} y quédate quieto dentro un momento', { w: 0.6 }) ],
  UNCOVER: [
    F('Aparta la ropa de {T} y descubre la piel', { tools: ['bothHands'] }), F('Desabrocha un botón o baja un poco la ropa de {T}, sin llegar a quitarla', { tools: ['bothHands'], targets: ['chest', 'breasts', 'abdomen', 'hips', 'waist', 'outerThighs'] }),
    F('Desliza la mano por debajo de la ropa hasta llegar a {T}', { tools: ['oneHand'] }),
  ],
  ADVANCE: [
    F('Apoya la mano sobre {T} y súbela unos centímetros, muy despacio', { notTargets: ['innerThighs'] }), F('Desliza la mano entre los muslos de {P} y déjala quieta ahí', { targets: ['innerThighs'] }),
    F('Apoya la mano sobre {T} y súbela un poco cada vez que {P} respire', { targets: ['outerThighs', 'innerThighs', 'abdomen'], w: 0.6 }),
  ],
};
/* GUIDED: cómo se expresa que quien recibe guía con su mano. Se elige una, según lo que la frase ya lleva.
   affects: qué dimensión toca la guía (una por frase, nunca todas). */
export const GUIDED_SHAPES = [
  // t: la frase no nombra a la pareja · tp: ya la nombra · th: la frase ya dice «mano» (se usa «la suya») · tph: ambas cosas
  { t: '{CORE} y deja que {P} guíe tu mano', tp: '{CORE} y deja que su mano guíe la tuya', th: '{CORE} y deja que {P} te guíe con la suya', tph: '{CORE} y deja que te guíe con la suya', affects: 'movement' },
  { t: '{CORE}, dejando que la mano de {P} marque el ritmo', tp: '{CORE}, dejando que su mano marque el ritmo', th: '{CORE}, dejando que {P} marque el ritmo con la suya', tph: '{CORE}, dejando que marque el ritmo con la suya', affects: 'pace' },
  { t: '{CORE}; que {P} te lleve con su mano donde quiera', tp: '{CORE}; que su mano te lleve donde quiera', th: '{CORE}; que {P} te lleve con la suya donde quiera', tph: '{CORE}; que te lleve con la suya donde quiera', affects: 'movement' },
  { t: '{CORE} y que {P} apriete tu mano si quiere más', tp: '{CORE} y que apriete tu mano si quiere más', th: '{CORE} y que {P} apriete la tuya si quiere más', tph: '{CORE} y que apriete la tuya si quiere más', affects: 'pressure' },
  { t: '{CORE}, con la mano de {P} sobre la tuya', tp: '{CORE}, con su mano sobre la tuya', th: '{CORE}, con la suya sobre la tuya', tph: '{CORE}, con la suya sobre la tuya', affects: 'pace' },
  { t: '{CORE}. La mano de {P} te dirá cómo seguir', tp: '{CORE}. Su mano te dirá cómo seguir', th: '{CORE}. La suya te dirá cómo seguir', tph: '{CORE}. La suya te dirá cómo seguir', affects: 'movement' },
];
