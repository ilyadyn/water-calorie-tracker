import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const response = await api.post('/auth/login', { username, password });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/dashboard';
        } else {
            setError('Ошибка сервера. Попробуйте еще раз.');
        }
    } catch (error) {
        if (error.response?.data?.error) {
            setError(error.response.data.error);
        } else if (error.code === 'ERR_NETWORK') {
            setError('Сервер недоступен. Попробуйте позже.');
        } else {
            setError('Неверное имя пользователя или пароль');
        }
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-container">
            <div className="login-form-box">
                <h1 className="login-title">Трекер здоровья</h1>
                <p className="login-subtitle">Вход в систему</p>
                {error && <p className="login-error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="login-input-group">
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            placeholder="Введите имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>
                    <div className="login-input-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <p className="login-text">
                    Нет аккаунта? <Link to="/register" className="login-link">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;