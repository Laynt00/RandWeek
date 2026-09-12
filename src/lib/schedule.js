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

console.log(fromGlobalSlot(toGlobalSlot(3, 20)));  // { day: 3, slotInDay: 20 }