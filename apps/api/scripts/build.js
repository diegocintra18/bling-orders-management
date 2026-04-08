const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scriptDir = path.resolve(__dirname);
const rootDir = path.join(scriptDir, '..', '..', '..');
const apiDir = path.join(rootDir, 'apps', 'api');

console.log('Script dir:', scriptDir);
console.log('Root dir:', rootDir);

const nodeModules = path.join(apiDir, 'node_modules/@bling-orders');
if (!fs.existsSync(nodeModules)) {
  fs.mkdirSync(nodeModules, { recursive: true });
}

try {
  console.log('\n=== Building @bling-orders/core ===');
  execSync('npx tsc -p packages/core/tsconfig.json', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('Core built successfully');

  console.log('\n=== Copying core to node_modules ===');
  const coreSrc = path.join(rootDir, 'packages/core/dist');
  if (fs.existsSync(coreSrc)) {
    fs.cpSync(coreSrc, path.join(nodeModules, 'core'), { recursive: true });
    console.log('Core copied to node_modules');
  } else {
    console.log('Core dist not found at:', coreSrc);
  }

  console.log('\n=== Building @bling-orders/infra ===');
  execSync('npx tsc -p packages/infra/tsconfig.json', { 
    cwd: rootDir, 
    stdio: 'inherit'
  });
  console.log('Infra built successfully');

  console.log('\n=== Copying infra to node_modules ===');
  const infraSrc = path.join(rootDir, 'packages/infra/dist');
  if (fs.existsSync(infraSrc)) {
    fs.cpSync(infraSrc, path.join(nodeModules, 'infra'), { recursive: true });
    console.log('Infra copied to node_modules');
  } else {
    console.log('Infra dist not found at:', infraSrc);
  }

  console.log('\n=== Building @bling-orders/api ===');
  execSync('npx tsc -p tsconfig.build.json', { 
    cwd: apiDir, 
    stdio: 'inherit'
  });
  console.log('API built successfully');

  console.log('\n✅ Build complete!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
