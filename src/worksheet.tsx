import React, {useEffect, useState, useRef, useMemo} from "react";
import ReactDOM from 'react-dom';

const Worksheet: React.FC = () => {
    const [currentWeek, setCurrentWeek] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [editingCell, setEditingCell] = useState<{ row: number; day: string; dayIndex: number } | null>(null);
    const [editedTime, setEditedTime] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [language, setLanguage] = useState<Language>("ru");
    const [updateKey, setUpdateKey] = useState(0);
    const [filters, setFilters] = useState<FiltersState>({
        projects: [], // Все доступные проекты
        activeProjects: [], // Выбранные проекты для фильтрации
    });
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const currentTranslation = translations[language] ?? translations["ru"];
    const [isAddEmployeePopupOpen, setIsAddEmployeePopupOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        id: '',
        fio: '',
        projects: '',
        schedule: {
            monday: { start: '', end: '' },
            tuesday: { start: '', end: '' },
            wednesday: { start: '', end: '' },
            thursday: { start: '', end: '' },
            friday: { start: '', end: '' },
            saturday: { start: '', end: '' },
            sunday: { start: '', end: '' },
        }
    });
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        // Применяем сохранённые настройки языка при загрузке
        const langSetting = localStorage.getItem('changed-lang');
        if (langSetting === 'enabled') {
            setLanguage("en");
        } else {
            setLanguage("ru");
        }
    }, []);

    useEffect(() => {
        const handleLanguageChange = (event: Event) => {
            const newLang = (event as CustomEvent<string>).detail as Language; // Приведение типа
            if (newLang) {
                setLanguage(newLang);
                setUpdateKey((prev) => prev + 1);
            }
        };

        window.addEventListener("languageUpdateEvent", handleLanguageChange);
        return () => window.removeEventListener("languageUpdateEvent", handleLanguageChange);
    }, []);

    // Рассчитываем количество строк, которые умещаются в контейнер
    useEffect(() => {
        const calculateRowsPerPage = () => {
            if (!containerRef.current) return;

            const viewportHeight = window.innerHeight; // Высота всего окна браузера
            const headerHeight = document.querySelector(".header")?.clientHeight || 0; // Высота заголовка
            const dateSwitcherHeight = document.querySelector(".subtitle")?.clientHeight || 0;
            const paginationHeight = document.querySelector(".footer")?.clientHeight || 0;
            const otherElementsHeight = 140; // Если есть отступы, доп. элементы

            const availableHeight = viewportHeight - headerHeight - dateSwitcherHeight - paginationHeight - otherElementsHeight;
            const rowHeight = document.querySelector(".worksheet__row")?.clientHeight || 40;

            const newRowsPerPage = Math.floor(availableHeight / rowHeight) || 10;

            setRowsPerPage(newRowsPerPage);
        };

        window.addEventListener("resize", calculateRowsPerPage);
        calculateRowsPerPage();
        return () => window.removeEventListener("resize", calculateRowsPerPage);
    }, [employees]);

    const changeWeek = (direction: "next" | "previous") => {
        const parsedWeek = parseWeekRange(currentWeek, currentTranslation);
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

        setCurrentWeek(formatWeekRange(newStart, newEnd, currentTranslation));
    };

    const toggleProjectFilter = (project: string) => {
        setFilters(prev => {
            const newActiveProjects = prev.activeProjects.includes(project)
                ? prev.activeProjects.filter(p => p !== project)
                : [...prev.activeProjects, project];

            return {
                ...prev,
                activeProjects: newActiveProjects
            };
        });
    };

    const clearFilters = () => {
        setFilters(prev => ({
            ...prev,
            activeProjects: []
        }));
    };

    useEffect(() => {
        if (showFilters && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showFilters]);

    // Применяем фильтрацию если есть активные фильтры
    const filteredEmployees = useMemo(() => {
        let result = employees;

        // Фильтрация по проектам
        if (filters.activeProjects.length > 0) {
            result = result.filter(employee => {
                const employeeProjects = employee.projects?.split(' ') || [];
                // @ts-ignore
                return filters.activeProjects.some(project =>
                    employeeProjects.includes(project))
            });
        }

        // Фильтрация по имени
        if (searchQuery) {
            result = result.filter(employee =>
                employee.fio.toLowerCase().includes(searchQuery.toLowerCase()))
        }

        return result;
    }, [employees, filters.activeProjects, searchQuery]);

    // Фиксируем current сотрудника (первого в списке)
    const currentEmployee = filteredEmployees.length > 0 ? filteredEmployees[0] : null;

    // Остальные сотрудники (без current) для пагинации
    const paginatedEmployees = filteredEmployees.slice(1);

    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(paginatedEmployees.length / rowsPerPage);

    // Формируем список для отображения
    const displayedEmployees = [
        ...(currentEmployee ? [currentEmployee] : []), // Всегда добавляем current первым
        ...paginatedEmployees.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
        )
    ];

    useEffect(() => {
        // Сбрасываем на первую страницу при изменении фильтров
        setCurrentPage(1);
    }, [filters.activeProjects]);

    const changePage = (direction: "next" | "previous") => {
        setCurrentPage((prev) => {
            if (direction === "next" && prev < totalPages) return prev + 1;
            if (direction === "previous" && prev > 1) return prev - 1;
            return prev;
        });
    };

    const handleEdit = (row: number, dayIndex: number, day: string, type: string, value: string) => {
        setEditedTime((prev) => ({
            ...prev,
            [`${row}-${dayIndex}-${type}`]: value,
        }));
    };

    const handleBlur = (employeeIndex: number, dayIndex: number, day: string, type: "start" | "end", event?: React.FocusEvent<HTMLInputElement> | null) => {
        const relatedTarget = event?.relatedTarget as HTMLInputElement | null;

        if (relatedTarget && relatedTarget.tagName === "INPUT") {
            return; // Не сбрасываем состояние, если переходим на другой input
        }

        const editedStart = editedTime[`${employeeIndex}-${dayIndex}-start`] || "";
        const editedEnd = editedTime[`${employeeIndex}-${dayIndex}-end`] || "";

        const oldValue = employees[employeeIndex].weekSchedule[day] || { start: "", end: "" };
        const hadOldValues = oldValue.start !== "" || oldValue.end !== ""; // Было ли что-то в старых данных
        const hasNewValues = editedStart !== "" || editedEnd !== ""; // Есть ли новые данные

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        const isStartValid = editedStart === "" || timeRegex.test(editedStart);
        const isEndValid = editedEnd === "" || timeRegex.test(editedEnd);

        // Если оба поля пустые и раньше не было значений — не сохраняем
        if (!hadOldValues && !hasNewValues) {
            return;
        }

        // Если раньше было значение, но пользователь удалил всё — откатываем к старым данным
        if (hadOldValues && !hasNewValues) {
            setEmployees((prev) =>
                prev.map((employee, index) =>
                    index === employeeIndex
                        ? {
                            ...employee,
                            weekSchedule: {
                                ...employee.weekSchedule,
                                [day]: oldValue, // Восстанавливаем предыдущие данные
                            },
                        }
                        : employee
                )
            );
            setEditingCell(null);
            return;
        }

        // Если хотя бы одно поле некорректное — откатываем
        if (!isStartValid || !isEndValid) {
            setEmployees((prev) =>
                prev.map((employee, index) =>
                    index === employeeIndex
                        ? {
                            ...employee,
                            weekSchedule: {
                                ...employee.weekSchedule,
                                [day]: oldValue,
                            },
                        }
                        : employee
                )
            );
            setEditingCell(null);
            return;
        }

        // Если в старых данных пусто — требуем заполнения обоих полей
        if (!hadOldValues && (editedStart === "" || editedEnd === "")) {
            return;
        }

        // Если оба поля заполнены корректно, обновляем
        setEmployees((prev) =>
            prev.map((employee, index) =>
                index === employeeIndex
                    ? {
                        ...employee,
                        weekSchedule: {
                            ...employee.weekSchedule,
                            [day]: {
                                start: editedStart || oldValue.start,
                                end: editedEnd || oldValue.end,
                            },
                        },
                    }
                    : employee
            )
        );

        setEditingCell(null);
        // TODO: отправить обновленные данные в API
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && editingCell !== null) {
                setEditingCell(null); // Отключаем редактирование
            }
            if (e.key === "Enter" && editingCell !== null) {
                const inputElement = document.querySelector("input"); // Находим input
                if (inputElement) {
                    const value = inputElement.value; // Получаем значение
                    handleEdit(editingCell.row, editingCell.dayIndex, editingCell.day, "start", value); // Сохраняем значение
                    const nextInput = inputRefs.current[1]; // Следующий input
                    if (nextInput) {
                        nextInput.focus(); // Переключаем фокус на следующий input
                    }
                    setEditingCell(null); // Завершаем редактирование
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [editingCell]); // Добавляем editingCell в зависимости

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.filters-panel') &&
                !target.closest('.sidebar__btn[data-key="sidebar_filters"]') &&
                !target.closest('.header__headbar__up-blocks__btn')) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddEmployee = (employeeData: typeof newEmployee) => {
        const projectsFromNewEmployee = employeeData.projects.split(' ').filter(Boolean);

        // Генерируем новый ID
        const newId = employees.length > 0
            ? Math.max(...employees.map(e => typeof e.id === 'number' ? e.id : 0)) + 1
            : 1;

        // Создаем нового сотрудника с ID на первом месте
        const newEmployee = {
            id: newId.toString(),
            fio: employeeData.fio,
            projects: employeeData.projects,
            weekSchedule: Object.fromEntries(
                Object.entries(employeeData.schedule).map(([day, time]) => [
                    day,
                    { start: time.start || '', end: time.end || '' }
                ])
            )
        };

        setEmployees(prev => [...prev, newEmployee]);

        // Обновляем список фильтров
        setFilters(prev => {
            const newProjects = [...prev.projects];
            let hasUpdates = false;

            projectsFromNewEmployee.forEach(project => {
                if (!newProjects.includes(project)) {
                    newProjects.push(project);
                    hasUpdates = true;
                }
            });

            return hasUpdates
                ? { ...prev, projects: newProjects.sort() }
                : prev;
        });

        setIsAddEmployeePopupOpen(false);
        setNewEmployee({
            id: '',
            fio: '',
            projects: '',
            schedule: {
                monday: { start: '', end: '' },
                tuesday: { start: '', end: '' },
                wednesday: { start: '', end: '' },
                thursday: { start: '', end: '' },
                friday: { start: '', end: '' },
                saturday: { start: '', end: '' },
                sunday: { start: '', end: '' },
            }
        });
    };

    const handleDeleteEmployee = (employeeId: string) => {
        setEmployees(prev => {
            const updatedEmployees = prev.filter(emp => emp.id !== employeeId);

            // Обновляем фильтры после удаления
            const remainingProjects = updatedEmployees.flatMap(emp =>
                emp.projects?.split(' ').filter(Boolean) || []
            );

            setFilters(f => ({
                ...f,
                projects: [...new Set(remainingProjects)].sort()
            }));

            return updatedEmployees;
        });
    };



};

export default Worksheet;
