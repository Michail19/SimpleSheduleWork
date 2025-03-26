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
    },
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
                setCurrentWeek(data.currentWeek);
            })
            .catch((error) => console.error("Ошибка при загрузке данных:", error));
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
        // Логика для изменения недели, можно использовать библиотеку moment.js для работы с датами
        const current = new Date(currentWeek);
        const newDate = direction === "next" ? current.setDate(current.getDate() + 7) : current.setDate(current.getDate() - 7);
        setCurrentWeek(new Date(newDate).toISOString().split('T')[0]); // Изменение на новую дату
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

            if (endTime > startTime) {
                totalHours += (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Разница в часах
            }
        });

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

    const handleBlur = (employeeIndex: number, dayIndex: number, day: string, type: string) => {
        const editedValue = editedTime[`${employeeIndex}-${dayIndex}-${type}`];
        const oldValue = employees[employeeIndex].weekSchedule[day];
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        // Если значение отсутствует, сохраняем старое значение
        if (editedValue === undefined || editedValue === "" || !timeRegex.test(editedValue)) {
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

        // Сохраняем новое значение
        setEmployees((prev) =>
            prev.map((employee, index) =>
                index === employeeIndex
                    ? {
                        ...employee,
                        weekSchedule: {
                            ...employee.weekSchedule,
                            [day]: {
                                ...employee.weekSchedule[day],
                                [type]: editedValue,
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


    return (
        <div className="content" key={updateKey}>
            {document.querySelector(".subtitle__date__place") &&
                ReactDOM.createPortal(
                    <span className="subtitle__date__place_text">{currentWeek}</span>,
                    document.querySelector(".subtitle__date__place") as Element
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
