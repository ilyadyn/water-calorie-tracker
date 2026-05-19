const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const waterRoutes = require('./routes/water');
const calorieRoutes = require('./routes/calories');
const profileRoutes = require('./routes/profile');
const measurementsRoutes = require('./routes/measurements');
const goalsRoutes = require('./routes/goals');


// Временный маршрут для теста - добавить запись на вчера
app.get('/api/test/add-yesterday', async (req, res) => {
    try {
        const client = await pool.connect();
        
        // Узнай свой user_id, замени 1 на нужный
        const userId = 1;
        
        await client.query(
            "INSERT INTO water_records (user_id, amount, record_date) VALUES ($1, $2, CURRENT_DATE - INTERVAL '1 day')",
            [userId, 500]
        );
        
        await client.query(
            "INSERT INTO calorie_records (user_id, food_name, calories, protein, fat, carbs, meal_type, record_date) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE - INTERVAL '1 day')",
            [userId, 'Вчерашний обед', 600, 25, 20, 50, 'lunch']
        );
        
        client.release();
        res.json({ message: 'Записи на вчера добавлены' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/goals', goalsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});