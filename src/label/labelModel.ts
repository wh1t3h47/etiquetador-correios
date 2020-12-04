import PDFKit from 'pdfkit';
import { positionOnPage } from './pageTypes';

class LabelModel {
  protected readonly doc: typeof PDFKit;

  // Caso seja true, significa que temos mais de uma label na pagina, caso seja
  // a segunda ou quarta, precisamos colocar ela a partir da metade da pagina
  protected label: positionOnPage;

  protected lastY: number;

  protected readonly pageWidth: number;

  protected readonly pageHeight: number;

  // Utilizado apenas para o x
  protected readonly halfPage: number;

  protected readonly marginTop: number;

  protected readonly marginLeft: number;

  protected readonly fontSizeSmall: number;

  protected readonly characterSpacingSmall: number;

  protected readonly characterSpacingBig: number

  protected readonly fontSizeBig: number;

  constructor() {
    this.doc = new PDFKit({
      bufferPages: true,
      size: 'A4',
      margin: 0,
      layout: 'portrait',
    });
    this.pageWidth = this.doc.page.width; // A4
    this.pageHeight = this.doc.page.height;
    this.halfPage = Math.round(this.pageWidth / 2);
    this.label = positionOnPage.topLeft; // primeira label
    this.lastY = 0;
    // propriedades de estilo que persistem em mais de um elemento da etiqueta
    this.marginTop = 12;
    this.marginLeft = 9;
    this.fontSizeSmall = 8.2;
    this.characterSpacingSmall = 0;
    this.characterSpacingBig = 0.2;
    this.fontSizeBig = 10;
  }

  protected get offsetX(): number {
    // Retorna a posicao x  de acordo com o numero da etiqueta
    // que estamos alterando (plotamos 1/4 da pagina)
    return (
      this.label === positionOnPage.topRight
      || this.label === positionOnPage.bottomRight
        // Se for a segunda etiqueta, elementos posicionados apos metade da pagina
        ? this.halfPage - this.marginLeft
        : 0
    ); // Caso nao, coloque no inicio da pagina
  }

  protected get offsetY(): number {
    // Retorna a posicao y de acordo com o numero da etiqueta
    // que estamos alterando (plotamos 1/4 da pagina)
    return this.label === positionOnPage.bottomLeft ||
      this.label === positionOnPage.bottomRight
      ? Math.round(this.pageHeight / 2) - this.marginTop
      : 0;
  }

  protected nextLabel(label?: number) {
    // Plotamos 1/4 da pagina, funcao de controle da posicao
    // de etiqueta que estamos plotando
    const Label = label || this.label + 1;
    this.label = Label;
  }
}

export default LabelModel;
