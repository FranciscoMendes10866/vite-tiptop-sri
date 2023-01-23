import { createHash } from "crypto";

import type { IOutputAsset, IOutputChunk } from "./types";

type IChunk = IOutputAsset | IOutputChunk;

export const generateHash = (source: Buffer, alg: string): string => {
  const hash = createHash(alg).update(source).digest().toString("base64");
  return `${alg.toLowerCase()}-${hash}`;
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
