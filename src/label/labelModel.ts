import PDFKit from 'pdfkit';
import { positionOnPage } from './pageTypes';

class LabelModel {
  protected readonly doc: typeof PDFKit;

  // Caso seja true, significa que temos mais de uma label na pagina, caso seja
  // a segunda ou quarta, precisamos colocar ela a partir da metade da pagina
  protected label: positionOnPage;

  protected lastY: number;

  protected readonly pageSize: number;

  protected readonly halfPage: number;

  protected readonly marginTop: number;

  protected readonly marginLeft: number;

  protected readonly fontSizeSmall: number;

  protected readonly characterSpacingSmall: number;

  protected readonly characterSpacingBig: number

  protected readonly fontSizeBig: number;

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
    this.characterSpacingBig = 0.2;
    this.fontSizeBig = 10;
  }

  protected get offset(): number {
    return (
      this.label === positionOnPage.topRight
      || this.label === positionOnPage.bottomRight
        // Se for a segunda etiqueta, elementos posicionados apos metade da pagina
        ? this.halfPage - this.marginLeft
        : 0
    ); // Caso nao, coloque no inicio da pagina
  }

  protected nextLabel(label?: number) {
    const Label = label || this.label + 1;
    this.label = Label;
  }
}

export default LabelModel;
