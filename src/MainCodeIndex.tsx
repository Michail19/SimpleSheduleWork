import React, {useState} from "react";
import LoginPopup from "./LoginPopup";

const MainCodeIndex: React.FC = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));

    return (
        <>
            {!authToken && <button onClick={() => setShowLogin(true)}>Войти</button>}

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
