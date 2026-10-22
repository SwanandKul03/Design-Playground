# Assets and data

All files required by the website are bundled locally. The website does not fetch fonts from a CDN or require a Figma API key.

| Runtime asset | Source and use |
| --- | --- |
| dist/assets/fonts/Heading-Bold.woff2 | Bold heading font from your supplied font delivery; used through the SystemHeading CSS alias |
| dist/assets/fonts/VanillaSans-Regular.woff2 | Supplied regular text font, used through SystemText |
| dist/assets/fonts/VanillaSans-Medium.woff2 | Supplied medium text font, used through SystemText |
| dist/assets/fonts/InstrumentSans-400.woff2 | Regular portfolio presentation font, bundled from the existing portfolio implementation |
| dist/assets/fonts/InstrumentSans-600.woff2 | Semibold portfolio presentation font, bundled from the existing portfolio implementation |
| dist/assets/tokens.json | Unmodified subset of the supplied data: primitives.mode1 (50) and colorSymanticTokens.mode1 (30) |

Component arrows, information glyphs, tool icons and drawings are created in HTML/SVG/CSS by the application. There are no missing raster assets or icon-library dependencies.

| Reference export | Original attachment |
| --- | --- |
| reference/Design-System.pdf | Design System.pdf |
| reference/Design-System.png | Design System@4x.png |
| reference/tokens-original.json | tokens.json |
| reference/fonts-original.zip | Deliveries.zip, including the original desktop/web font formats |
| reference/button-properties.png | Screenshot 2026-10-22 at 13.14.08.png |
| reference/input-properties.png | Screenshot 2026-10-22 at 13.14.56.png |

Runtime and reference checksums are in SOURCE_MANIFEST.json. Files under reference/ are retained for editing context and are not served by the development server or Pages workflow. Browser comments and unrelated portfolio assets are not required by this project.
