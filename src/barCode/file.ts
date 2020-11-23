import { promises } from 'fs';
import temp = require('temp');
import fs = require('fs');
import bwipjs = require('bwip-js');
import BarCodeData = require('./data');

temp.track(); // limpa tempfiles ao sair do node

class BarCodeFileGenerator extends BarCodeData.default {
  private barcodePath: string;

  constructor() {
    super();
    this.barcodePath = '';
  }

  private async criarCodigo(
    barcodeGen: bwipjs.ToBufferOptions,
  ): Promise<void> {
    let resolvedPath = '';

    await new Promise((resolve, reject) => {
      bwipjs.toBuffer(barcodeGen, (err, png) => {
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
          resolvedPath = info.path;
          resolve();
        });
      });
    });

    if (!resolvedPath) throw new Error('Erro ao criar QR Code!');
    this.barcodePath = resolvedPath;
  }

  public async generateDatamatrix(
    CepDestino: string,
    NumeroRuaDestino: number,
    CepRemetente: string,
    NumeroRuaRemetente: number,
  ): Promise<string> {
    const barcodeData = super.createDatamatrix(
      CepDestino, NumeroRuaDestino, CepRemetente, NumeroRuaRemetente,
    );
    await this.criarCodigo(barcodeData);
    return this.barcodePath;
  }

  public async generateCode128(CepDestino: string): Promise<string> {
    const barCodeData = super.createCode128(CepDestino);
    await this.criarCodigo(barCodeData);
    return this.barcodePath;
  }
}

export default BarCodeFileGenerator;
