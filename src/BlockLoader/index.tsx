import React from 'react';
import './BlockLoader.css'; // стили отдельно или в глобальных стилях

const BlockLoader: React.FC = () => {
    return (
        <div className="block-preloader">
            <div className="loader"></div>
        </div>
    );
};

export default BlockLoader;
