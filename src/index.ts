/* eslint-disable no-console */
import BarcodeGenerator from './barCode/file';
import DrawLabel from './label/correiosPackage/drawStream';

(async () => {
  const dlbl = new DrawLabel();
  dlbl.test();
  console.log('c4n y0u f33l it?');
})();
