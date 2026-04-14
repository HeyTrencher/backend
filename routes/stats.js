const uploadController = require('../controllers/uploadController');

module.exports = (req, res) => {
    console.log('[STATS ROUTE HIT]');
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        return res.end('Method Not Allowed');
    }
    return uploadController.handleUpload(req, res);
};

