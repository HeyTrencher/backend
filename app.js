const http = require('http');
const fs = require('fs');
const path = require('path');

const statsRoute = require('./routes/stats');
const authRoute = require('./routes/auth');
const authController = require('./controllers/authController');

const PORT = 8880;
const DATA_FOLDER = path.join(__dirname, 'data/forensic_files');

const server = http.createServer((req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);

    if (req.url === '/' || req.url.startsWith('/login') || req.url.startsWith('/logout')) {
        return authRoute(req, res);
    }

    if (req.url === '/dashboard') {
        if (!authController.isAuthenticated(req)) {
            res.writeHead(302, { 'Location': '/' });
            return res.end();
        }
        const filePath = path.join(__dirname, 'private', 'dashboard.html');
        try {
            const html = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(html);
        } catch {
            res.writeHead(500);
            return res.end('Error loading dashboard');
        }
    }

    if (req.url.startsWith('/stats')) {
        if (!authController.isAuthenticated(req)) {
            res.writeHead(401);
            return res.end('Unauthorized');
        }
        return statsRoute(req, res);
    }

    if (req.url === '/devices') {
        if (!authController.isAuthenticated(req)) {
            res.writeHead(401);
            return res.end('Unauthorized');
        }
        try {
            const devices = generateDevicesJSON();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(devices));
        } catch {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: 'Failed to generate devices' }));
        }
    }

    if (req.url.startsWith('/files/')) {
        if (!authController.isAuthenticated(req)) {
            res.writeHead(401);
            return res.end('Unauthorized');
        }
        const relativePath = req.url.replace('/files/', '');
        const filePath = path.join(DATA_FOLDER, relativePath);
        if (!filePath.startsWith(DATA_FOLDER)) {
            res.writeHead(403);
            return res.end('Access denied');
        }
        try {
            const file = fs.readFileSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
            });
            return res.end(file);
        } catch {
            res.writeHead(404);
            return res.end('File not found');
        }
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function generateDevicesJSON() {
    if (!fs.existsSync(DATA_FOLDER)) return [];
    return fs.readdirSync(DATA_FOLDER, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(deviceDir => {
            const devicePath = path.join(DATA_FOLDER, deviceDir.name);
            const categories = fs.readdirSync(devicePath, { withFileTypes: true })
                .filter(c => c.isDirectory())
                .reduce((acc, catDir) => {
                    const catPath = path.join(devicePath, catDir.name);
                    const files = fs.readdirSync(catPath).map(fName => ({
                        name: fName,
                        path: `${deviceDir.name}/${catDir.name}/${fName}`
                    }));
                    acc[catDir.name] = files;
                    return acc;
                }, {});
            return { deviceUUID: deviceDir.name, categories };
        });
}