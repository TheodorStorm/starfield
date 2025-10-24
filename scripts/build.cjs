#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json
const pkg = require('../package.json');

// Generate version.js
const versionContent = `// Auto-generated during build from package.json
export const VERSION = '${pkg.version}';
export const REPO_URL = '${pkg.repository.url.replace('git+', '').replace('.git', '')}';
`;

fs.writeFileSync(path.join(__dirname, '../src/version.js'), versionContent);
console.log(`Generated version.js: v${pkg.version}`);

// Copy files to dist
execSync('mkdir -p dist && cp src/*.js dist/ && cp src/*.d.ts dist/', { stdio: 'inherit' });
console.log('Build complete!');
