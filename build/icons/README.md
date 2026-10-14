# PhyChord application icons

The supplied PhC/staff design is the basis of the flat transparent-corner master.
Its proportions are preserved by uniform scaling and centered padding, never
independent width/height scaling. Circle and maskable layouts leave safe space
around the lettering and staff lines. The external tile edge is cleaned for
desktop export; these are raster exports, not a claim of a pixel-identical source.

- `master.png`, `rounded-square.png`: rounded white tile with transparent corners.
- `square.png`: solid white square presentation.
- `circle.png`: circular white presentation, complete design inset.
- `maskable.png`: white background and generous safe area for platform masks.
- `icon-{16,24,32,48,64,128,256,512,1024}.png`: raster size exports.
- `../icon.ico`: Windows application, installer and uninstaller icon.
- `../icon.icns`: macOS normal and Retina application icon.

Exports are committed, so normal builds do not need an image-generation service
or ImageMagick. To regenerate the exports from the master, install ImageMagick 7
and run `npm run icons`. `desktop/icons.cjs` writes the platform containers.
