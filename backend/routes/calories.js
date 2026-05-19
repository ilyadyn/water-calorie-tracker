const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../server');

const router = express.Router();

// Добавить запись о калориях
router.post('/add', auth, async (req, res) => {
    try {
        const { food_name, calories, protein, fat, carbs, meal_type, category_id, portion_size } = req.body;
        const userId = req.user.id;

        await pool.query(
            'INSERT INTO calorie_records (user_id, food_name, calories, protein, fat, carbs, meal_type, category_id, portion_size) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [userId, food_name, calories, protein || 0, fat || 0, carbs || 0, meal_type, category_id, portion_size]
        );

        res.json({ message: 'Запись добавлена' });
    } catch (error) {
        console.error('Ошибка добавления калорий:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить записи за сегодня
router.get('/today', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            `SELECT COALESCE(SUM(calories), 0) as total_calories, 
                    COALESCE(SUM(protein), 0) as total_protein,
                    COALESCE(SUM(fat), 0) as total_fat,
                    COALESCE(SUM(carbs), 0) as total_carbs,
                    COUNT(*) as count 
             FROM calorie_records 
             WHERE user_id = $1 AND record_date = CURRENT_DATE`,
            [userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения данных:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить историю калорий за период
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { days } = req.query;
        const limit = days ? parseInt(days) : 7;
        
        const result = await pool.query(
            `SELECT record_date, 
                    SUM(calories) as total_calories,
                    SUM(protein) as total_protein,
                    SUM(fat) as total_fat,
                    SUM(carbs) as total_carbs,
                    COUNT(*) as count 
             FROM calorie_records 
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
            `SELECT cr.*, fc.name as category_name, fc.icon as category_icon
             FROM calorie_records cr
             LEFT JOIN food_categories fc ON cr.category_id = fc.id
             WHERE cr.user_id = $1 AND cr.record_date = $2 
             ORDER BY cr.record_time DESC`,
            [userId, date]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить категории продуктов
router.get('/categories', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM food_categories ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить в избранное
router.post('/favorite', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { food_name, calories, protein, fat, carbs, category_id } = req.body;

        await pool.query(
            'INSERT INTO favorite_foods (user_id, food_name, calories, protein, fat, carbs, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [userId, food_name, calories, protein || 0, fat || 0, carbs || 0, category_id]
        );

        res.json({ message: 'Добавлено в избранное' });
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить избранные продукты
router.get('/favorites', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            `SELECT ff.*, fc.name as category_name, fc.icon as category_icon
             FROM favorite_foods ff
             LEFT JOIN food_categories fc ON ff.category_id = fc.id
             WHERE ff.user_id = $1 
             ORDER BY ff.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения избранного:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить запись о калориях
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const recordId = req.params.id;
        
        const result = await pool.query(
            'DELETE FROM calorie_records WHERE id = $1 AND user_id = $2 RETURNING *',
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