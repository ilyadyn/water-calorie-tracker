import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './Register.css';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
    }

    setLoading(true);

    try {
        const response = await api.post('/auth/register', { 
            username, 
            email, 
            password
        });
        
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
            setError('Ошибка регистрации. Попробуйте еще раз.');
        }
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="register-container">
            <div className="register-form-box">
                <h1 className="register-title">Трекер здоровья</h1>
                <p className="register-subtitle">Создание аккаунта</p>
                {error && <p className="register-error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="register-input-group">
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            placeholder="Придумайте имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="register-input"
                            required
                        />
                    </div>
                    <div className="register-input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Введите email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="register-input"
                            required
                        />
                    </div>
                    <div className="register-input-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            placeholder="Придумайте пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="register-input"
                            required
                            minLength="6"
                        />
                    </div>
                    <div className="register-input-group">
                        <label>Подтверждение пароля</label>
                        <input
                            type="password"
                            placeholder="Повторите пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="register-input"
                            required
                            minLength="6"
                        />
                    </div>
                    <button type="submit" className="register-button" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="register-text">
                    Уже есть аккаунт? <Link to="/login" className="register-link">Войти</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;