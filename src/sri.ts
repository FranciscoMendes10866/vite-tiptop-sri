import { load as loadHtml } from "cheerio";
import fetch from "node-fetch";
import type { Plugin as VitePlugin } from "vite";

import { generateHash, isHtmlAsset, toBuffer } from "./utils";

type IAlgos = "sha256"[] | "sha384"[] | "sha512"[] | string[];

export interface ISRIOptions {
  selectors?: string[];
  hashAlgorithms?: IAlgos;
  crossOriginPolicy?: "anonymous" | "use-credentials";
  indexHtmlPath?: string;
}

type IPlugin = (options?: ISRIOptions) => VitePlugin;

export const sri: IPlugin = (opts) => {
  const selectors = opts?.selectors ?? ["script", "link[rel=stylesheet]"];
  const algorithms = opts?.hashAlgorithms ?? ["sha512"];
  const crossOrigin = opts?.crossOriginPolicy ?? "anonymous";
  const indexHtmlPath = opts?.indexHtmlPath ?? "/";

  return {
    name: "vite-tiptop-rsi",
    enforce: "post",
    apply: "build",
    buildStart: () => {
      const illegibleList = algorithms.filter((algo) =>
        ["sha1", "md5"].includes(algo.toLowerCase())
      );

      for (const illegibleItem of illegibleList) {
        console.warn(`Insecure Hashing algorithm ${illegibleItem} provided.`);
      }
    },
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
            )?.replace(indexHtmlPath, "");

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
              console.warn(`Unable resolve resource: ${url}`);
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
