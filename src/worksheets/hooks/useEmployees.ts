import { useState, useEffect } from 'react';
import {translateMonth} from "../components/Worksheet/utils/dateUtils";

export function useEmployees() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const jsonPath = process.env.NODE_ENV === "production"
            ? "https://raw.githubusercontent.com/Michail19/SimpleSheduleWork/refs/heads/master/public/data/data_example.json"
            : "/data/data_example.json";

        fetch(jsonPath)
            .then((response) => response.json())
            .then((data) => {
                // Извлекаем все уникальные проекты
                const allProjects = data.employees.flatMap((employee: { projects: string; }) =>
                    employee.projects?.split(' ') || []
                ).filter(Boolean);

                const uniqueProjects = [...new Set(allProjects)];

                // @ts-ignore
                setFilters(prev => ({
                    ...prev,
                    projects: uniqueProjects
                }));

                setEmployees(data.employees);
                const translatedWeek = translateMonth(data.currentWeek, currentTranslation);
                setCurrentWeek(translatedWeek);
            })
            .catch((error) => console.error("Ошибка при загрузке данных:", error));
    }, []);

    return { employees, setEmployees };
}
