/* eslint-disable no-console */
import BarcodeGenerator from './barCode/file';
import pdfDraw from './label/correiosPackage/drawStream';

const { addCode, TestStuff } = pdfDraw;

(async () => {
  const barcodeGenerator = new BarcodeGenerator();
  const newBcode = barcodeGenerator.createCode128('80310-160');
  const newDm = barcodeGenerator.createDatamatrix('80310-160', 31337, '80310-160', 31337);
  addCode(0, 0, newBcode);
  addCode(0, 100, newDm);
  TestStuff('/tmp/lol.pdf');
  console.log(newDm);
  console.log(newBcode);
})();
