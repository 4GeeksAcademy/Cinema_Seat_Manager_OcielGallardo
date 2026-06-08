import {
  countSeats,
  displayCinema,
  findAdjacentSeats,
  initializeCinema,
  reserveSeat,
  type AdjacentSeats,
  type SeatCount,
} from "./cinema";

/**
 * Muestra una línea separadora para mejorar la lectura de la salida.
 */
function printSeparator(): void {
  console.log("------------------------------------------------------------");
}

/**
 * Imprime de forma consistente el resultado de conteo de asientos.
 */
function printSeatCount(count: SeatCount): void {
  console.log(`Asientos ocupados: ${count.occupied}`);
  console.log(`Asientos disponibles: ${count.available}`);
}

/**
 * Imprime el resultado de la búsqueda de dos asientos contiguos.
 */
function printAdjacentResult(result: AdjacentSeats | null): void {
  if (result === null) {
    console.log("Resultado de busqueda: no se encontraron asientos contiguos.");
    return;
  }

  console.log(
    `Resultado de busqueda: fila ${result.row}, columnas ${result.firstColumn} y ${result.secondColumn}.`,
  );
}

/**
 * Reserva una lista de asientos para preparar escenarios de prueba.
 */
function reserveSeatBatch(cinema: number[][], seats: Array<[number, number]>): void {
  for (let index: number = 0; index < seats.length; index += 1) {
    const [row, column]: [number, number] = seats[index];
    reserveSeat(cinema, row, column);
  }
}

/**
 * Marca todos los asientos con el mismo estado para preparar escenarios rapidamente.
 */
function fillCinema(cinema: number[][], state: 0 | 1): void {
  for (let row: number = 0; row < cinema.length; row += 1) {
    for (let column: number = 0; column < cinema[row].length; column += 1) {
      cinema[row][column] = state;
    }
  }
}

/**
 * Ejecuta el Caso 1: sala completamente vacia.
 */
function runCase1EmptyCinema(): void {
  console.log("CASO 1: Sala vacia");
  const cinema: number[][] = initializeCinema();

  displayCinema(cinema);
  printSeatCount(countSeats(cinema));
  printAdjacentResult(findAdjacentSeats(cinema));
  printSeparator();
}

/**
 * Ejecuta el Caso 2: sala parcialmente ocupada.
 */
function runCase2PartiallyOccupied(): void {
  console.log("CASO 2: Sala parcialmente ocupada");
  const cinema: number[][] = initializeCinema();

  reserveSeatBatch(cinema, [
    [0, 0],
    [0, 1],
    [2, 4],
    [4, 7],
    [6, 2],
  ]);

  console.log("Estado de la sala despues de reservar varios asientos:");
  displayCinema(cinema);

  console.log("Intento de reservar un asiento libre (3, 3):");
  reserveSeat(cinema, 3, 3);

  console.log("Intento de reservar un asiento ya ocupado (0, 0):");
  reserveSeat(cinema, 0, 0);

  printSeatCount(countSeats(cinema));
  printAdjacentResult(findAdjacentSeats(cinema));
  printSeparator();
}

/**
 * Ejecuta el Caso 3: sala casi llena con asientos libres aislados.
 */
function runCase3AlmostFull(): void {
  console.log("CASO 3: Sala casi llena");
  const cinema: number[][] = initializeCinema();

  fillCinema(cinema, 1);

  const isolatedFreeSeats: Array<[number, number]> = [
    [0, 0],
    [1, 2],
    [2, 4],
    [3, 6],
    [4, 8],
  ];

  for (let index: number = 0; index < isolatedFreeSeats.length; index += 1) {
    const [row, column]: [number, number] = isolatedFreeSeats[index];
    cinema[row][column] = 0;
  }

  displayCinema(cinema);
  printAdjacentResult(findAdjacentSeats(cinema));
  printSeparator();
}

/**
 * Ejecuta el Caso 4: sala completamente llena.
 */
function runCase4FullCinema(): void {
  console.log("CASO 4: Sala completamente llena");
  const cinema: number[][] = initializeCinema();

  fillCinema(cinema, 1);

  displayCinema(cinema);
  printSeatCount(countSeats(cinema));

  console.log("Intento de reservar un asiento en sala llena (5, 5):");
  reserveSeat(cinema, 5, 5);

  printAdjacentResult(findAdjacentSeats(cinema));
  printSeparator();
}

/**
 * Ejecuta todos los escenarios requeridos para validar el comportamiento.
 */
export function runAllScenarios(): void {
  console.log("INICIO DE PRUEBAS AUTOMATICAS - GESTION DE ASIENTOS DE CINE");
  printSeparator();

  runCase1EmptyCinema();
  runCase2PartiallyOccupied();
  runCase3AlmostFull();
  runCase4FullCinema();

  console.log("FIN DE PRUEBAS AUTOMATICAS");
}
