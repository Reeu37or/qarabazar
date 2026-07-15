// api/stats.js
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
    return { licenses: [], logs: [] };
}

module.exports = async (req, res) => {
    const { adminKey } = req.query;

    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    const db = readDB();
    const logs = db.logs || [];

    const stats = {
        totalLicenses: db.licenses.length,
        activeLicenses: db.licenses.filter(l => l.status === 'active').length,
        suspendedLicenses: db.licenses.filter(l => l.status === 'suspended').length,
        revokedLicenses: db.licenses.filter(l => l.status === 'revoked').length,
        totalChecks: logs.length,
        allowedChecks: logs.filter(l => l.result === 'allowed').length,
        deniedChecks: logs.filter(l => l.result === 'denied').length,
        lastCheck: logs.length > 0 ? logs[logs.length - 1] : null
    };

    return res.json(stats);
};