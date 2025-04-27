import React, {useEffect} from 'react';
import './BlockLoader.css'; // стили отдельно или в глобальных стилях

export function touch_on_load() {
    const button_hide = document.querySelector('.btn_worksheet');
    const footer_hide = document.querySelector('.footer');

    if (button_hide && footer_hide && localStorage.getItem('btn_state') !== 'hidden') {
        button_hide.classList.toggle('btn_worksheet_enable');
        footer_hide.classList.toggle('hide_content');
    }
}

const BlockLoader: React.FC = () => {
    return (
        <div className="block-preloader">
            <div className="loader"></div>
        </div>
    );
};

export default BlockLoader;
