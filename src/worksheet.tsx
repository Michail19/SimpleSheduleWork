import React from 'react'

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

const Worksheet = () => {
    const rows = Array.from({ length: 8 }, (_, rowIndex) => ({
        isCurrent: rowIndex === 0, // Первая строка получает класс "current"
        cells: Array.from({ length: 9 }, (_, cellIndex) => ({
            className: cellIndex === 1 ? "worksheet__cell_clock" : "worksheet__cell",
            content: 1
        }))
    }));

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
            {rows.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    className={`worksheet__row ${row.isCurrent ? "current" : ""}`}
                >
                    {row.cells.map((cell, cellIndex) => (
                        <div key={cellIndex} className={cell.className}>
                            {cell.content}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Worksheet;
