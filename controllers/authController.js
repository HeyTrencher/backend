const crypto = require('crypto');

const USERNAME = "admin";
const PASSWORD = "password123";

let sessions = {};

exports.login = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        const params = new URLSearchParams(body);
        const user = params.get('user');
        const pass = params.get('pass');
        if (user === USERNAME && pass === PASSWORD) {
            const sessionId = crypto.randomBytes(16).toString('hex');
            sessions[sessionId] = true;
            res.writeHead(302, {
                'Set-Cookie': `session=${sessionId}; HttpOnly`,
                'Location': '/dashboard'
            });
            return res.end();
        } else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            return res.end('Invalid credentials');
        }
    });
};

exports.logout = (req, res) => {
    res.writeHead(302, {
        'Set-Cookie': 'session=; Max-Age=0',
        'Location': '/'
    });
    res.end();
};

exports.isAuthenticated = (req) => {
    const cookie = req.headers.cookie;
    if (!cookie) return false;
    const match = cookie.match(/session=([a-f0-9]+)/);
    if (!match) return false;
    return sessions[match[1]] === true;
};