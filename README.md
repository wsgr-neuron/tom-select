# Tom Select

Note: This project is an in-house fork of [Tom Select](https://github.com/orchidjs/tom-select), which is licensed under the Apache License, Version 2.0. The original README can be viewed [here](README-upstream.md).

The fork is based on upstream Tom Select v2.4.3. web-ui vendors a custom build of it, described in [Web UI Build](#web-ui-build).

## Changes

### Selected Options Stay in Place

`updateOriginalInput` selects each existing `<option>` where it is, inside its `optgroup` and in the server's order. Upstream Tom Select moves a selected option to the end of the select. Selected options stay in DOM order, so a multiple select submits its values in option order, not in the order they were chosen. An option added on the client is still appended.

When a morph has replaced an option's element, the option is found in the select by its value rather than appended as a duplicate.

### Direction Is Not Detected

Every instance is left-to-right, even inside a `dir="rtl"` element, because web-ui supports English only. The wrapper never has the `rtl` class, and the left and right arrow keys are never reversed. Upstream Tom Select reads the computed `direction`, which forces a style recalculation for each instance.

### Asynchronous Dropdown Positioning

`open()` and `positionDropdown()` are asynchronous. `open()` waits for `positionDropdown()` before it shows the dropdown, so a plugin can determine the dropdown's position asynchronously. When `refreshOptions` opens the dropdown, the active option is scrolled into view once the dropdown is open, because scrolling depends on the dropdown's size.

### Label Has No `for` Attribute

The label's `for` attribute is removed, where upstream Tom Select points it at the control. A click on the label still focuses the control, and the control and dropdown are still labelled by the label through `aria-labelledby`.

### Invalid Event Listener Is Removed on Destroy

The listener for the input's `invalid` event is removed when the instance is destroyed.

### Custom Build Imports With an Extension

The `src/tom-select.custom.ts` that Grunt generates imports `./tom-select.js` rather than `./tom-select`, for Node16 module resolution.

## Web UI Build

web-ui vendors a custom build of this fork as `vendor/javascript/tom-select.js`. It is the minified UMD bundle of Tom Select with one plugin, `no_backspace_delete`. web-ui defines its other plugins itself.

The Rollup configuration builds the custom bundle only when `src/tom-select.custom.ts` exists. The file is ignored by Git, so create it with this content:

```typescript
import TomSelect from './tom-select.ts';

import no_backspace_delete from './plugins/no_backspace_delete/plugin.ts';

TomSelect.define('no_backspace_delete', no_backspace_delete);

export default TomSelect;
```

Install the dependencies from the tracked lockfile, build the UMD bundles, and copy the minified custom bundle into web-ui without its source map comment. Build with `node_modules` installed in the checkout, not linked from another one. Babel's exclusion of `node_modules` is relative to the working directory, and Rollup resolves a link to its target, so a linked `node_modules` has its dependencies transpiled and the bundle differs.

```bash
npm ci
npm run build:js:umd
sed '/^\/\/# sourceMappingURL=/d' dist/js/tom-select.custom.min.js > "$NEURON_HOME/web-ui/vendor/javascript/tom-select.js"
```

The vendored file starts with the `Tom Select v2.4.3` banner and ends with the `var tomSelect=function(t,e){return new TomSelect(t,e)}` footer. web-ui has no source map for it.

### Tests

Run the test suite in headless Chrome before vendoring a change:

```bash
TARGET=HeadlessChrome CHROME_BIN="$(which google-chrome)" npx karma start .config/karma.conf.cjs
```

The tests run against `dist/js/tom-select.complete.js`. `npm run build:js:umd` rebuilds it along with the custom bundle, so run the build before the tests.
