import {
  countSeats,
  findAdjacentSeats,
  initializeCinema,
  reserveSeat,
  type AdjacentSeats,
  type SeatCount,
} from "./cinema";

const cinema: number[][] = initializeCinema();
let highlightedPair: AdjacentSeats | null = null;
let seatMapElement: HTMLElement | null = null;
let summaryElement: HTMLElement | null = null;
let statusElement: HTMLElement | null = null;

/**
 * Genera el HTML base de la aplicacion web del gestor de asientos.
 */
function createAppTemplate(): string {
  return `
    <main class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,#334155_0%,transparent_35%),radial-gradient(circle_at_80%_0%,#0f766e_0%,transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]"></div>

      <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
        <header class="rounded-2xl border border-cyan-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-200">Cinema Seat Manager</p>
          <h1 class="mt-2 text-3xl font-black uppercase tracking-wide text-white sm:text-4xl">Mapa de asientos</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Haz click en un asiento libre para reservarlo. Los asientos ocupados no pueden seleccionarse.
          </p>
        </header>

        <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div class="rounded-2xl border border-cyan-300/25 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30 sm:p-6">
            <div class="mb-4 rounded-full border border-cyan-400/40 bg-cyan-400/10 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
              Pantalla
            </div>
            <div id="seat-map" class="space-y-2"></div>
          </div>

          <aside class="flex flex-col gap-4 rounded-2xl border border-emerald-300/25 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
            <h2 class="text-lg font-bold text-emerald-200">Panel de control</h2>
            <div id="seat-summary" class="rounded-xl bg-slate-950/60 p-4 text-sm"></div>
            <button
              id="adjacent-button"
              type="button"
              class="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300 active:scale-[0.99]"
            >
              Sugerir 2 asientos juntos
            </button>
            <div id="status-message" class="min-h-14 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200"></div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-lg border border-slate-700 p-2">L = Libre</div>
              <div class="rounded-lg border border-slate-700 p-2">X = Ocupado</div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  `;
}

/**
 * Devuelve las clases CSS que representan el estado visual de cada asiento.
 */
function getSeatClass(seat: number, isHighlighted: boolean): string {
  if (isHighlighted) {
    return "border-amber-200 bg-amber-400 text-amber-950 shadow-lg shadow-amber-900/40";
  }

  if (seat === 1) {
    return "cursor-not-allowed border-rose-300/50 bg-rose-700 text-rose-100 opacity-80";
  }

  return "border-emerald-200/60 bg-emerald-500 text-emerald-950 hover:bg-emerald-400";
}

/**
 * Indica si el asiento actual forma parte del par sugerido por el sistema.
 */
function isSeatHighlighted(row: number, column: number): boolean {
  if (highlightedPair === null) {
    return false;
  }

  return (
    highlightedPair.row === row
    && (highlightedPair.firstColumn === column || highlightedPair.secondColumn === column)
  );
}

/**
 * Construye e imprime el mapa de asientos para que sea clickeable por fila y columna.
 */
function renderSeatMap(): void {
  if (seatMapElement === null) {
    return;
  }

  const columnHeader: string = cinema[0]
    .map((_seat: number, column: number): string => {
      return `<div class="text-center text-xs font-semibold text-cyan-200">${column}</div>`;
    })
    .join("");

  const rowsHtml: string = cinema
    .map((rowSeats: number[], rowIndex: number): string => {
      const seatsHtml: string = rowSeats
        .map((seat: number, columnIndex: number): string => {
          const highlighted: boolean = isSeatHighlighted(rowIndex, columnIndex);
          const stateLabel: string = seat === 0 ? "L" : "X";
          const stateClass: string = getSeatClass(seat, highlighted);

          return `
            <button
              type="button"
              data-row="${rowIndex}"
              data-column="${columnIndex}"
              class="seat-btn h-10 rounded-md border text-sm font-black transition ${stateClass}"
              ${seat === 1 ? "disabled" : ""}
            >
              ${stateLabel}
            </button>
          `;
        })
        .join("");

      return `
        <div class="grid grid-cols-[auto_repeat(10,minmax(0,1fr))] items-center gap-2">
          <div class="pr-1 text-center text-sm font-bold text-cyan-100">${rowIndex}</div>
          ${seatsHtml}
        </div>
      `;
    })
    .join("");

  seatMapElement.innerHTML = `
    <div class="grid grid-cols-[auto_repeat(10,minmax(0,1fr))] items-center gap-2 pb-2">
      <div></div>
      ${columnHeader}
    </div>
    ${rowsHtml}
  `;

  const seatButtons: NodeListOf<HTMLButtonElement> = seatMapElement.querySelectorAll<HTMLButtonElement>(".seat-btn");
  seatButtons.forEach((button: HTMLButtonElement): void => {
    button.addEventListener("click", onSeatClick);
  });
}

