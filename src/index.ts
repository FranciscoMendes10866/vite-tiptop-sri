import fs from "fs/promises";
import { load as loadHtml } from "cheerio";
import fetch from "node-fetch";

import type { IPlugin, IManifest } from "./types";
import {
  generateAssetIntegrity,
  minifyHtml,
  resolveOuputDir,
  toBuffer,
} from "./utils";

const pluginSetup: IPlugin = (opts) => {
  const selectors = opts?.selectors ?? ["script", "link[rel=stylesheet]"];
  const algorithms = opts?.hashAlgorithms ?? ["sha512"];
  const crossOrigin = opts?.crossOriginPolicy ?? "anonymous";
  const indexHtmlPath = opts?.indexHtmlPath ?? "/";
  const manifestPaths = opts?.manifestsPaths ?? ["manifest.json"];
  const augmentManifest = opts?.augmentManifest ?? false;

  let buildDir: string | undefined = undefined;

  return {
    name: "vite-tiptop-rsi",
    enforce: "post",
    apply: "build",
    buildStart: () => {
      const illegibleList = algorithms.filter((algo) =>
        ["sha1", "md5"].includes(algo.toLowerCase())
      );

      for (const illegibleItem of illegibleList) {
        console.error(`Insecure Hashing algorithm ${illegibleItem} provided.`);
      }
    },
    writeBundle: async (normalizedOutputOptions) => {
      buildDir = normalizedOutputOptions.dir;
      if (!(buildDir && augmentManifest)) return;

      const resolveOuputFn = resolveOuputDir(buildDir);

      const promises = manifestPaths.map(async (manifestPath) => {
        const path = resolveOuputFn(manifestPath);

        const parsed: IManifest = await fs
          .readFile(path, "utf-8")
          .then(JSON.parse, () => undefined);

        if (parsed) {
          const manifestPromisses = Object.values(parsed).map(async (chunk) => {
            const fileBuffer = await fs.readFile(resolveOuputFn(chunk.file));
            chunk.integrity = generateAssetIntegrity(fileBuffer, algorithms);
          });

          await Promise.all(manifestPromisses);
          await fs.writeFile(path, JSON.stringify(parsed, null, 2));
        }
      });

      await Promise.all(promises);
    },
    closeBundle: async () => {
      if (!buildDir) return;

      const outputFile = `${buildDir}/index.html`;
      const html = await fs.readFile(outputFile);

      const $ = loadHtml(html);
      const elements = $(selectors.join()).get();

      for await (const element of elements) {
        const url = (
          $(element).attr("href") || $(element).attr("src")
        )?.replace(indexHtmlPath, "");

        if (!url) continue;

        let buffer: Buffer;
        const elementPath = `${buildDir}/${url}`;
        const doesFileExist = await fs.stat(elementPath);

        if (doesFileExist) {
          const file = await fs.readFile(elementPath);
          buffer = Buffer.from(file);
        } else if (url.startsWith("http")) {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          buffer = toBuffer(arrayBuffer);
        } else {
          console.warn(`Unable resolve resource: ${url}`);
          continue;
        }

        const integrityHash = generateAssetIntegrity(buffer, algorithms);

        $(element).attr("integrity", integrityHash);
        $(element).attr("crossorigin", crossOrigin);
      }

      await fs.writeFile(outputFile, minifyHtml($.html()));
    },
  };
};

export default pluginSetup;
