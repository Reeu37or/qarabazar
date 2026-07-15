// api/logs.js
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
    return { logs: [] };
}

module.exports = async (req, res) => {
    const { adminKey, limit } = req.query;

    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    const db = readDB();
    const logs = db.logs || [];
    const limitNum = parseInt(limit) || 100;

    return res.json({
        total: logs.length,
        logs: logs.slice(-limitNum).reverse()
    });
};