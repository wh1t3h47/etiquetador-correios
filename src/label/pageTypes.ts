import PDFKit from 'pdfkit';

// Apenas definicoes de tipo, note que o import do PDFKit
// Pode aparecer acinzentado em algumas versoes do vscode

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

// Um seletor mais amigavel pro usuario
type BrazilState =
                  "AC" | "AL" | "AM" | "AP" | "BA" | "CE" | "DF" | "ES" | "GO" |
                  "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" |
                  "RJ" | "RN" | "RO" | "RS" | "RR" | "SC" | "SE" | "SP" | "TO";

export { coordinates, coord, positionOnPage, TextOptions, BrazilState };
