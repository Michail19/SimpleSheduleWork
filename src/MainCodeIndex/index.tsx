import React, {useEffect, useState} from "react";
import LoginPopup from "./components/LoginPopup";
import ReactDOM from "react-dom";
import {translations} from "./translations";
import {Language} from "./types";
import ImageEditor from "../ImageEditor";

const MainCodeIndex: React.FC = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [language, setLanguage] = useState<Language>("ru");
    const currentTranslation = translations[language] ?? translations["ru"];
    const [iconReady, setIconReady] = useState(false);
    console.log(authToken);

    useEffect(() => {
        const savedIcon = localStorage.getItem('userIcon');
        if (!savedIcon) setIconReady(false);
    }, []);

    useEffect(() => {
        // Применяем сохранённые настройки языка при загрузке
        const langSetting = localStorage.getItem('changed-lang');
        if (langSetting === 'enabled') {
            setLanguage("en");
        } else {
            setLanguage("ru");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userIcon");
        setIconReady(false);
        window.location.href = 'index.html';
    };

    return (
        <>
            {window.innerWidth < 1090 ? (
                <>
                    {document.querySelector('.header__up-blocks__wrapper__list') &&
                        (localStorage.getItem("authToken") != null) &&
                        ReactDOM.createPortal(
                            <button
                                className="header__up-blocks__wrapper__list__btn"
                                onClick={() => handleLogout()}
                            >
                                {currentTranslation.exit}
                            </button>,
                            document.querySelector('.header__up-blocks__wrapper__list') as Element
                        )

                    }
                </>
            ) : (
                <>
                    {document.querySelector(".header__up-blocks__wrapper__list") &&
                        ReactDOM.createPortal(
                            <>
                                <a className="header__up-blocks__wrapper__list__btn" href="./main.html"
                                   data-key="schedule">{currentTranslation.schedule}</a>
                                <a className="header__up-blocks__wrapper__list__btn" href="./project.html"
                                   data-key="projects">{currentTranslation.project}</a>
                            </>,
                            document.querySelector(".header__up-blocks__wrapper__list") as Element
                        )}

                    {document.querySelector('.header__up-blocks__wrapper__list') &&
                        (localStorage.getItem("authToken") != null) &&
                        ReactDOM.createPortal(
                            <button
                                className="header__up-blocks__wrapper__list__btn"
                                onClick={() => handleLogout()}
                            >
                                {currentTranslation.exit}
                            </button>,
                            document.querySelector('.header__up-blocks__wrapper__list') as Element
                        )
                    }
                </>
            )}

            {!authToken ? (
                <button
                    className="header__up-blocks__wrapper__btn"
                    onClick={() => setShowLogin(true)}>Войти</button>
            ) : (
                document.querySelector(".header__up-blocks__wrapper_icon-place") &&
                        ReactDOM.createPortal(
                            (localStorage.getItem('userIcon') ? (
                                // <div className="header__up-blocks__wrapper__icon"></div>
                                    <img
                                        src={localStorage.getItem('userIcon')!}
                                        className='header__up-blocks__wrapper__icon_gen'
                                        alt="User Icon" />
                                ) : (
                                    <ImageEditor
                                        src="/images/account.png"
                                        letter="M"
                                        onRender={(dataUrl) => {
                                            localStorage.setItem('userIcon', dataUrl);
                                            setIconReady(true); // чтобы перерендерить, если нужно
                                        }}
                                    />
                                )),
                            document.querySelector(".header__up-blocks__wrapper_icon-place") as Element
                        )
            )}

            {showLogin && (
                <LoginPopup
                    onClose={() => setShowLogin(false)}
                    onLoginSuccess={(token) => {
                        setAuthToken(token);
                        console.log('Вошли с токеном:', token);
                    }}
                />
            )}
        </>
    );
}

export default MainCodeIndex;
