/* PLAYER ANATOMY OWNERSHIP. Cada jugador declara qué partes tiene (vulva · pene · senos); el resto del cuerpo se da por
   disponible para todos. Las dos anatomías nunca se mezclan: lo que recibe una carta tiene que existir en quien recibe,
   y con lo que se actúa tiene que existir en quien actúa. Nada de lógica HOMBRE → MUJER. */
import { BODY_PARTS_LIST, ACTOR_TOOLS_LIST, ANATOMY_IDS } from '../content/body.js';

export class PlayerAnatomy {
  constructor(playerId, declared = []) {
    this.playerId = playerId;
    this.declared = declared.filter(a => ANATOMY_IDS.includes(a));
    this.availableTargets = new Set(BODY_PARTS_LIST.filter(p => !p.anatomy || this.declared.includes(p.anatomy)).map(p => p.id));
    this.availableActorTools = new Set(ACTOR_TOOLS_LIST.filter(t => !t.anatomy || this.declared.includes(t.anatomy)).map(t => t.id));
  }
  hasTarget(part) { return this.availableTargets.has(part); }
  hasTool(tool) { return this.availableActorTools.has(tool); }
  has(anatomy) { return this.declared.includes(anatomy); }
}
export const anatomyOf = (playerId, bodyParts) => new PlayerAnatomy(playerId, (bodyParts && bodyParts[playerId]) || []);
