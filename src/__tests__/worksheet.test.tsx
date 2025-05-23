import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Worksheet from '../Worksheet';
import * as UserAccessLevel from '../UserAccessLevel';
import * as timeParsers from '../Worksheet/timeParsers';
import * as utils from '../Worksheet/utils';

// Мокаем fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () =>
            Promise.resolve({
                employees: [
                    {
                        id: '1',
                        fio: 'Иван Иванов',
                        projects: 'Проект1',
                        weekSchedule: {
                            monday: { start: '09:00', end: '17:00' },
                            tuesday: { start: '', end: '' },
                            wednesday: { start: '', end: '' },
                            thursday: { start: '', end: '' },
                            friday: { start: '', end: '' },
                            saturday: { start: '', end: '' },
                            sunday: { start: '', end: '' },
                        },
                    },
                ],
                currentWeek: '01.01 - 07.01',
            }),
    })
) as jest.Mock;

jest.mock('../UserAccessLevel', () => ({
    getUserAccessLevel: jest.fn(() => 'OWNER'),
    verifyToken: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('../Worksheet/timeParsers', () => ({
    translateMonth: jest.fn((w) => w),
    formatWeekRange: jest.fn((s, e, t) => '01.01 - 07.01'),
}));

jest.mock('../Worksheet/utils', () => ({
    calculateWorkHours: jest.fn(() => 8),
    filterEmployees: jest.fn((employees) => employees),
}));

describe('Worksheet', () => {
    it('renders employee data after fetch', async () => {
        render(<Worksheet />);

        // Ожидаем появления сотрудника
        await waitFor(() => {
            expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
        });

        // Проверка часов работы
        expect(screen.getByText(/8/)).toBeInTheDocument();

        // Проверка понедельника
        expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument();
    });

    it('opens AddEmployeePopup on button click', async () => {
        // Подготавливаем DOM для портала
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        document.body.appendChild(sidebar);

        render(<Worksheet />);

        await waitFor(() => {
            expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
        });

        // Кликаем по кнопке "Добавить сотрудника"
        const addButton = screen.getByText(/добавить/i);
        fireEvent.click(addButton);

        // Проверяем, что форма открытия добавления появилась
        await waitFor(() => {
            expect(screen.getByText(/сохранить/i)).toBeInTheDocument();
        });

        document.body.removeChild(sidebar);
    });
});
