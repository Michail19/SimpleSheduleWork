import { useState, useEffect } from 'react';

export const useWindowResize = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1090);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1090);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
};
