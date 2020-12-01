/* eslint-disable no-console */
import PdfDraw from './label/correiosPackage/drawStream';

(async () => {
  const pdfCreateFileWithStream = new PdfDraw();
  pdfCreateFileWithStream.test();
  console.log('generated /tmp/lol.pdf, open it!');
})();
