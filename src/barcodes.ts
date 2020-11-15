import { promises } from 'fs';
import temp = require('temp');
import fs = require('fs');
import bwipjs = require('bwip-js');

temp.track(); // limpa tempfiles ao sair do node

function sanitizeCep(cep: string): string {
  let sanitizedCep: string = cep.trim();
  if (cep.indexOf('-') !== -1) {
    sanitizedCep = sanitizedCep.replace('-', '').trim();
  }
  if (!/[0-9]{8,8}/.test(sanitizedCep)) {
    throw new Error('Formato de CEP incorreto!');
  }
  return sanitizedCep;
}

async function criarDatamatrix(cep: string): Promise<string> {
  const sanitizedCep: string = sanitizeCep(cep);
  let returnPath = '';

  await new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'datamatrix',
        text: sanitizedCep,
        scaleX: 1,
        scaleY: 1,
        height: 25,
        width: 25,
        includetext: false,
      },
      (err, png) => {
        if (err) {
          if (typeof err === 'string') {
            reject(new Error(err));
          } // else
          reject(err);
        }
        // `png` is a Buffer
        // png.length           : PNG file length
        // png.readUInt32BE(16) : PNG image width
        // png.readUInt32BE(20) : PNG image height
        temp.open('etiquetaCorreios', async (_err, info) => {
          if (_err) {
            if (typeof _err === 'string') {
              reject(new Error(_err));
            } // else
            reject(_err);
          }
          const tempFile: promises.FileHandle = await fs.promises.open(info.path, 'w');
          await fs.promises.writeFile(tempFile, png);
          fs.close(info.fd, (__err) => {
            if (_err) reject(new Error(__err?.message));
          }); // else
          returnPath = info.path;
          resolve();
        });
      },
    );
  });

  if (!returnPath) throw new Error('Erro ao criar QR Code!');
  return returnPath;
}

export default criarDatamatrix;
