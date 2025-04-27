import {Language, Project} from "../types";
import React from 'react';
import {getUserAccessLevel} from "../../UserAccessLevel";
import {translations} from "../translations";

interface ProjectDetailsPopupProps {
    project: Project;
    onClose: () => void;
    onEditEmployees: () => void; // Добавьте этот проп
    currentTranslation: typeof translations[Language];
}

const ProjectDetailsPopup: React.FC<ProjectDetailsPopupProps> = ({
                                                                     project,
                                                                     onClose,
                                                                     onEditEmployees,
                                                                     currentTranslation,
                                                                 }) => {
    const accessLevel = getUserAccessLevel() || "OWNER";
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h2>{project.name}</h2>
                <p><strong>Описание:</strong> {project.description || 'Нет описания'}</p>

                <div className="employees-section">
                    <div className="employees-header">
                        <strong className="employees-header-text">Сотрудники:</strong>
                        {accessLevel === "OWNER" &&
                            window.innerHeight > 500 &&
                            window.innerWidth > 786 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEmployees();
                                }}
                                className="add-employee-btn"
                            >
                                {currentTranslation.controlEmployee}
                            </button>
                        )}
                    </div>

                    <ul className="employees-list">
                        {project.employees?.length ? (
                            project.employees.map((emp) => (
                                <li className="employees-element" key={emp.id}>{emp.fio}</li>
                            ))
                        ) : (
                            <li className="employees-element">{currentTranslation.noEmployee}</li>
                        )}
                    </ul>
                </div>

                <button onClick={onClose} className="close-btn">×</button>
            </div>
        </div>
    );
};

export default ProjectDetailsPopup;
