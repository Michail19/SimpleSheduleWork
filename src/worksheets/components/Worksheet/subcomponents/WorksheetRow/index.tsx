import React from 'react';
import { TimeInput } from './TimeInput';
import { calculateWorkHours } from '../../utils/scheduleUtils';
import type { Employee, Schedule } from '../../types';

interface WorksheetRowProps {
    employee: Employee;
    isEditing: boolean;
    translations: Record<string, string>;
    onEditStart: (day: string) => void;
    onEditEnd: (day: string, newSchedule: Schedule) => void;
}

export const WorksheetRow = React.memo(({
                                            employee,
                                            isEditing,
                                            translations,
                                            onEditStart,
                                            onEditEnd
                                        }: WorksheetRowProps) => {
    return (
        <div className="worksheet-row">
            <div className="name-cell">{employee.fio}</div>
            <div className="hours-cell">
                {calculateWorkHours(employee.weekSchedule)}
            </div>

            {Object.entries(employee.weekSchedule).map(([day, schedule]) => (
                <TimeInput
                    key={day}
                    day={day}
                    schedule={schedule}
                    label={translations[day]}
                    isEditing={isEditing}
                    onEditStart={() => onEditStart(day)}
                    onEditEnd={(newSchedule) => onEditEnd(day, newSchedule)}
                />
            ))}
        </div>
    );
});