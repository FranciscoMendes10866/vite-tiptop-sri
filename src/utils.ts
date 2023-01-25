import { createHash } from "crypto";
import { resolve } from "path";

export const generateHash = (source: Buffer, algo: string): string => {
  const hash = createHash(algo).update(source).digest().toString("base64");
  return `${algo.toLowerCase()}-${hash}`;
};

export const toBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
  const newBuffer = Buffer.alloc(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < newBuffer.length; ++i) {
    newBuffer[i] = view[i];
  }
  return newBuffer;
};

export const generateAssetIntegrity = (
  source: Buffer,
  algos: string[]
): string => algos.map((algo) => generateHash(source, algo)).join(" ");

export const resolveOuputDir =
  (outDir: string) =>
  (path: string): string =>
    resolve(outDir, path);

export const minifyHtml = (html: string) => html.replace(/\s+/g, " ");
