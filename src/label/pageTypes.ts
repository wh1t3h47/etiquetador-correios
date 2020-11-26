import PDFKit from 'pdfkit';

type TextOptions = PDFKit.Mixins.TextOptions;

type coordinates<M extends string = "0" | "1"> = {
  // eslint-disable-next-line no-unused-vars
  [k in M]: number;
} & { length: 2 } & ReadonlyArray<number>;

// Regras quebradas usando const enum no typescript:
// https://github.com/typescript-eslint/typescript-eslint/issues/2484

const enum coord { // eslint-disable-line
  "x",
  "y",
}

const enum positionOnPage { // eslint-disable-line
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
}

export { coordinates, coord, positionOnPage, TextOptions };
