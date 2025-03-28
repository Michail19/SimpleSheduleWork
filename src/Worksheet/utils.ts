import {Employee, FiltersState, Schedule} from './types';

export const calculateWorkHours = (time: { [day: string]: Schedule }): string => {
    let totalHours = 0;

    Object.values(time).forEach((item) => {
        if (!item?.start || !item?.end) return;

        const startTime = new Date(`1970-01-01T${item.start}:00`);
        const endTime = new Date(`1970-01-01T${item.end}:00`);

        if (endTime >= startTime) {
            totalHours += (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        } else {
            const midnight = new Date("1970-01-02T00:00:00");
            totalHours += (midnight.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            totalHours += (endTime.getTime() - new Date("1970-01-01T00:00:00").getTime()) / (1000 * 60 * 60);
        }
    });

    let result = totalHours.toFixed(1);
    if (result[result.length - 1] != '0') return result;
    return Math.round(totalHours).toString();
};

export const filteredEmployees = (employees: Employee[], filters: FiltersState, searchQuery: string) => {
    let result = employees;

    if (filters.activeProjects.length > 0) {
        result = result.filter(employee => {
            const employeeProjects = employee.projects?.split(' ') || [];
            return filters.activeProjects.some(project => employeeProjects.includes(project));
        });
    }

    if (searchQuery) {
        result = result.filter(employee =>
            employee.fio.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return result;
};