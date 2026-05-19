import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Profile.css';

function Profile() {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        gender: '',
        age: '',
        weight: '',
        height: '',
        activity_level: 'moderate',
        daily_water_goal: 2000,
        daily_calorie_goal: 2000,
        daily_protein_goal: 50,
        daily_fat_goal: 65,
        daily_carbs_goal: 250,
        notifications_enabled: true,
        reminder_time: '09:00'
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data);
        } catch (error) {
            console.error('Ошибка загрузки профиля');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/profile/update', profile);
            setMessage('Профиль обновлен');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка обновления');
        }
    };

    const calculateNorms = () => {
        if (profile.weight && profile.height && profile.age && profile.gender) {
            let bmr;
            if (profile.gender === 'male') {
                bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
            } else {
                bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
            }

            const activityMultipliers = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                very_active: 1.9
            };

            const tdee = Math.round(bmr * (activityMultipliers[profile.activity_level] || 1.55));
            
            setProfile({
                ...profile,
                daily_calorie_goal: tdee,
                daily_water_goal: Math.round(profile.weight * 30),
                daily_protein_goal: Math.round((tdee * 0.3) / 4),
                daily_fat_goal: Math.round((tdee * 0.25) / 9),
                daily_carbs_goal: Math.round((tdee * 0.45) / 4)
            });
        }
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1 className="profile-logo">Трекер здоровья</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="profile-logout-btn">Выйти</button>
            </header>

            <nav className="profile-nav">
                <button onClick={() => navigate('/dashboard')} className="profile-nav-btn">Главная</button>
                <button onClick={() => navigate('/water')} className="profile-nav-btn">Вода</button>
                <button onClick={() => navigate('/calories')} className="profile-nav-btn">Калории</button>
                <button onClick={() => navigate('/history')} className="profile-nav-btn">История</button>
                <button onClick={() => navigate('/profile')} className="profile-nav-btn active">Профиль</button>
            </nav>

            <main className="profile-main">
                <h2 className="profile-subtitle">Настройки профиля</h2>
                
                {message && <p className="profile-message">{message}</p>}
                
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="profile-section">
                        <h3>Личные данные</h3>
                        <div className="profile-grid">
                            <input
                                type="text"
                                placeholder="Имя пользователя"
                                value={profile.username}
                                disabled
                                className="profile-input"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={profile.email}
                                disabled
                                className="profile-input"
                            />
                            <select
                                value={profile.gender || ''}
                                onChange={(e) => setProfile({...profile, gender: e.target.value})}
                                className="profile-input"
                            >
                                <option value="">Выберите пол</option>
                                <option value="male">Мужской</option>
                                <option value="female">Женский</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Возраст"
                                value={profile.age || ''}
                                onChange={(e) => setProfile({...profile, age: e.target.value})}
                                className="profile-input"
                            />
                            <input
                                type="number"
                                placeholder="Вес (кг)"
                                value={profile.weight || ''}
                                onChange={(e) => setProfile({...profile, weight: e.target.value})}
                                className="profile-input"
                                step="0.1"
                            />
                            <input
                                type="number"
                                placeholder="Рост (см)"
                                value={profile.height || ''}
                                onChange={(e) => setProfile({...profile, height: e.target.value})}
                                className="profile-input"
                            />
                            <select
                                value={profile.activity_level}
                                onChange={(e) => setProfile({...profile, activity_level: e.target.value})}
                                className="profile-input"
                            >
                                <option value="sedentary">Сидячий образ жизни</option>
                                <option value="light">Легкая активность</option>
                                <option value="moderate">Умеренная активность</option>
                                <option value="active">Активный образ жизни</option>
                                <option value="very_active">Очень активный</option>
                            </select>
                        </div>
                        <button type="button" onClick={calculateNorms} className="profile-calc-btn">
                            Рассчитать нормы
                        </button>
                    </div>

                    <div className="profile-section">
                        <h3>Дневные цели</h3>
                        <div className="profile-grid">
                            <div className="profile-input-group">
                                <label>Вода (мл)</label>
                                <input
                                    type="number"
                                    value={profile.daily_water_goal}
                                    onChange={(e) => setProfile({...profile, daily_water_goal: e.target.value})}
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-input-group">
                                <label>Калории (ккал)</label>
                                <input
                                    type="number"
                                    value={profile.daily_calorie_goal}
                                    onChange={(e) => setProfile({...profile, daily_calorie_goal: e.target.value})}
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-input-group">
                                <label>Белки (г)</label>
                                <input
                                    type="number"
                                    value={profile.daily_protein_goal}
                                    onChange={(e) => setProfile({...profile, daily_protein_goal: e.target.value})}
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-input-group">
                                <label>Жиры (г)</label>
                                <input
                                    type="number"
                                    value={profile.daily_fat_goal}
                                    onChange={(e) => setProfile({...profile, daily_fat_goal: e.target.value})}
                                    className="profile-input"
                                />
                            </div>
                            <div className="profile-input-group">
                                <label>Углеводы (г)</label>
                                <input
                                    type="number"
                                    value={profile.daily_carbs_goal}
                                    onChange={(e) => setProfile({...profile, daily_carbs_goal: e.target.value})}
                                    className="profile-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Уведомления</h3>
                        <div className="profile-grid">
                            <div className="profile-input-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={profile.notifications_enabled}
                                        onChange={(e) => setProfile({...profile, notifications_enabled: e.target.checked})}
                                    />
                                    Включить напоминания
                                </label>
                            </div>
                            <div className="profile-input-group">
                                <label>Время напоминания</label>
                                <input
                                    type="time"
                                    value={profile.reminder_time}
                                    onChange={(e) => setProfile({...profile, reminder_time: e.target.value})}
                                    className="profile-input"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="profile-save-btn">Сохранить изменения</button>
                </form>
            </main>
        </div>
    );
}

export default Profile;