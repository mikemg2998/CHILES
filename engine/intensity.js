/* Distribución objetivo de intensidad de cada nivel: tramos [min,max,probabilidad]. El nivel lo decide la pareja;
   la intensidad dentro del nivel la decide el director. Deseo tiene tres bandas internas (low · mid · high): se entra por
   la baja y la alta solo se alcanza con la curva de la sesión; nunca se muestra y nunca lleva sola a Intimidad. */
export const TARGET_BUCKETS = {
  1: [[1, 3, 0.8], [3, 3.5, 0.2]],
  2: [[3.5, 5, 0.5], [5, 6.8, 0.4], [6.8, 8, 0.1]],
  3: [[6.5, 8, 0.25], [8, 9, 0.4], [9, 10, 0.35]],
};
export const levelOf = intensity => intensity <= 3.5 ? 1 : intensity <= 8.5 ? 2 : 3;
