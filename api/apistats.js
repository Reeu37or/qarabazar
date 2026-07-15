// api/stats.js
const ADMIN_KEY = 'Admin_Secret_2024';

const DB = {
    licenses: [
        { userId: '4383533422', username: 'Dana_mammv', status: 'active' },
        { userId: '123456789', username: 'TestUser', status: 'active' }
    ],
    logs: [
        { userId: '4383533422', username: 'Dana_mammv', result: 'allowed', timestamp: Date.now() - 60000 },
        { userId: '123456789', username: 'TestUser', result: 'denied', timestamp: Date.now() - 120000 }
    ]
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { adminKey } = req.query;

    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    try {
        const stats = {
            totalLicenses: DB.licenses.length,
            activeLicenses: DB.licenses.filter(l => l.status === 'active').length,
            suspendedLicenses: DB.licenses.filter(l => l.status === 'suspended').length,
            revokedLicenses: DB.licenses.filter(l => l.status === 'revoked').length,
            totalChecks: DB.logs.length,
            allowedChecks: DB.logs.filter(l => l.result === 'allowed').length,
            deniedChecks: DB.logs.filter(l => l.result === 'denied').length,
            lastCheck: DB.logs.length > 0 ? DB.logs[DB.logs.length - 1] : null
        };
        return res.json(stats);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
