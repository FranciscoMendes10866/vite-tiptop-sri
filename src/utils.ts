import { createHash } from "crypto";
import { resolve } from "path";

import type { IOutputAsset, IOutputChunk } from "./types";

type IChunk = IOutputAsset | IOutputChunk;

export const generateHash = (source: Buffer, algo: string): string => {
  const hash = createHash(algo).update(source).digest().toString("base64");
  return `${algo.toLowerCase()}-${hash}`;
};

export const isHtmlAsset = (chunk: IChunk): chunk is IOutputAsset => {
  return chunk.fileName.endsWith(".html") && chunk.type === "asset";
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
): string => {
  return algos.map((algo) => generateHash(source, algo)).join(" ");
}

export const resolveOuputDir = (outDir: string) => (path: string): string => {
  return resolve(outDir, path)
}
