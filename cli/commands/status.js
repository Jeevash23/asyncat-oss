'use strict';

const { execSync } = require('child_process');
const { procs } = require('../lib/procs');
const { log, ok, col } = require('../lib/colors');
const { readEnv } = require('../lib/env');

function portRunning(port) {
  try {
    const out = execSync(`lsof -ti :${port} 2>/dev/null`).toString().trim();
    return out.length > 0;
  } catch (_) {
    return false;
  }
}

function parsePort(value, fallback) {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 ? port : fallback;
}

function run() {
  const denEnv = readEnv('den/.env');
  const builtInLlamaPort = parsePort(denEnv.LLAMA_SERVER_PORT, 8765);

  log('');
  const checks = [
    { name: 'Backend  (den)', port: 8716, key: 'backend' },
    { name: 'Frontend (neko)', port: 8717, key: 'frontend' },
    { name: 'llama.cpp built-in', port: builtInLlamaPort, key: null },
    { name: 'Ollama            ', port: 11434, key: null },
    { name: 'llama.cpp server  ', port: 8080, key: null },
  ];

  for (const s of checks) {
    const running = (s.key && procs[s.key] !== null) || portRunning(s.port);
    if (running) {
      ok(`${s.name}  ${col('dim', ':' + s.port)}  ${col('green', 'running')}`);
    } else {
      log(`  ${col('dim', '○')}  ${s.name}  ${col('dim', ':' + s.port + '  stopped')}`);
    }
  }
  log('');
}

module.exports = { run };
