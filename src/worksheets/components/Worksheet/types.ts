// Типы данных для расписания
export interface Schedule {
    start: string;
    end: string;
}

export interface Employee {
    id: string;
    fio: string;
    projects?: string; // Добавьте это поле (знак ? означает необязательное поле)
    weekSchedule: {
        [day: string]: Schedule;
    };
}

export interface FiltersState {
    projects: string[];
    activeProjects: string[];
}

export type Language = "ru" | "en";
