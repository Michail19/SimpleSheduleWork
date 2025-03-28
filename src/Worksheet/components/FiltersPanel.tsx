import React, { useRef, useEffect } from 'react';
import { FiltersState, Language } from '../types';
import { translations } from '../translations';

interface FiltersPanelProps {
    filters: FiltersState;
    searchQuery: string;
    currentTranslation: typeof translations[Language];
    setSearchQuery: (query: string) => void;
    toggleProjectFilter: (project: string) => void;
    clearFilters: () => void;
    setShowFilters: (show: boolean) => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
                                                              filters,
                                                              searchQuery,
                                                              currentTranslation,
                                                              setSearchQuery,
                                                              toggleProjectFilter,
                                                              clearFilters,
                                                              setShowFilters
                                                          }) => {
    const filteredProjects = filters.projects.filter(project =>
        project.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
            setShowFilters(false);
        }
    };

    return (
        <div className="filters-panel" onKeyDown={handleKeyDown} onClick={(e) => e.stopPropagation()}>
            <div className="search-container">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <h3>{currentTranslation.filters}</h3>

                <div className="filters-list">
                    {filteredProjects.map(project => (
                        <label key={project} className="filter-item">
                            <input
                                type="checkbox"
                                checked={filters.activeProjects.includes(project)}
                                onChange={() => toggleProjectFilter(project)}
                            />
                            <span>{project.replace('Project_', '')}</span>
                        </label>
                    ))}
                </div>

                <button
                    className="clear-filters-btn"
                    onClick={() => {
                        clearFilters();
                        setSearchQuery('');
                    }}
                    disabled={filters.activeProjects.length === 0 && !searchQuery}
                >
                    {currentTranslation.clearFilters}
                </button>
            </div>
        </div>
    );
};
