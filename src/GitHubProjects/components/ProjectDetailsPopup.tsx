import {Project} from "../types";
import React from 'react';

interface ProjectDetailsPopupProps {
  project: Project;
  onClose: () => void;
  onEditEmployees: () => void; // Добавьте этот проп
}

const ProjectDetailsPopup: React.FC<ProjectDetailsPopupProps> = ({
                                                                   project,
                                                                   onClose,
                                                                   onEditEmployees
                                                                 }) => {
  return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <h2>{project.name}</h2>
          <p><strong>Описание:</strong> {project.description || 'Нет описания'}</p>

          <div className="employees-section">
            <div className="employees-header">
              <strong>Сотрудники:</strong>
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEmployees();
                  }}
                  className="add-employee-btn"
              >
                Управление сотрудниками
              </button>
            </div>

            <ul className="employees-list">
              {project.employees?.length ? (
                  project.employees.map((emp) => (
                      <li key={emp.id}>{emp.fio}</li>
                  ))
              ) : (
                  <li>Нет назначенных сотрудников</li>
              )}
            </ul>
          </div>

          <button onClick={onClose} className="close-btn">
            Закрыть
          </button>
        </div>
      </div>
  );
};

export default ProjectDetailsPopup;
