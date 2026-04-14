const fileService = require('../services/fileService');

exports.handleUpload = (req, res) => {
    console.log('[UPLOAD CONTROLLER] Receiving data...');
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.deviceUUID || !data.category || !data.base64Data) {
                res.writeHead(400);
                return res.end('Missing required fields');
            }
            console.log('[DATA RECEIVED]', { device: data.deviceUUID, category: data.category, file: data.fileName });
            const savedPath = fileService.saveFile(data);
            fileService.saveMetadata({
                deviceUUID: data.deviceUUID,
                category: data.category,
                fileName: data.fileName,
                timestamp: new Date().toISOString()
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'OK', savedPath }));
        } catch (error) {
            console.log('[ERROR]', error);
            res.writeHead(500);
            return res.end('Server error');
        }
    });
};