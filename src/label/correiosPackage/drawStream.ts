import { writeFileSync } from 'fs';
import {
  coordinates, coord, TextOptions, BrazilState,
} from '../pageTypes';
import LabelModel from '../labelModel';
import BarCodeData from '../../barCode/barcodeModel';
import drawStream from '../../barCode/drawStream';

class DrawLabel extends LabelModel {
  private drawGluedLabelPlaceholder(): void {
    this.lastY = 0;
    const cornerSize = 12; // Tamanho do canto do retangulo
    const widthBetweenCorners = 260; // Largura da caixa - cornerSize - marginLeft
    const heightBetweenCorners = 139; // tamanho da caixa - cornerSize - marginLeft

    // Tamanho total da caixa
    const labelWidth = widthBetweenCorners + cornerSize * 2;

    const startDrawing = this.offset + this.marginLeft;

    const lineGap = 3; // Espaco entre os dois textos do placeholder de etiqueta
    const textY = 69; // Y do 'USO EXCLUSIVO DO CORREIOS' (incluindo marginLeft)

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

    const opts: TextOptions = {
      align: 'center',
      width: labelWidth,
      characterSpacing: this.characterSpacingBig,
      lineGap,
    };

    this.doc
      .font('Helvetica')
      .fontSize(this.fontSizeBig)
      .fill('black')
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
    const opts: TextOptions = {
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
      .text(text,
        startDrawing,
        textY,
        opts);
    startAfterText = 1 + startDrawing + this.doc.widthOfString(text, opts);
    opts.indent = undefined;
    this.doc
      .moveTo(startAfterText, this.lastY)
      .lineCap('butt')
      .lineTo(labelEnd, this.lastY)
      .stroke('black');
  }

  private drawShipToNeighbor(text?: string): void {
    const marginTop = 9;
    const boxHeight = 30;
    const paddingTextX = 5;
    const textBoxHeight = Math.round(boxHeight / 2) - 1;
    const labelWidth = this.halfPage - this.marginLeft * 2;
    this.lastY += marginTop;
    this.doc
      .rect(
        this.marginLeft + this.offset,
        this.lastY,
        labelWidth,
        boxHeight,
      )
      .stroke('black');

    const opts: TextOptions = {
      align: 'left',
      characterSpacing: this.characterSpacingSmall,
    };
    let Text = 'ENTREGA NO VIZINHO AUTORIZADA?';
    const textWidth = this.doc.widthOfString(Text, opts);
    const textYOnBox = (textBoxHeight - 10);
    this.doc
      .rect(
        this.marginLeft + this.offset,
        this.lastY,
        textWidth + paddingTextX * 2,
        textBoxHeight,
      )
      .fill('black');
    this.doc
      .font('Helvetica-Bold')
      .fontSize(this.fontSizeSmall)
      .fill('white')
      .text(
        Text,
        this.marginLeft + this.offset + paddingTextX,
        this.lastY + textYOnBox,
        opts,
      );

    Text = text || 'Não entregar ao vizinho';
    this.doc
      .font('Helvetica')
      .fill('black')
      .text(Text,
        this.marginLeft + this.offset + paddingTextX, // Mesmo x que "Entrega ao ..."
        this.lastY + Math.round(boxHeight) / 2 + textYOnBox,
        opts); // TODO FIXME WARN: Verificar contra a etiqueta original

    this.lastY += textBoxHeight + 20;
  }

  private drawRecipientBox(
    nameLine1?: string,
    nameLine2?: string,
    street?: string,
    streetNumber?: number,
    complement?: string,
    neighborhood?: string,
    cep?: string,
    city?: string,
    state?: BrazilState,
  ): void {
    const addressContainerHeight = 127;
    const addressContainerWidth = 204;
    const textBoxHeight = 15;
    const paddingTextX = this.offset + this.marginLeft;
    this.doc
      .rect(
        paddingTextX,
        this.lastY,
        addressContainerWidth,
        addressContainerHeight,
      )
      .stroke('black');
    const opts: TextOptions = {
      align: 'left',
      characterSpacing: this.characterSpacingBig,
    };
    this.doc.font('Helvetica-Bold').fontSize(this.fontSizeBig);
    const Text = 'DESTINATÁRIO';
    const textWidth = this.doc.widthOfString(Text, opts);
    const textYOnBox = (textBoxHeight - 11);
    this.doc
      .rect(
        this.marginLeft + this.offset,
        this.lastY,
        textWidth + 10,
        textBoxHeight,
      )
      .fill('black');
    this.doc
      .font('Helvetica-Bold')
      .fontSize(this.fontSizeBig)
      .fill('white')
      .text(
        Text,
        this.marginLeft + this.offset + 5,
        this.lastY + textYOnBox,
        opts,
      );
  }

  private drawDatamatrix(x: number, y: number): void {
    // Creates a dataMatrix object
    const barcodeGenerator = new BarCodeData();
    const datamatrix = barcodeGenerator.createDatamatrix('80310-160', 31337, '80310-160', 31337);
    drawStream(this.doc, x, y, datamatrix);
  }

  public test() {
    // Entry point to output PDF
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.drawShipToNeighbor();
    this.drawRecipientBox();
    this.drawDatamatrix(this.offset + 220, this.lastY);
    this.nextLabel(); // Avance para proxima etiqueta
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.drawShipToNeighbor();
    this.drawRecipientBox();
    this.drawDatamatrix(this.offset + 220, this.lastY);
    this.doc.end();
    writeFileSync('/tmp/lol.pdf', this.doc.read());
  }
}

export default DrawLabel;
