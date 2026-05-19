const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../server');

const router = express.Router();

// Создать цель
router.post('/add', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { goal_type, target_value, end_date } = req.body;

        await pool.query(
            'INSERT INTO goals (user_id, goal_type, target_value, end_date) VALUES ($1, $2, $3, $4)',
            [userId, goal_type, target_value, end_date]
        );

        res.json({ message: 'Цель создана' });
    } catch (error) {
        console.error('Ошибка создания цели:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить все цели
router.get('/all', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения целей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить прогресс цели
router.put('/progress/:id', auth, async (req, res) => {
    try {
        const goalId = req.params.id;
        const userId = req.user.id;
        const { current_value } = req.body;

        const result = await pool.query(
            'UPDATE goals SET current_value = $1, is_completed = CASE WHEN $1 >= target_value THEN true ELSE false END WHERE id = $2 AND user_id = $3 RETURNING *',
            [current_value, goalId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Цель не найдена' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления цели:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;