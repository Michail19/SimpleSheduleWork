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

export async function verifyToken(): Promise<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        const response = await fetch('https://ssw-backend.onrender.com/projects/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('authToken');
                return false;
            }
            throw new Error('Server error');
        }

        return true;
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        return false;
    }
}
