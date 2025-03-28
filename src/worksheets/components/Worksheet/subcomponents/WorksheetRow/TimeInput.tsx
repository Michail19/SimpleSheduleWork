import React, { useState } from 'react';
import type { Schedule } from '../../types';

interface TimeInputProps {
    day: string;
    schedule: Schedule;
    label: string;
    isEditing: boolean;
    onEditStart: () => void;
    onEditEnd: (schedule: Schedule) => void;
}

export const TimeInput = ({
                              day,
                              schedule,
                              label,
                              isEditing,
                              onEditStart,
                              onEditEnd
                          }: TimeInputProps) => {
    const [localSchedule, setLocalSchedule] = useState(schedule);

    const handleSave = () => {
        onEditEnd(localSchedule);
    };

    return (
        <div className="time-cell" onClick={!isEditing ? onEditStart : undefined}>
            {isEditing ? (
                <>
                    <input
                        type="time"
                        value={localSchedule.start}
                        onChange={(e) =>
                            setLocalSchedule(prev => ({ ...prev, start: e.target.value }))
                        }
                    />
                    <span>-</span>
                    <input
                        type="time"
                        value={localSchedule.end}
                        onChange={(e) =>
                            setLocalSchedule(prev => ({ ...prev, end: e.target.value }))
                        }
                    />
                    <button onClick={handleSave}>✓</button>
                </>
            ) : (
                <span>{`${schedule.start} - ${schedule.end}`}</span>
            )}
        </div>
    );
};
