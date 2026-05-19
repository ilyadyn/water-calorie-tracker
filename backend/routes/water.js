const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../server');

const router = express.Router();

// Добавить запись о воде
router.post('/add', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        await pool.query(
            'INSERT INTO water_records (user_id, amount) VALUES ($1, $2)',
            [userId, amount]
        );

        res.json({ message: 'Запись добавлена' });
    } catch (error) {
        console.error('Ошибка добавления воды:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить записи за сегодня
router.get('/today', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM water_records WHERE user_id = $1 AND record_date = CURRENT_DATE',
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения данных:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить историю воды за период
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { days } = req.query;
        const limit = days ? parseInt(days) : 7;
        
        const result = await pool.query(
            `SELECT record_date, SUM(amount) as total, COUNT(*) as count 
             FROM water_records 
             WHERE user_id = $1 
             GROUP BY record_date 
             ORDER BY record_date DESC 
             LIMIT $2`,
            [userId, limit]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения истории:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить детальные записи за день
router.get('/details/:date', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM water_records WHERE user_id = $1 AND record_date = $2 ORDER BY record_time DESC',
            [userId, date]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить запись о воде
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const recordId = req.params.id;
        
        const result = await pool.query(
            'DELETE FROM water_records WHERE id = $1 AND user_id = $2 RETURNING *',
            [recordId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }

        res.json({ message: 'Запись удалена' });
    } catch (error) {
        console.error('Ошибка удаления записи:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;