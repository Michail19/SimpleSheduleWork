import React, { useState } from 'react';
import { Employee } from '../types';

interface DeleteEmployeePopupProps {
    employees: Employee[];
    onDelete: (id: string) => void;
    onClose: () => void;
}

export const DeleteEmployeePopup: React.FC<DeleteEmployeePopupProps> = ({
                                                                            employees,
                                                                            onDelete,
                                                                            onClose
                                                                        }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const filteredEmployees = employees.filter(employee =>
        employee.fio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="delete-popup" onClick={e => e.stopPropagation()}>
                <h2>Удаление сотрудника</h2>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Поиск по ФИО..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="employees-list">
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(employee => (
                            <div
                                key={employee.id}
                                className={`employee-item ${
                                    selectedEmployee?.id === employee.id ? 'selected' : ''
                                }`}
                                onClick={() => setSelectedEmployee(employee)}
                            >
                                <span>{employee.fio}</span>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">Сотрудники не найдены</div>
                    )}
                </div>

                <div className="popup-actions">
                    <button className="popup-actions-btn" onClick={onClose}>Отмена</button>
                    <button
                        onClick={() => selectedEmployee && onDelete(selectedEmployee.id)}
                        disabled={!selectedEmployee}
                        className="popup-actions-btn danger-btn"
                    >
                        Удалить выбранного
                    </button>
                </div>
            </div>
        </div>
    );
};
