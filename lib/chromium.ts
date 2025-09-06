import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import path from 'path';

// Font path for Japanese support
const fontPath = path.join(process.cwd(), 'fonts', 'NotoSansJP.ttf');

export async function getBrowser() {
  // Load Japanese font
  await chromium.font(fontPath);
  
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1920, height: 1080 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  return browser;
}

export async function generatePDFFromHTML(html: string, options?: Record<string, unknown>): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  // Set content with proper encoding for Japanese
  await page.setContent(html, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  });
  
  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  
  // Generate PDF with default options
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm',
    },
    ...options,
  });
  
  await browser.close();
  return pdfBuffer;
}