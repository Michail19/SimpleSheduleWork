import React from 'react'

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
