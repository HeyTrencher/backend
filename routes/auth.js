const authController = require('../controllers/authController');

module.exports = (req, res) => {
    if (req.url === '/login' && req.method === 'POST') {
        return authController.login(req, res);
    }
    if (req.url === '/logout') {
        return authController.logout(req, res);
    }
    if (req.method === 'GET') {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../public/login.html');
        try {
            const html = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(html);
        } catch (err) {
            res.writeHead(500);
            return res.end('Error loading login page');
        }
    }
    res.writeHead(404);
    res.end('Not Found');
};