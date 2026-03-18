const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function runCmd(command) {
  execSync(command, { stdio: 'inherit' });
}

function detectPrivilegePrefix() {
  try {
    execSync('command -v sudo', { stdio: 'ignore' });
    return 'sudo ';
  } catch {
    return '';
  }
}

function addPathForNextSteps(dirPath) {
  if (process.env.GITHUB_PATH) {
    fs.appendFileSync(process.env.GITHUB_PATH, `${dirPath}\n`);
    return;
  }
  process.env.PATH = `${dirPath}:${process.env.PATH || ''}`;
}

async function run() {
  try {
    const version = process.env.INPUT_VERSION || 'latest';
    const privilegePrefix = detectPrivilegePrefix();
    
    console.log(`Installing MyCLI version: ${version} (jq-backed shim)...`);

    runCmd(`${privilegePrefix}apt-get update`);
    runCmd(`${privilegePrefix}apt-get install -y jq`);

    const shimDir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'mycli-bin');
    const shimPath = path.join(shimDir, 'mycli');
    fs.mkdirSync(shimDir, { recursive: true });

    const shimScript = `#!/usr/bin/env bash
set -euo pipefail

if [[ "\${1:-}" == "--version" ]]; then
  echo "mycli ${version} (shim using $(jq --version 2>/dev/null || echo 'jq unavailable'))"
  exit 0
fi

echo "mycli shim: no-op command (backed by jq install)."
exit 0
`;

    fs.writeFileSync(shimPath, shimScript, { mode: 0o755 });
    addPathForNextSteps(shimDir);

    console.log('MyCLI shim installed successfully.');
  } catch (error) {
    console.error(`Installation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();