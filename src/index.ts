import criarDatamatrix from './barcodes';

(async () => {
  const newDm = await criarDatamatrix('80310-160', 666, '80320-160', 4242);
  // eslint-disable-next-line no-console
  console.log(newDm);
})();
