import React, {useState, useMemo, useEffect} from 'react';
import { Employee } from '../types';
import { calculateWorkHours } from '../utils';

interface MobileEmployeeSearchProps {
    employees: Employee[];
    translations: Record<string, string>;
    editingCell: { employeeId: string; day: string; dayIndex: number } | null;
    editedTime: Record<string, string>;
    onEdit: (employeeId: string, dayIndex: number, day: string, type: string, value: string) => void;
    onBlur: (employeeId: string, dayIndex: number, day: string, type: "start" | "end", event?: React.FocusEvent<HTMLInputElement> | null) => void;
    onSetEditingCell: (cell: { employeeId: string; day: string; dayIndex: number } | null) => void;
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
    const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee =>
            employee.fio.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    useEffect(() => {
        setCurrentEmployeeIndex(0);
    }, [filteredEmployees]);

    const currentEmployee = filteredEmployees[currentEmployeeIndex];

    return (
        <div className="mobile-employee-search">
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
                    <>
                        {/* Отображаем только текущую карточку */}
                        <div className="employee-card" key={filteredEmployees[currentEmployeeIndex].id}>
                            <div className="employee-header">
                                <h3>{filteredEmployees[currentEmployeeIndex].fio}</h3>
                                <span className="hours">
                                    {calculateWorkHours(filteredEmployees[currentEmployeeIndex].weekSchedule)}{translations.hour}
                                </span>
                            </div>

                            <div className="schedule-grid">
                                {Object.entries(filteredEmployees[currentEmployeeIndex].weekSchedule).map(([day, schedule], dayIndex) => (
                                    <div className="day-slot" key={day}>
                                        <div className="day-label">{translations[day]}</div>
                                        {editingCell?.employeeId === currentEmployee.id && editingCell?.day === day ? (
                                            <div className="time-inputs">
                                                <input
                                                    type="time"
                                                    value={editedTime[`${currentEmployee.id}-${dayIndex}-start`] || schedule.start}
                                                    onChange={(e) => onEdit(currentEmployee.id, dayIndex, day, "start", e.target.value)}
                                                    onBlur={(e) => onBlur(currentEmployee.id, dayIndex, day, "start", e)}
                                                />
                                                <span>-</span>
                                                <input
                                                    type="time"
                                                    value={editedTime[`${currentEmployee.id}-${dayIndex}-end`] || schedule.end}
                                                    onChange={(e) => onEdit(currentEmployee.id, dayIndex, day, "end", e.target.value)}
                                                    onBlur={(e) => onBlur(currentEmployee.id, dayIndex, day, "end", e)}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="time-display"
                                                onClick={() => onSetEditingCell({
                                                    employeeId: currentEmployee.id,
                                                    day: day,
                                                    dayIndex: dayIndex
                                                })}
                                            >
                                                {`${schedule?.start} - ${schedule?.end}`}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="slot">
                                    {/* Кнопка поиска */}
                                    <button
                                        className="search-toggle"
                                        onClick={() => setIsSearchVisible(!isSearchVisible)}
                                    >
                                        {isSearchVisible ? '✕' : '🔍'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Навигация между карточками — ТОЛЬКО при активном поиске */}
                        {isSearchVisible && filteredEmployees.length > 1 && (
                            <div className="footer">
                                <button
                                    className="footer__btn"
                                    disabled={currentEmployeeIndex === 0}
                                    onClick={() => setCurrentEmployeeIndex(prev => Math.max(0, prev - 1))}
                                >
                                    ◄
                                </button>
                                <span className="footer__place">{currentEmployeeIndex + 1} / {filteredEmployees.length}</span>
                                <button
                                    className="footer__btn"
                                    disabled={currentEmployeeIndex >= filteredEmployees.length - 1}
                                    onClick={() => setCurrentEmployeeIndex(prev => Math.min(filteredEmployees.length - 1, prev + 1))}
                                >
                                    ►
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-results">
                        {translations.noResults || "Сотрудники не найдены"}
                    </div>
                )}
            </div>
        </div>
    );
};
