const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/pipeline.json');

function load() {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function save(data) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

function updateSession(id, update) {
    const data = load();

    if (!data[id]) {
        data[id] = {
            created: Date.now(),
            stages: []
        };
    }

    data[id].stages.push({
        time: Date.now(),
        ...update
    });

    save(data);
}

function getAll() {
    return load();
}

module.exports = {
    updateSession,
    getAll
};