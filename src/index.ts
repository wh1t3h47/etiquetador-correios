import criarDatamatrix from './barcodes';

(async () => {
  const newDm = await criarDatamatrix('80320-160');
  // eslint-disable-next-line no-console
  console.log(newDm);
})();
