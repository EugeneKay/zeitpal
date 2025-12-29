# ZeitPal Product Hunt Launch Materials

This folder contains all the materials needed for the ZeitPal Product Hunt launch.

## Contents

### 1. Launch Copy (`LAUNCH_COPY.md`)
- Tagline (60 characters)
- Short description (260 characters)
- First comment (post immediately after launch)
- Maker story
- Key talking points
- Social media posts
- FAQ for comments
- Gallery image descriptions

### 2. Featured Images (`images/`)

The HTML files are designed at 2560x1440 (2K resolution) and can be captured as screenshots.

| File | Description |
|------|-------------|
| `01-dashboard-overview.html` | Main dashboard with leave balance cards |
| `02-team-calendar.html` | Team calendar showing absences |
| `03-leave-request.html` | Leave request form |
| `04-approval-queue.html` | Manager approval queue |
| `05-hero-features.html` | Hero image with trust badges and features |

## How to Generate Screenshots at 2K Resolution

### Option 1: Using Chrome DevTools (Recommended)

1. Open any HTML file in Chrome
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
4. Type "Capture full size screenshot"
5. The image will be saved at the exact dimensions specified (2560x1440)

### Option 2: Using Puppeteer Script

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to 2K resolution
  await page.setViewport({ width: 2560, height: 1440 });

  const files = [
    '01-dashboard-overview.html',
    '02-team-calendar.html',
    '03-leave-request.html',
    '04-approval-queue.html',
    '05-hero-features.html'
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, 'images', file);
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(1000); // Wait for animations

    const outputName = file.replace('.html', '.png');
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', outputName),
      type: 'png'
    });

    console.log(`Captured: ${outputName}`);
  }

  await browser.close();
}

captureScreenshots();
```

### Option 3: Using the Browser Console

Open each HTML file and run this in the console:

```javascript
// Install html2canvas first (add to HTML):
// <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

html2canvas(document.body, {
  width: 2560,
  height: 1440,
  scale: 1
}).then(canvas => {
  const link = document.createElement('a');
  link.download = 'screenshot.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
```

### Option 4: Using macOS Screenshot

1. Open the HTML file in Safari
2. View > Enter Full Screen
3. Press `Cmd+Shift+4` then `Space` to capture the window
4. For exact dimensions, use the Automator or a screenshot tool like CleanShot X

## Product Hunt Image Guidelines

- **Gallery Images**: 1270x760px (minimum) - Our images are 2560x1440 which will scale down nicely
- **Thumbnail**: Automatically generated from first gallery image
- **Format**: PNG or JPG (PNG recommended for UI screenshots)
- **Recommended**: 5-8 images showing key features

## Recommended Gallery Order

1. **05-hero-features.html** - Lead with the value proposition
2. **01-dashboard-overview.html** - Show the product in action
3. **02-team-calendar.html** - Key feature: team visibility
4. **03-leave-request.html** - Key feature: ease of use
5. **04-approval-queue.html** - Key feature: manager workflow

## Launch Checklist

- [ ] Create Product Hunt account (if not already)
- [ ] Schedule launch for Tuesday/Wednesday (best days)
- [ ] Capture all 5 screenshots at 2K resolution
- [ ] Prepare the first comment (copy from LAUNCH_COPY.md)
- [ ] Notify team/friends to upvote at launch
- [ ] Post on social media (templates in LAUNCH_COPY.md)
- [ ] Monitor comments and respond promptly
- [ ] Update changelog/blog with launch announcement

## Design Notes

The images use:
- **Font**: Inter (Google Fonts)
- **Colors**: Neutral palette with blue/emerald/amber accents
- **Style**: Clean, minimal, Shadcn UI-inspired
- **Framework**: Tailwind CSS (via CDN)

All images are self-contained HTML files that can be viewed in any modern browser.
