import React, { useEffect, useState } from 'react'

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

    const calculateWorkHours = (time: Schedule[]): number => {
        let diff = 0;
        for (let i = 0; i < time.length; i++) {
            if (!time[i] || !time[i].start || !time[i].end) continue; // Защита от пустых данных

            const startTime = new Date(`1970-01-01T${time[i].start}:00`);
            const endTime = new Date(`1970-01-01T${time[i].end}:00`);

            if (endTime > startTime) {
                diff += (endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60; // Разница в часах
            }
        }
        return diff;
    };

    return (
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
                <div key={index} className="worksheet__row">
                    <div className="worksheet__cell">{employee.fio}</div>
                    <div className="worksheet__cell_clock">{calculateWorkHours(employee.weekSchedule)}</div>
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
    );
};

export default Worksheet;
