import React, {useEffect, useState} from "react";

interface AddEmployeePopupProps {
    initialData: EmployeeFormData;
    projectsList: string[];
    translations: Record<string, string>;
    onClose: () => void;
    onSave: (data: EmployeeFormData) => void;
}

const AddEmployeePopup = ({
                              initialData,
                              projectsList,
                              translations,
                              onClose,
                              onSave
                          }: AddEmployeePopupProps) => {
    const [employeeData, setEmployeeData] = useState(newEmployee);
    const [projectSuggestions, setProjectSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (employeeData.projects.includes(' ')) {
            const lastProject = employeeData.projects.split(' ').pop() || '';
            setProjectSuggestions(
                filters.projects.filter(p =>
                    p.toLowerCase().includes(lastProject.toLowerCase()) &&
                    !employeeData.projects.includes(p)
                )
            );
        }
    }, [employeeData.projects]);

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
            schedule: {
                ...prev.schedule,
                [day]: {
                    ...prev.schedule[day as keyof typeof prev.schedule],
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

                <div className="form-group">
                    <label>ФИО:</label>
                    <input
                        type="text"
                        name="fio"
                        value={employeeData.fio}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Проекты (через пробел):</label>
                    <input
                        type="text"
                        name="projects"
                        value={employeeData.projects}
                        onChange={handleChange}
                    />
                </div>

                <h3>График работы:</h3>
                {Object.entries(employeeData.schedule).map(([day, time]) => (
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
                    <button onClick={onClose}>Отмена</button>
                    <button
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

export default AddEmployeePopup;
