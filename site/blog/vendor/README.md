# vendor

`three-ombres.min.js` is [three.js](https://threejs.org/) r186 (MIT), cut down to the classes that
`../ombres.js` imports, plus `MarchingCubes` from three's examples. It is served from this site, so the
article makes no third-party request.

Rebuild (any machine with Node):

```sh
npm i three@0.186.0 esbuild
# entry.js: `export { …the names imported in ombres.js… } from 'three';`
#           `export { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';`
npx esbuild entry.js --bundle --format=esm --minify --legal-comments=none --outfile=three-ombres.min.js
```

Then put back the two-line licence header at the top of the file.
