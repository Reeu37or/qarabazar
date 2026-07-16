export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // БАЗА КЛИЕНТОВ ВПИСЫВАЕТСЯ СЮДА
    const ALLOWED_USERS = [
        "123456789", 
        "987654321"  
    ];

    try {
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        const robloxId = body.roblox_id ? body.roblox_id.toString() : "";

        if (ALLOWED_USERS.includes(robloxId)) {
            res.status(200).json({ status: "true" });
        } else {
            res.status(200).json({ status: "false" });
        }
    } catch (e) {
        res.status(200).json({ status: "false" });
    }
}
