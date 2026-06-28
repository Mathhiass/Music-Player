const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

try {
  // Ensure the local prisma directory exists inside music-app
  fs.mkdirSync(path.join(__dirname, '../prisma'), { recursive: true });

  // Copy schema.prisma from the project root to the local directory
  fs.copyFileSync(
    path.join(__dirname, '../../prisma/schema.prisma'),
    path.join(__dirname, '../prisma/schema.prisma')
  );

  console.log('Prisma schema copied locally. Generating client...');

  // Run prisma generate in the context of the music-app folder
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}
