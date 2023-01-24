# vite-tiptop-sri

## Install

Run the following command:

```sh
npm i vite-tiptop-sri --save-dev
```

## How to use

Make the following changes to `vite.config.js`:

```js
import { defineConfig } from "vite";
import { sri } from "vite-tiptop-sri";

export default defineConfig({
  plugins: [sri()],
});
```

Then run the build command:

```sh
npm run build
```

And finally check the `index.html` file inside the `dist/` folder.

You also have the possibility of Subresource integrity in manifest assets.

```js
import { defineConfig } from "vite";
import { sri } from "vite-tiptop-sri";

export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [sri({ augmentManifest: true })],
});
```

By default it will get the `manifest.json`, but others can be specified by taking into account the output directory.

```js
import { defineConfig } from "vite";
import { sri } from "vite-tiptop-sri";

export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [
    sri({
      augmentManifest: true,
      manifestPaths: ["manifest.json", "manifest-assets.json"],
    }),
  ],
});
```

## Credits

This package was inspired by the following projects:

- [rollup-plugin-sri](https://github.com/JonasKruckenberg/rollup-plugin-sri)
- [vite-plugin-sri](https://github.com/small-tech/vite-plugin-sri)
- [vite-plugin-manifest-sri](https://github.com/ElMassimo/vite-plugin-manifest-sri)

## License

[MIT](https://choosealicense.com/licenses/mit/)
