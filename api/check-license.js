// api/check-license.js
const fs = require('fs');
const path = require('path');

// Путь к файлу базы данных
const DB_PATH = path.join(__dirname, '../data/licenses.json');

// Чтение базы
function readDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {}
    return { licenses: [], logs: [], settings: { helloMessage: '👋 Добро пожаловать в AirbusA220KITTED!' } };
}

// Запись базы
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Секретный ключ (замени на свой)
const SECRET_KEY = 'AirbusA220KITTED_Secret_2024';

module.exports = async (req, res) => {
    // Только POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, username, placeId, jobId, version, secret } = req.body;

    // Проверка секретного ключа
    if (secret !== SECRET_KEY) {
        return res.status(401).json({ error: 'Invalid secret key' });
    }

    if (!userId) {
        return res.status(400).json({ allowed: false, error: 'UserId required' });
    }

    const db = readDB();
    
    // Ищем лицензию
    const license = db.licenses.find(l => l.userId === userId);
    
    // Проверяем статус
    let allowed = false;
    let status = 'not_found';
    
    if (license) {
        status = license.status;
        if (license.status === 'active') {
            allowed = true;
        }
    }

    // Логируем проверку
    db.logs.push({
        userId,
        username: username || 'Unknown',
        placeId: placeId || '0',
        jobId: jobId || '0',
        timestamp: Date.now(),
        date: new Date().toISOString(),
        result: allowed ? 'allowed' : 'denied',
        status: status,
        version: version || '1.0.0'
    });

    // Храним только последние 1000 логов
    if (db.logs.length > 1000) {
        db.logs = db.logs.slice(-1000);
    }

    writeDB(db);

    return res.json({
        allowed: allowed,
        status: status,
        helloMessage: db.settings.helloMessage || '👋 Добро пожаловать в AirbusA220KITTED!'
    });
};