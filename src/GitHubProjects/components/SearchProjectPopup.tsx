import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface SearchProjectPopupProps {
    currentTranslation: typeof translations[Language];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setIsOpen: (open: boolean) => void;
    popupRef: React.RefObject<HTMLDivElement | null>;
}

export const SearchProjectPopup: React.FC<SearchProjectPopupProps> = ({
                                                                          currentTranslation,
                                                                          searchQuery,
                                                                          setSearchQuery,
                                                                          setIsOpen,
                                                                          popupRef
                                                                      }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="popup-search" ref={popupRef}>
            <div className="search-container">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={currentTranslation.searchByName}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    );
};