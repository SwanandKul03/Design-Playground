# Design Playground

An interactive design system playground for exploring colours, typography, reusable components, variants and shared variables.

The design system was created in Figma first. This project brings that system into a browser, where visitors can inspect its foundations, change component properties and use the components on a slate alongside text and drawings.

## Project purpose

A design system is easier to understand when people can try it. This playground makes the relationship between foundations, components and their behaviour visible through direct interaction.

Visitors can explore individual decisions, such as a button state or text size, then use those same elements in a composition. Small bracketed descriptions show the specifications of the examples as they change.

The project serves as both a design-system showcase and a practical space for experimentation.

## Design process

### 1. Create the system in Figma

The system was designed using components, variants and variables.

| Figma feature | Role in the design system |
| --- | --- |
| Components | Reusable interface elements with consistent structure and editable properties |
| Variants | Related versions of a component, including different types, sizes, states and value types |
| Variables | Shared design values used to maintain consistency across the system |

Buttons and input fields form the component library. Colour values and typography establish the visual foundations.

### 2. Document the design definitions

The design sheet, colour exports, supplied fonts and component-property screenshots are retained in the reference folder. These files provide the source material for the website implementation.

The property screenshots document the controls available in the original Figma components, including visibility settings for text, labels, helper text and icons.

### 3. Implement the playground

The system was then implemented in HTML, CSS and JavaScript. Its visual definitions and component properties became interactive browser controls.

The website uses the supplied design material alongside explicit browser mappings for component states and shared colour values. The implementation scope and export limitations are documented below.

## Explore the playground

The page follows three stages.

| Stage | What visitors can explore |
| --- | --- |
| Foundations | Colour tokens, typography, text samples and the documented type scale |
| Components | Button and input properties, variants and interaction states |
| Slate | A composition made from components, editable text and freehand drawings |

The selected-colour information appears immediately after the swatch instruction and before the palette. The page has no top navigation, and the footer contains a Back to top button.

## Foundations

### Colours

The runtime includes 80 colour values across two collections.

| Collection | Values | Purpose |
| --- | ---: | --- |
| primitives.mode1 | 50 | Base colours for the system |
| colorSymanticTokens.mode1 | 30 | Button colours associated with type, size and state |

The collection identifiers retain their original spelling so the data and application bindings stay consistent.

The 50 primitives are organised into Primary, Secondary, Neutral, Background, Accent, Achromatic, Success, Warning and Error groups.

Selecting a swatch displays its name, hexadecimal value and token identifier. The value can be copied with Copy hex.

Only the design-system collections in dist/assets/tokens.json drive the interface. The original mixed token export is retained separately for reference.

### Typography

The typography explorer lets visitors edit a text sample and change its font selection and size.

The documented scale is:

| Role | Weight in the design sheet | Size / line height |
| --- | --- | --- |
| Heading 1 | Extra Bold | 128px / 128px |
| Heading 2 | Bold | 96px / 96px |
| Heading 3 | Semi Bold | 72px / 72px |
| Heading 4 | Medium | 60px / 60px |
| Heading 5 | Regular | 48px / 48px |
| Title | Medium | 24px / 24px |
| Sub-title | Medium | 18px / 18px |
| Body | Regular | 16px / 16px |
| Paragraph | Regular | 14px / 14px |
| Caption | Regular | 14px / 14px |
| Large button text | Regular | 18px / 18px |
| Small button text | Regular | 12px / 12px |

The supplied heading font includes a bold file only. Live heading samples use that available weight; other heading weights are listed as part of the documented scale.

The application uses generic font-family aliases for its specimens. The surrounding presentation uses the portfolio typeface, while the component samples use their supplied system fonts.

## Component library

### Buttons

Buttons support three types, two sizes and five states, giving 30 type-size-state combinations.

| Property | Available settings |
| --- | --- |
| Type | Primary, Secondary, Tertiary |
| State | Default, Hover, Focused, Pressed, Disabled |
| Size | Large, Small |
| Show Right Icon | Visible or hidden |
| Show Left Icon | Visible or hidden |
| Show Text | Visible or hidden |
| Text | Editable button label |

Both sizes have a 48px height. Large uses 18px text, and Small uses 12px text.

Visitors can inspect the states, try the default button's hover, focus and press behaviour, and add the configured button to the slate. The slate also provides a width control.

