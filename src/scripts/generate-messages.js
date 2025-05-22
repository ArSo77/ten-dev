// ES Module wrapper to run the TypeScript script
import { execSync } from 'child_process';

console.log('Running message generator script...');

try {
  execSync('npx tsx src/scripts/generate-messages.ts', { stdio: 'inherit' });
  console.log('Message generation completed successfully!');
} catch (error) {
  console.error('Error executing message generator:', error);
  process.exit(1);
} 