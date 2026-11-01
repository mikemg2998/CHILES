# Auditoría automática de la matriz · 2026-11-01

Pregunta: **¿esta acción merece aparecer aquí?** Esta herramienta solo señala; la decisión es humana y vive en
`engine/data/repertoire.js` (zonas) y `engine/data/positional.js` (cuerpo con cuerpo). Nada se promociona automáticamente:
UNREVIEWED → APPROVED solo lo hace una persona, editando el fichero o desde Content Lab (`lab/`).

Universo técnico (acción admite la herramienta y la biomecánica lo permite): **2038** relaciones acción · herramienta · zona.
EXCELLENT 125 · GOOD 155 · VALID 87 · REJECTED 36 · UNREVIEWED 1635.
Blueprints posicionales: 21 APPROVED · 1 UNREVIEWED.

## Heurísticas de sospecha

| ID | Qué señala |
|---|---|
| ANTICIPACION_PLANA | acción sin contacto (soplar, acercarse) sobre una zona poco sensible o de hueso: no construye anticipación |
| BOCA_SOBRE_HUESO | succión o mordisco sobre una zona poco sensible, de hueso o de alta tolerancia a la presión |
| NARIZ_FORZADA | la nariz solo tiene sentido en zonas altas o muy sensibles |
| PRESION_DONDE_NO_CABE | masaje, apretón o sujeción sobre una zona de baja tolerancia a la presión |
| MANO_QUIETA_RARA | apoyar la mano en una zona lateral o estrecha: postura rara |
| MENOR_CON_BOCA | combinación VALID (menor) con la boca: si no es excelente, probablemente no merece salir |
| INTIMA_GENERICA | acción genérica de mano sobre anatomía íntima con status menor: revisar la frase que sale |
| HERRAMIENTA_PEQUENA_ZONA_GRANDE | un solo dedo o la punta de la lengua recorriendo una zona larga: gesto que se diluye |

## Combinaciones aprobadas que las heurísticas señalan (46) — decidir: mantener con motivo o rechazar

| Zona | Acción · herramienta | Status | Heurísticas | Frase que sale |
|---|---|---|---|---|
| la espalda | Rozar · solo dedo | EXCELLENT | HERRAMIENTA_PEQUENA_ZONA_GRANDE | Dibuja formas con un dedo sobre la espalda de Ana. |
| la espalda | Rozar · labios | VALID | MENOR_CON_BOCA | Roza la espalda de Ana con los labios. |
| la espalda | Rozar · punta de la nariz | VALID | NARIZ_FORZADA | Recorre la espalda de Ana con la punta de la nariz, apenas tocando. |
| los glúteos | Mordisquear · dientes | VALID | MENOR_CON_BOCA | Mordisquea los glúteos de Ana, apenas apretando. |
| los glúteos | Rozar · labios | VALID | MENOR_CON_BOCA | Roza los glúteos de Ana con los labios. |
| los glúteos | Besar · labios | VALID | MENOR_CON_BOCA | Besa los glúteos de Ana. |
| los glúteos | Lamer · lengua | VALID | MENOR_CON_BOCA | Lame los glúteos de Ana. |
| el pecho | Chupar · boca | VALID | MENOR_CON_BOCA | Besa el pecho de Ana succionando un poco la piel. |
| el clítoris | Besar · labios | VALID | INTIMA_GENERICA | Besa el clítoris de Ana. |
| las clavículas | Mordisquear · dientes | GOOD | BOCA_SOBRE_HUESO | Mordisquea las clavículas de Ana. |
| las clavículas | Acercarse sin tocar · aliento | GOOD | ANTICIPACION_PLANA | Respira muy cerca de las clavículas de Ana, sin tocar. |
| las clavículas | Acercarse sin tocar · labios | GOOD | ANTICIPACION_PLANA | Acerca los labios a sus clavículas sin llegar a tocar, y que Ana note solo la cercanía. |
| los costados | Besar · labios | VALID | MENOR_CON_BOCA | Besa los costados de Ana. |
| los costados | Lamer · punta de la lengua | VALID | MENOR_CON_BOCA | Recorre los costados de Ana con la punta de la lengua. |
| la entrepierna | Acercarse sin tocar · aliento | VALID | MENOR_CON_BOCA | Respira muy cerca de la entrepierna de Ana, sin tocar. |
| la entrepierna | Acercarse sin tocar · labios | VALID | MENOR_CON_BOCA | Acércate a la entrepierna de Ana hasta casi rozar, y quédate ahí un momento. |
| la entrepierna | Besar · labios | VALID | MENOR_CON_BOCA | Besa la entrepierna de Ana. |
| las ingles | Mordisquear · dientes | VALID | MENOR_CON_BOCA | Mordisquea las ingles de Ana, apenas apretando. |
| las ingles | Acercarse sin tocar · aliento | VALID | MENOR_CON_BOCA | Respira muy cerca de las ingles de Ana, sin tocar. |
| las ingles | Acercarse sin tocar · labios | VALID | MENOR_CON_BOCA | Acércate a las ingles de Ana hasta casi rozar, y quédate ahí un momento. |
| las ingles | Besar · labios | VALID | MENOR_CON_BOCA | Besa las ingles de Ana. |
| las ingles | Lamer · lengua | VALID | MENOR_CON_BOCA | Lame las ingles de Ana. |
| las ingles | Lamer · punta de la lengua | VALID | MENOR_CON_BOCA | Recorre las ingles de Ana con la punta de la lengua. |
| las caderas | Rozar · labios | VALID | MENOR_CON_BOCA | Roza las caderas de Ana con los labios, apenas tocando. |
| las caderas | Besar · labios | VALID | MENOR_CON_BOCA | Da pequeños besos en las caderas de Ana. |
| la parte interna de los muslos | Apretar · mano | VALID | PRESION_DONDE_NO_CABE | Agarra la parte interna de los muslos de Ana y apriétala, soltando poco a poco. |
| la zona lumbar | Lamer · punta de la lengua | VALID | MENOR_CON_BOCA | Recorre la zona lumbar de Ana con la punta de la lengua. |
| la nuca | Soplar · aliento | EXCELLENT | ANTICIPACION_PLANA | Sopla sobre la nuca de Ana, muy cerca de la piel. |
| la nuca | Acercarse sin tocar · aliento | EXCELLENT | ANTICIPACION_PLANA | Respira muy cerca de la nuca de Ana, sin tocar. |
| la nuca | Acercarse sin tocar · labios | EXCELLENT | ANTICIPACION_PLANA | Acércate a la nuca de Ana hasta casi rozar, y quédate ahí un momento. |
| la nuca | Mordisquear · dientes | GOOD | BOCA_SOBRE_HUESO | Mordisquea la nuca de Ana, apenas apretando. |
| el cuello | Lamer · punta de la lengua | EXCELLENT | HERRAMIENTA_PEQUENA_ZONA_GRANDE | Roza el cuello de Ana con la punta de la lengua. |
| el cuello | Masajear · dos manos | VALID | PRESION_DONDE_NO_CABE | Masajea el cuello de Ana. |
| los pezones | Mordisquear · dientes | VALID | MENOR_CON_BOCA | Atrapa los pezones de Ana entre los dientes, sin apretar, y suelta. |
| los muslos | Rozar · labios | VALID | MENOR_CON_BOCA | Roza los muslos de Ana con los labios. |
| el pene | Besar · labios | VALID | INTIMA_GENERICA | Besa el pene de Ana. |
| los hombros | Mordisquear · dientes | EXCELLENT | BOCA_SOBRE_HUESO | Mordisquea los hombros de Ana. |
| las sienes | Besar · labios | VALID | MENOR_CON_BOCA | Da pequeños besos en las sienes de Ana. |
| los testículos | Rozar · yema de los dedos | VALID | INTIMA_GENERICA | Roza los testículos de Ana con la yema de los dedos. |
| los testículos | Acariciar · mano | VALID | INTIMA_GENERICA | Acaricia los testículos de Ana. |
| los testículos | Besar · labios | VALID | INTIMA_GENERICA | Da pequeños besos en los testículos de Ana. |
| los brazos | Rozar · solo dedo | VALID | HERRAMIENTA_PEQUENA_ZONA_GRANDE | Escribe tu nombre con un dedo sobre sus brazos y que Ana lo adivine. |
| la cintura | Rozar · labios | VALID | MENOR_CON_BOCA | Roza la cintura de Ana con los labios, apenas tocando. |
| la cintura | Besar · labios | VALID | MENOR_CON_BOCA | Besa la cintura de Ana. |
| las muñecas | Rozar · labios | VALID | MENOR_CON_BOCA | Roza las muñecas de Ana con los labios. |
| las muñecas | Besar · labios | VALID | MENOR_CON_BOCA | Da pequeños besos en las muñecas de Ana. |

