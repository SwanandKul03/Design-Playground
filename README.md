# Design Playground

The design system was first created in Figma using reusable components, variants and variables. Components establish reusable interface elements, variants define their types, sizes and states, and variables provide shared design values. The system was then implemented as an interactive web playground for exploring and using those elements.

The playground is a browser implementation built with HTML, CSS and JavaScript. Its bundled fonts and runtime colour tokens are served locally. The Figma exports, property screenshots, original token export and font delivery archive in `reference/` are static source material; the site does not synchronise with Figma. The available files do not contain complete prototype interactions or original variable-binding metadata, so the browser mappings are explicit implementation choices rather than recovered live bindings.

## Run locally

1. Open this folder in VS Code.
2. Install Node.js 22 or newer.
3. In the integrated terminal, run:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:5173/> in a browser.

No package installation or build step is required. The local server uses Node.js built-ins and serves only `dist/`. Open the site over HTTP rather than double-clicking `dist/index.html`, so the bundled colour data can load. Stop the server with Ctrl+C.

Check JavaScript syntax with:

```bash
npm run check
```

## Publish with GitHub Pages

The included GitHub Actions workflow deploys only `dist/`; it does not publish the reference exports. In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. Then open **Actions → Deploy Design Playground**, select **Run workflow** on the `main` branch, and wait for the deployment to succeed.

The workflow is manually triggered and does not redeploy automatically on every push. The project site URL is <https://swanandkul03.github.io/Design-Playground/>.

## Explore

- **Foundations:** browse the 50 primitive colours, inspect a selected colour's name, value and token, and edit a type sample against the documented type scale.
- **Buttons:** try Primary, Secondary and Tertiary buttons in Large and Small sizes and Default, Hover, Focused, Pressed and Disabled states. Change the label and toggle text and left/right icons.
- **Inputs:** try the four states and Default or Placeholder value types. Edit the label, helper text and value, and toggle label, helper, value and icon visibility.
- **Slate:** add, select, arrange, duplicate and delete components; add text; draw; update shared colours; undo and redo; switch between Arrange and Preview; zoom and fit the slate.
- **Specifications:** view compact bracketed details for rendered examples.

The selected-colour details appear above the palette. Slate content is saved in browser-local storage and is not submitted to a server. Saved content is separate for each browser origin.

The interface intentionally has no top navigation or separate brand header, import/export controls, source-sheet section, website thumbnail or custom favicon. The empty favicon declaration in `dist/index.html` is intentional. Reference images are retained for design review and are not displayed as website content.

## Files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Page content and controls |
| `dist/styles.css` | Layout, responsive behaviour, typography and component styling |
| `dist/app.js` | Component variants, colour and type explorers, slate interactions and local saving |
| `dist/assets/tokens.json` | The 50 primitive and 30 semantic runtime colour tokens |
| `dist/assets/fonts/` | Bundled fonts used by the browser implementation |
| `scripts/dev.mjs` | Dependency-free local development server |
| `reference/` | Static design exports, property screenshots, original tokens and font delivery archive |
| `SOURCE_MANIFEST.json` | Sizes and SHA-256 checksums for the runtime and reference files |

Only the two intended colour collections in `dist/assets/tokens.json` are loaded by the website. The original token export is kept as supplied in `reference/tokens-original.json` for reference and includes other unrelated collections that are not loaded. The supplied exports contain resolved values rather than complete variable aliases, component layout metadata or prototype actions. See [ASSETS.md](ASSETS.md) for the asset inventory and source limitations.
