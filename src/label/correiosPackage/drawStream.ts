import { writeFileSync } from 'fs';
import PDFDocument = require('pdfkit');
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
  private readonly doc: typeof PDFDocument;

  // Caso seja true, significa que temos mais de uma label na pagina, caso seja
  // a segunda ou quarta, precisamos colocar ela a partir da metade da pagina
  private labelSecondHalfPage: boolean;

  constructor() {
    this.doc = new PDFDocument({ bufferPages: true });
    this.labelSecondHalfPage = false;
  }

  private drawGluedLabelPlaceholder(): void {
    const marginLeft = 10;
    const marginTop = 10;
    const cornerSize = 15;
    const pageSize = this.doc.page.width; // A4
    const halfPage = Math.round(pageSize / 2);
    const widthBetweenCorners = halfPage - marginLeft * 2 - cornerSize * 2;
    const heightBetweenCorners = Math.round(widthBetweenCorners / 2);
    const offset = this.labelSecondHalfPage ? halfPage - marginLeft : 0;
    this.labelSecondHalfPage = !(this.labelSecondHalfPage);

    // Seguimos a mesma ordem que as bordas no CSS seguem

    const topLeftCorner: coordinates = [
      offset + marginLeft,
      marginTop + cornerSize,
    ];

    const topRightCorner: coordinates = [
      offset + marginLeft + cornerSize + widthBetweenCorners,
      marginTop,
    ];

    const bottomRightCorner: coordinates = [
      topRightCorner[coord.x] + cornerSize,
      marginTop + cornerSize + heightBetweenCorners,
    ];

    const bottomLeftCorner: coordinates = [
      offset + marginLeft + cornerSize,
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
      .lineTo(/* ...topLeftCorner */ X, Y)
      .lineTo(topLeftCorner[coord.x] + cornerSize, topLeftCorner[coord.y])
      .stroke();
    [X, Y] = topRightCorner;
    this.doc.moveTo(/* ...topRightCorner */ X, Y);
    topRightCorner[coord.x] += cornerSize;
    [X] = topRightCorner;
    this.doc
      .lineTo(/* ...topRightCorner */ X, Y)
      .lineTo(topRightCorner[coord.x], topRightCorner[coord.y] + cornerSize)
      .stroke();
    [X, Y] = bottomRightCorner;
    this.doc.moveTo(/* ...bottomRightCorner */ X, Y);
    bottomRightCorner[coord.y] += cornerSize;
    [, Y] = bottomRightCorner;
    this.doc
      .lineTo(/* ...bottomRightCorner */ X, Y)
      .lineTo(bottomRightCorner[coord.x] - cornerSize, bottomRightCorner[coord.y])
      .stroke();
    [X, Y] = bottomLeftCorner;
    this.doc.moveTo(/* ...bottomLeftCorner */ X, Y);
    bottomLeftCorner[coord.x] -= cornerSize;
    [X] = bottomLeftCorner;
    this.doc
      .lineTo(/* ...bottomLeftCorner */ X, Y)
      .lineTo(bottomLeftCorner[coord.x], bottomLeftCorner[coord.y] - cornerSize)
      .stroke();
  }

  public test() {
    this.drawGluedLabelPlaceholder();
    this.drawGluedLabelPlaceholder();
    this.doc.end();
    writeFileSync('/tmp/lol.pdf', this.doc.read());
  }
}

export default DrawLabel;
