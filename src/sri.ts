import { load as loadHtml } from "cheerio";
import fetch from "node-fetch";
import type { Plugin as VitePlugin } from "vite";

import { generateHash, isHtmlAsset, toBuffer } from "./utils";

type IAlgos = "sha256"[] | "sha384"[] | "sha512"[] | string[];

export interface IOptions {
  selectors?: string[];
  hashAlgorithms?: IAlgos;
  crossOriginPolicy?: "anonymous" | "use-credentials";
  indexHtmlPath?: string;
}

type IPlugin = (options?: IOptions) => VitePlugin;

export const sri: IPlugin = (opts) => {
  const selectors = opts?.selectors ?? ["script", "link[rel=stylesheet]"];
  const algorithms = opts?.hashAlgorithms ?? ["sha512"];
  const crossOrigin = opts?.crossOriginPolicy ?? "anonymous";
  const htmlPath = opts?.indexHtmlPath ?? "/";

  return {
    name: "vite-plugin-rsi",
    enforce: "post",
    apply: "build",
    generateBundle: async (_, bundle) => {
      for (const name in bundle) {
        const chunk = bundle[name];

        if (isHtmlAsset(chunk)) {
          const htmlSlice = chunk.source.toString();

          const $ = loadHtml(htmlSlice);
          const elements = $(selectors.join()).get();

          for await (const element of elements) {
            const url = (
              $(element).attr("href") || $(element).attr("src")
            )?.replace(htmlPath, "");

            if (!url) continue;

            let buffer: Buffer;
            if (url in bundle) {
              //@ts-ignore (both of them are string | undefined)
              buffer = Buffer.from(bundle[url].code || bundle[url].source);
            } else if (url.startsWith("http")) {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              buffer = toBuffer(arrayBuffer);
            } else {
              console.warn(`Could not resolve resource: ${url}`);
              continue;
            }

            const hashes = algorithms
              .map((algo: string) => generateHash(buffer, algo))
              .join(" ");

            $(element).attr("integrity", hashes);
            $(element).attr("crossorigin", crossOrigin);
          }

          chunk.source = $.html();
        }
      }
    },
  };
};
