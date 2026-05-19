import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
    const [waterTotal, setWaterTotal] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [calorieTotal, setCalorieTotal] = useState(0);
    const [calorieGoal, setCalorieGoal] = useState(2000);
    const [proteinTotal, setProteinTotal] = useState(0);
    const [fatTotal, setFatTotal] = useState(0);
    const [carbsTotal, setCarbsTotal] = useState(0);
    const [proteinGoal, setProteinGoal] = useState(50);
    const [fatGoal, setFatGoal] = useState(65);
    const [carbsGoal, setCarbsGoal] = useState(250);
    const [user, setUser] = useState(null);
    const [recentFoods, setRecentFoods] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        fetchProfile();
        fetchTodayData();
        fetchRecentFoods();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            const profile = response.data;
            setWaterGoal(profile.daily_water_goal);
            setCalorieGoal(profile.daily_calorie_goal);
            setProteinGoal(profile.daily_protein_goal);
            setFatGoal(profile.daily_fat_goal);
            setCarbsGoal(profile.daily_carbs_goal);
        } catch (error) {
            console.error('Ошибка загрузки профиля');
        }
    };

    const fetchTodayData = async () => {
        try {
            const waterResponse = await api.get('/water/today');
            setWaterTotal(waterResponse.data.total);

            const calorieResponse = await api.get('/calories/today');
            setCalorieTotal(calorieResponse.data.total_calories);
            setProteinTotal(calorieResponse.data.total_protein);
            setFatTotal(calorieResponse.data.total_fat);
            setCarbsTotal(calorieResponse.data.total_carbs);
        } catch (error) {
            console.error('Ошибка загрузки данных');
        }
    };

    const fetchRecentFoods = async () => {
        try {
            const response = await api.get('/calories/details/' + new Date().toISOString().split('T')[0]);
            setRecentFoods(response.data.slice(0, 5));
        } catch (error) {
            console.error('Ошибка загрузки последних записей');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const waterPercent = Math.min((waterTotal / waterGoal) * 100, 100);
    const caloriePercent = Math.min((calorieTotal / calorieGoal) * 100, 100);
    const proteinPercent = Math.min((proteinTotal / proteinGoal) * 100, 100);
    const fatPercent = Math.min((fatTotal / fatGoal) * 100, 100);
    const carbsPercent = Math.min((carbsTotal / carbsGoal) * 100, 100);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-logo">Трекер здоровья</h1>
                <div className="dashboard-user-info">
                    <span className="dashboard-username">{user?.username}</span>
                    <button onClick={handleLogout} className="dashboard-logout-btn">Выйти</button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <button onClick={() => navigate('/dashboard')} className="dashboard-nav-btn active">Главная</button>
                <button onClick={() => navigate('/water')} className="dashboard-nav-btn">Вода</button>
                <button onClick={() => navigate('/calories')} className="dashboard-nav-btn">Калории</button>
                <button onClick={() => navigate('/history')} className="dashboard-nav-btn">История</button>
                <button onClick={() => navigate('/stats')} className="dashboard-nav-btn">Статистика</button>
                <button onClick={() => navigate('/profile')} className="dashboard-nav-btn">Профиль</button>
                <button onClick={() => navigate('/measurements')} className="dashboard-nav-btn">Замеры</button>
            </nav>

            <main className="dashboard-main">
                <h2 className="dashboard-subtitle">Сводка за сегодня</h2>
                
                <div className="dashboard-cards">
                    <div className="dashboard-card water-card">
                        <h3 className="card-title">Вода</h3>
                        <div className="card-progress">
                            <div className="progress-info">
                                <span>{waterTotal} мл</span>
                                <span>{waterGoal} мл</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill water-fill" style={{width: `${waterPercent}%`}}></div>
                            </div>
                            <p className="progress-percent">{Math.round(waterPercent)}%</p>
                        </div>
                        <button onClick={() => navigate('/water')} className="card-btn water-btn">Добавить воду</button>
                    </div>

                    <div className="dashboard-card calories-card">
                        <h3 className="card-title">Калории</h3>
                        <div className="card-progress">
                            <div className="progress-info">
                                <span>{calorieTotal} ккал</span>
                                <span>{calorieGoal} ккал</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill calories-fill" style={{width: `${caloriePercent}%`}}></div>
                            </div>
                            <p className="progress-percent">{Math.round(caloriePercent)}%</p>
                        </div>
                        <button onClick={() => navigate('/calories')} className="card-btn calories-btn">Добавить еду</button>
                    </div>

                    <div className="dashboard-card macros-card">
                        <h3 className="card-title">Макронутриенты</h3>
                        <div className="macros-grid">
                            <div className="macro-item">
                                <span className="macro-label">Белки</span>
                                <div className="progress-bar small">
                                    <div className="progress-fill protein-fill" style={{width: `${proteinPercent}%`}}></div>
                                </div>
                                <span className="macro-value">{proteinTotal}/{proteinGoal}г</span>
                            </div>
                            <div className="macro-item">
                                <span className="macro-label">Жиры</span>
                                <div className="progress-bar small">
                                    <div className="progress-fill fat-fill" style={{width: `${fatPercent}%`}}></div>
                                </div>
                                <span className="macro-value">{fatTotal}/{fatGoal}г</span>
                            </div>
                            <div className="macro-item">
                                <span className="macro-label">Углеводы</span>
                                <div className="progress-bar small">
                                    <div className="progress-fill carbs-fill" style={{width: `${carbsPercent}%`}}></div>
                                </div>
                                <span className="macro-value">{carbsTotal}/{carbsGoal}г</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card recent-foods-card">
                        <h3 className="card-title">Последние приёмы пищи</h3>
                        {recentFoods.length > 0 ? (
                            <ul className="recent-foods-list">
                                {recentFoods.map((food, index) => (
                                    <li key={index} className="recent-food-item">
                                        <span className="food-name">{food.food_name}</span>
                                        <span className="food-calories">{food.calories} ккал</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">Нет записей за сегодня</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;