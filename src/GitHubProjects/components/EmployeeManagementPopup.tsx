import React, { useState, useEffect, useRef } from 'react';

interface Employee {
    id: number;
    fio: string;
}

interface Project {
    id: number;
    name: string;
    employees: Employee[];
}

interface EmployeeManagementPopupProps {
    project: Project;
    allEmployees: Employee[];
    onClose: (updatedEmployees: Employee[]) => void;
}

const EmployeeManagementPopup: React.FC<EmployeeManagementPopupProps> = ({
                                                                             project,
                                                                             allEmployees,
                                                                             onClose,
                                                                         }) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentAttached, setCurrentAttached] = useState<Employee[]>(project.employees);
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

    // Фильтрация сотрудников
    useEffect(() => {
        const filtered = allEmployees.filter(emp =>
            emp.fio.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !currentAttached.some(attached => attached.id === emp.id)
        );
        setAvailableEmployees(filtered);
    }, [searchQuery, currentAttached, allEmployees]);

    const handleAttach = (employee: Employee) => {
        setCurrentAttached(prev => [...prev, employee]);
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    const handleDetach = (employeeId: number) => {
        setCurrentAttached(prev => prev.filter(emp => emp.id !== employeeId));
    };

    const handleSave = () => {
        onClose(currentAttached);
    };

    return (
        <div className="popup-overlay">
            <div className="employee-management-popup">
                <h2>Управление сотрудниками: {project.name}</h2>

                <div className="search-section">
                    <input
                        type="text"
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск сотрудников..."
                        className="search-input"
                    />
                </div>

                <div className="employees-lists">
                    <div className="attached-section">
                        <h3>Прикрепленные сотрудники</h3>
                        {currentAttached.length === 0 ? (
                            <p className="empty-message">Нет прикрепленных сотрудников</p>
                        ) : (
                            <ul className="employees-list">
                                {currentAttached.map(emp => (
                                    <li key={`attached-${emp.id}`}>
                                        <span>{emp.fio}</span>
                                        <button
                                            onClick={() => handleDetach(emp.id)}
                                            className="action-btn detach-btn"
                                        >
                                            −
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="available-section">
                        <h3>Доступные сотрудники</h3>
                        {availableEmployees.length === 0 ? (
                            <p className="empty-message">
                                {searchQuery ? 'Ничего не найдено' : 'Нет доступных сотрудников'}
                            </p>
                        ) : (
                            <ul className="employees-list">
                                {availableEmployees.map(emp => (
                                    <li key={`available-${emp.id}`}>
                                        <span>{emp.fio}</span>
                                        <button
                                            onClick={() => handleAttach(emp)}
                                            className="action-btn attach-btn"
                                        >
                                            +
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="popup-actions">
                    <button onClick={handleSave} className="save-btn">
                        Сохранить изменения
                    </button>
                    <button onClick={() => onClose(project.employees)} className="cancel-btn">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagementPopup;
