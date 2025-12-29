#!/usr/bin/env node
/**
 * Screenshot Capture Script for Product Hunt Images
 *
 * This script uses Puppeteer to capture all HTML mockups as 2K PNG images.
 *
 * Usage:
 *   npx puppeteer browsers install chrome
 *   node capture-screenshots.js
 *
 * Or run with npx:
 *   npx puppeteer browsers install chrome && node capture-screenshots.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const VIEWPORT = {
  width: 1920,
  height: 1440,
  deviceScaleFactor: 1
};

const IMAGES = [
  { file: '01-dashboard-overview.html', name: '01-dashboard-overview.png' },
  { file: '02-team-calendar.html', name: '02-team-calendar.png' },
  { file: '03-leave-request.html', name: '03-leave-request.png' },
  { file: '04-approval-queue.html', name: '04-approval-queue.png' },
  { file: '05-hero-features.html', name: '05-hero-features.png' }
];

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');

  // Create output directory
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  for (const image of IMAGES) {
    const inputPath = path.join(__dirname, 'images', image.file);
    const outputPath = path.join(outputDir, image.name);

    console.log(`📸 Capturing: ${image.file}`);

    try {
      await page.goto(`file://${inputPath}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts and animations to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false, // Use viewport size exactly
        clip: {
          x: 0,
          y: 0,
          width: VIEWPORT.width,
          height: VIEWPORT.height
        }
      });

      console.log(`   ✅ Saved: ${image.name}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }

  await browser.close();

  console.log('\n✨ Done! Screenshots saved to ./screenshots/');
  console.log('\nImage dimensions: 1920x1440 (4:3 aspect ratio)');
  console.log('Format: PNG\n');

  // List generated files
  const files = fs.readdirSync(outputDir);
  console.log('Generated files:');
  files.forEach(file => {
    const stats = fs.statSync(path.join(outputDir, file));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - ${file} (${sizeMB} MB)`);
  });
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  captureScreenshots().catch(console.error);
} catch (e) {
  console.log('⚠️  Puppeteer not found. Installing...\n');
  console.log('Run: npm install puppeteer');
  console.log('Then: node capture-screenshots.js\n');

  // Provide alternative instructions
  console.log('Alternative: Open HTML files in Chrome and use DevTools:');
  console.log('1. Open any HTML file in Chrome');
  console.log('2. Press F12 to open DevTools');
  console.log('3. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)');
  console.log('4. Type "Capture full size screenshot" and press Enter\n');
}
