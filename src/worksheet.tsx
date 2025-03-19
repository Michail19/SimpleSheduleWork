import React, { useEffect, useState } from 'react';
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

    const changeWeek = (direction: "next" | "previous") => {
        // Логика для изменения недели, можно использовать библиотеку moment.js для работы с датами
        const current = new Date(currentWeek);
        const newDate = direction === "next" ? current.setDate(current.getDate() + 7) : current.setDate(current.getDate() - 7);
        setCurrentWeek(new Date(newDate).toISOString().split('T')[0]); // Изменение на новую дату
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
        console.log(result[result.length - 1]);
        if (result[result.length - 1] != '0') return result;
        else return Math.round(totalHours).toString();
    };

    return (
        <>
            {document.querySelector(".subtitle__date__place") &&
                ReactDOM.createPortal(
                    <span className="subtitle__date__place_text">{currentWeek}</span>,
                    document.querySelector(".subtitle__date__place") as Element
                )}
            <div className="worksheet">
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
                {employees.map((employee, index) => (
                    <div
                        key={index}
                        className={`worksheet__row ${index === 0 ? "current" : ""}`}
                    >
                        <div className="worksheet__cell">{employee.fio}</div>
                        <div className="worksheet__cell_clock">{calculateWorkHours(employee.weekSchedule)}ч.</div>
                        {Object.keys(employee.weekSchedule).map((day, dayIndex) => {
                            const schedule = employee.weekSchedule[day];
                            return (
                                <div key={dayIndex} className="worksheet__cell">
                                    <div>{`${schedule.start} - ${schedule.end}`}</div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Worksheet;
