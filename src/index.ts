import BarcodeGenerator from './barCodeFile';

(async () => {
  const barcodeGenerator = new BarcodeGenerator();
  const newDm = await barcodeGenerator.createCode128('80310-160');
  // eslint-disable-next-line no-console
  console.log(newDm);
})();
