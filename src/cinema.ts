export type SeatState = 0 | 1;

export type SeatCount = {
  occupied: number;
  available: number;
};

export type AdjacentSeats = {
  row: number;
  firstColumn: number;
  secondColumn: number;
};

const TOTAL_ROWS: number = 8;
const TOTAL_COLUMNS: number = 10;

/**
 * Crea la matriz de asientos de la sala con todos los lugares disponibles.
 */
export function initializeCinema(): number[][] {
  return Array.from({ length: TOTAL_ROWS }, (): number[] => Array(TOTAL_COLUMNS).fill(0));
}

/**
 * Muestra la sala en consola usando L para libre y X para ocupado.
 */
export function displayCinema(cinema: number[][]): void {
  const headerColumns: string = Array.from(
    { length: TOTAL_COLUMNS },
    (_unused: unknown, index: number): string => index.toString(),
  ).join(" ");

  console.log(`    ${headerColumns}`);

  for (let row: number = 0; row < cinema.length; row += 1) {
    const rowLabel: string = row.toString().padEnd(2, " ");
    const seatSymbols: string = cinema[row]
      .map((seat: number): string => (seat === 0 ? "L" : "X"))
      .join(" ");

    console.log(`${rowLabel}  ${seatSymbols}`);
  }
}

/**
 * Verifica si una posición está dentro de los límites de la sala.
 */
function isValidSeatPosition(cinema: number[][], row: number, column: number): boolean {
  return row >= 0
    && column >= 0
    && row < cinema.length
    && column < cinema[row].length;
}

/**
 * Intenta reservar un asiento; devuelve true si la reserva fue exitosa.
 */
export function reserveSeat(cinema: number[][], row: number, column: number): boolean {
  if (!isValidSeatPosition(cinema, row, column)) {
    console.log(`No se puede reservar: la posición (${row}, ${column}) no existe.`);
    return false;
  }

  if (cinema[row][column] === 1) {
    console.log(`No se puede reservar: el asiento (${row}, ${column}) ya está ocupado.`);
    return false;
  }

  cinema[row][column] = 1;
  console.log(`Reserva confirmada para el asiento (${row}, ${column}).`);
  return true;
}

/**
 * Cuenta cuántos asientos están ocupados y cuántos quedan disponibles.
 */
export function countSeats(cinema: number[][]): SeatCount {
  const occupied: number = cinema.reduce((total: number, row: number[]): number => {
    const occupiedInRow: number = row.reduce(
      (rowTotal: number, seat: number): number => rowTotal + (seat === 1 ? 1 : 0),
      0,
    );
    return total + occupiedInRow;
  }, 0);

  const totalSeats: number = cinema.length * (cinema[0]?.length ?? 0);
  const available: number = totalSeats - occupied;

  return { occupied, available };
}

/**
 * Busca el primer par horizontal de asientos contiguos libres en la sala.
 */
export function findAdjacentSeats(cinema: number[][]): AdjacentSeats | null {
  for (let row: number = 0; row < cinema.length; row += 1) {
    const currentRow: number[] = cinema[row];

    for (let column: number = 0; column < currentRow.length - 1; column += 1) {
      const currentSeat: SeatState = currentRow[column] as SeatState;
      const nextSeat: SeatState = currentRow[column + 1] as SeatState;

      if (currentSeat === 0 && nextSeat === 0) {
        return {
          row,
          firstColumn: column,
          secondColumn: column + 1,
        };
      }
    }
  }

  console.log("No existen dos asientos contiguos libres en la sala.");
  return null;
}
