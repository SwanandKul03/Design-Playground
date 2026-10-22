# Assets and source material

The website uses local assets only. It does not request fonts or design tokens from a CDN and does not connect to Figma.

## Browser assets

| Runtime asset | Use |
| --- | --- |
| `dist/assets/fonts/Heading-Bold.woff2` | Supplied bold heading font |
| `dist/assets/fonts/VanillaSans-Regular.woff2` | Supplied regular text font |
| `dist/assets/fonts/VanillaSans-Medium.woff2` | Supplied medium text font |
| `dist/assets/fonts/InstrumentSans-400.woff2` | Regular interface font used by the existing browser implementation |
| `dist/assets/fonts/InstrumentSans-600.woff2` | Semibold interface font used by the existing browser implementation |
| `dist/assets/tokens.json` | Runtime subset containing 50 primitive and 30 semantic button colours |

Icons and component drawings are rendered by the application with HTML, SVG and CSS. The website does not load the original mixed token export.

## Reference files

| File | Source material and purpose |
| --- | --- |
| `reference/Design-System.pdf` | Original design-system export |
| `reference/Design-System.png` | Image export of the design system |
| `reference/button-properties.png` | Button component property screenshot |
| `reference/input-properties.png` | Input component property screenshot |
| `reference/tokens-original.json` | Original token export, retained for reference |
| `reference/fonts-original.zip` | Supplied font delivery archive |

These static references were used to compare the browser implementation's layout, typography, colours, button and input properties. They do not provide live Figma synchronisation, complete prototype interactions or full variable-binding metadata. Runtime token mappings are explicit. Some small tertiary button backgrounds follow the visual export where the raw token values differ, and user overrides take precedence.

The original token export includes collections beyond the runtime design-system subset. Those collections are preserved only in the reference export; the browser loads only the 50 primitive and 30 semantic values in `dist/assets/tokens.json`.

The bundled heading font includes only a bold file. Other heading weights shown in the type scale are documented but not synthesized in the live specimen. Font files are retained as supplied; review the font vendor's terms before redistribution.

File sizes and SHA-256 checksums are recorded in `SOURCE_MANIFEST.json`. Reference files are kept for design review and are not served by the local development server.
