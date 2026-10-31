# Pollo a la brasa

Juego privado de dados para parejas adultas. Cuatro dados (acción, zona, forma, condición) sobre un motor procedural con restricciones:
cada tirada es coherente, varía, y la intensidad sube y baja con ritmo.

- `engine/` motor independiente de la interfaz: catálogo, compatibilidad, intensidad, historial, preferencias, lenguaje natural.
- `app/` interfaz: negro, carbón, dorado y crema; dados como piezas físicas; favoritas y ajustes. No toca el motor.
- `tests/simulate.js` simula miles de tiradas y comprueba que no salga ninguna combinación inválida: `node tests/simulate.js 3000`.

Se publica en GitHub Pages desde `main`.
