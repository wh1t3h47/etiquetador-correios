/* eslint-disable no-console */
import DrawTest from './label/correiosPackage/drawTest';
import {BrazilState, sender, recipient} from './label/pageTypes'

export default async (
      RemetenteObj: sender,
      DestinatarioObj: recipient,
  ) => {
  // Cria um PDF
  const pdfCreateFileWithStream = new DrawTest();
  // Roda o teste de desenhar a label
  pdfCreateFileWithStream.test(RemetenteObj, DestinatarioObj);
  console.log('generated /tmp/lol.pdf, open it!');
};
