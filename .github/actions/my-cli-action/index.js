const { execSync } = require('child_process');

async function run() {
  try {
    const version = process.env.INPUT_VERSION || 'latest';
    
    console.log(`Installing MyCLI version: ${version}...`);

    execSync(`bash -o pipefail -c "curl -fsSL https://cli.example.com/install.sh | sh"`, {
      stdio: 'inherit',
    });

    console.log("MyCLI installed successfully.");
  } catch (error) {
    console.error(`Installation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();