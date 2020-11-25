import { writeFileSync } from 'fs';
import PDFKit = require('pdfkit');
import BarCodeData = require('../../barCode/data');
import drawStream = require('../../barCode/drawStream');

type coordinates<M extends string = '0' | '1'> = {
  // eslint-disable-next-line no-unused-vars
  [k in M]: number;
} & { length: 2 } & ReadonlyArray<number>;

// Regras quebradas usando const enum no typescript:
// https://github.com/typescript-eslint/typescript-eslint/issues/2484

const enum coord { // eslint-disable-line
  x, // eslint-disable-line
  y, // eslint-disable-line
}

const enum positionOnPage { // eslint-disable-line
  topLeft, // eslint-disable-line
  topRight, // eslint-disable-line
  bottomLeft, // eslint-disable-line
  bottomRight, // eslint-disable-line
}

class DrawLabel {
  private readonly doc: typeof PDFKit;

  // Caso seja true, significa que temos mais de uma label na pagina, caso seja
  // a segunda ou quarta, precisamos colocar ela a partir da metade da pagina
  private label: positionOnPage;

  private lastY: number;

  private readonly pageSize: number;

  private readonly halfPage: number;

  private readonly marginTop: number;

  private readonly marginLeft: number;

  private readonly fontSizeSmall: number;

  private readonly characterSpacingSmall: number;

  constructor() {
    this.doc = new PDFKit({ bufferPages: true });
    this.pageSize = this.doc.page.width; // A4
    this.halfPage = Math.round(this.pageSize / 2);
    this.label = positionOnPage.topLeft; // primeira label
    this.lastY = 0;
    // propriedades de estilo que persistem em mais de um elemento da etiqueta
    this.marginTop = 12;
    this.marginLeft = 12;
    this.fontSizeSmall = 8.2;
    this.characterSpacingSmall = 0;
  }

  private get offset(): number {
    return ( // eslint-disable-next-line operator-linebreak
      this.label === positionOnPage.topRight ||
      this.label === positionOnPage.bottomRight
    ) // Se for a segunda etiqueta, elementos posicionados apos metade da pagina
      ? this.halfPage - this.marginLeft
      : 0; // Caso nao, coloque no inicio da pagina
  }

  private nextLabel(label?: number) {
    const Label = label || this.label + 1;
    this.label = Label;
  }

  private drawGluedLabelPlaceholder(): void {
    const cornerSize = 12; // Tamanho do canto do retangulo
    const widthBetweenCorners = 260; // Largura da caixa - cornerSize - marginLeft
    const heightBetweenCorners = 139; // tamanho da caixa - cornerSize - marginLeft

    // Tamanho total da caixa
    const labelWidth = widthBetweenCorners + cornerSize * 2;

    const startDrawing = this.offset + this.marginLeft;

    const lineGap = 3; // Espaco entre os dois textos do placeholder de etiqueta
    const fontSizeBig = 10;
    const textY = 69; // Y do 'USO EXCLUSIVO DO CORREIOS' (incluindo marginLeft)
    const characterSpacingBig = 0.2;

    // Seguimos a mesma ordem que as bordas no CSS seguem

    const topLeftCorner: coordinates = [
      startDrawing,
      this.marginTop + cornerSize,
    ];

    const topRightCorner: coordinates = [
      startDrawing + cornerSize + widthBetweenCorners,
      this.marginTop,
    ];

    const bottomRightCorner: coordinates = [
      topRightCorner[coord.x] + cornerSize,
      this.marginTop + cornerSize + heightBetweenCorners,
    ];

    const bottomLeftCorner: coordinates = [
      startDrawing + cornerSize,
      cornerSize + bottomRightCorner[coord.y],
    ];

    this.lastY = bottomLeftCorner[coord.y];

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
      .text(
        'USO EXCLUSIVO DOS CORREIOS',
        startDrawing, // X
        textY,
        opts,
      ); // Y

    opts.characterSpacing = this.characterSpacingSmall;
    this.doc
      .fontSize(this.fontSizeSmall)
      .text(
        'Cole aqui a etiqueta com o código identificador da encomenda',
        startDrawing,
        undefined, // Relativo ao texto anterior
        opts,
      );
  }

  private drawSignReceipt(): void {
    const paddingTop = 7;
    this.lastY += paddingTop;
    const labelEnd = this.offset + this.halfPage - this.marginLeft + 1;
    let startDrawing: number = this.offset + this.marginLeft;

    let text = 'Recebedor:';
    const opts: PDFKit.Mixins.TextOptions = {
      align: 'left',
      characterSpacing: this.characterSpacingSmall,
    };
    this.doc
      .fontSize(this.fontSizeSmall)
      .text(
        text,
        startDrawing,
        this.lastY,
        opts,
      );
    let startAfterText = 1 + startDrawing + this.doc.widthOfString(text, opts);
    this.lastY -= 2; // Ajustezinho pra ficar mais fiel
    this.lastY += this.doc.heightOfString(text, opts);
    this.doc
      .moveTo(startAfterText, this.lastY)
      .lineCap('butt')
      .lineTo(labelEnd, this.lastY)
      .stroke('black');

    text = 'Assinatura:';
    this.lastY += paddingTop;
    this.doc
      .fontSize(this.fontSizeSmall)
      .text(
        text,
        startDrawing,
        this.lastY,
        opts,
      );
    const textY = this.lastY;
    startAfterText = 1 + startDrawing + this.doc.widthOfString(text, opts);
    const endDrawing = this.offset + Math.round((labelEnd - 1 - startDrawing) / 2);
    this.lastY -= 2; // Ajustezinho pra ficar mais fiel
    this.lastY += this.doc.heightOfString(text, opts);
    this.doc
      .moveTo(startAfterText, this.lastY)
      .lineCap('butt')
      .lineTo(endDrawing, this.lastY)
      .stroke('black');

    text = 'Documento:';
    startDrawing = endDrawing + 2;
    this.doc
      .fontSize(this.fontSizeSmall)
      .text(text, startDrawing, textY, opts);
    startAfterText = 1 + startDrawing + this.doc.widthOfString(text, opts);
    this.doc
      .moveTo(startAfterText, this.lastY)
      .lineCap('butt')
      .lineTo(labelEnd, this.lastY)
      .stroke('black');
  }

  public test() {
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.nextLabel(); // Avance para proxima etiqueta
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.doc.end();
    writeFileSync('/tmp/lol.pdf', this.doc.read());
  }
}

export default DrawLabel;
