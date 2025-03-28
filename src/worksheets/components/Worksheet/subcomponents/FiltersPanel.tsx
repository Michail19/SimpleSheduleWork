import React, { useRef, useEffect } from 'react';
import { FiltersState } from '../types';

interface FiltersPanelProps {
    filters: FiltersState;
    searchQuery: string;
    translations: Record<string, string>;
    onToggleFilter: (project: string) => void;
    onClearFilters: () => void;
    onSearchChange: (query: string) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
                                                       filters,
                                                       searchQuery,
                                                       translations,
                                                       onToggleFilter,
                                                       onClearFilters,
                                                       onSearchChange
                                                   }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
            onClearFilters();
        }
    };

    const filteredProjects = filters.projects.filter(project =>
        project.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className="filters-panel"
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="search-container">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={translations.searchByName || 'Search...'}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <h3>{translations.filters}</h3>

                <div className="filters-list">
                    {filteredProjects.map(project => (
                        <label key={project} className="filter-item">
                            <input
                                type="checkbox"
                                checked={filters.activeProjects.includes(project)}
                                onChange={() => onToggleFilter(project)}
                            />
                            <span>{project.replace('Project_', '')}</span>
                        </label>
                    ))}
                </div>

                <button
                    className="clear-filters-btn"
                    onClick={onClearFilters}
                    disabled={filters.activeProjects.length === 0 && !searchQuery}
                >
                    {translations.clearFilters}
                </button>
            </div>
        </div>
    );
};

export default FiltersPanel;
