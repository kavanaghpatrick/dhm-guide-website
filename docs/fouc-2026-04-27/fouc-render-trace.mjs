// Trace the EXACT moment of first paint and what's painted
import { chromium } from 'playwright';

const SCREENSHOT_DIR = '/Users/patrickkavanagh/dhm-guide-website/docs/fouc-2026-04-27/screenshots';

async function trace({ url, name, viewport, deviceLabel, throttle3G }) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  if (throttle3G) {
    // Simulate slow 3G to expose the FOUC window
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 200,
      downloadThroughput: (400 * 1024) / 8, // 400 Kbps download
      uploadThroughput: (400 * 1024) / 8,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  }

  // Capture screencast to see every frame
  await cdp.send('Page.startScreencast', {
    format: 'png',
    quality: 80,
    everyNthFrame: 1,
  });

  const frames = [];
  cdp.on('Page.screencastFrame', async (frame) => {
    frames.push({
      data: frame.data,
      timestamp: frame.metadata.timestamp,
      sessionId: frame.sessionId,
    });
    try {
      await cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  const start = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  const loaded = Date.now() - start;

  // Wait a bit more for everything to settle
  await page.waitForTimeout(3000);

  await cdp.send('Page.stopScreencast');

  console.log(`Captured ${frames.length} frames over ${Date.now() - start}ms`);
  console.log(`Load event at: ${loaded}ms`);

  // Save key frames at intervals
  const fs = await import('node:fs/promises');
  const navStart = frames[0]?.timestamp || 0;
  const intervals = [0, 200, 400, 600, 800, 1000, 1500, 2000, 3000, 5000];
  for (const target of intervals) {
    const targetTs = navStart + target / 1000;
    let bestFrame = null;
    let bestDist = Infinity;
    for (const f of frames) {
      const dist = Math.abs(f.timestamp - targetTs);
      if (dist < bestDist) {
        bestDist = dist;
        bestFrame = f;
      }
    }
    if (bestFrame) {
      const tag = throttle3G ? 'slow3G' : 'normal';
      const buf = Buffer.from(bestFrame.data, 'base64');
      const filepath = `${SCREENSHOT_DIR}/${name}-${deviceLabel}-${tag}-frame-${target}ms.png`;
      await fs.writeFile(filepath, buf);
      console.log(`  ${target}ms target -> actual ${((bestFrame.timestamp - navStart) * 1000).toFixed(0)}ms saved`);
    }
  }

  await browser.close();
}

await trace({
  url: 'https://www.dhmguide.com/',
  name: 'home',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
  throttle3G: true,
});

await trace({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 1280, height: 800 },
  deviceLabel: 'desktop',
  throttle3G: true,
});

await trace({
  url: 'https://www.dhmguide.com/never-hungover/dhm-dosage-guide-2025',
  name: 'dosage-guide',
  viewport: { width: 390, height: 844 },
  deviceLabel: 'mobile',
  throttle3G: true,
});

console.log('Done');
