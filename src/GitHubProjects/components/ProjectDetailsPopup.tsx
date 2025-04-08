import React, { useState } from 'react';
import { Employee, Project } from '../types';

interface ProjectDetailsPopupProps {
    project: Project;
    onClose: () => void;
    onAddEmployee: (employeeId: number) => void; // Функция для добавления сотрудника
    employeesList: Employee[]; // Список всех сотрудников из JSON
}

const ProjectDetailsPopup: React.FC<ProjectDetailsPopupProps> = ({
                                                                     project,
                                                                     onClose,
                                                                     onAddEmployee,
                                                                     employeesList
                                                                 }) => {
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

    const handleAddEmployee = () => {
        if (selectedEmployeeId) {
            onAddEmployee(selectedEmployeeId);
            setIsAddingEmployee(false);
            setSelectedEmployeeId(null);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h2>{project.name}</h2>
                <p><strong>Описание:</strong> {project.description || 'Нет описания'}</p>

                <div className="employees-section">
                    <div className="employees-header">
                        <strong>Сотрудники:</strong>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAddingEmployee(true);
                            }}
                            className="add-employee-btn"
                        >
                            + Добавить
                        </button>
                    </div>

                    <ul className="employees-list">
                        {project.employees?.length ? (
                            project.employees.map((emp, idx) => (
                                <li key={`${emp.id}-${idx}`}>{emp.fio}</li>
                            ))
                        ) : (
                            <li>Нет назначенных сотрудников</li>
                        )}
                    </ul>
                </div>

                {isAddingEmployee && (
                    <div className="add-employee-popup">
                        <h3>Выберите сотрудника</h3>
                        <select
                            value={selectedEmployeeId || ''}
                            onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                            className="employee-select"
                        >
                            <option value="">-- Выберите --</option>
                            {employeesList.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.fio}
                                </option>
                            ))}
                        </select>
                        <div className="popup-buttons">
                            <button
                                onClick={() => setIsAddingEmployee(false)}
                                className="cancel-btn"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleAddEmployee}
                                disabled={!selectedEmployeeId}
                                className="confirm-btn"
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                )}

                <button onClick={onClose} className="close-btn">
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default ProjectDetailsPopup;