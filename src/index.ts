/* eslint-disable no-console */
import DrawTest from './label/correiosPackage/drawTest';

(async () => {
  const pdfCreateFileWithStream = new DrawTest();
  pdfCreateFileWithStream.test();
  console.log('generated /tmp/lol.pdf, open it!');
})();
