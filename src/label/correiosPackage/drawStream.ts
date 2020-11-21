import BwipJs = require('bwip-js');
import fs = require('fs');
import PDFDocument = require('pdfkit');
import drawStream = require('../../barCode/drawStream');

const doc = new PDFDocument({ bufferPages: true });

const addCode = (x: number, y: number, o: BwipJs.ToBufferOptions) => {
  // test purposes
  drawStream.default(doc, x, y, o);
};

function TestStuff(path: string) {
  // test purposes
  doc.end();
  fs.writeFileSync(path, doc.read());
}

export default { addCode, TestStuff };
