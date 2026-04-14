const fs = require('fs');
const path = require('path');

const ROOT_FOLDER = path.join(__dirname, '../data/forensic_files');

function ensureFolderExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

exports.saveFile = (data) => {
    const deviceUUID = data.deviceUUID || 'unknown_device';
    const category = data.category || 'misc';
    const fileName = data.fileName || `file_${Date.now()}`;
    const base64Data = data.base64Data;
    const deviceFolder = path.join(ROOT_FOLDER, deviceUUID);
    const categoryFolder = path.join(deviceFolder, category);
    ensureFolderExists(categoryFolder);
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fullPath = path.join(categoryFolder, fileName);
    fs.writeFileSync(fullPath, fileBuffer);
    console.log(`[FILE SAVED] ${fullPath}`);
    return fullPath;
};

exports.saveMetadata = (info) => {
    const logPath = path.join(ROOT_FOLDER, 'metadata_log.json');
    let logs = [];
    if (fs.existsSync(logPath)) {
        try { logs = JSON.parse(fs.readFileSync(logPath)); } catch { logs = []; }
    }
    logs.push(info);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
};