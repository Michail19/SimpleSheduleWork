import React, {useEffect, useState, useRef} from "react";
import ReactDOM from 'react-dom';
import {Employee, FiltersState, Language} from './types';
import {translations} from './translations';
import {parseWeekRange, formatWeekRange, translateMonth} from "./timeParsers"
import {calculateWorkHours, filterEmployees} from './utils';
import {FiltersPanel} from './components/FiltersPanel';
import {AddEmployeePopup} from './components/AddEmployeePopup';
import {DeleteEmployeePopup} from './components/DeleteEmployeePopup';
import {MobileEmployeeSearch} from "./components/MobileEmployeeSearch";
import {getUserAccessLevel} from "../UserAccessLevel";

const Worksheet: React.FC = () => {
    // Состояния и рефы
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentWeek, setCurrentWeek] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [editingCell, setEditingCell] = useState<{ employeeId: string; day: string; dayIndex: number } | null>(null);
    const [editedTime, setEditedTime] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1090);
    const [language, setLanguage] = useState<Language>("ru");
    const [updateKey, setUpdateKey] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQueryEmployees, setSearchQueryEmployees] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const currentTranslation = translations[language] ?? translations["ru"];
    const [isAddEmployeePopupOpen, setIsAddEmployeePopupOpen] = useState(false);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const accessLevel = getUserAccessLevel() || "USER";
    const [filters, setFilters] = useState<FiltersState>({
        projects: [],
        activeProjects: [],
    });
    const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'> & { id?: string }>({
        fio: '',
        projects: '',
        weekSchedule: {
            monday: {start: '', end: ''},
            tuesday: {start: '', end: ''},
            wednesday: {start: '', end: ''},
            thursday: {start: '', end: ''},
            friday: {start: '', end: ''},
            saturday: {start: '', end: ''},
            sunday: {start: '', end: ''},
        }
    });

    // Эффекты и обработчики
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1090);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
        const fetchData = async () => {
            const token = localStorage.getItem("authToken"); // предполагается, что ты сохраняешь токен после логина

            try {
                // console.log(token);
                const response = await fetch("https://ssw-backend.onrender.com/schedule/weekly", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Ошибка при загрузке с сервера");
                }

                const data = await response.json();

                const allProjects = data.employees.flatMap((employee: { projects: string }) =>
                    employee.projects?.split(" ") || []
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
            } catch (error) {
                console.warn("Сервер недоступен, используем JSON-файл", error);

                const jsonPath = process.env.NODE_ENV === "production"
                    ? "https://raw.githubusercontent.com/Michail19/SimpleSheduleWork/refs/heads/master/public/data/data_example.json"
                    : "/data/data_example.json";

                try {
                    const fallbackResponse = await fetch(jsonPath);
                    const data = await fallbackResponse.json();

                    const allProjects = data.employees.flatMap((employee: { projects: string }) =>
                        employee.projects?.split(" ") || []
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
                } catch (fallbackErr) {
                    console.error("Ошибка при загрузке fallback JSON:", fallbackErr);
                }
            }
        };

        fetchData();
    }, [language]);


    // Рассчитываем количество строк, которые умещаются в контейнер
    useEffect(() => {
        const calculateRowsPerPage = () => {
            if (!containerRef.current) return;

            const rowElements = containerRef.current.querySelectorAll(".worksheet__row");
            let maxHeight = 0;

            rowElements.forEach(row => {
                const height = (row as HTMLElement).offsetHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                }
            });

            // Если нет строк, fallback
            const finalRowHeight = maxHeight || 40;

            // const containerTop = containerRef.current.getBoundingClientRect().top;
            const viewportHeight = window.innerHeight; // Высота всего окна браузера
            const headerHeight = document.querySelector(".header")?.clientHeight || 0; // Высота заголовка
            const dateSwitcherHeight = document.querySelector(".subtitle")?.clientHeight || 0;
            const paginationHeight = document.querySelector(".footer")?.clientHeight || 0;
            const otherElementsHeight = 60; // Если есть отступы, доп. элементы
            const availableHeight = viewportHeight - headerHeight - dateSwitcherHeight - paginationHeight - otherElementsHeight;

            const newRowsPerPage = Math.floor(availableHeight / finalRowHeight) || 1;

            setRowsPerPage(newRowsPerPage - 1);
        };

        window.addEventListener("resize", calculateRowsPerPage);
        calculateRowsPerPage();
        return () => window.removeEventListener("resize", calculateRowsPerPage);
    }, [employees]); // или employees, если до фильтрации

    //Перерасчёт страниц
    useEffect(() => {
        if (employees.length === 0 || rowsPerPage === 0) return;

        const maxPage = Math.ceil(employees.length / rowsPerPage);
        if (currentPage > maxPage) {
            setCurrentPage(maxPage);
        }
    }, [employees.length, rowsPerPage, currentPage]);

    // Смена недели
    function getWeekRangeByOffset(offset: number): { start: Date; end: Date } {
        const now = new Date();
        const currentDay = now.getDay(); // 0 (воскресенье) до 6 (суббота)
        const diffToMonday = (currentDay + 6) % 7; // Преобразуем: понедельник — 0, вторник — 1, ..., воскресенье — 6

        const monday = new Date(now);
        monday.setDate(monday.getDate() - diffToMonday + offset * 7);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {start: monday, end: sunday};
    }

    const changeWeek = async (direction: "next" | "previous") => {
        await flushChanges();

        const offsetChange = direction === "next" ? 1 : -1;

        // Подсчёт смещения недели (можно хранить в useState или useRef)
        setCurrentOffset(prev => {
            const newOffset = prev + offsetChange;

            const {start, end} = getWeekRangeByOffset(newOffset);

            const formatDate = (date: Date) =>
                new Intl.DateTimeFormat("ru-RU", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    timeZone: "Europe/Moscow"
                })
                    .format(date)
                    .split(".")
                    .reverse()
                    .join("-");
            const formattedDate = formatDate(start);
            console.log(start, end);
            console.log(formattedDate);

            const newWeekRange = formatWeekRange(start, end, currentTranslation); // остаётся та же функция

            fetchWeekData(formattedDate, newWeekRange);

            return newOffset;
        });
    };

    const [currentOffset, setCurrentOffset] = useState(0);

    const fetchWeekData = async (formattedDate: string, newWeekRange: string) => {
        try {
            const token = localStorage.getItem("authToken");
            const url = `https://ssw-backend.onrender.com/schedule/weekly?date=${formattedDate}`;
            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Cache-Control": "no-cache"
                },
            });

            if (!response.ok) throw new Error("Ошибка сервера");

            const data = await response.json();

            const allProjects = data.employees.flatMap(
                (e: { projects: string }) => e.projects?.split(" ") || []
            ).filter(Boolean);

            setEmployees(data.employees);
            setCurrentWeek(newWeekRange);
            setPendingChanges([]);
            pendingChangesRef.current = [];
        } catch (err) {
            console.error("Ошибка при загрузке данных:", err);
            setCurrentWeek(newWeekRange);
        }
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

    const filteredEmployees = filterEmployees(employees, filters, searchQueryEmployees);
    const currentEmployee = filteredEmployees.length > 0 ? filteredEmployees[0] : null; // Фиксируем current сотрудника (первого в списке)
    const paginatedEmployees = filteredEmployees.slice(1); // Остальные сотрудники (без current) для пагинации
    const totalPages = Math.ceil(paginatedEmployees.length / rowsPerPage); // Рассчитываем общее количество страниц

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

    // Изменение времени в ячейке
    const [pendingChanges, setPendingChanges] = useState<any[]>([]);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const pendingChangesRef = useRef<any[]>([]);

    const handleEdit = (employeeId: string, dayIndex: number, day: string, type: string, value: string) => {
        setEditedTime((prev) => ({
            ...prev,
            [`${employeeId}-${dayIndex}-${type}`]: value,
        }));
    };

    const handleBlur = (
        employeeId: string,
        dayIndex: number,
        day: string,
        type: "start" | "end",
        event?: React.FocusEvent<HTMLInputElement> | null
    ) => {
        const relatedTarget = event?.relatedTarget as HTMLInputElement | null;
        if (relatedTarget && relatedTarget.tagName === "INPUT") {
            return; // Не сбрасываем состояние, если переходим на другой input
        }

        const editedStart = editedTime[`${employeeId}-${dayIndex}-start`] || "";
        const editedEnd = editedTime[`${employeeId}-${dayIndex}-end`] || "";

        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) return;

        const oldValue = employee.weekSchedule[day] || {start: "", end: ""};
        const hadOldValues = oldValue.start !== "" || oldValue.end !== "";
        const hasNewValues = editedStart !== "" || editedEnd !== "";

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        const isStartValid = editedStart === "" || timeRegex.test(editedStart);
        const isEndValid = editedEnd === "" || timeRegex.test(editedEnd);

        if (!hadOldValues && !hasNewValues) return;

        // Если раньше было значение, но пользователь удалил всё — откатываем к старым данным
        if (hadOldValues && !hasNewValues) {
            setEmployees(prev =>
                prev.map(emp =>
                    emp.id === employeeId
                        ? {
                            ...emp,
                            weekSchedule: {
                                ...emp.weekSchedule,
                                [day]: oldValue,
                            },
                        }
                        : emp
                )
            );
            setEditingCell(null);
            return;
        }

        // Если хотя бы одно поле некорректное — откатываем
        if (!isStartValid || !isEndValid) {
            setEmployees(prev =>
                prev.map(emp =>
                    emp.id === employeeId
                        ? {
                            ...emp,
                            weekSchedule: {
                                ...emp.weekSchedule,
                                [day]: oldValue,
                            },
                        }
                        : emp
                )
            );
            setEditingCell(null);
            return;
        }

        // Если оба поля пустые, а раньше было пусто — ничего не делаем
        if (!hadOldValues && (editedStart === "" || editedEnd === "")) return;

        // Обновляем данные
        setEmployees(prev =>
            prev.map(emp =>
                emp.id === employeeId
                    ? {
                        ...emp,
                        weekSchedule: {
                            ...emp.weekSchedule,
                            [day]: {
                                start: editedStart || oldValue.start,
                                end: editedEnd || oldValue.end,
                            },
                        },
                    }
                    : emp
            )
        );

        setEditingCell(null);

        const parsedWeek = parseWeekRange(currentWeek, currentTranslation);
        if (!parsedWeek) return;

        const {start, end} = parsedWeek;
        const newStart = new Date(start);

        // Костыль по месяцам сохраняем
        const formatDate = (date: Date) =>
            new Intl.DateTimeFormat("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "Europe/Moscow"
            })
                .format(date)
                .split(".")
                .reverse()
                .join("-");
        const formattedDate = formatDate(start);

        enqueueChange(
            employeeId,
            formattedDate,
            day,
            editedStart || oldValue.start,
            editedEnd || oldValue.end
        );
    };

    const enqueueChange = (employeeId: string, weekStart: string, day: string, start: string | null, end: string | null) => {
        setPendingChanges((prev) => {
            const updated = [...prev];
            const existing = updated.find(item => item.employeeId === employeeId && item.weekStart === weekStart);

            if (existing) {
                existing.schedule[day] = {start, end};
            } else {
                updated.push({
                    employeeId,
                    weekStart,
                    schedule: {
                        [day]: {start, end},
                    },
                });
            }

            pendingChangesRef.current = updated; // Сохраняем актуальное значение
            return updated;
        });

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            flushChanges();
        }, 2000);
    };


    const flushChanges = async () => {
        if (pendingChangesRef.current.length === 0) return;

        const payload = pendingChangesRef.current.map(change => ({
            employeeId: change.employeeId,
            weekStart: change.weekStart,
            schedule: change.schedule
        }));

        pendingChangesRef.current = []; // очистка ref
        setPendingChanges([]); // очистка state (для рендера)

        try {
            const token = localStorage.getItem("authToken");
            if (!token) throw new Error("Токен авторизации не найден");

            const response = await fetch("https://ssw-backend.onrender.com/schedule/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error("Ошибка при отправке:", await response.text());
            }
        } catch (error) {
            console.error("Ошибка при отправке расписания:", error);
        }
    };

    const handleClearTime = (employeeId: string, dayIndex: number, day: string) => {
        const parsedWeek = parseWeekRange(currentWeek, currentTranslation);
        if (!parsedWeek) return;

        const {start, end} = parsedWeek;

        const formatDate = (date: Date) =>
            new Intl.DateTimeFormat("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "Europe/Moscow"
            })
                .format(date)
                .split(".")
                .reverse()
                .join("-");
        const formattedDate = formatDate(start);

        setEmployees((prev) =>
            prev.map((employee) =>
                employee.id === employeeId
                    ? {
                        ...employee,
                        weekSchedule: {
                            ...employee.weekSchedule,
                            [day]: {start: "", end: ""},
                        },
                    }
                    : employee
            )
        );

        enqueueChange(employeeId, formattedDate, day, null, null);
    };

    useEffect(() => {
        const handleUnload = () => {
            flushChanges();
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!editingCell) return;

            if (e.key === "Escape") {
                setEditingCell(null);
            }

            if (e.key === "Enter") {
                const inputs = Array.from(document.querySelectorAll("input[type='time']")) as HTMLInputElement[];
                if (inputs.length === 0) return;

                const [startInput, endInput] = inputs;
                const {employeeId, dayIndex, day} = editingCell;

                if (startInput) {
                    const startValue = startInput.value;
                    handleEdit(employeeId, dayIndex, day, "start", startValue);
                }

                if (endInput) {
                    const endValue = endInput.value;
                    handleEdit(employeeId, dayIndex, day, "end", endValue);
                }

                setEditingCell(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [editingCell]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.filters-panel') &&
                !target.closest('.sidebar__btn[data-key="sidebar_filters"]') &&
                !target.closest('.header__up-blocks__headbar__btn')) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddEmployee = (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
        const projectsFromNewEmployee = employeeData.projects?.split(' ').filter(Boolean) || [];

        // Генерируем новый ID
        const newId = employees.length > 0
            ? Math.max(...employees.map(e => parseInt(e.id))) + 1
            : 1;

        // Создаем нового сотрудника с ID на первом месте
        const newEmployee: Employee = {
            id: newId.toString(),
            fio: employeeData.fio,
            projects: employeeData.projects || '',
            weekSchedule: employeeData.weekSchedule
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
                ? {...prev, projects: newProjects.sort()}
                : prev;
        });

        setIsAddEmployeePopupOpen(false);
        setNewEmployee({
            fio: '',
            projects: '',
            weekSchedule: {
                monday: {start: '', end: ''},
                tuesday: {start: '', end: ''},
                wednesday: {start: '', end: ''},
                thursday: {start: '', end: ''},
                friday: {start: '', end: ''},
                saturday: {start: '', end: ''},
                sunday: {start: '', end: ''},
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

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = 'index.html';
    };


    return (
        <div className="content" key={updateKey}>
            {/* Рендеринг порталов и компонентов */}

            {accessLevel === "OWNER" &&
                document.querySelector('.sidebar') &&
                ReactDOM.createPortal(
                    <button
                        className="sidebar__btn"
                        onClick={() => setIsAddEmployeePopupOpen(true)}
                    >
                        {currentTranslation.addAnEmployeeBR}
                    </button>,
                    document.querySelector('.sidebar') as Element
                )
            }
            {accessLevel === "OWNER" &&
                document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <button
                        className="header__up-blocks__headbar__btn"
                        onClick={() => setIsAddEmployeePopupOpen(true)}
                    >
                        {currentTranslation.addAnEmployee}
                    </button>,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }
            {accessLevel === "OWNER" &&
                isAddEmployeePopupOpen && (
                    <AddEmployeePopup
                        onClose={() => setIsAddEmployeePopupOpen(false)}
                        onSave={handleAddEmployee}
                        currentTranslation={currentTranslation}
                        filters={filters}
                        initialData={newEmployee}
                    />
                )}

            {accessLevel === "OWNER" &&
                document.querySelector('.sidebar') &&
                ReactDOM.createPortal(
                    <button
                        className="sidebar__btn"
                        onClick={() => setIsDeletePopupOpen(true)}
                    >
                        {currentTranslation.deleteAnEmployeeBR}
                    </button>,
                    document.querySelector('.sidebar') as Element
                )
            }
            {accessLevel === "OWNER" &&
                document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <button
                        className="header__up-blocks__headbar__btn"
                        onClick={() => setIsDeletePopupOpen(true)}
                    >
                        {currentTranslation.deleteAnEmployee}
                    </button>,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }
            {accessLevel === "OWNER" &&
                isDeletePopupOpen && (
                    <DeleteEmployeePopup
                        employees={employees}
                        onDelete={handleDeleteEmployee}
                        onClose={() => {
                            setIsDeletePopupOpen(false);
                            setSearchTerm('');
                            setSelectedEmployee(null);
                        }}
                        currentTranslation={currentTranslation}
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
            {showFilters && (
                ReactDOM.createPortal(
                    <FiltersPanel
                        filters={filters}
                        searchQuery={searchQueryEmployees}
                        currentTranslation={currentTranslation}
                        setSearchQuery={setSearchQueryEmployees}
                        toggleProjectFilter={toggleProjectFilter}
                        clearFilters={clearFilters}
                        setShowFilters={setShowFilters}
                    />,
                    document.querySelector('.sidebar') as Element
                )
            )}

            {document.querySelector('.header__up-blocks__headbar') &&
                ReactDOM.createPortal(
                    <button
                        className={`header__up-blocks__headbar__btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        data-key="sidebar_filters"
                    >
                        {currentTranslation.filters}
                    </button>,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            }
            {showFilters && (
                ReactDOM.createPortal(
                    <FiltersPanel
                        filters={filters}
                        searchQuery={searchQueryEmployees}
                        currentTranslation={currentTranslation}
                        setSearchQuery={setSearchQueryEmployees}
                        toggleProjectFilter={toggleProjectFilter}
                        clearFilters={clearFilters}
                        setShowFilters={setShowFilters}
                    />,
                    document.querySelector('.header__up-blocks__headbar') as Element
                )
            )}

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

            {(document.querySelector(".header__up-blocks__wrapper_icon-place") &&
                ReactDOM.createPortal(
                    (localStorage.getItem('userIcon') ? (
                        <img
                            src={localStorage.getItem('userIcon')!}
                            className='header__up-blocks__wrapper__icon_gen'
                            alt="User Icon" />
                    ) : (
                        <div className="header__up-blocks__wrapper__icon"></div>
                    )),
                    document.querySelector(".header__up-blocks__wrapper_icon-place") as Element
                )
            )}

            {/* Остальной JSX */}
            {isMobile ? (
                <>
                    {document.querySelector('.header__up-blocks__wrapper__list') &&
                        (localStorage.getItem("authToken") != null) &&
                        ReactDOM.createPortal(
                            <button
                                className="header__up-blocks__wrapper__list__btn"
                                onClick={() => handleLogout()}
                            >
                                {currentTranslation.exit}
                            </button>,
                            document.querySelector('.header__up-blocks__wrapper__list') as Element
                        )
                    }

                    <MobileEmployeeSearch
                        employees={displayedEmployees}
                        translations={currentTranslation}
                        editingCell={editingCell}
                        editedTime={editedTime}
                        onEdit={handleEdit}
                        onBlur={handleBlur}
                        onSetEditingCell={setEditingCell}
                        accessLevel={accessLevel}
                    />
                </>
            ) : (
                <>
                    {document.querySelector(".header__up-blocks__wrapper__list") &&
                        ReactDOM.createPortal(
                            <>
                                <a className="header__up-blocks__wrapper__list__btn" href="./index.html"
                                   data-key="home">{currentTranslation.home}</a>
                                <a className="header__up-blocks__wrapper__list__btn" href="./project.html"
                                   data-key="project">{currentTranslation.project}</a>
                            </>,
                            document.querySelector(".header__up-blocks__wrapper__list") as Element
                        )}

                    {document.querySelector('.header__up-blocks__wrapper__list') &&
                        (localStorage.getItem("authToken") != null) &&
                        ReactDOM.createPortal(
                            <button
                                className="header__up-blocks__wrapper__list__btn"
                                onClick={() => handleLogout()}
                            >
                                {currentTranslation.exit}
                            </button>,
                            document.querySelector('.header__up-blocks__wrapper__list') as Element
                        )
                    }

                    <div ref={containerRef} className="worksheet">
                        {filteredEmployees.length > 0 ? (
                            <>
                                <div className="worksheet__row__header">
                                    <div
                                        className="worksheet__row__header__cell header-cell">{currentTranslation.title}</div>
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
                                        // style={{ height: `${maxRowHeight}px` }}
                                    >
                                        <div className="worksheet__cell_name">{employee.fio}</div>
                                        <div
                                            className="worksheet__cell_clock">{calculateWorkHours(employee.weekSchedule)}{currentTranslation.hour}</div>
                                        {Object.keys(employee.weekSchedule).map((day: string, dayIndex: number) => {
                                            const schedule = employee.weekSchedule[day];

                                            return (
                                                <div key={dayIndex} className="worksheet__cell">
                                                    {editingCell?.employeeId === employee.id && editingCell?.day === day ? (
                                                        <>
                                                            <input
                                                                type="time"
                                                                value={
                                                                    editedTime[`${employee.id}-${dayIndex}-start`] || schedule.start
                                                                }
                                                                onChange={(e) =>
                                                                    handleEdit(employee.id, dayIndex, day, "start", e.target.value)
                                                                }
                                                                onBlur={(e) =>
                                                                    handleBlur(employee.id, dayIndex, day, "start", e)
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Escape") {
                                                                        setEditingCell(null);
                                                                    }
                                                                    if (e.key === "Enter") {
                                                                        handleBlur(employee.id, dayIndex, day, "start", null);
                                                                    }
                                                                }}
                                                            />
                                                            -
                                                            <input
                                                                type="time"
                                                                value={
                                                                    editedTime[`${employee.id}-${dayIndex}-end`] || schedule.end
                                                                }
                                                                onChange={(e) =>
                                                                    handleEdit(employee.id, dayIndex, day, "end", e.target.value)
                                                                }
                                                                onBlur={(e) =>
                                                                    handleBlur(employee.id, dayIndex, day, "end", e)
                                                                }
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Escape") {
                                                                        setEditingCell(null);
                                                                    }
                                                                    if (e.key === "Enter") {
                                                                        handleBlur(employee.id, dayIndex, day, "end", null);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                className="clear-time-btn"
                                                                onClick={() =>
                                                                    handleClearTime(employee.id, dayIndex, day)
                                                                }
                                                                title="Очистить время"
                                                                style={{
                                                                    marginLeft: "0.5em",
                                                                    cursor: "pointer",
                                                                    background: "none",
                                                                    border: "none",
                                                                    fontSize: "1em",
                                                                    color: "#888"
                                                                }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div
                                                            onClick={() => {
                                                                if (accessLevel === "OWNER" ||
                                                                    employee === employees[0]) { // If not current
                                                                    setEditingCell({
                                                                        employeeId: employee.id,
                                                                        day: day,
                                                                        dayIndex: dayIndex,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            {`${schedule?.start} - ${schedule?.end}`}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="no-results">
                                {currentTranslation.noResults}
                            </div>
                        )}
                    </div>
                    {document.querySelector(".footer") &&
                        (totalPages > 1) &&
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