## Rechazadas con motivo (36)

| Zona | Acción · herramienta | Motivo | Heurísticas que lo habrían señalado |
|---|---|---|---|
| el abdomen | Soplar · aliento | soplar sobre el abdomen: gesto plano; la anticipación va en el bajo vientre | — (criterio editorial) |
| el abdomen | Rozar · punta de la nariz | la nariz sobre el abdomen: forzado | NARIZ_FORZADA |
| los tobillos | Acariciar · mano | acariciar los tobillos: relleno | — (criterio editorial) |
| el ano | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| la espalda | Soplar · aliento | soplar sobre la espalda no construye nada: la anticipación va en nuca, cuello, orejas y bajo vientre | ANTICIPACION_PLANA |
| los senos | Nalgada · mano | la nalgada solo en glúteos | — (criterio editorial) |
| las mejillas | Nalgada · mano | la nalgada solo en glúteos | — (criterio editorial) |
| el clítoris | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| el clítoris | Apretar · mano | presión firme donde no cabe | PRESION_DONDE_NO_CABE |
| las clavículas | Soplar · aliento | soplar sobre un hueso: técnicamente posible, editorialmente pobre (caso real: «Sopla sobre las clavículas…») | ANTICIPACION_PLANA |
| las clavículas | Chupar · boca | succionar piel fina sobre hueso: no es un gesto que merezca salir | BOCA_SOBRE_HUESO |
| el rostro | Nalgada · mano | la nalgada solo en glúteos | — (criterio editorial) |
| los costados | Soplar · aliento | soplar en los costados: gesto plano | — (criterio editorial) |
| los costados | Rozar · punta de la nariz | la nariz en los costados: forzado | NARIZ_FORZADA |
| los costados | Masajear · dos manos | masajear los costados: zona de baja tolerancia a la presión | PRESION_DONDE_NO_CABE |
| los costados | Apoyar la mano · dos manos | apoyar las manos en los costados: postura rara | MANO_QUIETA_RARA |
| los costados | Apoyar la mano · mano | apoyar la mano en un costado: postura rara | MANO_QUIETA_RARA |
| los costados | Apretar · mano | apretar los costados se convierte en cosquillas | PRESION_DONDE_NO_CABE |
| los costados | Chupar · boca | succionar los costados: incómodo, sin recorrido | — (criterio editorial) |
| el glande | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| el glande | Apretar · mano | presión firme donde no cabe | PRESION_DONDE_NO_CABE |
| las caderas | Mordisquear · dientes | mordisquear las caderas: hueso | — (criterio editorial) |
| la zona lumbar | Cosquillear · dedos | tamborilear en la zona lumbar: gesto hueco | — (criterio editorial) |
| el cuello | Apretar · mano | presión firme donde no cabe | PRESION_DONDE_NO_CABE |
| el pene | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| el pene | Nalgada · mano | la nalgada solo en glúteos | — (criterio editorial) |
| los hombros | Chupar · boca | succionar los hombros: no es un gesto que merezca salir | BOCA_SOBRE_HUESO |
| los hombros | Cosquillear · dedos | tamborilear sobre los hombros: no es juego ni caricia | — (criterio editorial) |
| los testículos | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| los testículos | Nalgada · mano | la nalgada solo en glúteos | — (criterio editorial) |
| los testículos | Apretar · mano | presión firme donde no cabe | PRESION_DONDE_NO_CABE |
| la vagina | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| la vulva | Mordisquear · dientes | dientes y anatomía íntima: no | — (criterio editorial) |
| la vulva | Nalgada · mano | la nalgada solo en glúteos | — (criterio editorial) |
| la cintura | Mordisquear · dientes | mordisquear la cintura: hueso y piel tensa | — (criterio editorial) |
| las muñecas | Masajear · dos manos | masajear las muñecas con las dos manos: forzado | — (criterio editorial) |

## Matriz completa por zona

Cada zona lista su repertorio: lo aprobado con status, lo rechazado con motivo y lo que el modelo podría producir y nadie ha revisado.

### el cabello (`hair`) · sensibilidad 1.5 · presión medium · niveles 1 2 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | EXCELLENT | 1 |  | Acaricia el cabello de Ana. |
| Cabello · dedos | EXCELLENT | 1 |  | Pasa los dedos por el cabello de Ana. |
| Masajear · yema de los dedos | EXCELLENT | 1 |  | Masajea el cuero cabelludo de Ana con las yemas. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la frente (`forehead`) · sensibilidad 1 · presión medium · niveles 1 2 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Besar · labios | EXCELLENT | 1 |  | Besa la frente de Ana. |
| Acariciar · mano | VALID | 1 |  | Pasa la mano por la frente de Ana. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las sienes (`temples`) · sensibilidad 1.5 · presión low · niveles 1 2 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | GOOD | 1 |  | Acaricia las sienes de Ana. |
| Rozar · yema de los dedos | VALID | 1 |  | Roza las sienes de Ana con la yema de los dedos. |
| Besar · labios | VALID | 1 |  | Besa las sienes de Ana. |
| Masajear · pulgares | VALID | 1 |  | Presiona las sienes de Ana con los pulgares. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las mejillas (`cheeks`) · sensibilidad 2 · presión low · niveles 1 2 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | EXCELLENT | 1 |  | Pasa la mano por las mejillas de Ana. |
| Apoyar la mano · mano | EXCELLENT | 1 |  | Apoya la mano sobre las mejillas de Ana, sin moverla. |
| Rozar · yema de los dedos | GOOD | 1 |  | Roza las mejillas de Ana con la yema de los dedos. |
| Besar · labios | GOOD | 1 |  | Besa las mejillas de Ana. |
| Nalgada · mano | REJECTED | — | la nalgada solo en glúteos | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el rostro (`face`) · sensibilidad 2 · presión low · niveles 1 2 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | EXCELLENT | 1 |  | Acaricia el rostro de Ana, sin buscar nada más. |
| Rozar · yema de los dedos | GOOD | 1 |  | Roza el rostro de Ana con la yema de los dedos. |
| Rozar · solo dedo | GOOD | 1 |  | Recorre el contorno del rostro de Ana con un solo dedo. |
| Nalgada · mano | REJECTED | — | la nalgada solo en glúteos | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la nariz (`nose`) · sensibilidad 1.5 · presión low · niveles 1

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · punta de la nariz | EXCELLENT | 1 |  | Roza la nariz de Ana con la tuya. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las orejas (`ears`) · sensibilidad 3.5 · presión low · niveles 1 2 · estilos preferidos SOFT INTERMITTENT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mordisquear · dientes | EXCELLENT | 2 |  | Atrapa las orejas de Ana entre los dientes, sin apretar, y suelta. |
| Acercarse sin tocar · aliento | EXCELLENT | 2 |  | Respira muy cerca de las orejas de Ana, sin tocar. |
| Besar · labios | EXCELLENT | 1 2 |  | Besa las orejas de Ana. |
| Lamer · punta de la lengua | EXCELLENT | 2 |  | Recorre las orejas de Ana con la punta de la lengua. |
| Susurrar · voz | EXCELLENT | 2 |  | Susurra algo a Ana al oído. |
| Soplar · aliento | GOOD | 2 |  | Sopla sobre las orejas de Ana, muy cerca de la piel. |
| Rozar · labios | GOOD | 2 |  | Roza las orejas de Ana con los labios, apenas tocando. |
| Acercarse sin tocar · labios | GOOD | 2 |  | Acércate a las orejas de Ana hasta casi rozar, y quédate ahí un momento. |
| Rozar · yema de los dedos | VALID | 1 2 |  | Roza las orejas de Ana con la yema de los dedos. |
| Rozar · solo dedo | VALID | 1 2 |  | Recorre el contorno de las orejas de Ana con un solo dedo. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |

