# vite-tiptop-sri

## Install

Run the following command:

```sh
npm i vite-tiptop-sri --save-dev
```

## How to use

Make the following changes to `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { sri } from 'vite-tiptop-sri'

export default defineConfig({
  plugins: [sri()]
})
```

Then run the build command:

```sh
npm run build
```

And finally check the `index.html` file inside the `dist/` folder.

## Credits

This package was inspired by the following projects:

- [rollup-plugin-sri](https://github.com/JonasKruckenberg/rollup-plugin-sri)
- [vite-plugin-sri](https://github.com/small-tech/vite-plugin-sri)
- [vite-plugin-manifest-sri](https://github.com/ElMassimo/vite-plugin-manifest-sri)

## License

[MIT](https://choosealicense.com/licenses/mit/)
