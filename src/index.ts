/* eslint-disable no-console */
import DrawTest from './label/correiosPackage/drawTest';

(async () => {
  // Cria um PDF
  const pdfCreateFileWithStream = new DrawTest();
  // Roda o teste de desenhar a label
  pdfCreateFileWithStream.test();
  console.log('generated /tmp/lol.pdf, open it!');
})();
