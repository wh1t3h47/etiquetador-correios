import bwipjs from 'bwip-js';

interface Datamatrix {
  cepDestino: string,
  numeroRuaDestino: string,
  cepRemetente: string,
  numeroRuaRemetente: string,
  checkSumCepDestino: string,
}

class BarCodeModel {
  protected sanitizedCep: string;

  constructor() {
    this.sanitizedCep = '';
  }

  private sanitizeCep(cep: string): void {
    let sanitizedCep: string = cep.trim();
    if (cep.indexOf('-') !== -1) {
      sanitizedCep = sanitizedCep.replace('-', '').trim();
    }
    if (!/[0-9]{8,8}/.test(sanitizedCep)) {
      throw new Error('Formato de CEP incorreto!');
    }
    this.sanitizedCep = sanitizedCep;
  }

  public createDatamatrix(
    CepDestino: string,
    NumeroRuaDestino: number,
    CepRemetente: string,
    NumeroRuaRemetente: number,
  ): bwipjs.ToBufferOptions {
    this.sanitizeCep(CepDestino);
    const cepDestino: string = this.sanitizedCep;
    this.sanitizeCep(CepRemetente);
    const cepRemetente: string = this.sanitizedCep;

    if (NumeroRuaDestino > 99999 || NumeroRuaRemetente > 99999) {
      throw new Error('Erro: Número de rua muito alto');
    }
    const numeroRuaDestino: string = String(NumeroRuaDestino).padStart(5, '0');
    const numeroRuaRemetente: string = String(NumeroRuaRemetente).padStart(
      5,
      '0',
    );

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
    const data: string = `${datamatrix.cepDestino}${datamatrix.numeroRuaDestino}${datamatrix.cepRemetente}${datamatrix.numeroRuaRemetente}${datamatrix.checkSumCepDestino}`.padEnd(
      126,
      '0',
    );
    return {
      bcid: 'datamatrix',
      text: data,
      backgroundcolor: 'FFFFFF',
      scaleX: 1,
      scaleY: 1,
      width: 25,
      height: 25,
      paddingwidth: 1,
      paddingheight: 1,
      includetext: false,
    };
  }

  public createCode128(CepDestino: string): bwipjs.ToBufferOptions {
    this.sanitizeCep(CepDestino);
    const cepDestino = this.sanitizedCep;
    return {
      bcid: 'code128',
      text: cepDestino,
      backgroundcolor: 'FFFFFF',
      scaleX: 1,
      scaleY: 1,
      width: 55,
      height: 20,
      paddingwidth: 5,
      includetext: false,
      includecheck: true,
    };
  }
}

export default BarCodeModel;
