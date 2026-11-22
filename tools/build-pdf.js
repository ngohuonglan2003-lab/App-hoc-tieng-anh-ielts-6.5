// Tạo lại file PDF cẩm nang: node tools/build-pdf.js  (cần Playwright + Chromium)
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const root = path.resolve(__dirname, '..');
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(root, 'docs', 'cam-nang.html'));
  await p.waitForSelector('body[data-ready="1"]');
  await p.pdf({
    path: path.join(root, 'docs', 'cam-nang-ielts-6.5.pdf'), format: 'A4', printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#888">Cẩm nang tự học IELTS 6.5 · trang <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' }
  });
  await b.close();
  console.log('Đã tạo docs/cam-nang-ielts-6.5.pdf');
})();
