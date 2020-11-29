/* eslint-disable no-console */
import BarcodeGenerator from './barCode/file';
import PdfDraw from './label/correiosPackage/drawStream';

(async () => {
  const pdfCreateFileWithStream = new PdfDraw();
  pdfCreateFileWithStream.test();
})();
