import {Employee, Schedule} from "../../types";

export interface WorksheetRowHandlers {
    onEditStart: (day: string) => void;
    onEditEnd: (day: string, schedule: Schedule) => void;
}

export type WorksheetRowProps = {
    employee: Employee;
    isEditing: boolean;
    translations: Record<string, string>;
} & WorksheetRowHandlers;
