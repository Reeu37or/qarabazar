// api/whitelist.js
const ADMIN_KEY = 'Admin_Secret_2024';

// Общее хранилище (синхронизация с check-license)
const DB = {
    licenses: [
        { userId: '4383533422', username: 'Dana_mammv', status: 'active' },
        { userId: '123456789', username: 'TestUser', status: 'active' }
    ]
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, adminKey, userId, username, status } = req.body;

    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    try {
        switch (action) {
            case 'list':
                return res.json({ licenses: DB.licenses });

            case 'add':
                if (!userId || !username) {
                    return res.status(400).json({ error: 'userId and username required' });
                }
                if (DB.licenses.find(l => l.userId === userId)) {
                    return res.status(400).json({ error: 'License already exists' });
                }
                DB.licenses.push({ userId, username, status: 'active' });
                return res.json({ success: true, license: { userId, username, status: 'active' } });

            case 'remove':
                if (!userId) {
                    return res.status(400).json({ error: 'userId required' });
                }
                DB.licenses = DB.licenses.filter(l => l.userId !== userId);
                return res.json({ success: true });

            case 'update':
                if (!userId || !status) {
                    return res.status(400).json({ error: 'userId and status required' });
                }
                const license = DB.licenses.find(l => l.userId === userId);
                if (!license) {
                    return res.status(404).json({ error: 'License not found' });
                }
                license.status = status;
                return res.json({ success: true, license });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};// api/whitelist.js
const ADMIN_KEY = 'Admin_Secret_2024';

// Общее хранилище (синхронизация с check-license)
const DB = {
    licenses: [
        { userId: '4383533422', username: 'Dana_mammv', status: 'active' },
        { userId: '123456789', username: 'TestUser', status: 'active' }
    ]
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, adminKey, userId, username, status } = req.body;

    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Invalid admin key' });
    }

    try {
        switch (action) {
            case 'list':
                return res.json({ licenses: DB.licenses });

            case 'add':
                if (!userId || !username) {
                    return res.status(400).json({ error: 'userId and username required' });
                }
                if (DB.licenses.find(l => l.userId === userId)) {
                    return res.status(400).json({ error: 'License already exists' });
                }
                DB.licenses.push({ userId, username, status: 'active' });
                return res.json({ success: true, license: { userId, username, status: 'active' } });

            case 'remove':
                if (!userId) {
                    return res.status(400).json({ error: 'userId required' });
                }
                DB.licenses = DB.licenses.filter(l => l.userId !== userId);
                return res.json({ success: true });

            case 'update':
                if (!userId || !status) {
                    return res.status(400).json({ error: 'userId and status required' });
                }
                const license = DB.licenses.find(l => l.userId === userId);
                if (!license) {
                    return res.status(404).json({ error: 'License not found' });
                }
                license.status = status;
                return res.json({ success: true, license });

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
