import React from "react";
import {Employee} from "../types";

interface DeleteEmployeePopupProps {
    employees: Employee[];
    translations: Record<string, string>;
    onClose: () => void;
    onDelete: (id: string) => void;
}

const DeleteEmployeePopup = ({
                                 employees,
                                 translations,
                                 onClose,
                                 onDelete
                             }: DeleteEmployeePopupProps) => {
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
                    <button onClick={onClose}>Отмена</button>
                    <button
                        onClick={() => selectedEmployee && onDelete(selectedEmployee.id)}
                        disabled={!selectedEmployee}
                        className="danger-btn"
                    >
                        Удалить выбранного
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteEmployeePopup;
