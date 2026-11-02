# Pollo a la brasa

Juego privado para parejas adultas. **La pareja controla la dirección; el motor elige entre buenas experiencias.**
Cada carta es una interacción diseñada por una persona; el azar solo decide cuál de las que caben ahora sale. Nunca
intenta convertir combinaciones aleatorias en buenas experiencias. La pareja percibe «nos salió esta».

```
CARTA CURADA → VARIANTES APROBADAS → COMPATIBILIDAD DE SESIÓN → SELECCIÓN PONDERADA → FRASE → TIEMPO → PANTALLA
```

## Niveles

01 Conexión · 02 Deseo · 03 Intimidad. Tres, no cuatro (lo guardado con «Exploración» se migra a Deseo). El nivel lo
cambia solo la pareja desde el indicador, en cualquier dirección y sin confirmaciones: el director nunca sube ni baja
(`nextLevel = USER_DECISION`), ME GUSTA no es subir, «más suave» no es bajar, Deseo en su banda alta no es Intimidad.

- **Conexión** es autosuficiente: 17 cartas (masajes, picos, abrazos, manos, música, una guiada, una de elección).
- **Deseo** se juega **con ropa**: 14 cartas; ninguna exige ni cambia ropa.
- **Intimidad** es un mazo **con estado**: cada carta declara qué ropa necesita fuera y se compara con la ropa **real** de cada
  jugador. Entrar en Intimidad no es desnudarse; nada obliga a quitarse nada ni a terminar en nada. Alrededor de la carta 15
  (entre la 13 y la 17) el juego pregunta «¿Queréis seguir por vuestra cuenta?»: seguir con el juego conserva todo el estado;
  seguir por vuestra cuenta cierra sin victorias ni objetivos.

## Contenido (`content/`)

Única fuente de verdad. Añadir una carta es añadirla a su fichero de nivel; el selector no cambia.

- `schema.js` — `CuratedInteraction` (id · level · family · intraLevelIntensity · status APPROVED | UNREVIEWED | REJECTED ·
  source DESIGNER_PROVIDED | MIGRATED_APPROVED · interactionType STANDARD | MUTUAL | GUIDED | CHOOSE | PATH | BODY_TO_BODY |
  UNDRESS | POSITIONAL | SPECIAL · actorRequirements · receiverRequirements · clothing · allowedSides · copy / copyBySide ·
  variants · playConstraints · durations · timerMode FIXED | WEIGHTED | NO_TIMER · choices · path · undress · requiredOrientation ·
  note · baseWeight · tags · notes), familias, PlayConstraints con su copia, requisitos de ropa.
- `body.js` — partes que reciben y partes con las que se actúa, con anatomía requerida (vulva · pene · senos), lado, prendas que las tapan y **región corporal** (FACE · NECK · ARMS_HANDS · CHEST · ABDOMEN · BACK · HIPS_GLUTES · THIGHS_LEGS · FEET · INTIMATE · FULL_BODY) para la diversidad del selector. Prendas: camiseta · pantalón · calcetines · brasier · panties · calzoncillos, según anatomía, no género.
- `connection.js` (C01–C52: 50 activas con `similarityGroup`; C29 y C35 REJECTED) · `desire.js` (D01–D14) · `intimacy.js` (I01–I24: I21 THROUGH_BRA, I22 THROUGH_BOXERS, I23 THROUGH_PANTIES; I14 I16 I24 UNREVIEWED) · `undress.js` (U01–U08) · `transitions.js` (solo para mazo vacío).
- `index.js` — junta los mazos, deriva etiquetas («hoy no») y valida la estructura (`validateContent`).

Solo **APPROVED** entra en producción. Una carta UNREVIEWED puede estar sin copia a propósito: es una decisión pendiente del
diseñador, no un hueco que rellenar. Nunca se infieren relaciones nuevas ni se generan cartas por producto cartesiano.

## Motor (`engine/`, sin dependencias ni build)

