import { spawn } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

if (!process.env.SONAR_TOKEN) {
  console.error('SONAR_TOKEN is required to verify SonarCloud analysis.');
  process.exit(1);
}

const child = spawn('npx', ['--no-install', 'sonar-scanner-npm', '-Dsonar.qualitygate.wait=true'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  console.error(`Unable to start SonarCloud analysis: ${error.message}`);
  process.exitCode = 1;
});

child.on('close', (code) => {
  process.exitCode = code ?? 1;
});
