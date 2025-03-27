import React, { useEffect, useState, useRef } from "react";
import ReactDOM from 'react-dom';

// Типы данных для расписания
interface Schedule {
    start: string;
    end: string;
}

interface Employee {
    fio: string;
    weekSchedule: {
        [day: string]: Schedule;
    };
}

interface Data {
    currentWeek: string;
    employees: Employee[];
}

type Language = "ru" | "en";

const translations: Record<Language, { [key: string]: string }> = {
    ru: {
        title: "Сотрудник",
        monday: "Понедельник",
        tuesday: "Вторник",
        wednesday: "Среда",
        thursday: "Четверг",
        friday: "Пятница",
        saturday: "Суббота",
        sunday: "Воскресенье",
        page: "Лист",
        outOf: "из",
        hour: "ч.",
        january: "Январь",
        february: "Февраль",
        march: "Март",
        april: "Апрель",
        may: "Май",
        june: "Июнь",
        july: "Июль",
        august: "Август",
        september: "Сентябрь",
        october: "Октябрь",
        november: "Ноябрь",
        december: "Декабрь",
    },
    en: {
        title: "Employee",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        page: "Page",
        outOf: "of",
        hour: "h.",
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
    },
};

const parseWeekRange = (weekRange: string, currentTranslation: any): { start: Date; end: Date } | null => {
    const match = weekRange.match(/(\d+)-(\d+)\s+(\S+)\s+(\d{4})/);
    if (!match) return null;

    const [, startDay, endDay, monthName, year] = match;

    // Найдем ключ месяца в переводах
    const monthKey = Object.keys(currentTranslation).find(key => currentTranslation[key] === monthName);
    if (!monthKey) return null;

    const monthIndex = Object.keys(translations.ru).indexOf(monthKey) - 7; // -7, т.к. первые 7 ключей - дни недели
    if (monthIndex < 0) return null;

    const startDate = new Date(parseInt(year, 10), monthIndex, parseInt(startDay, 10));
    const endDate = new Date(parseInt(year, 10), monthIndex, parseInt(endDay, 10));

    return { start: startDate, end: endDate };
};

const formatWeekRange = (start: Date, end: Date, currentTranslation: any): string => {
    const monthKey = Object.keys(translations.ru)[start.getMonth() + 7]; // +7, т.к. первые 7 ключей - дни недели
    const monthName = currentTranslation[monthKey];

    return `${start.getDate()}-${end.getDate()} ${monthName} ${start.getFullYear()}`;
};

const translateMonth = (weekString: string, currentTranslation: any): string => {
    const match = weekString.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
    if (!match) return weekString; // Если месяц не найден, вернуть строку как есть

    const englishMonth = match[0].toLowerCase(); // Найденный месяц
    const translatedMonth = currentTranslation[englishMonth] || englishMonth; // Перевод или оригинал

    return weekString.replace(new RegExp(englishMonth, "i"), translatedMonth); // Заменяем в строке
};

const Worksheet: React.FC = () => {
    const [data, setData] = useState<Data | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [currentWeek, setCurrentWeek] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [editingCell, setEditingCell] = useState<{ row: number; day: string; dayIndex: number } | null>(null);
    const [editedTime, setEditedTime] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1090);
    const [language, setLanguage] = useState<Language>("ru");
    const [updateKey, setUpdateKey] = useState(0);
    const currentTranslation = translations[language] ?? translations["ru"];

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
        fetch("/data/data_example.json")
            .then((response) => response.json())
            .then((data) => {
                setData(data);
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

    // Фиксируем `current` сотрудника на всех страницах
    const currentEmployee = employees.length > 0 ? employees[0] : null;
    const paginatedEmployees = employees.slice(1); // Убираем `current` из списка
    const totalPages = Math.ceil(paginatedEmployees.length / rowsPerPage);

    const displayedEmployees = [
        ...(currentEmployee ? [currentEmployee] : []), // Всегда добавляем `current`
        ...paginatedEmployees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    ];

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

        const handleBlur = (employeeIndex: number, dayIndex: number, day: string, type: "start" | "end") => {
        const editedStart = editedTime[`${employeeIndex}-${dayIndex}-start`];
        const editedEnd = editedTime[`${employeeIndex}-${dayIndex}-end`];

        const oldValue = employees[employeeIndex].weekSchedule[day] || { start: "", end: "" };
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        // Проверяем, что оба поля корректны
        if (!timeRegex.test(editedStart || "") || !timeRegex.test(editedEnd || "")) {
            setEmployees((prev) =>
                prev.map((employee, index) =>
                    index === employeeIndex
                        ? {
                            ...employee,
                            weekSchedule: {
                                ...employee.weekSchedule,
                                [day]: oldValue, // Оставляем старые значения, если ввод некорректный
                            },
                        }
                        : employee
                )
            );
            setEditingCell(null);
            return;
        }

        // Если оба поля заполнены, сохраняем в state
        setEmployees((prev) =>
            prev.map((employee, index) =>
                index === employeeIndex
                    ? {
                        ...employee,
                        weekSchedule: {
                            ...employee.weekSchedule,
                            [day]: { start: editedStart, end: editedEnd },
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


    return (
        <div className="content" key={updateKey}>
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
                                                        onBlur={() => handleBlur(0, dayIndex, day, "start")}
                                                    />
                                                    -
                                                    <input
                                                        type="time"
                                                        value={editedTime[`0-${dayIndex}-end`] || schedule.end}
                                                        onChange={(e) => handleEdit(0, dayIndex, day, "end", e.target.value)}
                                                        onBlur={() => handleBlur(0, dayIndex, day, "end")}
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
                                className={`worksheet__row ${index === 0 ? "current" : ""}`}
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
                                                        onBlur={() => handleBlur(index, dayIndex, day, "start")}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null); // Отмена редактирования
                                                            }
                                                            if (e.key === "Enter") {
                                                                handleBlur(index, dayIndex, day, "start")
                                                            }
                                                        }}
                                                    />
                                                    -
                                                    <input
                                                        type="time"
                                                        value={editedTime[`${index}-${dayIndex}-end`] || schedule.end}
                                                        onChange={(e) => handleEdit(index, dayIndex, day, "end", e.target.value)}
                                                        onBlur={() => handleBlur(index, dayIndex, day, "end")}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                setEditingCell(null); // Отмена редактирования
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
