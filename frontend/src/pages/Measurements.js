import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../utils/api';
import './Measurements.css';

function Measurements() {
    const [weight, setWeight] = useState('');
    const [chest, setChest] = useState('');
    const [waist, setWaist] = useState('');
    const [hips, setHips] = useState('');
    const [measurements, setMeasurements] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMeasurements();
    }, []);

    const fetchMeasurements = async () => {
        try {
            const response = await api.get('/measurements/history');
            setMeasurements(response.data.reverse());
        } catch (error) {
            console.error('Ошибка загрузки измерений');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/measurements/add', {
                weight: parseFloat(weight),
                chest: parseFloat(chest),
                waist: parseFloat(waist),
                hips: parseFloat(hips)
            });
            setMessage('Измерения добавлены');
            setWeight('');
            setChest('');
            setWaist('');
            setHips('');
            fetchMeasurements();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка добавления');
        }
    };

    const chartData = measurements.map(m => ({
        date: new Date(m.measurement_date).toLocaleDateString('ru-RU'),
        вес: parseFloat(m.weight),
        грудь: parseFloat(m.chest),
        талия: parseFloat(m.waist),
        бедра: parseFloat(m.hips)
    }));

    return (
        <div className="measurements-container">
            <header className="measurements-header">
                <h1 className="measurements-logo">Трекер здоровья</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="measurements-logout-btn">Выйти</button>
            </header>

            <nav className="measurements-nav">
    <button onClick={() => navigate('/dashboard')} className="measurements-nav-btn">Главная</button>
    <button onClick={() => navigate('/water')} className="measurements-nav-btn">Вода</button>
    <button onClick={() => navigate('/calories')} className="measurements-nav-btn">Калории</button>
    <button onClick={() => navigate('/history')} className="measurements-nav-btn">История</button>
    <button onClick={() => navigate('/stats')} className="measurements-nav-btn">Статистика</button>
    <button onClick={() => navigate('/profile')} className="measurements-nav-btn">Профиль</button>
    <button onClick={() => navigate('/measurements')} className="measurements-nav-btn active">Замеры</button>
</nav>

            <main className="measurements-main">
                <h2 className="measurements-subtitle">Замеры тела</h2>

                <div className="measurements-content">
                    <div className="measurements-form-section">
                        <h3>Добавить замеры</h3>
                        {message && <p className="measurements-message">{message}</p>}
                        <form onSubmit={handleSubmit} className="measurements-form">
                            <div className="measurements-input-group">
                                <label>Вес (кг)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    required
                                    step="0.1"
                                />
                            </div>
                            <div className="measurements-input-group">
                                <label>Грудь (см)</label>
                                <input
                                    type="number"
                                    value={chest}
                                    onChange={(e) => setChest(e.target.value)}
                                    step="0.1"
                                />
                            </div>
                            <div className="measurements-input-group">
                                <label>Талия (см)</label>
                                <input
                                    type="number"
                                    value={waist}
                                    onChange={(e) => setWaist(e.target.value)}
                                    step="0.1"
                                />
                            </div>
                            <div className="measurements-input-group">
                                <label>Бедра (см)</label>
                                <input
                                    type="number"
                                    value={hips}
                                    onChange={(e) => setHips(e.target.value)}
                                    step="0.1"
                                />
                            </div>
                            <button type="submit" className="measurements-submit-btn">Сохранить</button>
                        </form>
                    </div>

                    <div className="measurements-chart-section">
                        <h3>График измерений</h3>
                        <LineChart width={600} height={300} data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="вес" stroke="#4a90e2" strokeWidth={2} />
                            <Line type="monotone" dataKey="грудь" stroke="#e27d4a" strokeWidth={2} />
                            <Line type="monotone" dataKey="талия" stroke="#4a7c59" strokeWidth={2} />
                            <Line type="monotone" dataKey="бедра" stroke="#8b0000" strokeWidth={2} />
                        </LineChart>

                        <div className="measurements-history">
                            <h3>История замеров</h3>
                            <div className="measurements-table">
                                <div className="measurements-table-header">
                                    <span>Дата</span>
                                    <span>Вес</span>
                                    <span>Грудь</span>
                                    <span>Талия</span>
                                    <span>Бедра</span>
                                </div>
                                {measurements.slice(0, 10).map((m, index) => (
                                    <div key={index} className="measurements-table-row">
                                        <span>{new Date(m.measurement_date).toLocaleDateString('ru-RU')}</span>
                                        <span>{m.weight} кг</span>
                                        <span>{m.chest} см</span>
                                        <span>{m.waist} см</span>
                                        <span>{m.hips} см</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Measurements;