### los labios (`lips`) · sensibilidad 4.5 · presión low · niveles 2 3 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mordisquear · labios | EXCELLENT | 2 3 |  | Atrapa el labio inferior de Ana entre los tuyos. |
| Rozar · solo dedo | EXCELLENT | 2 3 |  | Recorre el contorno de los labios de Ana con un solo dedo. |
| Acercarse sin tocar · labios | EXCELLENT | 2 3 |  | Acércate a los labios de Ana hasta casi rozar, y quédate ahí un momento. |
| Besar · labios | EXCELLENT | 2 3 |  | Besa a Ana en la boca, despacio y profundo. |
| Mordisquear · dientes | GOOD | 2 3 |  | Mordisquea los labios de Ana. |
| Rozar · labios | GOOD | 2 3 |  | Roza los labios de Ana con los tuyos, apenas tocando. |
| Acercarse sin tocar · aliento | GOOD | 2 3 |  | Deja que Ana sienta tu respiración sobre sus labios, sin que la piel se toque. |
| Lamer · punta de la lengua | GOOD | 2 3 |  | Roza los labios de Ana con la punta de la lengua. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el cuello (`neck`) · sensibilidad 3.5 · presión low · niveles 1 2 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mordisquear · dientes | EXCELLENT | 2 3 |  | Mordisquea el cuello de Ana. |
| Soplar · aliento | EXCELLENT | 2 3 |  | Sopla sobre el cuello de Ana, muy cerca de la piel. |
| Rozar · yema de los dedos | EXCELLENT | 1 2 3 |  | Recorre el cuello de Ana con la yema de los dedos. |
| Rozar · dedos | EXCELLENT | 1 2 3 |  | Recorre el cuello de Ana con la punta de los dedos. |
| Rozar · labios | EXCELLENT | 2 3 |  | Roza el cuello de Ana con los labios, apenas tocando. |
| Rozar · punta de la nariz | EXCELLENT | 2 3 |  | Recorre el cuello de Ana con la punta de la nariz, apenas tocando. |
| Acariciar · mano | EXCELLENT | 1 2 3 |  | Acaricia el cuello de Ana, sin buscar nada más. |
| Acercarse sin tocar · labios | EXCELLENT | 2 3 |  | Acerca los labios a su cuello sin llegar a tocar, y que Ana note solo la cercanía. |
| Acercarse sin tocar · aliento | EXCELLENT | 2 3 |  | Respira muy cerca del cuello de Ana, sin tocar. |
| Besar · labios | EXCELLENT | 1 2 3 |  | Recorre el cuello de Ana a besos. |
| Lamer · punta de la lengua | EXCELLENT | 2 3 |  | Roza el cuello de Ana con la punta de la lengua. |
| Chupar · boca | EXCELLENT | 2 3 |  | Chupa el cuello de Ana. |
| Rozar · uñas | GOOD | 2 3 |  | Pasa las uñas por el cuello de Ana. |
| Apoyar la mano · mano | GOOD | 1 2 |  | Apoya la mano sobre el cuello de Ana, sin moverla. |
| Apoyar la mano · dos manos | GOOD | 1 2 |  | Frota tus manos hasta calentarlas y apóyalas sobre el cuello de Ana. |
| Cosquillear · yema de los dedos | GOOD | 1 2 |  | Pasa la yema de los dedos por su cuello hasta que a Ana se le escape la risa. |
| Masajear · dos manos | VALID | 1 2 3 |  | Masajea el cuello de Ana, buscando dónde está más cargado. |
| Apretar · mano | REJECTED | — | presión firme donde no cabe | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la nuca (`nape`) · sensibilidad 3 · presión medium · niveles 1 2 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Soplar · aliento | EXCELLENT | 2 |  | Sopla sobre la nuca de Ana, muy cerca de la piel. |
| Rozar · yema de los dedos | EXCELLENT | 1 2 |  | Roza la nuca de Ana con la yema de los dedos. |
| Sujetar · mano | EXCELLENT | 2 |  | Sujeta el cabello de Ana desde la nuca y acerca su boca a la tuya. |
| Acercarse sin tocar · labios | EXCELLENT | 2 |  | Acércate a la nuca de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | EXCELLENT | 2 |  | Deja que Ana sienta tu respiración sobre su nuca, sin que la piel se toque. |
| Besar · labios | EXCELLENT | 1 2 |  | Da pequeños besos en la nuca de Ana. |
| Masajear · dos manos | EXCELLENT | 1 2 |  | Masajea la nuca de Ana. |
| Masajear · pulgares | EXCELLENT | 1 2 |  | Masajea la nuca de Ana con los pulgares, en pequeños círculos. |
| Apoyar la mano · mano | EXCELLENT | 1 2 |  | Pon la mano sobre la nuca de Ana y déjala ahí, con todo su peso. |
| Mordisquear · dientes | GOOD | 2 |  | Mordisquea la nuca de Ana, apenas apretando. |
| Rozar · punta de la nariz | GOOD | 2 |  | Roza la nuca de Ana con la punta de la nariz. |
| Acariciar · mano | GOOD | 1 2 |  | Pasa la mano por la nuca de Ana. |
| Cosquillear · yema de los dedos | GOOD | 1 2 |  | Pasa la yema de los dedos por su nuca hasta que a Ana se le escape la risa. |
| Rozar · uñas | VALID | 2 |  | Pasa las uñas por la nuca de Ana. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los hombros (`shoulders`) · sensibilidad 1.5 · presión high · niveles 1 2 · estilos preferidos FIRM SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mordisquear · dientes | EXCELLENT | 2 |  | Mordisquea los hombros de Ana. |
| Besar · labios | EXCELLENT | 1 2 |  | Besa los hombros de Ana. |
| Masajear · dos manos | EXCELLENT | 1 2 |  | Masajea los hombros de Ana, en pequeños círculos. |
| Masajear · pulgares | EXCELLENT | 1 2 |  | Presiona los hombros de Ana con los pulgares. |
| La ropa · dos manos | EXCELLENT | 2 |  | Aparta la ropa de los hombros de Ana y descubre la piel. |
| Rozar · yema de los dedos | GOOD | 1 2 |  | Roza los hombros de Ana con la yema de los dedos. |
| Rozar · solo dedo | GOOD | 1 2 |  | Dibuja formas con un dedo sobre los hombros de Ana. |
| Rozar · labios | GOOD | 2 |  | Roza los hombros de Ana con los labios. |
| Acariciar · mano | GOOD | 1 2 |  | Acaricia los hombros de Ana, sin buscar nada más. |
| Apoyar la mano · mano | GOOD | 1 2 |  | Apoya la mano sobre los hombros de Ana, sin moverla. |
| Rozar · punta de la nariz | VALID | 2 |  | Roza los hombros de Ana con la punta de la nariz. |
| Chupar · boca | REJECTED | — | succionar los hombros: no es un gesto que merezca salir | — |
| Cosquillear · dedos | REJECTED | — | tamborilear sobre los hombros: no es juego ni caricia | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las clavículas (`collarbones`) · sensibilidad 3 · presión low · niveles 1 2 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | EXCELLENT | 1 2 |  | Roza las clavículas de Ana con la yema de los dedos. |
| Rozar · solo dedo | EXCELLENT | 1 2 |  | Recorre el contorno de las clavículas de Ana con un solo dedo. |
| Rozar · labios | EXCELLENT | 2 |  | Roza las clavículas de Ana con los labios, apenas tocando. |
| Mordisquear · dientes | GOOD | 2 |  | Mordisquea las clavículas de Ana, apenas apretando. |
| Rozar · dedos | GOOD | 1 2 |  | Roza las clavículas de Ana con la punta de los dedos. |
| Rozar · punta de la nariz | GOOD | 2 |  | Recorre las clavículas de Ana con la punta de la nariz, apenas tocando. |
| Acariciar · mano | GOOD | 1 2 |  | Acaricia las clavículas de Ana. |
| Acercarse sin tocar · labios | GOOD | 2 |  | Acércate a las clavículas de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | GOOD | 2 |  | Respira muy cerca de las clavículas de Ana, sin tocar. |
| Besar · labios | GOOD | 1 2 |  | Besa las clavículas de Ana. |
| Lamer · punta de la lengua | GOOD | 2 |  | Recorre las clavículas de Ana con la punta de la lengua. |
| Soplar · aliento | REJECTED | — | soplar sobre un hueso: técnicamente posible, editorialmente pobre (caso real: «Sopla sobre las clavículas…») | — |
| Chupar · boca | REJECTED | — | succionar piel fina sobre hueso: no es un gesto que merezca salir | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la espalda (`back`) · sensibilidad 2.5 · presión high · niveles 1 2 · estilos preferidos SLOW FIRM

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | EXCELLENT | 1 2 |  | Roza la espalda de Ana con la yema de los dedos. |
| Rozar · dedos | EXCELLENT | 1 2 |  | Recorre la espalda de Ana con la punta de los dedos. |
| Rozar · solo dedo | EXCELLENT | 1 2 |  | Dibuja formas con un dedo sobre la espalda de Ana. |
| Rozar · uñas | EXCELLENT | 2 |  | Pasa las uñas por la espalda de Ana. |
| Acariciar · mano | EXCELLENT | 1 2 |  | Acaricia la espalda de Ana, sin buscar nada más. |
| Besar · labios | EXCELLENT | 1 2 |  | Besa la espalda de Ana. |
| Masajear · dos manos | EXCELLENT | 1 2 |  | Masajea la espalda de Ana. |
| Apoyar la mano · dos manos | EXCELLENT | 1 2 |  | Frota tus manos hasta calentarlas y apóyalas sobre la espalda de Ana. |
| Cosquillear · dedos | EXCELLENT | 1 2 |  | Tamborilea con los dedos sobre la espalda de Ana, como si tocaras el piano. |
| La ropa · mano | EXCELLENT | 2 |  | Desliza la mano por debajo de la ropa hasta llegar a la espalda de Ana. |
| Apoyar la mano · mano | GOOD | 1 2 |  | Apoya la mano sobre la espalda de Ana, sin moverla. |
| Rozar · labios | VALID | 2 |  | Roza la espalda de Ana con los labios. |
| Rozar · punta de la nariz | VALID | 2 |  | Roza la espalda de Ana con la punta de la nariz. |
| La ropa · dos manos | VALID | 2 |  | Aparta la ropa de la espalda de Ana y descubre la piel. |
| Soplar · aliento | REJECTED | — | soplar sobre la espalda no construye nada: la anticipación va en nuca, cuello, orejas y bajo vientre | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la zona lumbar (`lowerBack`) · sensibilidad 4.5 · presión high · niveles 2 3 · estilos preferidos FIRM SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | EXCELLENT | 2 3 |  | Roza la zona lumbar de Ana con la yema de los dedos. |
| Masajear · dos manos | EXCELLENT | 2 3 |  | Masajea la zona lumbar de Ana, buscando dónde está más cargado. |
| Apoyar la mano · dos manos | EXCELLENT | 2 |  | Frota tus manos hasta calentarlas y apóyalas sobre la zona lumbar de Ana. |
| Rozar · dedos | GOOD | 2 3 |  | Roza la zona lumbar de Ana con la punta de los dedos. |
| Rozar · solo dedo | GOOD | 2 |  | Dibuja formas con un dedo sobre la zona lumbar de Ana. |
| Rozar · uñas | GOOD | 2 3 |  | Pasa las uñas por la zona lumbar de Ana. |
| Rozar · labios | GOOD | 2 3 |  | Roza la zona lumbar de Ana con los labios, apenas tocando. |
| Acariciar · mano | GOOD | 2 3 |  | Acaricia la zona lumbar de Ana. |
| Besar · labios | GOOD | 2 3 |  | Besa la zona lumbar de Ana. |
| Masajear · pulgares | GOOD | 2 |  | Presiona la zona lumbar de Ana con los pulgares. |
| Apoyar la mano · mano | GOOD | 2 |  | Deja la mano quieta sobre su zona lumbar y nota cómo respira Ana. |
| La ropa · mano | GOOD | 2 |  | Desliza la mano por debajo de la ropa hasta llegar a la zona lumbar de Ana. |
| Lamer · punta de la lengua | VALID | 2 3 |  | Recorre la zona lumbar de Ana con la punta de la lengua. |
| La ropa · dos manos | VALID | 2 |  | Aparta la ropa de la zona lumbar de Ana y descubre la piel. |
| Cosquillear · dedos | REJECTED | — | tamborilear en la zona lumbar: gesto hueco | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el pecho (`chest`) · sensibilidad 5 · presión medium · niveles 2 3

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Apoyar la mano · mano | EXCELLENT | 2 |  | Deja la mano quieta sobre su pecho y nota cómo respira Ana. |
| La ropa · dos manos | EXCELLENT | 2 |  | Aparta la ropa del pecho de Ana y descubre la piel. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza el pecho de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Recorre el pecho de Ana con la punta de los dedos. |
| Rozar · labios | GOOD | 2 3 |  | Roza el pecho de Ana con los labios. |
| Acariciar · mano | GOOD | 2 3 |  | Acaricia el pecho de Ana, de arriba abajo. |
| Besar · labios | GOOD | 2 3 |  | Da pequeños besos en el pecho de Ana. |
| Lamer · punta de la lengua | GOOD | 2 3 |  | Recorre el pecho de Ana con la punta de la lengua. |
| Apoyar la mano · dos manos | GOOD | 2 |  | Frota tus manos hasta calentarlas y apóyalas sobre el pecho de Ana. |
| Rozar · solo dedo | VALID | 2 |  | Dibuja formas con un dedo sobre el pecho de Ana. |
| Rozar · uñas | VALID | 2 3 |  | Pasa las uñas por el pecho de Ana. |
| Masajear · dos manos | VALID | 2 3 |  | Masajea el pecho de Ana, en pequeños círculos. |
| Chupar · boca | VALID | 2 3 |  | Chupa el pecho de Ana. |
| Cosquillear · dedos | VALID | 2 |  | Tamborilea con los dedos sobre el pecho de Ana, como si tocaras el piano. |
| La ropa · mano | VALID | 2 |  | Desliza la mano por debajo de la ropa hasta llegar al pecho de Ana. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el abdomen (`abdomen`) · sensibilidad 4.5 · presión low · niveles 2 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · dedos | EXCELLENT | 2 3 |  | Recorre el abdomen de Ana con la punta de los dedos. |
| Acariciar · mano | EXCELLENT | 2 3 |  | Pasa la mano por el abdomen de Ana. |
| Apoyar la mano · mano | EXCELLENT | 2 |  | Pon la mano sobre el abdomen de Ana y déjala ahí, con todo su peso. |
| Cosquillear · dedos | EXCELLENT | 2 |  | Tamborilea con los dedos sobre el abdomen de Ana, como si tocaras el piano. |
| La ropa · mano | EXCELLENT | 2 |  | Desliza la mano por debajo de la ropa hasta llegar al abdomen de Ana. |
| Mano que avanza · mano | GOOD | 2 3 |  | Apoya la mano sobre el abdomen de Ana y súbela unos centímetros, muy despacio. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza el abdomen de Ana con la yema de los dedos. |
| Rozar · solo dedo | GOOD | 2 |  | Escribe tu nombre con un dedo sobre su abdomen y que Ana lo adivine. |
| Rozar · labios | GOOD | 2 3 |  | Recorre el abdomen de Ana con los labios. |
| Besar · labios | GOOD | 2 3 |  | Besa el abdomen de Ana. |
| Lamer · punta de la lengua | GOOD | 2 3 |  | Recorre el abdomen de Ana con la punta de la lengua. |
| Apoyar la mano · dos manos | GOOD | 2 |  | Frota tus manos hasta calentarlas y apóyalas sobre el abdomen de Ana. |
| Cosquillear · yema de los dedos | GOOD | 2 |  | Haz cosquillas en el abdomen de Ana con la yema de los dedos. |
| La ropa · dos manos | GOOD | 2 |  | Desabrocha un botón o baja un poco la ropa del abdomen de Ana, sin llegar a quitarla. |
| Rozar · uñas | VALID | 2 3 |  | Pasa las uñas por el abdomen de Ana. |
| Soplar · aliento | REJECTED | — | soplar sobre el abdomen: gesto plano; la anticipación va en el bajo vientre | — |
| Rozar · punta de la nariz | REJECTED | — | la nariz sobre el abdomen: forzado | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el bajo vientre (`lowerAbdomen`) · sensibilidad 6.5 · presión low · niveles 2 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mano que avanza · mano | EXCELLENT | 2 3 |  | Apoya la mano sobre el bajo vientre de Ana y súbela unos centímetros, muy despacio. |
| Soplar · aliento | EXCELLENT | 2 3 |  | Sopla sobre el bajo vientre de Ana, muy cerca de la piel. |
| Rozar · labios | EXCELLENT | 2 3 |  | Roza el bajo vientre de Ana con los labios, apenas tocando. |
| Acariciar · mano | EXCELLENT | 2 3 |  | Acaricia el bajo vientre de Ana. |
| Besar · labios | EXCELLENT | 2 3 |  | Besa el bajo vientre de Ana. |
| Lamer · punta de la lengua | EXCELLENT | 2 3 |  | Recorre el bajo vientre de Ana con la punta de la lengua. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza el bajo vientre de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Roza el bajo vientre de Ana con la punta de los dedos. |
| Acercarse sin tocar · labios | GOOD | 2 3 |  | Acércate al bajo vientre de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | GOOD | 2 3 |  | Respira muy cerca del bajo vientre de Ana, sin tocar. |
| Lamer · lengua | GOOD | 2 3 |  | Lame el bajo vientre de Ana. |
| Chupar · boca | GOOD | 2 3 |  | Besa el bajo vientre de Ana succionando un poco la piel. |
| La ropa · dos manos | GOOD | 2 |  | Aparta la ropa del bajo vientre de Ana y descubre la piel. |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la cintura (`waist`) · sensibilidad 3.5 · presión medium · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | GOOD | 1 2 |  | Roza la cintura de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 1 2 |  | Roza la cintura de Ana con la punta de los dedos. |
| Acariciar · mano | GOOD | 1 2 |  | Acaricia la cintura de Ana. |
| La ropa · mano | GOOD | 2 |  | Desliza la mano por debajo de la ropa hasta llegar a la cintura de Ana. |
| La ropa · dos manos | GOOD | 2 |  | Aparta la ropa de la cintura de Ana y descubre la piel. |
| Rozar · solo dedo | VALID | 1 2 |  | Dibuja formas con un dedo sobre la cintura de Ana. |
| Rozar · labios | VALID | 2 |  | Roza la cintura de Ana con los labios. |
| Besar · labios | VALID | 1 2 |  | Besa la cintura de Ana. |
| Apoyar la mano · mano | VALID | 1 2 |  | Apoya la mano sobre la cintura de Ana, sin moverla. |
| Apretar · mano | VALID | 2 |  | Aprieta la cintura de Ana con la mano. |
| Mordisquear · dientes | REJECTED | — | mordisquear la cintura: hueso y piel tensa | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los costados (`flanks`) · sensibilidad 4.5 · presión low · niveles 2 3 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | EXCELLENT | 2 3 |  | Con la yema de los dedos, recorre los costados de Ana de un lado a otro. |
| Cosquillear · yema de los dedos | EXCELLENT | 2 |  | Haz cosquillas en los costados de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Recorre los costados de Ana con la punta de los dedos. |
| Rozar · uñas | GOOD | 2 3 |  | Recorre los costados de Ana con las uñas. |
| Rozar · labios | GOOD | 2 3 |  | Roza los costados de Ana con los labios, apenas tocando. |
| Acariciar · mano | GOOD | 2 3 |  | Pasa la mano por los costados de Ana. |
| Besar · labios | VALID | 2 3 |  | Recorre los costados de Ana a besos. |
| Lamer · punta de la lengua | VALID | 2 3 |  | Recorre los costados de Ana con la punta de la lengua. |
| Soplar · aliento | REJECTED | — | soplar en los costados: gesto plano | — |
| Rozar · punta de la nariz | REJECTED | — | la nariz en los costados: forzado | — |
| Masajear · dos manos | REJECTED | — | masajear los costados: zona de baja tolerancia a la presión | — |
| Apoyar la mano · mano | REJECTED | — | apoyar la mano en un costado: postura rara | — |
| Apoyar la mano · dos manos | REJECTED | — | apoyar las manos en los costados: postura rara | — |
| Apretar · mano | REJECTED | — | apretar los costados se convierte en cosquillas | — |
| Chupar · boca | REJECTED | — | succionar los costados: incómodo, sin recorrido | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las caderas (`hips`) · sensibilidad 5 · presión high · niveles 2 3 · estilos preferidos FIRM

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Sujetar · dos manos | EXCELLENT | 2 3 |  | Sujeta las caderas de Ana con las dos manos y acércalas a ti. |
| Apretar · mano | EXCELLENT | 2 3 |  | Agarra las caderas de Ana y apriétalas, soltando poco a poco. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza las caderas de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Roza las caderas de Ana con la punta de los dedos. |
| Acariciar · mano | GOOD | 2 3 |  | Pasa la mano por las caderas de Ana. |
| La ropa · dos manos | GOOD | 2 |  | Desabrocha un botón o baja un poco la ropa de las caderas de Ana, sin llegar a quitarla. |
| Rozar · solo dedo | VALID | 2 3 |  | Recorre el contorno de las caderas de Ana con un solo dedo. |
| Rozar · labios | VALID | 2 3 |  | Roza las caderas de Ana con los labios. |
| Besar · labios | VALID | 2 3 |  | Da pequeños besos en las caderas de Ana. |
| Masajear · dos manos | VALID | 2 3 |  | Masajea las caderas de Ana. |
| La ropa · mano | VALID | 2 |  | Desliza la mano por debajo de la ropa hasta llegar a las caderas de Ana. |
| Mordisquear · dientes | REJECTED | — | mordisquear las caderas: hueso | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los senos (`breasts`) · sensibilidad 6.5 · presión medium · niveles 2 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · labios | EXCELLENT | 2 3 |  | Roza los senos de Ana con los labios, apenas tocando. |
| Acariciar · mano | EXCELLENT | 2 3 |  | Pasa la mano por los senos de Ana. |
| Besar · labios | EXCELLENT | 2 3 |  | Da pequeños besos en los senos de Ana. |
| La ropa · dos manos | EXCELLENT | 2 |  | Desabrocha un botón o baja un poco la ropa de los senos de Ana, sin llegar a quitarla. |
| Mordisquear · dientes | GOOD | 2 3 |  | Mordisquea los senos de Ana. |
| Soplar · aliento | GOOD | 2 3 |  | Sopla sobre los senos de Ana, muy cerca de la piel. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza los senos de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Roza los senos de Ana con la punta de los dedos. |
| Rozar · solo dedo | GOOD | 2 3 |  | Dibuja formas con un dedo sobre los senos de Ana. |
| Rozar · punta de la nariz | GOOD | 2 3 |  | Recorre los senos de Ana con la punta de la nariz, apenas tocando. |
| Acercarse sin tocar · labios | GOOD | 2 3 |  | Acércate a los senos de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | GOOD | 2 3 |  | Respira muy cerca de los senos de Ana, sin tocar. |
| Lamer · lengua | GOOD | 2 3 |  | Lame los senos de Ana. |
| Lamer · punta de la lengua | GOOD | 2 3 |  | Recorre los senos de Ana con la punta de la lengua. |
| Apretar · mano | GOOD | 2 3 |  | Aprieta los senos de Ana con la mano. |
| Chupar · boca | GOOD | 2 3 |  | Besa los senos de Ana succionando un poco la piel. |
| Nalgada · mano | REJECTED | — | la nalgada solo en glúteos | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los pezones (`nipples`) · sensibilidad 8 · presión low · niveles 2 3 · estilos preferidos SOFT INTERMITTENT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | EXCELLENT | 2 3 |  | Roza los pezones de Ana con la yema de los dedos. |
| Lamer · lengua | EXCELLENT | 2 3 |  | Lame los pezones de Ana. |
| Lamer · punta de la lengua | EXCELLENT | 2 3 |  | Roza los pezones de Ana con la punta de la lengua. |
| Chupar · boca | EXCELLENT | 2 3 |  | Chupa los pezones de Ana. |
| Rozar · labios | GOOD | 2 3 |  | Roza los pezones de Ana con los labios. |
| Acariciar · mano | GOOD | 2 3 |  | Pasa la mano por los pezones de Ana. |
| Acercarse sin tocar · labios | GOOD | 2 3 |  | Acércate a los pezones de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | GOOD | 2 3 |  | Respira muy cerca de los pezones de Ana, sin tocar. |
| Besar · labios | GOOD | 2 3 |  | Da pequeños besos en los pezones de Ana. |
| Estimular · dedos | GOOD | 3 |  | Estimula los pezones de Ana con los dedos. |
| Estimular · boca | GOOD | 3 |  | Estimula los pezones de Ana con la boca. |
| Mordisquear · dientes | VALID | 2 3 |  | Mordisquea los pezones de Ana. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los brazos (`upperArms`) · sensibilidad 1 · presión high · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | GOOD | 1 |  | Roza los brazos de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 1 |  | Recorre los brazos de Ana con la punta de los dedos. |
| Acariciar · mano | GOOD | 1 |  | Acaricia los brazos de Ana, sin buscar nada más. |
| Masajear · dos manos | GOOD | 1 |  | Masajea los brazos de Ana, en pequeños círculos. |
| Cosquillear · dedos | GOOD | 1 |  | Tamborilea con los dedos sobre los brazos de Ana, como si tocaras el piano. |
| Rozar · solo dedo | VALID | 1 |  | Dibuja formas con un dedo sobre los brazos de Ana. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los antebrazos (`forearms`) · sensibilidad 1.5 · presión high · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las manos (`hands`) · sensibilidad 1 · presión high · niveles 1 2 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Tomar la mano · dos manos | EXCELLENT | 1 |  | Toma las dos manos de Ana entre las tuyas y quédate así un momento. |
| Tomar la mano · dedos | EXCELLENT | 1 |  | Entrelaza tus dedos con los de Ana. |
| Tomar la mano · labios | EXCELLENT | 1 |  | Besa la palma de la mano de Ana y ciérrale los dedos sobre el beso. |
| Besar · labios | EXCELLENT | 1 |  | Da pequeños besos en las manos de Ana. |
| Masajear · dos manos | EXCELLENT | 1 |  | Masajea las manos de Ana. |
| Rozar · solo dedo | GOOD | 1 |  | Recorre el contorno de las manos de Ana con un solo dedo. |
| Acariciar · mano | GOOD | 1 |  | Pasa la mano por las manos de Ana. |
| Masajear · pulgares | GOOD | 1 |  | Presiona las manos de Ana con los pulgares. |
| Rozar · yema de los dedos | VALID | 1 |  | Roza las manos de Ana con la yema de los dedos. |
| Cosquillear · dedos | VALID | 1 |  | Tamborilea con los dedos sobre las manos de Ana, como si tocaras el piano. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las palmas de las manos (`palms`) · sensibilidad 1.5 · presión high · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · solo dedo | EXCELLENT | 1 |  | Escribe tu nombre con un dedo sobre las palmas de sus manos y que Ana lo adivine. |
| Tomar la mano · dos manos | EXCELLENT | 1 |  | Pon tus palmas contra las de Ana y empujad un poco, notando la fuerza del otro. |
| Masajear · pulgares | EXCELLENT | 1 |  | Presiona las palmas de las manos de Ana con los pulgares. |
| Acariciar · mano | VALID | 1 |  | Pasa la mano por las palmas de las manos de Ana. |
| Masajear · dos manos | VALID | 1 |  | Masajea las palmas de las manos de Ana, en pequeños círculos. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los dedos (`fingers`) · sensibilidad 1.5 · presión medium · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | VALID | 1 |  | Acaricia los dedos de Ana, sin buscar nada más. |
| Masajear · dos manos | VALID | 1 |  | Masajea los dedos de Ana. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las muñecas (`wrists`) · sensibilidad 2 · presión medium · niveles 1 2 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | GOOD | 1 2 |  | Roza las muñecas de Ana con la yema de los dedos. |
| Rozar · solo dedo | GOOD | 1 2 |  | Recorre el contorno de las muñecas de Ana con un solo dedo. |
| Acariciar · mano | GOOD | 1 2 |  | Pasa la mano por las muñecas de Ana. |
| Sujetar · mano | GOOD | 2 |  | Sujeta las muñecas de Ana con una mano y mantenlas quietas un momento. |
| Rozar · dedos | VALID | 1 2 |  | Roza las muñecas de Ana con la punta de los dedos. |
| Rozar · labios | VALID | 2 |  | Roza las muñecas de Ana con los labios. |
| Besar · labios | VALID | 1 2 |  | Besa las muñecas de Ana. |
| Masajear · dos manos | REJECTED | — | masajear las muñecas con las dos manos: forzado | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las axilas (`armpits`) · sensibilidad 4 · presión low · niveles 2 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Cosquillear · yema de los dedos | VALID | 2 |  | Haz cosquillas en las axilas de Ana con la yema de los dedos. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los muslos (`outerThighs`) · sensibilidad 5 · presión high · niveles 2 3

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · uñas | EXCELLENT | 2 3 |  | Recorre los muslos de Ana con las uñas. |
| Mano que avanza · mano | GOOD | 2 3 |  | Apoya la mano sobre sus muslos y súbela un poco cada vez que Ana respire. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Recorre los muslos de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Recorre los muslos de Ana con la punta de los dedos. |
| Rozar · solo dedo | GOOD | 2 3 |  | Recorre el contorno de los muslos de Ana con un solo dedo. |
| Acariciar · mano | GOOD | 2 3 |  | Acaricia los muslos de Ana. |
| Besar · labios | GOOD | 2 3 |  | Besa los muslos de Ana. |
| Masajear · dos manos | GOOD | 2 3 |  | Masajea los muslos de Ana, en pequeños círculos. |
| Apoyar la mano · mano | GOOD | 2 |  | Apoya la mano sobre los muslos de Ana, sin moverla. |
| Apretar · mano | GOOD | 2 3 |  | Agarra los muslos de Ana y apriétalos, soltando poco a poco. |
| Cosquillear · dedos | GOOD | 2 |  | Tamborilea con los dedos sobre los muslos de Ana, como si tocaras el piano. |
| La ropa · mano | GOOD | 2 |  | Desliza la mano por debajo de la ropa hasta llegar a los muslos de Ana. |
| La ropa · dos manos | GOOD | 2 |  | Aparta la ropa de los muslos de Ana y descubre la piel. |
| Rozar · labios | VALID | 2 3 |  | Roza los muslos de Ana con los labios, apenas tocando. |
| Masajear · pulgares | VALID | 2 |  | Masajea los muslos de Ana con los pulgares. |
| Apoyar la mano · dos manos | VALID | 2 |  | Frota tus manos hasta calentarlas y apóyalas sobre los muslos de Ana. |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la parte interna de los muslos (`innerThighs`) · sensibilidad 6.5 · presión low · niveles 2 3 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mano que avanza · mano | EXCELLENT | 2 3 |  | Desliza la mano entre los muslos de Ana y déjala quieta ahí. |
| Rozar · yema de los dedos | EXCELLENT | 2 3 |  | Recorre la parte interna de los muslos de Ana con la yema de los dedos. |
| Rozar · dedos | EXCELLENT | 2 3 |  | Recorre la parte interna de los muslos de Ana con la punta de los dedos. |
| Rozar · uñas | EXCELLENT | 2 3 |  | Pasa las uñas por la parte interna de los muslos de Ana. |
| Rozar · labios | EXCELLENT | 2 3 |  | Recorre la parte interna de los muslos de Ana con los labios. |
| Acariciar · mano | EXCELLENT | 2 3 |  | Acaricia la parte interna de los muslos de Ana. |
| Besar · labios | EXCELLENT | 2 3 |  | Besa la parte interna de los muslos de Ana. |
| Lamer · lengua | EXCELLENT | 2 3 |  | Lame la parte interna de los muslos de Ana. |
| Mordisquear · dientes | GOOD | 2 3 |  | Mordisquea la parte interna de los muslos de Ana. |
| Soplar · aliento | GOOD | 2 3 |  | Sopla sobre la parte interna de los muslos de Ana, muy cerca de la piel. |
| Rozar · punta de la nariz | GOOD | 2 3 |  | Roza la parte interna de los muslos de Ana con la punta de la nariz. |
| Acercarse sin tocar · labios | GOOD | 2 3 |  | Acerca los labios a la parte interna de sus muslos sin llegar a tocar, y que Ana note solo la cercanía. |
| Acercarse sin tocar · aliento | GOOD | 2 3 |  | Deja que Ana sienta tu respiración sobre la parte interna de sus muslos, sin que la piel se toque. |
| Lamer · punta de la lengua | GOOD | 2 3 |  | Recorre la parte interna de los muslos de Ana con la punta de la lengua. |
| Chupar · boca | GOOD | 2 3 |  | Chupa la parte interna de los muslos de Ana. |
| Cosquillear · yema de los dedos | GOOD | 2 |  | Pasa la yema de los dedos por la parte interna de sus muslos hasta que a Ana se le escape la risa. |
| Apretar · mano | VALID | 2 3 |  | Agarra la parte interna de los muslos de Ana y apriétala, soltando poco a poco. |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las piernas (`legs`) · sensibilidad 2 · presión high · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Masajear · dos manos | GOOD | 1 |  | Masajea las piernas de Ana. |
| Rozar · yema de los dedos | VALID | 1 |  | Roza las piernas de Ana con la yema de los dedos. |
| Rozar · dedos | VALID | 1 |  | Recorre las piernas de Ana con la punta de los dedos. |
| Acariciar · mano | VALID | 1 |  | Acaricia las piernas de Ana, sin buscar nada más. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la parte de atrás de las rodillas (`poplitealArea`) · sensibilidad 4 · presión low · niveles 2 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | VALID | 2 |  | Roza la parte de atrás de las rodillas de Ana con la yema de los dedos. |
| Rozar · dedos | VALID | 2 |  | Roza la parte de atrás de las rodillas de Ana con la punta de los dedos. |
| Acariciar · mano | VALID | 2 |  | Acaricia la parte de atrás de las rodillas de Ana. |
| Cosquillear · yema de los dedos | VALID | 2 |  | Pasa la yema de los dedos por la parte de atrás de sus rodillas hasta que a Ana se le escape la risa. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las pantorrillas (`calves`) · sensibilidad 1.5 · presión high · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Masajear · dos manos | GOOD | 1 |  | Masajea las pantorrillas de Ana, en pequeños círculos. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los tobillos (`ankles`) · sensibilidad 2 · presión medium · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Masajear · dos manos | VALID | 1 2 |  | Masajea los tobillos de Ana, en pequeños círculos. |
| Masajear · pulgares | VALID | 1 2 |  | Presiona los tobillos de Ana con los pulgares. |
| Acariciar · mano | REJECTED | — | acariciar los tobillos: relleno | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los pies (`feet`) · sensibilidad 2 · presión high · niveles 1 2 · estilos preferidos FIRM

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Masajear · dos manos | EXCELLENT | 1 |  | Sostén los pies de Ana entre tus manos y masajea cada dedo. |
| Masajear · pulgares | EXCELLENT | 1 |  | Presiona los pies de Ana con los pulgares. |
| Acariciar · mano | GOOD | 1 |  | Acaricia los pies de Ana. |
| Cosquillear · yema de los dedos | GOOD | 1 2 |  | Haz cosquillas en los pies de Ana con la yema de los dedos. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los dedos de los pies (`toes`) · sensibilidad 2 · presión medium · niveles 1 2

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los glúteos (`buttocks`) · sensibilidad 6.5 · presión high · niveles 2 3 · estilos preferidos FIRM

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | EXCELLENT | 2 3 |  | Acaricia los glúteos de Ana. |
| Nalgada · mano | EXCELLENT | 2 3 |  | Da una nalgada en los glúteos de Ana. |
| Apretar · mano | EXCELLENT | 2 3 |  | Agarra los glúteos de Ana y apriétalos, soltando poco a poco. |
| Rozar · uñas | GOOD | 2 3 |  | Pasa las uñas por los glúteos de Ana. |
| Masajear · dos manos | GOOD | 2 3 |  | Masajea los glúteos de Ana. |
| Mordisquear · dientes | VALID | 2 3 |  | Mordisquea los glúteos de Ana, apenas apretando. |
| Rozar · labios | VALID | 2 3 |  | Roza los glúteos de Ana con los labios, apenas tocando. |
| Besar · labios | VALID | 2 3 |  | Besa los glúteos de Ana. |
| Lamer · lengua | VALID | 2 3 |  | Lame los glúteos de Ana. |
| La ropa · dos manos | VALID | 2 |  | Aparta la ropa de los glúteos de Ana y descubre la piel. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### las ingles (`hipCrease`) · sensibilidad 7 · presión low · niveles 2 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza las ingles de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Roza las ingles de Ana con la punta de los dedos. |
| Rozar · labios | GOOD | 2 3 |  | Roza las ingles de Ana con los labios. |
| Mordisquear · dientes | VALID | 2 3 |  | Mordisquea las ingles de Ana. |
| Acariciar · mano | VALID | 2 3 |  | Acaricia las ingles de Ana. |
| Acercarse sin tocar · labios | VALID | 2 3 |  | Acércate a las ingles de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | VALID | 2 3 |  | Respira muy cerca de las ingles de Ana, sin tocar. |
| Besar · labios | VALID | 2 3 |  | Besa las ingles de Ana. |
| Lamer · lengua | VALID | 2 3 |  | Lame las ingles de Ana. |
| Lamer · punta de la lengua | VALID | 2 3 |  | Recorre las ingles de Ana con la punta de la lengua. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la entrepierna (`groin`) · sensibilidad 7.5 · presión medium · niveles 2 3 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Frotar · palma de la mano | EXCELLENT | 2 3 |  | Apoya la palma sobre la entrepierna de Ana, por encima de la ropa, y frótala. |
| Rozar · yema de los dedos | GOOD | 2 3 |  | Roza la entrepierna de Ana con la yema de los dedos. |
| Rozar · dedos | GOOD | 2 3 |  | Roza la entrepierna de Ana con la punta de los dedos. |
| Rozar · labios | GOOD | 2 3 |  | Roza la entrepierna de Ana con los labios. |
| Acariciar · mano | GOOD | 2 3 |  | Pasa la mano por la entrepierna de Ana. |
| Lamer · lengua | GOOD | 2 3 |  | Lame la entrepierna de Ana. |
| Acercarse sin tocar · labios | VALID | 2 3 |  | Acércate a la entrepierna de Ana hasta casi rozar, y quédate ahí un momento. |
| Acercarse sin tocar · aliento | VALID | 2 3 |  | Deja que Ana sienta tu respiración sobre su entrepierna, sin que la piel se toque. |
| Besar · labios | VALID | 2 3 |  | Besa la entrepierna de Ana. |
| Estimular · dedos | VALID | 3 |  | Estimula la entrepierna de Ana con los dedos. |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · dientes | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · punta de la nariz | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la vulva (`vulva`) · anatomía vulva · sensibilidad 9 · presión low · niveles 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | EXCELLENT | 3 |  | Acaricia la vulva de Ana. |
| Acercarse sin tocar · aliento | EXCELLENT | 3 |  | Deja que Ana sienta tu respiración sobre su vulva, sin que la piel se toque. |
| Besar · labios | EXCELLENT | 3 |  | Da pequeños besos en la vulva de Ana. |
| Lamer · lengua | EXCELLENT | 3 |  | Lame la vulva de Ana. |
| Estimular · dedos | EXCELLENT | 3 |  | Estimula la vulva de Ana con los dedos. |
| Rozar · yema de los dedos | GOOD | 3 |  | Roza la vulva de Ana con la yema de los dedos. |
| Estimular · mano | GOOD | 3 |  | Masturba a Ana, centrándote en la vulva. |
| Estimular · boca | GOOD | 3 |  | Estimula la vulva de Ana con la boca. |
| Acercarse sin tocar · labios | VALID | 3 |  | Acércate a la vulva de Ana hasta casi rozar, y quédate ahí un momento. |
| Chupar · boca | VALID | 3 |  | Chupa la vulva de Ana. |
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Nalgada · mano | REJECTED | — | la nalgada solo en glúteos | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el clítoris (`clitoris`) · anatomía vulva · sensibilidad 9.5 · presión low · niveles 3 · estilos preferidos SLOW SOFT INTERMITTENT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Lamer · lengua | EXCELLENT | 3 |  | Lame el clítoris de Ana. |
| Estimular · dedos | EXCELLENT | 3 |  | Estimula el clítoris de Ana con los dedos. |
| Estimular · mano | EXCELLENT | 3 |  | Masturba a Ana, centrándote en el clítoris. |
| Estimular · boca | EXCELLENT | 3 |  | Estimula el clítoris de Ana con la boca. |
| Chupar · boca | EXCELLENT | 3 |  | Métete el clítoris de Ana en la boca y chupa. |
| Rozar · yema de los dedos | GOOD | 3 |  | Roza el clítoris de Ana con la yema de los dedos. |
| Acariciar · mano | GOOD | 3 |  | Acaricia el clítoris de Ana. |
| Besar · labios | VALID | 3 |  | Besa el clítoris de Ana. |
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Apretar · mano | REJECTED | — | presión firme donde no cabe | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### la vagina (`vagina`) · anatomía vulva · sensibilidad 9.5 · presión low · niveles 3 · estilos preferidos SLOW

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Introducir · solo dedo | EXCELLENT | 3 |  | Introduce un dedo en la vagina de Ana. |
| Estimular · dedos | GOOD | 3 |  | Estimula la vagina de Ana con los dedos. |
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el pene (`penis`) · anatomía pene · sensibilidad 9 · presión medium · niveles 3 · estilos preferidos SLOW FIRM

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Acariciar · mano | EXCELLENT | 3 |  | Acaricia el pene de Ana. |
| Acercarse sin tocar · aliento | EXCELLENT | 3 |  | Deja que Ana sienta tu respiración sobre su pene, sin que la piel se toque. |
| Lamer · lengua | EXCELLENT | 3 |  | Lame el pene de Ana. |
| Estimular · dedos | EXCELLENT | 3 |  | Estimula el pene de Ana con los dedos. |
| Estimular · mano | EXCELLENT | 3 |  | Masturba a Ana, centrándote en el pene. |
| Rozar · yema de los dedos | GOOD | 3 |  | Roza el pene de Ana con la yema de los dedos. |
| Estimular · boca | GOOD | 3 |  | Estimula el pene de Ana con la boca. |
| Acercarse sin tocar · labios | VALID | 3 |  | Acércate al pene de Ana hasta casi rozar, y quédate ahí un momento. |
| Besar · labios | VALID | 3 |  | Besa el pene de Ana. |
| Chupar · boca | VALID | 3 |  | Chupa el pene de Ana. |
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Nalgada · mano | REJECTED | — | la nalgada solo en glúteos | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el glande (`glans`) · anatomía pene · sensibilidad 9.5 · presión low · niveles 3 · estilos preferidos SLOW SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Estimular · boca | EXCELLENT | 3 |  | Estimula el glande de Ana con la boca. |
| Chupar · boca | EXCELLENT | 3 |  | Chupa el glande de Ana. |
| Lamer · lengua | GOOD | 3 |  | Lame el glande de Ana. |
| Estimular · dedos | GOOD | 3 |  | Acaricia el glande de Ana con los dedos, sin apartarlos. |
| Estimular · mano | GOOD | 3 |  | Masturba a Ana, centrándote en el glande. |
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Apretar · mano | REJECTED | — | presión firme donde no cabe | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### los testículos (`testicles`) · anatomía pene · sensibilidad 8.5 · presión low · niveles 3 · estilos preferidos SOFT

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Rozar · yema de los dedos | VALID | 3 |  | Roza los testículos de Ana con la yema de los dedos. |
| Acariciar · mano | VALID | 3 |  | Acaricia los testículos de Ana. |
| Besar · labios | VALID | 3 |  | Besa los testículos de Ana. |
| Lamer · lengua | VALID | 3 |  | Lame los testículos de Ana. |
| Estimular · dedos | VALID | 3 |  | Estimula los testículos de Ana con los dedos. |
| Estimular · boca | VALID | 3 |  | Estimula los testículos de Ana con la boca. |
| Chupar · boca | VALID | 3 |  | Métete los testículos de Ana en la boca y chupa. |
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Nalgada · mano | REJECTED | — | la nalgada solo en glúteos | — |
| Apretar · mano | REJECTED | — | presión firme donde no cabe | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |

