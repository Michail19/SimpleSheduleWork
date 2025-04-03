import React, { useState } from 'react';
import {Employee, Language} from '../types';
import {translations} from "../translations";

interface DeleteEmployeePopupProps {
    employees: Employee[];
    onDelete: (id: string) => void;
    onClose: () => void;
    currentTranslation: typeof translations[Language];
}

export const DeleteEmployeePopup: React.FC<DeleteEmployeePopupProps> = ({
                                                                            employees,
                                                                            onDelete,
                                                                            onClose,
                                                                            currentTranslation
                                                                        }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const filteredEmployees = employees.filter(employee =>
        employee.fio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="delete-popup" onClick={e => e.stopPropagation()}>
                <h2>{currentTranslation.deleteEmployee}</h2>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder={currentTranslation.searchPlaceholder}
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
                        <div className="no-results">{currentTranslation.noResults}</div>
                    )}
                </div>

                <div className="popup-actions">
                    <button className="popup-actions-btn" onClick={onClose}>{currentTranslation.cancel}</button>
                    <button
                        onClick={() => selectedEmployee && onDelete(selectedEmployee.id)}
                        disabled={!selectedEmployee}
                        className="popup-actions-btn danger-btn"
                    >
                        {currentTranslation.deleteSelected}
                    </button>
                </div>
            </div>
        </div>
    );
};
