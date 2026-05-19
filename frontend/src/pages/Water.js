import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Water.css';

function Water() {
    const [amount, setAmount] = useState('');
    const [waterTotal, setWaterTotal] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [message, setMessage] = useState('');
    const [todayRecords, setTodayRecords] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchWaterData();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setWaterGoal(response.data.daily_water_goal);
        } catch (error) {
            console.error('Ошибка загрузки профиля');
        }
    };

    const fetchWaterData = async () => {
        try {
            const response = await api.get('/water/today');
            setWaterTotal(response.data.total);

            const detailsResponse = await api.get('/water/details/' + new Date().toISOString().split('T')[0]);
            setTodayRecords(detailsResponse.data);
        } catch (error) {
            console.error('Ошибка загрузки данных');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;
        
        try {
            await api.post('/water/add', { amount: parseInt(amount) });
            setMessage(`Добавлено ${amount} мл воды`);
            setAmount('');
            fetchWaterData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка добавления записи');
        }
    };

    const handleQuickAdd = async (value) => {
        try {
            await api.post('/water/add', { amount: value });
            setMessage(`Добавлено ${value} мл`);
            fetchWaterData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка добавления');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/water/delete/${id}`);
            fetchWaterData();
            setMessage('Запись удалена');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка удаления');
        }
    };

    const waterPercent = Math.min((waterTotal / waterGoal) * 100, 100);
    const remaining = Math.max(waterGoal - waterTotal, 0);
    const quickAddAmounts = [100, 200, 300, 500];

    const glassesCount = Math.ceil(remaining / 250);

    return (
        <div className="water-container">
            <header className="water-header">
                <h1 className="water-logo">Трекер здоровья</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="water-logout-btn">Выйти</button>
            </header>

            <nav className="water-nav">
                <button onClick={() => navigate('/dashboard')} className="water-nav-btn">Главная</button>
                <button onClick={() => navigate('/water')} className="water-nav-btn active">Вода</button>
                <button onClick={() => navigate('/calories')} className="water-nav-btn">Калории</button>
                <button onClick={() => navigate('/history')} className="water-nav-btn">История</button>
                <button onClick={() => navigate('/stats')} className="water-nav-btn">Статистика</button>
                <button onClick={() => navigate('/profile')} className="water-nav-btn">Профиль</button>
                <button onClick={() => navigate('/measurements')} className="water-nav-btn">Замеры</button>
            </nav>

            <main className="water-main">
                <h2 className="water-subtitle">Потребление воды</h2>
                
                {message && <p className="water-message">{message}</p>}

                <div className="water-content">
                    <div className="water-progress-section">
                        <div className="water-circle-container">
                            <div className="water-circle">
                                <svg width="200" height="200" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="90" fill="none" stroke="#e0e0e0" strokeWidth="12"/>
                                    <circle 
                                        cx="100" 
                                        cy="100" 
                                        r="90" 
                                        fill="none" 
                                        stroke="#4a90e2" 
                                        strokeWidth="12"
                                        strokeDasharray={`${2 * Math.PI * 90}`}
                                        strokeDashoffset={`${2 * Math.PI * 90 * (1 - waterPercent / 100)}`}
                                        transform="rotate(-90 100 100)"
                                        style={{transition: 'stroke-dashoffset 0.5s ease'}}
                                    />
                                </svg>
                                <div className="circle-text">
                                    <span className="circle-value">{waterTotal}</span>
                                    <span className="circle-unit">мл</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="water-stats">
                            <p className="water-remaining">
                                Осталось выпить: <strong>{remaining} мл</strong>
                                <br/>
                                <small>Примерно {glassesCount} стакан(ов) по 250 мл</small>
                            </p>
                            <div className="water-progress-bar">
                                <div className="water-progress-fill" style={{width: `${waterPercent}%`}}></div>
                            </div>
                            <p className="water-percent">{Math.round(waterPercent)}% от цели</p>
                        </div>

                        <div className="quick-add-section">
                            <h3>Быстрое добавление</h3>
                            <div className="quick-add-buttons">
                                {quickAddAmounts.map(value => (
                                    <button key={value} onClick={() => handleQuickAdd(value)} className="quick-add-btn">
                                        +{value} мл
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="water-form-section">
                        <div className="water-form-box">
                            <h3>Добавить запись</h3>
                            <form onSubmit={handleSubmit} className="water-form">
                                <input
                                    type="number"
                                    placeholder="Количество воды (мл)"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="water-input"
                                    required
                                    min="1"
                                />
                                <button type="submit" className="water-submit-btn">Добавить</button>
                            </form>
                        </div>

                        <div className="water-history">
                            <h3>Сегодняшние записи</h3>
                            {todayRecords.length > 0 ? (
                                <ul className="water-history-list">
                                    {todayRecords.map(record => (
                                        <li key={record.id} className="water-history-item">
                                            <span className="water-record-amount">{record.amount} мл</span>
                                            <span className="water-record-time">
                                                {new Date(record.record_time).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <button 
                                                onClick={() => handleDelete(record.id)} 
                                                className="water-delete-btn"
                                                title="Удалить запись"
                                            >
                                                Удалить
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data">Нет записей за сегодня</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Water; 