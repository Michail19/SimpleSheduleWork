import {useEmployees} from "../../hooks/useEmployees";
import {useState} from "react";
import {Schedule} from "./types";
import {WorksheetRow} from "./subcomponents/WorksheetRow";
import React from "react";
import {translations} from "../../translations";

const Worksheet = () => {
    // 1. Состояние вынесено в хук useEmployees
    const { employees, updateSchedule } = useEmployees();
    const [editingDay, setEditingDay] = useState<string | null>(null);

    // 2. Обработчики передаются в пропсы
    const handleEditStart = (day: string) => {
        setEditingDay(day);
    };

    const handleEditEnd = (day: string, newSchedule: Schedule) => {
        updateSchedule(editingEmployeeId, day, newSchedule);
        setEditingDay(null);
    };

    return (
        <div className="worksheet">
            {employees.map(employee => (
                <WorksheetRow
                    key={employee.id}
                    employee={employee}
                    isEditing={editingDay !== null}
                    translations={translations}
                    onEditStart={handleEditStart}
                    onEditEnd={handleEditEnd}
                />
            ))}
        </div>
    );
};

export default Worksheet;