Button presses demonstrate local interaction feedback within the playground.

### Input fields

Input fields support four states and two value types, giving eight state-value-type combinations.

| Property | Available settings |
| --- | --- |
| State | Default, Focused, Error, Disabled |
| Value Type | Default, Placeholder |
| Has Label | Show or hide the label |
| Label | Editable label text |
| Helper Text visibility | Show or hide helper text |
| Helper Text content | Editable helper message |
| Has Left Icon | Show or hide the left icon |
| Has Right Icon | Show or hide the right icon |
| Has Icon with Helper Text | Show or hide the helper icon |
| Has Value | Show or hide the value area |
| Value | Editable value or placeholder content |

Default displays the configured content as a value. Placeholder displays it as placeholder content until a visitor types into the field.

In Preview mode, enabled inputs accept text. The Error state demonstrates error feedback, and Disabled prevents input interaction.

## Bracketed specifications

Design-system examples include small bracketed descriptions of their rendered properties.

A button example:

~~~text
[primary button · large · default · h 48px · text 18px · #C5FF64]
~~~

A text example:

~~~text
[text · regular · 16px / 16px · #000000]
~~~

These descriptions update with relevant state, variant, text-size and colour changes. They make the system's specifications visible alongside the examples.

## Design slate

The slate provides a 1200 by 800 logical workspace. Zoom changes its display scale without changing the underlying component coordinates.

### Add and arrange

Visitors can add a button or input from the component library, select an item to edit its properties, and drag items into position. On supported desktop interactions, library components can also be dragged onto the slate.

Selected items can be duplicated or deleted. A width control allows component dimensions to be adjusted.

### Write and draw

The Text tool places a text item on the slate. Its content, typeface, size and colour can be changed in Properties.

The Draw tool creates freehand strokes with an adjustable ink colour and stroke width. Drawing controls also allow strokes to be cleared.

### Arrange and Preview

| Mode | Behaviour |
| --- | --- |
| Arrange | Select, position and edit items |
| Preview | Use the buttons and input fields as interactive controls |

This makes it possible to switch between composing an interface and trying its behaviour.

### Shared colour variables

The Variables panel exposes the runtime colour values. Visitors can search for a value, edit its colour or hexadecimal representation, and reset it.

Every item bound to that selected value updates together. The starter example contains two buttons sharing the same Primary, Large, Default colour, providing a direct example of a shared change.

The exported semantic values are resolved colours. Their source alias graph is not available, so editing a primitive does not automatically recalculate every semantic value that might have referenced it in Figma. Updates follow the bindings implemented in the browser.

### History and starting points

Undo and redo support composition changes. Blank slate removes the current items and drawings, while Reset example restores the starter composition.

The initial example contains a heading, an input and two buttons. It provides a small composition that visitors can inspect and modify.

## Local saving

The slate saves its composition in the current browser using localStorage. Items, drawings and colour overrides are retained when browser storage is available.

Saving is specific to the browser profile and website origin. A slate created on localhost does not automatically transfer to another domain or a hosted deployment. Clearing site storage removes the saved composition.

If storage is unavailable, the current composition remains available for the session.

## Keyboard controls

| Action | Keyboard control |
| --- | --- |
| Move through interactive controls | Tab or Shift + Tab |
| Switch between foundation or editing tabs | Left/Right Arrow, Home or End while a tab has focus |
| Move a selected slate item | Arrow keys while the item has focus |
| Move by a larger increment | Shift + Arrow keys |
| Delete a selected item | Delete or Backspace outside an editable field |
| Undo | Ctrl/Cmd + Z outside an editable field |
| Redo | Ctrl/Cmd + Shift + Z, or Ctrl/Cmd + Y |
| Close the slate dialog | Escape |

Native text fields retain their own keyboard editing behaviour.

## Responsive and accessible interaction

The implementation includes labelled controls, native buttons and inputs, visible focus styles, tab semantics and a native dialog for the slate.

On narrower screens, the component library becomes a horizontal strip and editing properties move below the workspace. The palette uses a single-column layout.

The page also provides a skip link and respects reduced-motion preferences.

## Technology

| Technology | Use |
| --- | --- |
| HTML | Page structure, controls, forms and the slate dialog |
| CSS | Layout, responsive behaviour, typography and component styling |
| JavaScript | Component rendering, state changes, editing and shared values |
| SVG | Component graphics and freehand drawing paths |
| localStorage | Browser-local composition saving |
| Node.js built-ins | Local development server |
| GitHub Actions | Optional manual deployment to GitHub Pages |

All five runtime fonts and the colour data are included locally. The site requires no framework, package dependencies or Figma API connection to run.

## Run locally in VS Code

### Requirements

- Node.js 22 or newer.
- npm, supplied with Node.js.
- A modern browser.

### Start the project

1. Open the design-playground folder in VS Code.
2. Open an integrated terminal in that folder.
3. Run:

~~~bash
npm run dev
~~~

4. Open [http://localhost:5173/](http://localhost:5173/).

No npm install step is required. The development server uses Node.js built-ins.

The application loads its colour data over HTTP, so it should be opened through the local server. Edit the files in dist/ and refresh the browser to see changes. Stop the server with Ctrl+C.

To use another port:

~~~bash
npm run dev -- --port 5174
~~~

To check JavaScript syntax:

~~~bash
npm run check
~~~

The project also includes a Start Design Playground task and an Open Design Playground debug configuration in VS Code. F5 uses that configuration to start the server and launch the browser debugger.

## Project files

| Path | Purpose |
| --- | --- |
| dist/index.html | Page content, sections and editor controls |
| dist/styles.css | Styles, breakpoints, typography and component appearance |
| dist/app.js | Component behaviour, properties, shared values and slate logic |
| dist/assets/tokens.json | The 80 runtime colour values |
| dist/assets/fonts/ | The five runtime font files |
| scripts/dev.mjs | Local HTTP development server |
| package.json | Project information and npm commands |
| .vscode/ | Editor tasks, settings and debugging configuration |
| .github/workflows/pages.yml | Manual GitHub Pages deployment workflow |
| reference/ | Original design exports and component-property screenshots |
| ASSETS.md | Asset inventory and source descriptions |
| ASSET_MANIFEST.json | File sizes and SHA-256 checksums for runtime and reference assets |

The dist folder contains editable application source. There is no build step, and the local server serves that folder.

## Reference material

| File | Contents |
| --- | --- |
| reference/Design-System.pdf | Original design-system sheet |
| reference/Design-System.png | Image version of the original sheet |
| reference/tokens-original.json | Original token export, including its supplied encoding and collections |
| reference/fonts-original.zip | Original font delivery archive |
| reference/button-properties.png | Figma button-property screenshot |
| reference/input-properties.png | Figma input-property screenshot |

The original mixed token export is retained for design reference. The runtime uses the filtered design-system data in dist/assets/tokens.json.

## GitHub Pages deployment

The included workflow is named Deploy Design Playground and runs manually.

1. Push the project to a GitHub repository, including the .github directory.
2. Configure GitHub Pages to use GitHub Actions as its publishing source.
3. Run Deploy Design Playground from the repository's Actions tab.
4. Use the deployment URL returned by the workflow.

The workflow publishes dist/ only. Reference exports remain outside the published site. Relative asset paths support hosting beneath a repository path.

See the [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for repository setup details.

## Implementation scope

The project implements the design definitions available in the supplied material.

- The exports contain resolved colour values; complete variable alias IDs, numeric variables and prototype actions are not included.
- Browser component bindings are explicit implementation mappings.
- The Small Tertiary button's Default, Disabled and Pressed backgrounds follow the visual sheet where the exported values conflict. Visitor colour overrides take priority.
- Input styling uses documented primitive colours.
- The live heading specimen uses the supplied bold font. Other heading weights remain documented reference values.
- The slate is a focused component playground with its own editing tools.

## Verifying changes

When making changes, check the following:

- The page loads its fonts, stylesheet, script and tokens successfully.
- Button types, sizes, states and visibility properties behave as expected.
- Input states, value types and optional labels, helpers, values and icons respond correctly.
- Shared colour changes update every item bound to the selected value.
- Bracketed specifications match the examples.
- Adding, arranging, writing, drawing, previewing and undoing changes still work.
- The slate saves and restores its composition when browser storage is available.
- Desktop and narrow-screen layouts keep controls usable.
- Any modified runtime or reference assets have corresponding checksum updates in ASSET_MANIFEST.json.

Original font assets and any supplied notices are retained with the project. Asset details are documented in [ASSETS.md](ASSETS.md).
