import PDFKit from 'pdfkit';
import bwipjs from 'bwip-js';

// Desenha o barcode no PDFKit, esse arquivo eh uma ponte entre bibliotecas
// Utilizamos ts-ignore pois tem um bug no bwip-js

function DrawingPDFKit(doc: typeof PDFKit, opts:bwipjs.ToBufferOptions) {
  // Global graphics state
  let gsDx: number;
  let gsDy: number; // x,y translate (padding)

  const addPad = (X: number, Y: number) => [X + gsDx, Y + gsDy];

  function lineTo(x: number, y: number) {
    const p = addPad(x, y);
    doc.lineTo(p[0], p[1]);
  }

  function moveTo(x: number, y: number) {
    const p = addPad(x, y);
    doc.moveTo(p[0], p[1]);
  }

  return {
    init(Width: number, Height: number) {
      const padl = opts.paddingwidth || 0;
      const padr = opts.paddingwidth || 0;
      const padt = opts.paddingheight || 0;
      const padb = opts.paddingheight || 0;

      const width = Width + padl + padr;
      const height = Height + padt + padb;

      // Initialize defaults
      doc.save();
      doc.lineCap('butt');

      gsDx = 0;
      gsDy = 0;
      moveTo(0, 0);
      lineTo(width, 0);
      lineTo(width, height);
      lineTo(0, height);
      lineTo(0, 0);
      doc.fillColor(`#${opts.backgroundcolor}`);
      doc.fill('even-odd');

      // Now add in the effects of the padding
      gsDx = padl;
      gsDy = padt;
    },
    // Stuff used internally by bwipjs
    scale(_x:number, _y:number) {}, // eslint-disable-line no-unused-vars
    // eslint-disable-next-line no-unused-vars
    measure(_str: unknown, _font: unknown, _fwidth:number, _fheight:number) {
      return { width: 0, ascent: 0, descent: 0 }; // we dont use font, no measure
    },
    // Unconnected stroked lines are used to draw the bars in linear barcodes.
    // No line cap should be applied.  These lines are always orthogonal.
    line(x0:number, y0:number, x1:number, y1:number, lw:number) {
      moveTo(x0, y0);
      lineTo(x1, y1);

      doc.lineWidth(lw).stroke();
    },
    // Polygons are used to draw the connected regions in a 2d barcode.
    // These will always be unstroked, filled, non-intersecting,
    // orthogonal shapes.
    // You will see a series of polygon() calls, followed by a fill().
    polygon(pts: Array<Array<number>>) {
      moveTo(pts[0][0], pts[0][1]);
      for (let i = 1, n = pts.length; i < n; i += 1) {
        lineTo(pts[i][0], pts[i][1]);
      }
    },
    // PostScript's default fill rule is even-odd.
    fill(rgb: string) {
      doc.fillColor(`#${rgb}`);
      doc.fill('even-odd');
    },
    // Called after all drawing is complete.  The return value from this method
    // is the return value from `bwipjs.render()`.
    end() {
      doc.restore();
      return doc;
    },
  };
}

function addCode(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  options: bwipjs.ToBufferOptions,
) {
  doc.save();
  doc.translate(x, y);
  // As declaracoes de tipo do @type/ bwipjs t^em problema
  // @ts-ignore
  bwipjs.fixupOptions(options);
  // @ts-ignore
  bwipjs.render(options, DrawingPDFKit(doc, options));
  doc.restore();
}

export default addCode;
