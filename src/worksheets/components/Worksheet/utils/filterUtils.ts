import { FiltersState } from '../types';

export function applyFilters(filters: FiltersState, employees: any[]) {
    return employees.filter(emp => filters.activeProjects.includes(emp.projects || ''));
}
