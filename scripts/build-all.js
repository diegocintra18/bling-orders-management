const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);

console.log('Project root:', rootDir);

try {
  console.log('\n=== Building packages and api ===');
  
  console.log('Building @bling-orders/core...');
  execSync('npm run build --workspace=@bling-orders/core', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('Core built');

  console.log('Building @bling-orders/infra...');
  execSync('npm run build --workspace=@bling-orders/infra', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('Infra built');

  console.log('Building @bling-orders/api...');
  execSync('npm run build --workspace=@bling-orders/api', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('API built');

  console.log('\n✅ Build complete!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
