import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Calories.css';

function Calories() {
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [fat, setFat] = useState('');
    const [carbs, setCarbs] = useState('');
    const [mealType, setMealType] = useState('other');
    const [categoryId, setCategoryId] = useState('');
    const [portionSize, setPortionSize] = useState('');
    const [calorieTotal, setCalorieTotal] = useState(0);
    const [calorieGoal, setCalorieGoal] = useState(2000);
    const [proteinTotal, setProteinTotal] = useState(0);
    const [fatTotal, setFatTotal] = useState(0);
    const [carbsTotal, setCarbsTotal] = useState(0);
    const [message, setMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [todayFoods, setTodayFoods] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchTodayData();
        fetchCategories();
        fetchFavorites();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setCalorieGoal(response.data.daily_calorie_goal);
        } catch (error) {
            console.error('Ошибка загрузки профиля');
        }
    };

    const fetchTodayData = async () => {
        try {
            const calorieResponse = await api.get('/calories/today');
            setCalorieTotal(calorieResponse.data.total_calories);
            setProteinTotal(calorieResponse.data.total_protein);
            setFatTotal(calorieResponse.data.total_fat);
            setCarbsTotal(calorieResponse.data.total_carbs);

            const detailsResponse = await api.get('/calories/details/' + new Date().toISOString().split('T')[0]);
            setTodayFoods(detailsResponse.data);
        } catch (error) {
            console.error('Ошибка загрузки данных');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/calories/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий');
        }
    };

    const fetchFavorites = async () => {
        try {
            const response = await api.get('/calories/favorites');
            setFavorites(response.data);
        } catch (error) {
            console.error('Ошибка загрузки избранного');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foodName || !calories) return;

        try {
            await api.post('/calories/add', {
                food_name: foodName,
                calories: parseInt(calories),
                protein: parseFloat(protein) || 0,
                fat: parseFloat(fat) || 0,
                carbs: parseFloat(carbs) || 0,
                meal_type: mealType,
                category_id: categoryId || null,
                portion_size: portionSize
            });
            setMessage('Запись добавлена!');
            setFoodName('');
            setCalories('');
            setProtein('');
            setFat('');
            setCarbs('');
            setPortionSize('');
            fetchTodayData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка добавления записи');
        }
    };

    const handleAddFavorite = async (food) => {
        try {
            await api.post('/calories/favorite', {
                food_name: food.food_name,
                calories: food.calories,
                protein: food.protein,
                fat: food.fat,
                carbs: food.carbs,
                category_id: food.category_id
            });
            fetchFavorites();
            setMessage('Добавлено в избранное');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка добавления в избранное');
        }
    };

    const handleSelectFavorite = (food) => {
        setFoodName(food.food_name);
        setCalories(food.calories.toString());
        setProtein(food.protein.toString());
        setFat(food.fat.toString());
        setCarbs(food.carbs.toString());
        setCategoryId(food.category_id || '');
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/calories/delete/${id}`);
            fetchTodayData();
            setMessage('Запись удалена');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Ошибка удаления');
        }
    };

    const caloriePercent = Math.min((calorieTotal / calorieGoal) * 100, 100);
    const remaining = Math.max(calorieGoal - calorieTotal, 0);

    const mealTypes = [
        { value: 'breakfast', label: 'Завтрак' },
        { value: 'lunch', label: 'Обед' },
        { value: 'dinner', label: 'Ужин' },
        { value: 'snack', label: 'Перекус' },
        { value: 'other', label: 'Другое' }
    ];

    return (
        <div className="calories-container">
            <header className="calories-header">
                <h1 className="calories-logo">Трекер здоровья</h1>
                <button onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }} className="calories-logout-btn">Выйти</button>
            </header>

            <nav className="calories-nav">
    <button onClick={() => navigate('/dashboard')} className="calories-nav-btn">Главная</button>
    <button onClick={() => navigate('/water')} className="calories-nav-btn">Вода</button>
    <button onClick={() => navigate('/calories')} className="calories-nav-btn active">Калории</button>
    <button onClick={() => navigate('/history')} className="calories-nav-btn">История</button>
    <button onClick={() => navigate('/stats')} className="calories-nav-btn">Статистика</button>
    <button onClick={() => navigate('/profile')} className="calories-nav-btn">Профиль</button>
    <button onClick={() => navigate('/measurements')} className="calories-nav-btn">Замеры</button>
</nav>

            <main className="calories-main">
                <h2 className="calories-subtitle">Учет калорий</h2>
                
                {message && <p className="calories-message">{message}</p>}

                <div className="calories-content">
                    <div className="calories-left-section">
                        <div className="calories-progress-section">
                            <h3>Прогресс за сегодня</h3>
                            <div className="calories-progress-info">
                                <span>{calorieTotal} / {calorieGoal} ккал</span>
                                <span className={calorieTotal > calorieGoal ? 'over' : ''}>
                                    {Math.round(caloriePercent)}%
                                </span>
                            </div>
                            <div className="calories-progress-bar">
                                <div 
                                    className="calories-progress-fill" 
                                    style={{width: `${caloriePercent}%`, backgroundColor: caloriePercent > 100 ? '#d32f2f' : '#e27d4a'}}
                                ></div>
                            </div>
                            <p className="calories-remaining">
                                {remaining > 0 ? `Осталось: ${remaining} ккал` : `Перебор на ${Math.abs(remaining)} ккал`}
                            </p>

                            <div className="macros-mini">
                                <div className="macro-mini-item">
                                    <span>Белки: {proteinTotal}г</span>
                                </div>
                                <div className="macro-mini-item">
                                    <span>Жиры: {fatTotal}г</span>
                                </div>
                                <div className="macro-mini-item">
                                    <span>Углеводы: {carbsTotal}г</span>
                                </div>
                            </div>
                        </div>

                        {favorites.length > 0 && (
                            <div className="favorites-section">
                                <h3>Избранные продукты</h3>
                                <div className="favorites-list">
                                    {favorites.map(food => (
                                        <div key={food.id} className="favorite-item" onClick={() => handleSelectFavorite(food)}>
                                            <span className="favorite-name">{food.food_name}</span>
                                            <span className="favorite-calories">{food.calories} ккал</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="today-foods-section">
                            <h3>Сегодняшние приёмы пищи</h3>
                            {todayFoods.length > 0 ? (
                                <ul className="today-foods-list">
                                    {todayFoods.map(food => (
                                        <li key={food.id} className="today-food-item">
                                            <div className="food-info">
                                                <span className="food-name">{food.food_name}</span>
                                                <span className="food-meal-type">
                                                    {mealTypes.find(t => t.value === food.meal_type)?.label || 'Другое'}
                                                </span>
                                            </div>
                                            <div className="food-values">
                                                <span className="food-calories">{food.calories} ккал</span>
                                                <button onClick={() => handleDelete(food.id)} className="food-delete-btn">Удалить</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data">Нет записей за сегодня</p>
                            )}
                        </div>
                    </div>

                    <div className="calories-form-section">
                        <h3>Добавить приём пищи</h3>
                        <form onSubmit={handleSubmit} className="calories-form">
                            <div className="form-group">
                                <label>Название блюда</label>
                                <input
                                    type="text"
                                    value={foodName}
                                    onChange={(e) => setFoodName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Калории</label>
                                    <input
                                        type="number"
                                        value={calories}
                                        onChange={(e) => setCalories(e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Размер порции</label>
                                    <input
                                        type="text"
                                        value={portionSize}
                                        onChange={(e) => setPortionSize(e.target.value)}
                                        placeholder="Например: 100г"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Тип приёма пищи</label>
                                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                                    {mealTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Категория</label>
                                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                    <option value="">Выберите категорию</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-section-title">Макронутриенты (на порцию)</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Белки (г)</label>
                                    <input
                                        type="number"
                                        value={protein}
                                        onChange={(e) => setProtein(e.target.value)}
                                        step="0.1"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Жиры (г)</label>
                                    <input
                                        type="number"
                                        value={fat}
                                        onChange={(e) => setFat(e.target.value)}
                                        step="0.1"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Углеводы (г)</label>
                                    <input
                                        type="number"
                                        value={carbs}
                                        onChange={(e) => setCarbs(e.target.value)}
                                        step="0.1"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="calories-submit-btn">Добавить</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Calories;