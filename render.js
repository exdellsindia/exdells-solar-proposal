const path = require('path');
const puppeteer = require('puppeteer');

const outputPath = path.join(__dirname, 'exdells-solar-proposal.pdf');
const htmlPath = `file://${path.join(__dirname, 'index.html')}`;

const run = async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--font-render-hinting=medium']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });

  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__chartsReady === true, { timeout: 30000 });

  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true
  });

  await browser.close();

  // eslint-disable-next-line no-console
  console.log(`PDF generated at ${outputPath}`);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
