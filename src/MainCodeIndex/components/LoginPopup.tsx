import React, { useState } from 'react';

interface LoginPopupProps {
    onClose: () => void;
    onLoginSuccess: (token: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://ssw-backend.onrender.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Неверное имя пользователя или пароль');
            }

            const data = await response.json();
            const token = data.token;

            // Сохраняем токен
            localStorage.setItem('authToken', token);
            onLoginSuccess(token);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-popup">
            <div className="login-content">
                <h2>Вход</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? (
                            <span className="loading-wrapper">
                                <span className="loading-dot">.</span>
                                <span className="loading-dot">.</span>
                                <span className="loading-dot">.</span>
                            </span>
                        ) : 'Войти'}
                    </button>
                </form>
                <button onClick={onClose}>Отмена</button>

                {/* Сообщение о долгой загрузке */}
                {loading && (
                    <div className="loading-message" id="loadingMessage">
                        Используется маломощный сервер, пожалуйста подождите...
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPopup;
