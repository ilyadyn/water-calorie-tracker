const pool = require('../server');

const initDB = async () => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                gender VARCHAR(10),
                age INTEGER,
                weight DECIMAL(5,2),
                height DECIMAL(5,2),
                activity_level VARCHAR(50) DEFAULT 'moderate',
                daily_water_goal INTEGER DEFAULT 2000,
                daily_calorie_goal INTEGER DEFAULT 2000,
                daily_protein_goal INTEGER DEFAULT 50,
                daily_fat_goal INTEGER DEFAULT 65,
                daily_carbs_goal INTEGER DEFAULT 250,
                notifications_enabled BOOLEAN DEFAULT true,
                reminder_time TIME DEFAULT '09:00:00',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS water_records (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                record_date DATE DEFAULT CURRENT_DATE,
                record_time TIME DEFAULT CURRENT_TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS food_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                icon VARCHAR(50)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS calorie_records (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                food_name VARCHAR(255) NOT NULL,
                calories INTEGER NOT NULL,
                protein DECIMAL(5,1) DEFAULT 0,
                fat DECIMAL(5,1) DEFAULT 0,
                carbs DECIMAL(5,1) DEFAULT 0,
                meal_type VARCHAR(50) DEFAULT 'other',
                category_id INTEGER REFERENCES food_categories(id),
                portion_size VARCHAR(100),
                record_date DATE DEFAULT CURRENT_DATE,
                record_time TIME DEFAULT CURRENT_TIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS favorite_foods (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                food_name VARCHAR(255) NOT NULL,
                calories INTEGER NOT NULL,
                protein DECIMAL(5,1) DEFAULT 0,
                fat DECIMAL(5,1) DEFAULT 0,
                carbs DECIMAL(5,1) DEFAULT 0,
                category_id INTEGER REFERENCES food_categories(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                goal_type VARCHAR(50) NOT NULL,
                target_value DECIMAL(10,2) NOT NULL,
                current_value DECIMAL(10,2) DEFAULT 0,
                start_date DATE DEFAULT CURRENT_DATE,
                end_date DATE,
                is_completed BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS reminders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                reminder_type VARCHAR(50) NOT NULL,
                reminder_time TIME NOT NULL,
                days_of_week TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS body_measurements (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                weight DECIMAL(5,2),
                chest DECIMAL(5,2),
                waist DECIMAL(5,2),
                hips DECIMAL(5,2),
                measurement_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            INSERT INTO food_categories (name, icon) VALUES 
                ('Овощи', 'vegetables'),
                ('Фрукты', 'fruits'),
                ('Мясо', 'meat'),
                ('Рыба', 'fish'),
                ('Молочные продукты', 'dairy'),
                ('Зерновые', 'grains'),
                ('Напитки', 'drinks'),
                ('Сладости', 'sweets'),
                ('Фастфуд', 'fastfood'),
                ('Другое', 'other')
            ON CONFLICT (name) DO NOTHING;
        `);

        await client.query('COMMIT');
        console.log('База данных успешно инициализирована');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка инициализации БД:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = initDB;