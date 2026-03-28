const { spawn } = require('child_process');
const fs = require('fs');
const out = fs.openSync('./dev.log', 'a');
const err = fs.openSync('./dev.err', 'a');
const child = spawn('npm.cmd', ['run', 'dev'], { detached: true, stdio: ['ignore', out, err] });
child.unref();
console.log('Server spawned. PID:', child.pid);
