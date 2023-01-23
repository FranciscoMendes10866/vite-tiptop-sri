export interface IPreRenderedAsset {
  name: string | undefined;
  source: string | Uint8Array;
  type: "asset";
}

export interface IOutputAsset extends IPreRenderedAsset {
  fileName: string;
}

export interface IPreRenderedChunk {
  exports: string[];
  facadeModuleId: string | null;
  isDynamicEntry: boolean;
  isEntry: boolean;
  isImplicitEntry: boolean;
  moduleIds: string[];
  name: string;
  type: "chunk";
}

export interface IRenderedModule {
  code: string | null;
  originalLength: number;
  removedExports: string[];
  renderedExports: string[];
  renderedLength: number;
}

export interface IRenderedChunk extends IPreRenderedChunk {
  dynamicImports: string[];
  fileName: string;
  implicitlyLoadedBefore: string[];
  importedBindings: {
    [imported: string]: string[];
  };
  imports: string[];
  modules: {
    [id: string]: IRenderedModule;
  };
  referencedFiles: string[];
}

export interface ISourceMap {
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent: string[];
  version: number;
  toString(): string;
  toUrl(): string;
}

export interface IOutputChunk extends IRenderedChunk {
  code: string;
  map: ISourceMap | null;
}
