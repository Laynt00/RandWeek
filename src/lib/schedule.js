// Por simplicidad el modelo de tiempo dentro de la aplicacion se gestiona en intervalos de 30min. 
export const SLOTS_PER_DAY = 48;
export const DAYS_PER_WEEK = 7;
export const SLOTS_PER_WEEK = SLOTS_PER_DAY * DAYS_PER_WEEK;


// Convierte "HH:MM" a la posición dentro del día (0-47)
export function hourToSlotInDay(hour) {
    const hourSplited = hour.split(":");
    const hours = parseInt(hourSplited[0], 10);
    const minutes = parseInt(hourSplited[1], 10);
    return hours * 2 + (minutes >= 30 ? 1 : 0);
}

// Convierte intervalos en "HH:MM"
export function slotInDayToHour(slot) {
    const hours = Math.floor(slot / 2);
    const minutes = (slot % 2) * 30;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;

}

// Devuelve el intervalo global (0-335 en una semana) 
export function toGlobalSlot(day, slotInDay) {
    return (day * SLOTS_PER_DAY) + slotInDay;
}

// Devuelve intervalo diario desde uno global
export function fromGlobalSlot(slot) {
    const day = Math.floor(slot / SLOTS_PER_DAY);
    const slotInDay = slot % SLOTS_PER_DAY;
    return { day, slotInDay };
}

// Grid base semanal
export function createEmptyGrid() {
    return new Array(SLOTS_PER_WEEK).fill(null)
}

export function fillFixedBlocks(grid, fixedBlocks) {
    for (const block of fixedBlocks) {
        const info = { type: block.type, name: block.name };
        const startSlot = hourToSlotInDay(block.start);
        const endSlot = hourToSlotInDay(block.end);

        // L-V[0,1,2,3,4] / L-D[0,1,2,3,4,5,6]
        for (const day of block.days) {
            if (startSlot < endSlot) {
                // Caso normal: el bloque no cruza medianoche
                markRange(grid, day, startSlot, endSlot, info);
            } else {
                // Caso especial: el bloque cruza medianoche (ej: dormir 23:00–07:00)
                // Parte 1: del inicio hasta el final del día actual
                markRange(grid, day, startSlot, SLOTS_PER_DAY, info);
                // Parte 2: del inicio del día siguiente hasta el fin del bloque
                const nextDay = (day + 1) % DAYS_PER_WEEK;
                markRange(grid, nextDay, 0, endSlot, info);
            }
        }
    }
    return grid;
}

// Rellena un rango de slots dentro de un dia en concreto
function markRange(grid, day, startSlot, endSlot, info) {
    // startSlot y endSlot son slot dentro del día (0-47)
    // info es lo que se guarda en cada slot: { type, name }
    for (let s = startSlot; s < endSlot; s++) {
        const global = toGlobalSlot(day, s);
        grid[global] = info;
    }
}

export function countFreeSlots(grid) {
    return grid.filter(slot => slot === null).length;
}

export function getFreeSlots(grid) {
    const free = [];
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === null)
            free.push(i);
    }
    return free;
}

export function splitActivityIntoBlocks(activity) {
    let remaining = activity.hours;
    let blockSize;
    const blocks = [];

    while (remaining > 0) {
        const blockSize = remaining <= activity.maxBlock ? remaining : activity.maxBlock;
        if (blockSize < activity.minBlock) {
            throw new Error("No es posible trocear con esos parametros")
        }
        blocks.push({name: activity.name, duration: blockSize});
        remaining -= blockSize;
    }
    return blocks;
}


// TESTS
const grid = createEmptyGrid();
const fixedBlocks = [
    { name: "Dormir", type: "sleep", days: [0, 1, 2, 3, 4, 5, 6], start: "23:00", end: "07:00" },
    { name: "Desayuno", type: "meal", days: [0, 1, 2, 3, 4, 5, 6], start: "09:00", end: "09:30" },
    { name: "Comida", type: "meal", days: [0, 1, 2, 3, 4, 5, 6], start: "13:00", end: "14:00" },
];

fillFixedBlocks(grid, fixedBlocks);

console.log("Slots libres:", countFreeSlots(grid));
console.log("Primeros 10 libres:", getFreeSlots(grid).slice(0, 10));
console.log("Total libres (debe coincidir):", getFreeSlots(grid).length);

console.log(splitActivityIntoBlocks({ name: "Gym", hours: 5, minBlock: 1, maxBlock: 2 }));

console.log(splitActivityIntoBlocks({ name: "Leer", hours: 3, minBlock: 0.5, maxBlock: 1 }));

console.log(splitActivityIntoBlocks({ name: "Estudiar", hours: 20, minBlock: 2, maxBlock: 3 }));

try {
  splitActivityIntoBlocks({ name: "Imposible", hours: 5, minBlock: 2, maxBlock: 2 });
} catch (e) {
  console.log("Error esperado:", e.message);
}