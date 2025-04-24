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

    useEffect(() => {
        setCurrentAttached(project.employees);
    }, [project.employees]);

    const handleSave = async () => {
        // Вычисляем, кто добавлен и кто удалён
        const originalIds = new Set(project.employees.map(e => e.id));
        const currentIds = new Set(currentAttached.map(e => e.id));

        const added = currentAttached.filter(e => !originalIds.has(e.id));
        const removed = project.employees.filter(e => !currentIds.has(e.id));

        // Формируем payload в точном формате, как в curl-примере
        const payload = [];

        if (added.length > 0) {
            payload.push({
                action: 'add',
                fio: added.map(emp => ({ id: emp.id, fio: emp.fio })), // Важно: передаем массив {id, fio}
                project: project.name,
            });
        }

        if (removed.length > 0) {
            payload.push({
                action: 'remove',
                fio: removed.map(emp => ({ id: emp.id, fio: emp.fio })), // Аналогично для удаления
                project: project.name,
            });
        }

        if (payload.length === 0) {
            onClose(currentAttached);
            return;
        }

        // Проверяем токен
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Ошибка авторизации. Токен не найден.');
            return;
        }

        // Логируем payload для отладки
        console.log("Отправляемые данные:", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch('https://ssw-backend.onrender.com/projects/change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json(); // Попробуем прочитать тело ошибки
                console.error("Детали ошибки:", errorData);
                throw new Error(`Ошибка: ${response.status} - ${errorData.message || 'Неизвестная ошибка'}`);
            }

            // Всё успешно — закрываем попап
            onClose(currentAttached);
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            alert('Не удалось сохранить изменения. Проверьте консоль для деталей.');
        }
    };

    return (
        <div className="popup-overlay">
            <div className="employee-management-popup">
                <h2 className="popup-header">Управление сотрудниками: {project.name}</h2>

                <div className="search-section">
                    <input
                        type="text"
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск сотрудников..."
                    />
                </div>

                <div className="employees-lists">
                    <div className="attached-section">
                        <h3 className="section-header-h">Прикрепленные сотрудники</h3>
                        {currentAttached.length === 0 ? (
                            <p className="empty-message">Нет прикрепленных сотрудников</p>
                        ) : (
                            <ul className="employees-list">
                                {currentAttached.map(emp => (
                                    <li className="employees-element" key={`attached-${emp.id}`}>
                                        <span className="employees-element-name">{emp.fio}</span>
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
                        <h3 className="section-header-h">Доступные сотрудники</h3>
                        {availableEmployees.length === 0 ? (
                            <p className="empty-message">
                                {searchQuery ? 'Ничего не найдено' : 'Нет доступных сотрудников'}
                            </p>
                        ) : (
                            <ul className="employees-list">
                                {availableEmployees.map(emp => (
                                    <li className="employees-element" key={`available-${emp.id}`}>
                                        <span className="employees-element-name">{emp.fio}</span>
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
                    <button onClick={() => onClose(project.employees)} className="cancel-btn popup-actions-btn">
                        Закрыть
                    </button>
                    <button onClick={handleSave} className="save-btn popup-actions-btn">
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagementPopup;
