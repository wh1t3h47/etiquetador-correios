import { promises } from 'fs';
import temp = require('temp');
import fs = require('fs');
import bwipjs = require('bwip-js');

temp.track(); // limpa tempfiles ao sair do node
interface Datamatrix {
  cepDestino: string,
  numeroRuaDestino: string,
  cepRemetente: string,
  numeroRuaRemetente: string,
  checkSumCepDestino: string,
}

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

async function criarCodigo(data: string): Promise<string> {
  let returnPath = '';

  await new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'datamatrix',
        text: data,
        backgroundcolor: 'FFFFFF',
        scaleX: 3, // changeme: 1
        scaleY: 3, // ^^^^^^
        width: 25,
        height: 25,
        paddingwidth: 1,
        paddingheight: 1,
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
          const tempFile: promises.FileHandle = await fs.promises.open(
            info.path,
            'w',
          );
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

async function criarDatamatrix(
  CepDestino: string,
  NumeroRuaDestino: number,
  CepRemetente: string,
  NumeroRuaRemetente: number,
) : Promise<string> {
  const cepDestino: string = sanitizeCep(CepDestino);
  const cepRemetente: string = sanitizeCep(CepRemetente);
  if (NumeroRuaDestino > 99999 || NumeroRuaRemetente > 99999) {
    throw new Error('Erro: número de rua muito alto');
  }
  const numeroRuaDestino: string = String(NumeroRuaDestino).padStart(5, '0');
  const numeroRuaRemetente: string = String(NumeroRuaRemetente).padStart(5, '0');
  let checkSum = 0;
  cepDestino.split('').forEach((d) => {
    const digit = parseInt(d, 10);
    checkSum += digit;
    if (checkSum >= 10) {
      checkSum -= 10;
    }
  });
  checkSum = 10 - checkSum;
  const checkSumCepDestino = String(checkSum);
  const datamatrix: Datamatrix = {
    cepDestino,
    numeroRuaDestino,
    cepRemetente,
    numeroRuaRemetente,
    checkSumCepDestino,
  };
  const data: string = `${datamatrix.cepDestino}${datamatrix.numeroRuaDestino}${datamatrix.cepRemetente}${datamatrix.numeroRuaRemetente}${datamatrix.checkSumCepDestino}`
    .padEnd(126, '0');
  return criarCodigo(data);
}

export default criarDatamatrix;
