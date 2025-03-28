import { useState, useEffect, useCallback } from 'react';
import { Employee, FiltersState } from '../components/Worksheet/types';
import { parseWeekRange, formatWeekRange } from '../components/Worksheet/utils/dateUtils';

export const useEmployees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentWeek, setCurrentWeek] = useState<string>("");
    const [filters, setFilters] = useState<FiltersState>({
        projects: [], // Все доступные проекты
        activeProjects: [], // Выбранные проекты для фильтрации
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Загрузка данных
    const fetchEmployees = useCallback(async (language: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const jsonPath = process.env.NODE_ENV === "production"
                ? "https://raw.githubusercontent.com/Michail19/SimpleSheduleWork/refs/heads/master/public/data/data_example.json"
                : "/data/data_example.json";

            const response = await fetch(jsonPath);
            const data = await response.json();

            // Извлекаем уникальные проекты
            const allProjects = data.employees.flatMap((employee: Employee) =>
                employee.projects?.split(' ') || []
            ).filter(Boolean);

            setFilters(prev => ({
                ...prev,
                projects: [...new Set(allProjects)]
            }));

            setEmployees(data.employees);
            setCurrentWeek(data.currentWeek);
        } catch (err) {
            setError('Ошибка при загрузке данных');
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Изменение недели
    const changeWeek = useCallback((direction: "next" | "previous", translations: Record<string, string>) => {
        const parsedWeek = parseWeekRange(currentWeek, translations);
        if (!parsedWeek) return;

        const { start, end } = parsedWeek;
        const newStart = new Date(start);
        const newEnd = new Date(end);

        if (direction === "next") {
            newStart.setDate(newStart.getDate() + 7);
            newEnd.setDate(newEnd.getDate() + 7);
        } else {
            newStart.setDate(newStart.getDate() - 7);
            newEnd.setDate(newEnd.getDate() - 7);
        }

        setCurrentWeek(formatWeekRange(newStart, newEnd, translations));
    }, [currentWeek]);

    // Фильтрация сотрудников
    const getFilteredEmployees = useCallback((searchQuery: string) => {
        return employees.filter(employee => {
            // Фильтр по проектам
            const projectMatch = filters.activeProjects.length === 0 ||
                filters.activeProjects.some(project =>
                    employee.projects?.includes(project)
                );

            // Фильтр по имени
            const nameMatch = searchQuery
                ? employee.fio.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            return projectMatch && nameMatch;
        });
    }, [employees, filters.activeProjects]);

    // Добавление сотрудника
    const addEmployee = useCallback((employeeData: Omit<Employee, 'id'>) => {
        const newId = employees.length > 0
            ? Math.max(...employees.map(e => parseInt(e.id))) + 1
            : 1;

        const newEmployee: Employee = {
            id: newId.toString(),
            ...employeeData
        };

        setEmployees(prev => [...prev, newEmployee]);

        // Обновляем фильтры
        const newProjects = employeeData.projects?.split(' ').filter(Boolean) || [];
        setFilters(prev => {
            const updatedProjects = [...prev.projects];
            let hasUpdates = false;

            newProjects.forEach(project => {
                if (!updatedProjects.includes(project)) {
                    updatedProjects.push(project);
                    hasUpdates = true;
                }
            });

            return hasUpdates
                ? { ...prev, projects: updatedProjects.sort() }
                : prev;
        });
    }, [employees]);

    // Удаление сотрудника
    const deleteEmployee = useCallback((id: string) => {
        setEmployees(prev => {
            const updatedEmployees = prev.filter(emp => emp.id !== id);

            // Обновляем доступные проекты
            const remainingProjects = updatedEmployees.flatMap(emp =>
                emp.projects?.split(' ').filter(Boolean) || []
            );

            setFilters(f => ({
                ...f,
                projects: [...new Set(remainingProjects)].sort()
            }));

            return updatedEmployees;
        });
    }, []);

    // Обновление расписания
    const updateSchedule = useCallback((employeeId: string, day: string, newSchedule: Schedule) => {
        setEmployees(prev =>
            prev.map(employee =>
                employee.id === employeeId
                    ? {
                        ...employee,
                        weekSchedule: {
                            ...employee.weekSchedule,
                            [day]: newSchedule
                        }
                    }
                    : employee
            )
        );
    }, []);

    return {
        employees,
        currentWeek,
        filters,
        isLoading,
        error,
        fetchEmployees,
        changeWeek,
        getFilteredEmployees,
        addEmployee,
        deleteEmployee,
        updateSchedule,
        setFilters
    };
};
