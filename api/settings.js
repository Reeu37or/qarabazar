// api/settings.js
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
    return { settings: { helloMessage: '👋 Добро пожаловать в AirbusA220KITTED!' } };
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = async (req, res) => {
    const { adminKey, action, helloMessage } = req.body;

    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    const db = readDB();

    if (action === 'get') {
        return res.json({ settings: db.settings });
    }

    if (action === 'update' && helloMessage !== undefined) {
        db.settings.helloMessage = helloMessage;
        writeDB(db);
        return res.json({ success: true, settings: db.settings });
    }

    return res.status(400).json({ error: 'Invalid action' });
};