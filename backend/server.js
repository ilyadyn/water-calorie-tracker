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

const initDB = require('./db/init');

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const waterRoutes = require('./routes/water');
const calorieRoutes = require('./routes/calories');
const profileRoutes = require('./routes/profile');
const measurementsRoutes = require('./routes/measurements');
const goalsRoutes = require('./routes/goals');

app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/goals', goalsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    try {
        await initDB();
        console.log(`Сервер запущен на порту ${PORT}`);
    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
    }
});