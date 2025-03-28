import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { calculateWorkHours } from '../utils';

interface MobileEmployeeSearchProps {
    employees: Employee[];
    translations: Record<string, string>;
    editingCell: { row: number; day: string; dayIndex: number } | null;
    editedTime: Record<string, string>;
    onEdit: (row: number, dayIndex: number, day: string, type: string, value: string) => void;
    onBlur: (row: number, dayIndex: number, day: string, type: "start" | "end", event?: React.FocusEvent<HTMLInputElement> | null) => void;
    onSetEditingCell: (cell: { row: number; day: string; dayIndex: number } | null) => void;
}

export const MobileEmployeeSearch: React.FC<MobileEmployeeSearchProps> = ({
                                                                              employees,
                                                                              translations,
                                                                              editingCell,
                                                                              editedTime,
                                                                              onEdit,
                                                                              onBlur,
                                                                              onSetEditingCell,
                                                                          }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.fio.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    return (
        <div className="mobile-employee-search">
            {/* Кнопка поиска */}
            <button
                className="search-toggle"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
                {isSearchVisible ? '✕' : '🔍'}
            </button>

            {/* Поле поиска */}
            {isSearchVisible && (
                <div className="search-container">
                    <input
                        type="text"
                        placeholder={translations.searchByName}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            )}

            {/* Результаты */}
            <div className="employee-list">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee, rowIndex) => (
                        <div className="employee-card" key={employee.id}>
                            <div className="employee-header">
                                <h3>{employee.fio}</h3>
                                <span className="hours">
                  {calculateWorkHours(employee.weekSchedule)}{translations.hour}
                </span>
                            </div>

                            <div className="schedule-grid">
                                {Object.entries(employee.weekSchedule).map(([day, schedule], dayIndex) => (
                                    <div className="day-slot" key={day}>
                                        <div className="day-label">{translations[day]}</div>
                                        {editingCell?.row === rowIndex && editingCell?.day === day ? (
                                            <div className="time-inputs">
                                                <input
                                                    type="time"
                                                    value={editedTime[`${rowIndex}-${dayIndex}-start`] || schedule.start}
                                                    onChange={(e) => onEdit(rowIndex, dayIndex, day, "start", e.target.value)}
                                                    onBlur={(e) => onBlur(rowIndex, dayIndex, day, "start", e)}
                                                />
                                                <span>-</span>
                                                <input
                                                    type="time"
                                                    value={editedTime[`${rowIndex}-${dayIndex}-end`] || schedule.end}
                                                    onChange={(e) => onEdit(rowIndex, dayIndex, day, "end", e.target.value)}
                                                    onBlur={(e) => onBlur(rowIndex, dayIndex, day, "end", e)}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="time-display"
                                                onClick={() => onSetEditingCell({ row: rowIndex, day, dayIndex })}
                                            >
                                                {`${schedule.start} - ${schedule.end}`}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        {translations.noResults || "Сотрудники не найдены"}
                    </div>
                )}
            </div>
        </div>
    );
};
