/* Distribución objetivo de intensidad de cada nivel: tramos [min,max,probabilidad]. El nivel lo decide la pareja;
   la intensidad dentro del nivel la decide el director. */
export const TARGET_BUCKETS = {
  1: [[1, 3, 0.8], [3, 3.5, 0.2]],
  2: [[3.5, 4.5, 0.2], [4.5, 5.5, 0.6], [5.5, 6.5, 0.2]],
  3: [[6, 6.8, 0.25], [6.8, 7.4, 0.45], [7.4, 8, 0.3]],
  4: [[6.5, 8, 0.25], [8, 9, 0.4], [9, 10, 0.35]],
};
export const levelOf = intensity => intensity <= 3.5 ? 1 : intensity <= 6.5 ? 2 : intensity <= 8.5 ? 3 : 4;
