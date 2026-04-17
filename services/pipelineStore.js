// services/pipelineStore.js
// PERMANENT JSON LOGGING VERSION

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LOG_FILE = path.join(DATA_DIR, 'pipeline_logs.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let sessions = loadLogs();

/*
sessions structure:

{
  sessionId123: {
    sessionId,
    firstSeen,
    lastSeen,
    currentStage,
    userAgent,
    events: [...]
  }
}
*/

function loadLogs() {
  try {
    if (!fs.existsSync(LOG_FILE)) return {};

    const raw = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.log('Failed loading logs:', err.message);
    return {};
  }
}

function saveLogs() {
  try {
    fs.writeFileSync(
      LOG_FILE,
      JSON.stringify(sessions, null, 2),
      'utf8'
    );
  } catch (err) {
    console.log('Failed saving logs:', err.message);
  }
}

function updateSession(sessionId, payload = {}) {
  if (!sessionId) sessionId = 'unknown';

  const now = Date.now();

  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      sessionId,
      firstSeen: now,
      lastSeen: now,
      currentStage: payload.stage || 'unknown',
      userAgent: payload.userAgent || '',
      events: []
    };
  }

  const session = sessions[sessionId];

  session.lastSeen = now;
  session.currentStage = payload.stage || session.currentStage;
  session.userAgent = payload.userAgent || session.userAgent;

  session.events.push({
    time: now,
    stage: payload.stage || 'unknown',
    userAgent: payload.userAgent || '',
    raw: payload.raw || {}
  });

  // keep newest 500 events
  if (session.events.length > 500) {
    session.events = session.events.slice(-500);
  }

  saveLogs();
}

function getAll() {
  return Object.values(sessions)
    .sort((a, b) => b.lastSeen - a.lastSeen);
}

function getSession(sessionId) {
  return sessions[sessionId] || null;
}

function clearAll() {
  sessions = {};
  saveLogs();
}

module.exports = {
  updateSession,
  getAll,
  getSession,
  clearAll
};
