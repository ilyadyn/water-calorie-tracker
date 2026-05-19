const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../server');

const router = express.Router();

// Добавить измерение
router.post('/add', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { weight, chest, waist, hips } = req.body;

        await pool.query(
            'INSERT INTO body_measurements (user_id, weight, chest, waist, hips) VALUES ($1, $2, $3, $4, $5)',
            [userId, weight, chest, waist, hips]
        );

        res.json({ message: 'Измерения добавлены' });
    } catch (error) {
        console.error('Ошибка добавления измерений:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить историю измерений
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT * FROM body_measurements WHERE user_id = $1 ORDER BY measurement_date DESC LIMIT 30',
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения измерений:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;