import type { Schedule } from '../types';

export const calculateWorkHours = (schedule: Record<string, Schedule>): string => {
    let totalHours = 0;

    Object.values(schedule).forEach((item) => {
        if (!item?.start || !item?.end) return; // Пропускаем некорректные записи

        const startTime = new Date(`1970-01-01T${item.start}:00`);
        const endTime = new Date(`1970-01-01T${item.end}:00`);

        if (endTime >= startTime) {
            // Обычная смена (в пределах одного дня)
            totalHours += (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        } else {
            // 🔹 Ночная смена (переход через полночь)
            const midnight = new Date("1970-01-02T00:00:00");

            // Часы до полуночи
            totalHours += (midnight.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            // Часы после полуночи
            totalHours += (endTime.getTime() - new Date("1970-01-01T00:00:00").getTime()) / (1000 * 60 * 60);
        }
    });

    // Округляем красиво
    let result = totalHours.toFixed(1);
    if (result[result.length - 1] != '0') return result;
    else return Math.round(totalHours).toString();
};
