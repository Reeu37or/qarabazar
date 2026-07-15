// api/check-license.js
const SECRET_KEY = 'AirbusA220KITTED_Secret_2024';

// Хранилище в памяти (на Vercel данные НЕ сохраняются между запросами)
let licenses = [
    { userId: '4383533422', username: 'Dana_mammv', status: 'active', licenseKey: 'A7K9-M4X2-R5T8' },
    { userId: '123456789', username: 'TestUser', status: 'active', licenseKey: 'TEST-1234-5678' }
];

let logs = [];
let settings = { helloMessage: '👋 Добро пожаловать в AirbusA220KITTED!' };

module.exports = async (req, res) => {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, username, placeId, jobId, version, secret } = req.body;

        if (secret !== SECRET_KEY) {
            return res.status(401).json({ error: 'Invalid secret key' });
        }

        if (!userId) {
            return res.status(400).json({ allowed: false, error: 'UserId required' });
        }

        // Ищем лицензию
        const license = licenses.find(l => l.userId === userId);
        let allowed = false;
        let status = 'not_found';

        if (license) {
            status = license.status;
            if (license.status === 'active') {
                allowed = true;
            }
        }

        // Логируем проверку
        logs.push({
            userId,
            username: username || 'Unknown',
            placeId: placeId || '0',
            jobId: jobId || '0',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            result: allowed ? 'allowed' : 'denied',
            status: status
        });

        // Храним только 100 логов
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }

        return res.json({
            allowed: allowed,
            status: status,
            helloMessage: settings.helloMessage || '👋 Добро пожаловать в AirbusA220KITTED!'
        });

    } catch (error) {
        console.error('[ERROR]', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
