import type { Plugin as VitePlugin, Manifest } from "vite";

declare module "vite" {
  interface ManifestChunk {
    integrity: string;
  }
}

export type IAlgos = "sha256"[] | "sha384"[] | "sha512"[] | string[];

export interface ISRIOptions {
  selectors?: string[];
  hashAlgorithms?: IAlgos;
  crossOriginPolicy?: "anonymous" | "use-credentials";
  indexHtmlPath?: string;
  manifestsPaths?: string[];
  augmentManifest?: boolean;
  filesToIgnore?: string[];
}

export type IPlugin = (options?: ISRIOptions) => VitePlugin;

export type IManifest = Manifest | undefined;