- `anatomy.js` — `PlayerAnatomy { playerId, availableTargets, availableActorTools }` a partir de lo que cada jugador declaró. Las dos anatomías nunca se mezclan.
- `clothing.js` — `PlayerClothingState { top, bottoms, socks, bra, panties, boxers }` con ON · OFF · NONE (brasier solo con senos; calzoncillos con pene sin vulva; panties en el resto; la prenda que no aplica queda NONE y no se muestra). Camiseta ≠ brasier, pantalón ≠ panties/calzoncillos: cada prenda cubre lo suyo; accesibilidad por parte (PARTE QUE EXISTE ≠ PARTE ACCESIBLE); requisitos ANY · CLOTHED · THROUGH_CLOTHING · SKIN_ACCESS · TOP_ACCESS · BOTTOM_ACCESS · UNDERWEAR_ON · UNDERWEAR_OFF · FULL_BODY_ACCESS · THROUGH_BRA / THROUGH_PANTIES / THROUGH_BOXERS (`THROUGH_GARMENT(g)`: la prenda interior puesta y su exterior fuera; cartas propias SOBRE la prenda, que desaparecen al quitarla mientras entran las de acceso directo). **Capas** (`GARMENT_LAYERS` en body.js): camiseta → brasier → piel; pantalón → panties / calzoncillos → piel; una prenda interior solo se quita con su exterior fuera, y una UNDRESS normal nunca retira dos capas. `coverage(parte, estado)` = COVERED_BY_OUTER · THROUGH_UNDERWEAR · DIRECT + prenda responsable; bandas informativas I-A / I-B / I-C.
- `deck.js` — el selector: **filtrar** (aprobada ∩ nivel ∩ anatomía ∩ ropa ∩ disponibilidad ∩ físico ∩ sesión, cada rechazo con razón) → **ponderar** con factores independientes, nunca un «intensity score» (baseWeight · cardRecency · familyDiversity · bodyRegionDiversity · regionStarvation · targetDiversity · typeSpacing · newlyUnlockedBoost · sameRegionUndressCooldown (tras quitar una exterior, quitar la interior de la misma zona pesa poco unas cartas) · sessionPurpose · favorFamily; la región íntima no gana peso por serlo: desnudez aumenta posibilidades, no reduce el cuerpo a la anatomía íntima) → **elegir** carta, variante, lado (memoria de lateralidad como peso) y PlayConstraint (FREE siempre; la reciente pesa poco).
- `history.js` — cartas, familias, variantes, lados por carta y por parte, limitaciones, actores, receptores, cambios de ropa.
- `session.js` — director (CONNECT · BUILD · EXPLORE · DEEPEN · MAINTAIN · VARIATION · SOFTEN · COOLDOWN · END; en Intimidad favorece oportunidades, nunca decide que la pareja «está lista»), feedback suave (ME GUSTA favorece familias afines; nunca repite, nunca sube), check-in, sí / quizá / hoy no, pausa de continuidad.
- `realizer.js` — de carta + variante + lado + limitación a una frase: varía entre las estructuras aprobadas, nunca el significado.
- `engine.js` — API de sesión (nivel, ropa, UNDRESS registrado, pausa, favoritas) y generación; mazo vacío → transición neutra y aviso (`stats.emptyDecks`), nunca relaja nada.
- `duration.js`, `levels.js`, `prefs.js`, `rng.js`.

`app/` solo muestra: QUIÉN · QUÉ · SIGUIENTE, temporizador, ♡ ME GUSTA, •••, estado de ropa, qué se quitó, pausa, «Lo nuestro».
Los dados son un ritual de azar (caras con puntos) que no representa nada del contenido.

## Comprobaciones

`node tests/bra.js` simula los tres estados de pecho y `node tests/layers.js` las secuencias por capas. `node tests/diversity.js --out=informe.md` genera la auditoría de diversidad corporal: cartas APPROVED por región, 1 000 selecciones de Intimidad con acceso completo y 100 sesiones reales empezando vestidos.

```
node tests/validate.js              # estructura del contenido
node --test 'tests/*.test.js'       # §65 general · §66 ropa · §67 Intimidad
node tests/simulate.js 100 --out=informe.md   # §68: 320 sesiones, informe
```

**Content Lab** (`lab/`, también en `/lab/`): inspector de cada carta (ID · NIVEL · FAMILIA · TIPO · STATUS · ORIGEN · requisitos ·
ropa · lados · variantes · limitaciones · tiempos · peso · elegibilidad) y «Mazo en vivo»: escenario real (nivel, dirección,
anatomía y ropa de cada uno), elegibles, rechazadas con motivo y tiradas con candidatas, pesos, ganadora, variante, lado,
duración y propósito. Aprobar o rechazar es editar `status` en `content/` y pasar la validación.

Privacidad: en el teléfono solo nombres, anatomía, «Lo nuestro», vibración y configuración hecha (`localStorage` `pab.v2`,
`schema` 4). Sesión, ropa, humor y feedback viven en memoria. Sin telemetría.
