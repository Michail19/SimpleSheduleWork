import React, { useState, useEffect } from 'react';
import {Employee, FiltersState, Language} from '../types';
import { translations } from '../translations';

interface AddEmployeePopupProps {
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id'> & { id?: string }) => void;
    currentTranslation: typeof translations[Language];
    filters: FiltersState;
    initialData?: Omit<Employee, 'id'> & { id?: string };
}

export const AddEmployeePopup: React.FC<AddEmployeePopupProps> = ({
                                                                      onClose,
                                                                      onSave,
                                                                      currentTranslation,
                                                                      filters,
                                                                      initialData
                                                                  }) => {
    const [employeeData, setEmployeeData] = useState<Omit<Employee, 'id'> & { id?: string }>({
        fio: '',
        projects: '',
        weekSchedule: {
            monday: { start: '', end: '' },
            tuesday: { start: '', end: '' },
            wednesday: { start: '', end: '' },
            thursday: { start: '', end: '' },
            friday: { start: '', end: '' },
            saturday: { start: '', end: '' },
            sunday: { start: '', end: '' },
        }
    });

    const [projectSuggestions, setProjectSuggestions] = useState<string[]>([]);

    // Инициализация начальными данными
    useEffect(() => {
        if (initialData) {
            setEmployeeData(initialData);
        }
    }, [initialData]);

    // Подсказки проектов
    useEffect(() => {
        if (employeeData.projects?.includes(' ')) {
            const lastProject = employeeData.projects.split(' ').pop() || '';
            setProjectSuggestions(
                filters.projects.filter(p =>
                    p.toLowerCase().includes(lastProject.toLowerCase()) &&
                    !employeeData.projects?.includes(p)
                )
            );
        }
    }, [employeeData.projects, filters.projects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleScheduleChange = (day: string, type: 'start' | 'end', value: string) => {
        setEmployeeData(prev => ({
            ...prev,
            weekSchedule: {
                ...prev.weekSchedule,
                [day]: {
                    ...prev.weekSchedule[day],
                    [type]: value
                }
            }
        }));
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="add-employee-popup" onClick={e => e.stopPropagation()}>
                <h2>Добавить сотрудника</h2>
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="search-container">
                    <label>ФИО:</label>
                    <input
                        type="text"
                        name="fio"
                        value={employeeData.fio}
                        onChange={handleChange}
                    />
                </div>

                <div className="search-container">
                    <label>Проекты (через пробел):</label>
                    <input
                        type="text"
                        name="projects"
                        value={employeeData.projects}
                        onChange={handleChange}
                    />
                </div>

                <h3>График работы:</h3>
                {Object.entries(employeeData.weekSchedule).map(([day, time]) => (
                    <div key={day} className="schedule-row">
                        <label>{currentTranslation[day as keyof typeof currentTranslation]}:</label>
                        <input
                            type="time"
                            value={time.start}
                            onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                        />
                        <span>-</span>
                        <input
                            type="time"
                            value={time.end}
                            onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                        />
                    </div>
                ))}

                <div className="popup-actions">
                    <button className="popup-actions-btn" onClick={onClose}>Отмена</button>
                    <button
                        className="popup-actions-btn"
                        onClick={() => onSave(employeeData)}
                        disabled={!employeeData.fio.trim()}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};