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
    const containerRef = useRef<HTMLDivElement | null>(null);

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
            const otherElementsHeight = 120; // Если есть отступы, доп. элементы

            const availableHeight = viewportHeight - headerHeight - dateSwitcherHeight - paginationHeight - otherElementsHeight;
            const rowHeight = document.querySelector(".worksheet__row")?.clientHeight || 40;

            const newRowsPerPage = Math.floor(availableHeight / rowHeight) || 10;
            console.log( Math.floor((viewportHeight - headerHeight - dateSwitcherHeight - paginationHeight - otherElementsHeight) / rowHeight));
            console.log( Math.floor((viewportHeight - headerHeight - otherElementsHeight) / rowHeight));

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

    const [editingCell, setEditingCell] = useState<{ row: number; day: number } | null>(null);
    const [editedTime, setEditedTime] = useState<Record<string, string>>({});

    const handleEdit = (row: number, day: number, type: string, value: string) => {
        setEditedTime((prev) => ({
            ...prev,
            [`${row}-${day}-${type}`]: value,
        }));
    };

    const handleBlur = (employeeIndex: number, day: number, type: string) => {
        setEditingCell(null);
        // TODO: отправить обновленные данные в state или API
    };

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
                        <div className="worksheet__cell">{employee.fio}</div>
                        <div className="worksheet__cell_clock">{calculateWorkHours(employee.weekSchedule)}ч.</div>
                        {Object.keys(employee.weekSchedule).map((day: string, dayIndex: number) => {
                            const schedule = employee.weekSchedule[day];
                            return (
                                <div key={dayIndex} className="worksheet__cell">
                                    {editingCell?.row === index && editingCell?.day === dayIndex ? (
                                        <>
                                            <input
                                                type="time"
                                                value={editedTime[`${index}-${dayIndex}-start`] || schedule.start}
                                                onChange={(e) => handleEdit(index, dayIndex, "start", e.target.value)}
                                                onBlur={() => handleBlur(index, dayIndex, "start")}
                                                autoFocus
                                            />
                                            -
                                            <input
                                                type="time"
                                                value={editedTime[`${index}-${dayIndex}-end`] || schedule.end}
                                                onChange={(e) => handleEdit(index, dayIndex, "end", e.target.value)}
                                                onBlur={() => handleBlur(index, dayIndex, "end")}
                                            />
                                        </>
                                    ) : (
                                        <div onClick={() => setEditingCell({ row: index, day: dayIndex })}>
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
