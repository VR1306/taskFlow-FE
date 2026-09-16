import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const token = process.env.SONAR_TOKEN;

if (!token) {
  console.log('⚠️  SONAR_TOKEN not found in environment or .env. Skipping SonarCloud upload.');
  process.exit(0);
}

console.log('🚀 Running SonarCloud Scan with configured token...');

const child = spawn('npx', ['sonar-scanner-npm', `-Dsonar.token=${token}`], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ SonarCloud scan failed with exit code ${code}`);
    process.exit(code || 1);
  }
  console.log('✅ SonarCloud scan completed successfully!');
  process.exit(0);
});
