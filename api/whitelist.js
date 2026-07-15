// api/whitelist.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/licenses.json');
const ADMIN_KEY = 'Admin_Secret_2024';

function readDB() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        }
    } catch (e) {}
    return { licenses: [], logs: [], settings: { helloMessage: '👋 Добро пожаловать в AirbusA220KITTED!' } };
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = async (req, res) => {
    const { action, adminKey, userId, username, status } = req.body;

    // Проверка админ-ключа
    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    const db = readDB();

    switch (action) {
        case 'add':
            if (!userId || !username) {
                return res.status(400).json({ error: 'userId and username required' });
            }
            
            // Проверяем, нет ли уже
            const existing = db.licenses.find(l => l.userId === userId);
            if (existing) {
                return res.status(400).json({ error: 'License already exists', license: existing });
            }

            const newLicense = {
                userId: userId,
                username: username,
                status: 'active',
                licenseKey: generateLicenseKey(),
                createdAt: Date.now()
            };
            db.licenses.push(newLicense);
            writeDB(db);
            return res.json({ success: true, license: newLicense });

        case 'remove':
            if (!userId) {
                return res.status(400).json({ error: 'userId required' });
            }
            db.licenses = db.licenses.filter(l => l.userId !== userId);
            writeDB(db);
            return res.json({ success: true });

        case 'update':
            if (!userId || !status) {
                return res.status(400).json({ error: 'userId and status required' });
            }
            const license = db.licenses.find(l => l.userId === userId);
            if (!license) {
                return res.status(404).json({ error: 'License not found' });
            }
            license.status = status;
            writeDB(db);
            return res.json({ success: true, license });

        case 'list':
            return res.json({ licenses: db.licenses });

        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
};

// Генерация лицензионного ключа
function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) key += '-';
    }
    return key;
}