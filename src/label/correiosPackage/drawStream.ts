import { writeFileSync } from 'fs';
import PDFKit = require('pdfkit');
import BarCodeData = require('../../barCode/data');
import drawStream = require('../../barCode/drawStream');

type coordinates<M extends string = '0' | '1'> = {
  // eslint-disable-next-line no-unused-vars
  [k in M]: number;
} & { length: 2 } & ReadonlyArray<number>;

const enum coord { // eslint-disable-line
  x, // eslint-disable-line
  y, // eslint-disable-line
} // whatever name I use, eslint complains about shadowing ??

class DrawLabel {
  private readonly doc: typeof PDFKit;

  // Caso seja true, significa que temos mais de uma label na pagina, caso seja
  // a segunda ou quarta, precisamos colocar ela a partir da metade da pagina
  private labelSecondHalfPage: boolean;

  constructor() {
    this.doc = new PDFKit({ bufferPages: true });
    this.labelSecondHalfPage = false;
  }

  private drawGluedLabelPlaceholder(): void {
    const marginLeft = 12;
    const marginTop = 12;
    const cornerSize = 12; // Tamanho do canto do retangulo
    const widthBetweenCorners = 260; // Largura da caixa - cornerSize - marginLeft
    const heightBetweenCorners = 139; // tamanho da caixa - cornerSize - marginLeft

    const pageSize = this.doc.page.width; // A4
    const halfPage = Math.round(pageSize / 2);
    // Tamanho total da caixa
    const labelWidth = widthBetweenCorners + cornerSize * 2;
    // Caso seja a segunda etiqueta, ela vai ser colocada apos metade da pagina
    const offset = this.labelSecondHalfPage ? halfPage - marginLeft : 0;
    const startDrawing = offset + marginLeft;
    // Caso seja a segunda etiqueta, a proxima vai ser a primeira
    this.labelSecondHalfPage = !(this.labelSecondHalfPage);

    const lineGap = 3; // Espaco entre os dois textos do placeholder de etiqueta
    const fontSizeBig = 10;
    const textY = 69; // Y do 'USO EXCLUSIVO DO CORREIOS' (incluindo marginLeft)
    const characterSpacingBig = 0.2;
    const fontSizeSmall = 8.2;
    const characterSpacingSmall = 0;

    // Seguimos a mesma ordem que as bordas no CSS seguem

    const topLeftCorner: coordinates = [
      startDrawing,
      marginTop + cornerSize,
    ];

    const topRightCorner: coordinates = [
      startDrawing + cornerSize + widthBetweenCorners,
      marginTop,
    ];

    const bottomRightCorner: coordinates = [
      topRightCorner[coord.x] + cornerSize,
      marginTop + cornerSize + heightBetweenCorners,
    ];

    const bottomLeftCorner: coordinates = [
      startDrawing + cornerSize,
      cornerSize + bottomRightCorner[coord.y],
    ];

    /* NOTA: Eu me asseguro pessoalmente de que todos esses parametros spread
     * t^em obrigat`oriamente dois argumentos satisfeitos pelo tipo coordinates.
     * O motivo pelos operadores rest estarem comentados eh porque o typescript
     * ainda nao suporta operadores rest adequadamente (mesmo usando array fixa)
    */
    let [X, Y] = topLeftCorner; // Can TypeScript support rest please?!
    this.doc.moveTo(/* ...topLeftCorner */ X, Y);
    topLeftCorner[coord.y] -= cornerSize;
    [, Y] = topLeftCorner;

    this.doc
      .lineCap('butt')
      .lineTo(/* ...topLeftCorner */ X, Y)
      .lineTo(topLeftCorner[coord.x] + cornerSize, topLeftCorner[coord.y])
      .stroke('black');

    [X, Y] = topRightCorner;
    this.doc.moveTo(/* ...topRightCorner */ X, Y);
    topRightCorner[coord.x] += cornerSize;
    [X] = topRightCorner;

    this.doc
      .lineCap('butt')
      .lineTo(/* ...topRightCorner */ X, Y)
      .lineTo(topRightCorner[coord.x], topRightCorner[coord.y] + cornerSize)
      .stroke('black');

    [X, Y] = bottomRightCorner;
    this.doc.moveTo(/* ...bottomRightCorner */ X, Y);
    bottomRightCorner[coord.y] += cornerSize;
    [, Y] = bottomRightCorner;

    this.doc
      .lineCap('butt')
      .lineTo(/* ...bottomRightCorner */ X, Y)
      .lineTo(
        bottomRightCorner[coord.x] - cornerSize,
        bottomRightCorner[coord.y],
      )
      .stroke('black');

    [X, Y] = bottomLeftCorner;
    this.doc.moveTo(/* ...bottomLeftCorner */ X, Y);
    bottomLeftCorner[coord.x] -= cornerSize;
    [X] = bottomLeftCorner;

    this.doc
      .lineCap('butt')
      .lineTo(/* ...bottomLeftCorner */ X, Y)
      .lineTo(bottomLeftCorner[coord.x], bottomLeftCorner[coord.y] - cornerSize)
      .stroke('black');

    // Colocar texto no placeholder da etiqueta colada

    const opts: PDFKit.Mixins.TextOptions = {
      align: 'center',
      width: labelWidth,
      characterSpacing: characterSpacingBig,
      lineGap,
    };

    this.doc
      .font('Helvetica')
      .fontSize(fontSizeBig)
      .text('USO EXCLUSIVO DOS CORREIOS',
        startDrawing, // X
        textY, opts); // Y

    opts.characterSpacing = characterSpacingSmall;
    this.doc
      .fontSize(fontSizeSmall)
      .text('Cole aqui a etiqueta com o código identificador da encomenda',
        startDrawing,
        undefined, // Relativo ao texto anterior
        opts);
  }

  public test() {
    this.drawGluedLabelPlaceholder();
    this.drawGluedLabelPlaceholder();
    this.doc.end();
    writeFileSync('/tmp/lol.pdf', this.doc.read());
  }
}

export default DrawLabel;