### el ano (`anus`) · sensibilidad 9 · presión low · niveles 3

| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |
|---|---|---|---|---|
| Mordisquear · dientes | REJECTED | — | dientes y anatomía íntima: no | — |
| Mano que avanza · mano | UNREVIEWED | — |  | — |
| Mordisquear · labios | UNREVIEWED | — |  | — |
| Soplar · aliento | UNREVIEWED | — |  | — |
| Rozar · yema de los dedos | UNREVIEWED | — |  | — |
| Rozar · dedos | UNREVIEWED | — |  | — |
| Rozar · solo dedo | UNREVIEWED | — |  | — |
| Rozar · uñas | UNREVIEWED | — |  | — |
| Rozar · labios | UNREVIEWED | — |  | — |
| Acariciar · mano | UNREVIEWED | — |  | — |
| Acariciar · dos manos | UNREVIEWED | — |  | — |
| Acariciar · yema de los dedos | UNREVIEWED | — |  | — |
| Acariciar · palma de la mano | UNREVIEWED | — |  | — |
| Sujetar · mano | UNREVIEWED | — |  | — |
| Sujetar · dos manos | UNREVIEWED | — |  | — |
| Cabello · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · dos manos | UNREVIEWED | — |  | — |
| Tomar la mano · dedos | UNREVIEWED | — |  | — |
| Tomar la mano · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · labios | UNREVIEWED | — |  | — |
| Acercarse sin tocar · aliento | UNREVIEWED | — |  | — |
| Introducir · solo dedo | UNREVIEWED | — |  | — |
| Besar · labios | UNREVIEWED | — |  | — |
| Lamer · lengua | UNREVIEWED | — |  | — |
| Lamer · punta de la lengua | UNREVIEWED | — |  | — |
| Masajear · dos manos | UNREVIEWED | — |  | — |
| Masajear · pulgares | UNREVIEWED | — |  | — |
| Masajear · yema de los dedos | UNREVIEWED | — |  | — |
| Apoyar la mano · mano | UNREVIEWED | — |  | — |
| Apoyar la mano · dos manos | UNREVIEWED | — |  | — |
| Frotar · palma de la mano | UNREVIEWED | — |  | — |
| Nalgada · mano | UNREVIEWED | — |  | — |
| Apretar · mano | UNREVIEWED | — |  | — |
| Apretar · dos manos | UNREVIEWED | — |  | — |
| Estimular · dedos | UNREVIEWED | — |  | — |
| Estimular · mano | UNREVIEWED | — |  | — |
| Estimular · boca | UNREVIEWED | — |  | — |
| Estimular · lengua | UNREVIEWED | — |  | — |
| Chupar · boca | UNREVIEWED | — |  | — |
| Cosquillear · dedos | UNREVIEWED | — |  | — |
| Cosquillear · yema de los dedos | UNREVIEWED | — |  | — |
| La ropa · mano | UNREVIEWED | — |  | — |
| La ropa · dos manos | UNREVIEWED | — |  | — |
| Susurrar · voz | UNREVIEWED | — |  | — |
