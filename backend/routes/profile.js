const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../server');

const router = express.Router();

// Получить профиль пользователя
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT id, username, email, gender, age, weight, height, activity_level, daily_water_goal, daily_calorie_goal, daily_protein_goal, daily_fat_goal, daily_carbs_goal, notifications_enabled, reminder_time, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить профиль пользователя
router.put('/update', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            gender, age, weight, height, activity_level,
            daily_water_goal, daily_calorie_goal,
            daily_protein_goal, daily_fat_goal, daily_carbs_goal,
            notifications_enabled, reminder_time
        } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET gender = COALESCE($1, gender),
                 age = COALESCE($2, age),
                 weight = COALESCE($3, weight),
                 height = COALESCE($4, height),
                 activity_level = COALESCE($5, activity_level),
                 daily_water_goal = COALESCE($6, daily_water_goal),
                 daily_calorie_goal = COALESCE($7, daily_calorie_goal),
                 daily_protein_goal = COALESCE($8, daily_protein_goal),
                 daily_fat_goal = COALESCE($9, daily_fat_goal),
                 daily_carbs_goal = COALESCE($10, daily_carbs_goal),
                 notifications_enabled = COALESCE($11, notifications_enabled),
                 reminder_time = COALESCE($12, reminder_time),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $13
             RETURNING id, username, email, gender, age, weight, height, activity_level, daily_water_goal, daily_calorie_goal, daily_protein_goal, daily_fat_goal, daily_carbs_goal, notifications_enabled, reminder_time`,
            [gender, age, weight, height, activity_level,
             daily_water_goal, daily_calorie_goal,
             daily_protein_goal, daily_fat_goal, daily_carbs_goal,
             notifications_enabled, reminder_time,
             userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить статистику за период
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period } = req.query; // week, month, year
        let interval;

        switch(period) {
            case 'week':
                interval = '7 days';
                break;
            case 'month':
                interval = '30 days';
                break;
            case 'year':
                interval = '365 days';
                break;
            default:
                interval = '7 days';
        }

        const waterStats = await pool.query(
            `SELECT record_date, SUM(amount) as total
             FROM water_records 
             WHERE user_id = $1 AND record_date >= CURRENT_DATE - INTERVAL '${interval}'
             GROUP BY record_date 
             ORDER BY record_date`,
            [userId]
        );

        const calorieStats = await pool.query(
            `SELECT record_date, SUM(calories) as total_calories,
                    SUM(protein) as total_protein,
                    SUM(fat) as total_fat,
                    SUM(carbs) as total_carbs
             FROM calorie_records 
             WHERE user_id = $1 AND record_date >= CURRENT_DATE - INTERVAL '${interval}'
             GROUP BY record_date 
             ORDER BY record_date`,
            [userId]
        );

        res.json({
            water: waterStats.rows,
            calories: calorieStats.rows
        });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;