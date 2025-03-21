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
        <>
            {document.querySelector(".subtitle__date__place") &&
                ReactDOM.createPortal(
                    <span className="subtitle__date__place_text">{currentWeek}</span>,
                    document.querySelector(".subtitle__date__place") as Element
                )}
            <div ref={containerRef} className="worksheet">
                <div className="worksheet__row__header">
                    <div className="worksheet__row__header__cell header-cell">Сотрудник</div>
                    <div className="worksheet__row__header__cell_clock">
                        <div className="cell_clock_img"></div>
                    </div>
                    <div className="worksheet__row__header__cell">Понедельник</div>
                    <div className="worksheet__row__header__cell">Вторник</div>
                    <div className="worksheet__row__header__cell">Среда</div>
                    <div className="worksheet__row__header__cell">Четверг</div>
                    <div className="worksheet__row__header__cell">Пятница</div>
                    <div className="worksheet__row__header__cell">Суббота</div>
                    <div className="worksheet__row__header__cell">Воскресенье</div>
                </div>
                {displayedEmployees.map((employee, index) => (
                    <div
                        key={index}
                        className={`worksheet__row ${index === 0 ? "current" : ""}`}
                    >
                        <div className="worksheet__cell_name">{employee.fio}</div>
                        <div className="worksheet__cell_clock">{calculateWorkHours(employee.weekSchedule)}ч.</div>
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
                            Лист {currentPage} из {totalPages}
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
    );
};

export default Worksheet;
