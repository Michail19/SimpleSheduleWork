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
    }, [language]);

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

    const calculateWorkHours = (time: { [day: string]: Schedule }): string => {
        let totalHours = 0;

        Object.values(time).forEach((item) => {
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

    const AddEmployeePopup = ({ onClose, onSave }: {
        onClose: () => void;
        onSave: (employee: typeof newEmployee) => void;
    }) => {
        const [employeeData, setEmployeeData] = useState(newEmployee);
        const [projectSuggestions, setProjectSuggestions] = useState<string[]>([]);

        useEffect(() => {
            if (employeeData.projects.includes(' ')) {
                const lastProject = employeeData.projects.split(' ').pop() || '';
                setProjectSuggestions(
                    filters.projects.filter(p =>
                        p.toLowerCase().includes(lastProject.toLowerCase()) &&
                        !employeeData.projects.includes(p)
                    )
                );
            }
        }, [employeeData.projects]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setEmployeeData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleScheduleChange = (day: string, type: 'start' | 'end', value: string) => {
            setEmployeeData(prev => ({
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [day]: {
                        ...prev.schedule[day as keyof typeof prev.schedule],
                        [type]: value
                    }
                }
            }));
        };

        return (
            <div className="popup-overlay" onClick={onClose}>
                <div className="add-employee-popup" onClick={e => e.stopPropagation()}>
                    <h2>Добавить сотрудника</h2>
                    <button className="close-btn" onClick={onClose}>×</button>

                    <div className="form-group">
                        <label>ФИО:</label>
                        <input
                            type="text"
                            name="fio"
                            value={employeeData.fio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Проекты (через пробел):</label>
                        <input
                            type="text"
                            name="projects"
                            value={employeeData.projects}
                            onChange={handleChange}
                        />
                    </div>

                    <h3>График работы:</h3>
                    {Object.entries(employeeData.schedule).map(([day, time]) => (
                        <div key={day} className="schedule-row">
                            <label>{currentTranslation[day as keyof typeof currentTranslation]}:</label>
                            <input
                                type="time"
                                value={time.start}
                                onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="time"
                                value={time.end}
                                onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="popup-actions">
                        <button onClick={onClose}>Отмена</button>
                        <button
                            onClick={() => onSave(employeeData)}
                            disabled={!employeeData.fio.trim()}
                        >
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        );
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

    const FiltersPanel = () => {
        const filteredProjects = filters.projects.filter(project =>
            project.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const inputRef = useRef<HTMLInputElement>(null);

        // Фиксируем фокус при монтировании
        useEffect(() => {
            inputRef.current?.focus();
        }, []);

        const handleKeyDown = (e: React.KeyboardEvent) => {
            // Предотвращаем всплытие событий клавиш
            e.stopPropagation();

            // Дополнительно: закрытие по Escape
            if (e.key === 'Escape') {
                setShowFilters(false);
            }
        };

        return (
            <div
                className="filters-panel"
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="search-container">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    <h3>{currentTranslation.filters}</h3>

                    <div className="filters-list">
                        {filteredProjects.map(project => (
                            <label key={project} className="filter-item">
                                <input
                                    type="checkbox"
                                    checked={filters.activeProjects.includes(project)}
                                    onChange={() => toggleProjectFilter(project)}
                                />
                                <span>{project.replace('Project_', '')}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        className="clear-filters-btn"
                        onClick={() => {
                            clearFilters();
                            setSearchQuery('');
                        }}
                        disabled={filters.activeProjects.length === 0 && !searchQuery}
                    >
                        {currentTranslation.clearFilters}
                    </button>
                </div>
            </div>
        );
    };

    const DeleteEmployeePopup = ({employees, onDelete, onClose}: {
        employees: Employee[];
        onDelete: (id: string) => void;
        onClose: () => void;
    }) => {
        const filteredEmployees = employees.filter(employee =>
            employee.fio.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="popup-overlay" onClick={onClose}>
                <div className="delete-popup" onClick={e => e.stopPropagation()}>
                    <h2>Удаление сотрудника</h2>
                    <button className="close-btn" onClick={onClose}>×</button>

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Поиск по ФИО..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="employees-list">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map(employee => (
                                <div
                                    key={employee.id}
                                    className={`employee-item ${
                                        selectedEmployee?.id === employee.id ? 'selected' : ''
                                    }`}
                                    onClick={() => setSelectedEmployee(employee)}
                                >
                                    <span>{employee.fio}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">Сотрудники не найдены</div>
                        )}
                    </div>

                    <div className="popup-actions">
                        <button onClick={onClose}>Отмена</button>
                        <button
                            onClick={() => selectedEmployee && onDelete(selectedEmployee.id)}
                            disabled={!selectedEmployee}
                            className="danger-btn"
                        >
                            Удалить выбранного
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="content" key={updateKey}>
            {document.querySelector('.sidebar') &&
                ReactDOM.createPortal(
                    <button
                        className="sidebar__btn"
                        onClick={() => setIsAddEmployeePopupOpen(true)}
                    >
                        Добавить <br/>
                        сотрудника
                    </button>,
                    document.querySelector('.sidebar') as Element
                )
            }
            {document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <button
                        className="header__headbar__up-blocks__btn"
                        onClick={() => setIsAddEmployeePopupOpen(true)}
                    >
                        Добавить сотрудника
                    </button>,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }
            {isAddEmployeePopupOpen && (
                <AddEmployeePopup
                    onClose={() => setIsAddEmployeePopupOpen(false)}
                    onSave={handleAddEmployee}
                />
            )}

            {document.querySelector('.sidebar') &&
                ReactDOM.createPortal(
                    <button
                        className="sidebar__btn"
                        onClick={() => setIsDeletePopupOpen(true)}
                    >
                        Удалить <br/>
                        сотрудника
                    </button>,
                    document.querySelector('.sidebar') as Element
                )
            }
            {document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <button
                        className="header__headbar__up-blocks__btn"
                        onClick={() => setIsDeletePopupOpen(true)}
                    >
                        Удалить сотрудника
                    </button>,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }
            {isDeletePopupOpen && (
                <DeleteEmployeePopup
                    employees={employees}
                    onDelete={handleDeleteEmployee}
                    onClose={() => {
                        setIsDeletePopupOpen(false);
                        setSearchTerm('');
                        setSelectedEmployee(null);
                    }}
                />
            )}

            {document.querySelector('.sidebar') &&
                ReactDOM.createPortal(
                    <button
                        className={`sidebar__btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        data-key="sidebar_filters"
                    >
                        {currentTranslation.filters}
                    </button>,
                    document.querySelector('.sidebar') as Element
                )
            }
            {showFilters && document.querySelector('.sidebar') &&
                ReactDOM.createPortal(
                    <FiltersPanel />,
                    document.querySelector('.sidebar') as Element
                )
            }

            {document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <button
                        className={`header__headbar__up-blocks__btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        data-key="sidebar_filters"
                    >
                        {currentTranslation.filters}
                    </button>,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }
            {showFilters && document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <FiltersPanel />,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }

            {document.querySelector(".subtitle__date__place") &&
                ReactDOM.createPortal(
                    <button
                        className="subtitle__date__btn"
                        onClick={() => changeWeek('previous')}
                    >
                        ◄
                    </button>,
                    document.querySelector(".subtitle__date__place") as Element
                )}

            {document.querySelector(".subtitle__date__place") &&
                ReactDOM.createPortal(
                    <span className="subtitle__date__place_text">{currentWeek}</span>,
                    document.querySelector(".subtitle__date__place") as Element
                )}

            {document.querySelector(".subtitle__date") &&
                ReactDOM.createPortal(
                    <button
                        className="subtitle__date__btn"
                        onClick={() => changeWeek('next')}
                    >
                        ►
                    </button>,
                    document.querySelector(".subtitle__date") as Element
                )}

            {isMobile ? (
                <>
                    {displayedEmployees.length > 0 && (
                        <div ref={containerRef} className="worksheet">
                            <div className="worksheet__row_mobile">
                                <div className="worksheet__cell_name-cell">{displayedEmployees[0].fio}</div>
                                <div className="worksheet__cell_block_cell"></div>
                                {Object.keys(displayedEmployees[0].weekSchedule).map((day: string, dayIndex: number) => {
                                    const schedule = displayedEmployees[0].weekSchedule[day];
                                    return (
                                        <div className="worksheet__cell" key={dayIndex}>
                                            <div className="worksheet__day-label">{currentTranslation[day]}</div>
                                            {editingCell?.row === 0 && editingCell?.day === day ? (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={editedTime[`0-${dayIndex}-start`] || schedule.start}
                                                        onChange={(e) => handleEdit(0, dayIndex, day, "start", e.target.value)}
                                                        onBlur={(e) => handleBlur(0, dayIndex, day, "start", e)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null); // Отмена редактирования
                                                            }
                                                            if (e.key === "Enter") {
                                                                handleBlur(0, dayIndex, day, "start", null);
                                                            }
                                                        }}
                                                    />
                                                    -
                                                    <input
                                                        type="time"
                                                        value={editedTime[`0-${dayIndex}-end`] || schedule.end}
                                                        onChange={(e) => handleEdit(0, dayIndex, day, "end", e.target.value)}
                                                        onBlur={(e) => handleBlur(0, dayIndex, day, "end", e)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null); // Отмена редактирования
                                                            }
                                                            if (e.key === "Enter") {
                                                                handleBlur(0, dayIndex, day, "end", null);
                                                            }
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <div onClick={() => setEditingCell({ row: 0, day: day, dayIndex: dayIndex })}>
                                                    {`${schedule.start} - ${schedule.end}`}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
                ) : (
                <>
                    <div ref={containerRef} className="worksheet">
                        <div className="worksheet__row__header">
                            <div className="worksheet__row__header__cell header-cell">{currentTranslation.title}</div>
                            <div className="worksheet__row__header__cell_clock">
                                <div className="cell_clock_img"></div>
                            </div>
                            <div className="worksheet__row__header__cell">{currentTranslation.monday}</div>
                            <div className="worksheet__row__header__cell">{currentTranslation.tuesday}</div>
                            <div className="worksheet__row__header__cell">{currentTranslation.wednesday}</div>
                            <div className="worksheet__row__header__cell">{currentTranslation.thursday}</div>
                            <div className="worksheet__row__header__cell">{currentTranslation.friday}</div>
                            <div className="worksheet__row__header__cell">{currentTranslation.saturday}</div>
                            <div className="worksheet__row__header__cell">{currentTranslation.sunday}</div>
                        </div>
                        {displayedEmployees.map((employee, index) => (
                            <div
                                key={index}
                                className={`worksheet__row ${employee === employees[0] ? "current" : ""}`}
                            >
                                <div className="worksheet__cell_name">{employee.fio}</div>
                                <div className="worksheet__cell_clock">{calculateWorkHours(employee.weekSchedule)}{currentTranslation.hour}</div>
                                {Object.keys(employee.weekSchedule).map((day: string, dayIndex: number) => {
                                    const schedule = employee.weekSchedule[day];
                                    return (
                                        <div key={dayIndex} className="worksheet__cell">
                                            {editingCell?.row === index && editingCell?.day === day ? (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={editedTime[`${index}-${dayIndex}-start`] || schedule.start}
                                                        onChange={(e) => handleEdit(index, dayIndex, day, "start", e.target.value)}
                                                        onBlur={(e) => handleBlur(index, dayIndex, day, "start", e)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null); // Отмена редактирования
                                                            }
                                                            if (e.key === "Enter") {
                                                                handleBlur(index, dayIndex, day, "start", null);
                                                            }
                                                        }}
                                                    />
                                                    -
                                                    <input
                                                        type="time"
                                                        value={editedTime[`${index}-${dayIndex}-end`] || schedule.end}
                                                        onChange={(e) => handleEdit(index, dayIndex, day, "end", e.target.value)}
                                                        onBlur={(e) => handleBlur(index, dayIndex, day, "end", e)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null); // Отмена редактирования
                                                            }
                                                            if (e.key === "Enter") {
                                                                handleBlur(index, dayIndex, day, "end", null);
                                                            }
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <div onClick={() => setEditingCell({ row: index, day: day, dayIndex: dayIndex })}>
                                                    {`${schedule.start} - ${schedule.end}`}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    {document.querySelector(".footer") &&
                        ReactDOM.createPortal(
                            <>
                                <button
                                    className="footer__btn"
                                    onClick={() => changePage("previous")}
                                    disabled={currentPage === 1}
                                >
                                    ◄
                                </button>
                                <div className="footer__place">
                                    {currentTranslation.page} {currentPage} {currentTranslation.outOf} {totalPages}
                                </div>
                                <button
                                    className="footer__btn"
                                    onClick={() => changePage("next")}
                                    disabled={currentPage === totalPages}
                                >
                                    ►
                                </button>
                            </>,
                            document.querySelector(".footer") as Element
                        )}
                </>
            )}
        </div>
    );
};

export default Worksheet;
