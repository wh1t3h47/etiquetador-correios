import { writeFileSync } from 'fs';
import DrawLabel from './drawStream';
import {sender, recipient} from '../pageTypes'

// Cria um arquivo PDF para testes manuais e gera o arquivo
// /tmp/lol.pdf para prototipar

// TODO: Refatorar pra for, suportar mais de uma pagina

class DrawTest extends DrawLabel {
  private drawLabel(Sender: sender | undefined, Recipient: recipient | undefined) {
    if (Sender && Recipient) {
      this.drawGluedLabelPlaceholder();
      this.drawSignReceipt();
      this.drawShipToNeighbor();
      this.drawDatamatrix();
      this.drawCode128();
      this.drawRecipientBox();
      this.drawRecipientText(
        Recipient.address.NomeLinha1,
        Recipient.address.NomeLinha2,
        Recipient.address.RuaComPrefixo,
        Recipient.address.NumeroDaRua,
        Recipient.address.Complemento,
        Recipient.address.Bairro,
        Recipient.address.CEP,
        Recipient.address.Cidade,
        Recipient.address.Estado
      );
      this.drawSenderText(
        Sender.address.NomeLinha1,
        Sender.address.NomeLinha2,
        Sender.address.RuaComPrefixo,
        Sender.address.NumeroDaRua,
        Sender.address.Complemento,
        Sender.address.Bairro,
        Sender.address.CEP,
        Sender.address.Cidade,
        Sender.address.Estado
      );
    }
  }

  public test(
    sender1?: sender,
    recipient1?: recipient,
    sender2?: sender,
    recipient2?: recipient,
    sender3?: sender,
    recipient3?: recipient,
    sender4?: sender,
    recipient4?: recipient,
  ) {
    if (
      !(sender1 && recipient1) &&
      !(sender2 && recipient2) &&
      !(sender3 && recipient3) &&
      !(sender4 && recipient4)
    ) {
        throw new Error('Preciso de pelo menos um par consecutivo de destinatario e remetente!');
      }
    // Entry point to output PDF

    this.drawLabel(sender1, recipient1)

    this.drawLabel(sender2, recipient2);

    this.drawLabel(sender3, recipient3);

    this.drawLabel(sender4, recipient4);

    this.doc.end();
    writeFileSync('/tmp/lol.pdf', this.doc.read());
  }
}

export default DrawTest;
