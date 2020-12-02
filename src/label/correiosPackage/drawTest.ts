import { writeFileSync } from 'fs';
import DrawLabel from './drawStream';

// Cria um arquivo PDF para testes manuais e gera o arquivo
// /tmp/lol.pdf para prototipar

// TODO: Refatorar pra for, suportar mais de uma pagina

class DrawTest extends DrawLabel {
  public test() {
    // Entry point to output PDF
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.drawShipToNeighbor();
    this.drawDatamatrix();
    this.drawCode128();
    this.drawRecipientBox();
    this.drawRecipientText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.drawSenderText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.nextLabel(); // Avance para proxima etiqueta
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.drawShipToNeighbor();
    this.drawDatamatrix();
    this.drawCode128();
    this.drawRecipientBox();
    this.drawRecipientText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.drawSenderText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.nextLabel();
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.drawShipToNeighbor();
    this.drawDatamatrix();
    this.drawCode128();
    this.drawRecipientBox();
    this.drawRecipientText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.drawSenderText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.nextLabel(); // Avance para proxima etiqueta
    this.drawGluedLabelPlaceholder();
    this.drawSignReceipt();
    this.drawShipToNeighbor();
    this.drawDatamatrix();
    this.drawCode128();
    this.drawRecipientBox();
    this.drawRecipientText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );
    this.drawSenderText(
      'Paulo',
      'Leminski Filho',
      'R. Padre Gastón',
      42,
      'Casa',
      'Cidade Industrial',
      '81170-450',
      'Curitiba',
      'PR',
    );

    this.doc.end();
    writeFileSync('/tmp/lol.pdf', this.doc.read());
  }
}

export default DrawTest;
