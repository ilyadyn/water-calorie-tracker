import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import './Stats.css';

function Stats() {
    const [period, setPeriod] = useState('week');
    const [waterData, setWaterData] = useState([]);
    const [calorieData, setCalorieData] = useState([]);
    const [macroData, setMacroData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        try {
            const response = await api.get(`/profile/stats?period=${period}`);
            
            const waterStats = response.data.water.map(item => ({
                date: new Date(item.record_date).toLocaleDateString('ru-RU'),
                вода: parseInt(item.total)
            }));
            setWaterData(waterStats);

            const calorieStats = response.data.calories.map(item => ({
                date: new Date(item.record_date).toLocaleDateString('ru-RU'),
                калории: parseInt(item.total_calories),
                белки: parseInt(item.total_protein),
                жиры: parseInt(item.total_fat),
                углеводы: parseInt(item.total_carbs)
            }));
            setCalorieData(calorieStats);

            const totals = response.data.calories.reduce((acc, item) => {
                acc.protein += parseInt(item.total_protein);
                acc.fat += parseInt(item.total_fat);
                acc.carbs += parseInt(item.total_carbs);
                return acc;
            }, { protein: 0, fat: 0, carbs: 0 });

            setMacroData([
                { name: 'Белки', value: totals.protein },
                { name: 'Жиры', value: totals.fat },
                { name: 'Углеводы', value: totals.carbs }
            ]);

        } catch (error) {
            console.error('Ошибка загрузки статистики');
        }
    };

    const COLORS = ['#4a90e2', '#e27d4a', '#4a7c59'];

    return (
        <div className="stats-container">
            <header className="stats-header">
                <h1 className="stats-logo">Трекер здоровья</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="stats-logout-btn">Выйти</button>
            </header>

            <nav className="stats-nav">
    <button onClick={() => navigate('/dashboard')} className="stats-nav-btn">Главная</button>
    <button onClick={() => navigate('/water')} className="stats-nav-btn">Вода</button>
    <button onClick={() => navigate('/calories')} className="stats-nav-btn">Калории</button>
    <button onClick={() => navigate('/history')} className="stats-nav-btn">История</button>
    <button onClick={() => navigate('/stats')} className="stats-nav-btn active">Статистика</button>
    <button onClick={() => navigate('/profile')} className="stats-nav-btn">Профиль</button>
    <button onClick={() => navigate('/measurements')} className="stats-nav-btn">Замеры</button>
</nav>

            <main className="stats-main">
                <div className="stats-header-section">
                    <h2 className="stats-subtitle">Статистика и аналитика</h2>
                    <div className="stats-period-buttons">
                        <button 
                            onClick={() => setPeriod('week')} 
                            className={`stats-period-btn ${period === 'week' ? 'active' : ''}`}
                        >
                            Неделя
                        </button>
                        <button 
                            onClick={() => setPeriod('month')} 
                            className={`stats-period-btn ${period === 'month' ? 'active' : ''}`}
                        >
                            Месяц
                        </button>
                        <button 
                            onClick={() => setPeriod('year')} 
                            className={`stats-period-btn ${period === 'year' ? 'active' : ''}`}
                        >
                            Год
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stats-card">
                        <h3>Потребление воды</h3>
                        <LineChart width={500} height={300} data={waterData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="вода" stroke="#4a90e2" strokeWidth={2} />
                        </LineChart>
                    </div>

                    <div className="stats-card">
                        <h3>Потребление калорий</h3>
                        <BarChart width={500} height={300} data={calorieData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="калории" fill="#e27d4a" />
                        </BarChart>
                    </div>

                    <div className="stats-card">
                        <h3>Макронутриенты</h3>
                        <LineChart width={500} height={300} data={calorieData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="белки" stroke="#4a90e2" strokeWidth={2} />
                            <Line type="monotone" dataKey="жиры" stroke="#e27d4a" strokeWidth={2} />
                            <Line type="monotone" dataKey="углеводы" stroke="#4a7c59" strokeWidth={2} />
                        </LineChart>
                    </div>

                    <div className="stats-card">
                        <h3>Распределение макронутриентов</h3>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={macroData}
                                cx={200}
                                cy={150}
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {macroData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Stats;