/**
 * Actualiza el resumen de asientos ocupados y disponibles en el panel lateral.
 */
function renderSummary(): void {
  if (summaryElement === null) {
    return;
  }

  const seatCount: SeatCount = countSeats(cinema);

  summaryElement.innerHTML = `
    <p class="text-slate-300">Asientos ocupados: <strong class="text-rose-300">${seatCount.occupied}</strong></p>
    <p class="text-slate-300">Asientos disponibles: <strong class="text-emerald-300">${seatCount.available}</strong></p>
  `;
}

/**
 * Escribe mensajes de estado visibles para guiar a quien use la interfaz.
 */
function setStatusMessage(message: string): void {
  if (statusElement === null) {
    return;
  }

  statusElement.textContent = message;
}

/**
 * Maneja el click sobre un asiento libre para intentar reservarlo.
 */
function onSeatClick(event: Event): void {
  const buttonElement: HTMLButtonElement = event.currentTarget as HTMLButtonElement;

  const rowValue: string | undefined = buttonElement.dataset.row;
  const columnValue: string | undefined = buttonElement.dataset.column;

  if (rowValue === undefined || columnValue === undefined) {
    return;
  }

  const row: number = Number(rowValue);
  const column: number = Number(columnValue);

  const reservationSuccessful: boolean = reserveSeat(cinema, row, column);
  highlightedPair = null;

  if (reservationSuccessful) {
    setStatusMessage(`Reserva realizada con exito para la fila ${row}, columna ${column}.`);
  } else {
    setStatusMessage(`No fue posible reservar la fila ${row}, columna ${column}.`);
  }

  renderUI();
}

/**
 * Ejecuta la busqueda de dos asientos contiguos y los resalta en el mapa.
 */
function suggestAdjacentSeats(): void {
  const result: AdjacentSeats | null = findAdjacentSeats(cinema);

  highlightedPair = result;

  if (result === null) {
    setStatusMessage("No hay dos asientos contiguos disponibles en este momento.");
  } else {
    setStatusMessage(
      `Sugerencia encontrada en fila ${result.row}, columnas ${result.firstColumn} y ${result.secondColumn}.`,
    );
  }

  renderSeatMap();
}

/**
 * Re-renderiza los bloques visuales que dependen del estado de asientos.
 */
function renderUI(): void {
  renderSeatMap();
  renderSummary();
}

/**
 * Inicializa la interfaz web y conecta todos los eventos de la aplicacion.
 */
export function initializeWebApp(): void {
  const appContainer: HTMLElement | null = document.querySelector<HTMLElement>("#app");

  if (appContainer === null) {
    console.log("No se encontro el contenedor #app para renderizar la interfaz web.");
    return;
  }

  appContainer.innerHTML = createAppTemplate();

  seatMapElement = appContainer.querySelector<HTMLElement>("#seat-map");
  summaryElement = appContainer.querySelector<HTMLElement>("#seat-summary");
  statusElement = appContainer.querySelector<HTMLElement>("#status-message");

  const adjacentButton: HTMLButtonElement | null = appContainer.querySelector<HTMLButtonElement>("#adjacent-button");
  if (adjacentButton !== null) {
    adjacentButton.addEventListener("click", suggestAdjacentSeats);
  }

  setStatusMessage("Selecciona un asiento libre para realizar una reserva.");
  renderUI();
}
