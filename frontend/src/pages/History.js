import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import api from '../utils/api';
import './History.css';

function History() {
    const [activeTab, setActiveTab] = useState('water');
    const [period, setPeriod] = useState('week');
    const [waterHistory, setWaterHistory] = useState([]);
    const [calorieHistory, setCalorieHistory] = useState([]);
    const [waterChartData, setWaterChartData] = useState([]);
    const [calorieChartData, setCalorieChartData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateDetails, setDateDetails] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, [activeTab, period]);

    useEffect(() => {
        if (selectedDate) {
            fetchDateDetails();
        }
    }, [selectedDate, activeTab]);

    const fetchHistory = async () => {
        try {
            const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
            
            if (activeTab === 'water') {
                const response = await api.get(`/water/history?days=${days}`);
                setWaterHistory(response.data);
                
                const chartData = response.data.map(item => ({
                    date: new Date(item.record_date).toLocaleDateString('ru-RU'),
                    вода: parseInt(item.total),
                    приёмов: parseInt(item.count)
                })).reverse();
                setWaterChartData(chartData);
            } else {
                const response = await api.get(`/calories/history?days=${days}`);
                setCalorieHistory(response.data);
                
                const chartData = response.data.map(item => ({
                    date: new Date(item.record_date).toLocaleDateString('ru-RU'),
                    калории: parseInt(item.total_calories),
                    белки: parseInt(item.total_protein),
                    жиры: parseInt(item.total_fat),
                    углеводы: parseInt(item.total_carbs)
                })).reverse();
                setCalorieChartData(chartData);
            }
        } catch (error) {
            console.error('Ошибка загрузки истории');
        }
    };

    const fetchDateDetails = async () => {
        try {
            if (activeTab === 'water') {
                const response = await api.get(`/water/details/${selectedDate}`);
                setDateDetails(response.data);
            } else {
                const response = await api.get(`/calories/details/${selectedDate}`);
                setDateDetails(response.data);
            }
        } catch (error) {
            console.error('Ошибка загрузки деталей');
            setDateDetails([]);
        }
    };

    const getTotalForPeriod = () => {
        if (activeTab === 'water') {
            return waterHistory.reduce((sum, item) => sum + parseInt(item.total), 0);
        } else {
            return calorieHistory.reduce((sum, item) => sum + parseInt(item.total_calories), 0);
        }
    };

    const getAverageForPeriod = () => {
        const count = activeTab === 'water' ? waterHistory.length : calorieHistory.length;
        const total = getTotalForPeriod();
        return count > 0 ? Math.round(total / count) : 0;
    };

    const mealTypes = {
        breakfast: 'Завтрак',
        lunch: 'Обед',
        dinner: 'Ужин',
        snack: 'Перекус',
        other: 'Другое'
    };

    return (
        <div className="history-container">
            <header className="history-header">
                <h1 className="history-logo">Трекер здоровья</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="history-logout-btn">Выйти</button>
            </header>

            <nav className="history-nav">
    <button onClick={() => navigate('/dashboard')} className="history-nav-btn">Главная</button>
    <button onClick={() => navigate('/water')} className="history-nav-btn">Вода</button>
    <button onClick={() => navigate('/calories')} className="history-nav-btn">Калории</button>
    <button onClick={() => navigate('/history')} className="history-nav-btn active">История</button>
    <button onClick={() => navigate('/stats')} className="history-nav-btn">Статистика</button>
    <button onClick={() => navigate('/profile')} className="history-nav-btn">Профиль</button>
    <button onClick={() => navigate('/measurements')} className="history-nav-btn">Замеры</button>
</nav>

            <main className="history-main">
                <h2 className="history-subtitle">История записей</h2>
                
                <div className="history-controls">
                    <div className="history-tabs">
                        <button 
                            onClick={() => setActiveTab('water')} 
                            className={`history-tab ${activeTab === 'water' ? 'active' : ''}`}
                        >
                            Вода
                        </button>
                        <button 
                            onClick={() => setActiveTab('calories')} 
                            className={`history-tab ${activeTab === 'calories' ? 'active' : ''}`}
                        >
                            Калории
                        </button>
                    </div>

                    <div className="history-periods">
                        <button 
                            onClick={() => setPeriod('week')} 
                            className={`history-period-btn ${period === 'week' ? 'active' : ''}`}
                        >
                            Неделя
                        </button>
                        <button 
                            onClick={() => setPeriod('month')} 
                            className={`history-period-btn ${period === 'month' ? 'active' : ''}`}
                        >
                            Месяц
                        </button>
                        <button 
                            onClick={() => setPeriod('year')} 
                            className={`history-period-btn ${period === 'year' ? 'active' : ''}`}
                        >
                            Год
                        </button>
                    </div>
                </div>

                <div className="history-stats-summary">
                    <div className="summary-card">
                        <span className="summary-label">Всего за период</span>
                        <span className="summary-value">
                            {getTotalForPeriod()} {activeTab === 'water' ? 'мл' : 'ккал'}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Среднее в день</span>
                        <span className="summary-value">
                            {getAverageForPeriod()} {activeTab === 'water' ? 'мл' : 'ккал'}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Всего записей</span>
                        <span className="summary-value">
                            {activeTab === 'water' ? waterHistory.length : calorieHistory.length} дней
                        </span>
                    </div>
                </div>

                <div className="history-chart-section">
                    <h3>График за период</h3>
                    {activeTab === 'water' ? (
                        <BarChart width={800} height={300} data={waterChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="вода" fill="#4a90e2" />
                        </BarChart>
                    ) : (
                        <LineChart width={800} height={300} data={calorieChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="калории" stroke="#e27d4a" strokeWidth={2} />
                            <Line type="monotone" dataKey="белки" stroke="#4a90e2" strokeWidth={2} />
                            <Line type="monotone" dataKey="жиры" stroke="#4a7c59" strokeWidth={2} />
                            <Line type="monotone" dataKey="углеводы" stroke="#8b0000" strokeWidth={2} />
                        </LineChart>
                    )}
                </div>

                <div className="history-details-section">
                    <div className="details-header">
                        <h3>Детали по дате</h3>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="history-date-input"
                        />
                    </div>
                    
                    <div className="details-list">
                        {dateDetails.length > 0 ? (
                            activeTab === 'water' ? (
                                dateDetails.map(record => (
                                    <div key={record.id} className="detail-item">
                                        <span className="detail-amount">{record.amount} мл</span>
                                        <span className="detail-time">
                                            {new Date(record.record_time).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                dateDetails.map(record => (
                                    <div key={record.id} className="detail-item detail-food">
                                        <div className="detail-food-info">
                                            <span className="detail-food-name">{record.food_name}</span>
                                            <span className="detail-food-category">
                                                {record.category_name || 'Без категории'}
                                            </span>
                                            <span className="detail-meal-type">
                                                {mealTypes[record.meal_type] || 'Другое'}
                                            </span>
                                        </div>
                                        <div className="detail-food-values">
                                            <span className="detail-calories">{record.calories} ккал</span>
                                            <span className="detail-macros">
                                                Б: {record.protein}г Ж: {record.fat}г У: {record.carbs}г
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            <p className="no-data">Нет записей за выбранную дату</p>
                        )}
                    </div>
                </div>

                <div className="history-full-list">
                    <h3>Все записи за период</h3>
                    {activeTab === 'water' ? (
                        waterHistory.length > 0 ? (
                            <div className="full-list-table">
                                <div className="table-header">
                                    <span>Дата</span>
                                    <span>Всего</span>
                                    <span>Приёмов</span>
                                </div>
                                {waterHistory.map((record, index) => (
                                    <div key={index} className="table-row">
                                        <span>{new Date(record.record_date).toLocaleDateString('ru-RU')}</span>
                                        <span>{record.total} мл</span>
                                        <span>{record.count} раз</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">Нет записей</p>
                        )
                    ) : (
                        calorieHistory.length > 0 ? (
                            <div className="full-list-table">
                                <div className="table-header">
                                    <span>Дата</span>
                                    <span>Калории</span>
                                    <span>Белки</span>
                                    <span>Жиры</span>
                                    <span>Углеводы</span>
                                </div>
                                {calorieHistory.map((record, index) => (
                                    <div key={index} className="table-row">
                                        <span>{new Date(record.record_date).toLocaleDateString('ru-RU')}</span>
                                        <span>{record.total_calories} ккал</span>
                                        <span>{record.total_protein}г</span>
                                        <span>{record.total_fat}г</span>
                                        <span>{record.total_carbs}г</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">Нет записей</p>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}

export default History;