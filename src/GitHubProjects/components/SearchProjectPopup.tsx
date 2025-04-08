import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface SearchProjectPopupProps {
    currentTranslation: typeof translations[Language];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setIsOpen: (open: boolean) => void;
}

export const SearchProjectPopup: React.FC<SearchProjectPopupProps> = ({
                                                                          currentTranslation,
                                                                          searchQuery,
                                                                          setSearchQuery,
                                                                          setIsOpen
                                                                      }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsOpen]);

    return (
        <div className="popup-overlay" onClick={() => setIsOpen(false)}>
            <div
                className="popup-content popup-search"
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={currentTranslation.searchByName}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};
