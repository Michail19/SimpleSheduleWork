// Типы данных для расписания
export interface Schedule {
    start: string;
    end: string;
}

export interface Employee {
    id: number;  // Важно: только number
    fio: string;
}

export interface Project {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    updated_at: string;
    language: string | null;
    stargazers_count: number;
    employees: Employee[];  // Массив строго типизированных Employee
}

export type Language = "ru" | "en";
