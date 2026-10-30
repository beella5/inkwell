# Architecture & Engineering Decisions

## 1. AI Tooling Disclosure
- **AI Tool Used**: Google Antigravity (powered by Anthropic Claude 3.7 / Sonnet 4.6).
- **Role**: Pair programmer assisting with architectural scaffolding, design token extraction from Stitch MCP, state reducer design, unit test setup, and canvas compositing logic.

### One Thing I Changed From AI Output
- **Per-Layer Offscreen Isolation during Export Compositing**: The initial AI draft directly iterated through visible layers and drew strokes onto a single shared export canvas. However, because the eraser tool uses `globalCompositeOperation = 'destination-out'`, erasing strokes on an upper layer would have punched completely through the underlying visible artwork and the solid white canvas background. I refactored `exportPng.js` to render each layer onto its own transient offscreen canvas first before compositing it with `'source-over'` onto the final target canvas. This guarantees eraser actions remain strictly isolated to the layer where they were drawn.

---

## 2. Stroke-Object Storage over Canvas Snapshots

### Context
Drawing applications typically choose between two undo/redo paradigms:
1. **Raster Snapshotting (`getImageData` / `toDataURL`)**: Storing pixel arrays or data URLs after every completed stroke.
2. **Vector Stroke-Object Log**: Storing discrete parameter objects (`{ tool, color, size, points }` or `{ tool, x, y, width, height }`).

### Decision
Inkwell strictly employs **Stroke-Object Storage**.

### Rationale
- **Memory Footprint**: A 1000×700 RGBA canvas at 2x DPR takes ~5.6 MB per snapshot. Keeping 30 undo steps across 3 layers would consume over 500 MB of RAM, leading to severe garbage collection pauses and browser crashes. In contrast, 100 vector strokes occupy less than 50 KB of JSON.
- **Serialization Efficiency**: Stroke objects serialize and deserialize instantly to and from JSON, making debounced auto-save fast and non-blocking.
- **Scalability & Resolution Independence**: Vector strokes can be re-rendered onto any canvas resolution, exported to SVG paths, or scaled dynamically without pixelation.
- **Selective Redrawing**: Independent layers can be cleared and redrawn on demand (e.g. after discarding an uncommitted stroke on `Escape` or `pointercancel`) without affecting other layers.

---

## 3. LocalStorage over IndexedDB (and the 5MB Limitation)

### Context
Browser-side persistence for lightweight web applications can be backed by either Web Storage (`localStorage`) or IndexedDB.

### Decision
Inkwell utilizes `localStorage` under the key `inkwell:v1`.

### Rationale
- **Synchronous Predictability & Zero-Dependency Setup**: `localStorage` offers a straightforward API that can be safely wrapped in a debounced hook with honest status transitions (`saving` → `saved` / `error`). It requires no asynchronous connection lifecycles, database upgrade migrations, or external IDB wrapper dependencies.
- **Sufficient Capacity for Stroke Objects**: Because Inkwell serializes vector stroke objects rather than base64 raster blobs, an average drawing with dozens of complex strokes consumes between 15 KB and 80 KB of text—well within the standard 5 MB `localStorage` threshold.
- **Graceful Failure & Honest Feedback**: If a drawing exceeds quota, `localStorage.setItem` throws a quota exception, which Inkwell catches immediately and surfaces to the user via the "Couldn't save" status indicator.

---

## 4. Background Patterns Separate from Stroke History

### Context
Inkwell supports Blank, Dotted, and Graph paper guidelines. These guidelines could either be modeled as special background strokes inside the layer history or handled as independent stage metadata.

### Decision
Background patterns are managed as decoupled stage settings rather than strokes in the command history.

### Rationale
- **User Intent**: Changing the paper style from "Blank" to "Graph" represents a workspace viewing preference, not an artistic drawing modification that should be reverted when pressing `Ctrl+Z` (Undo).
- **Clean Redraw Isolation**: The background canvas sits at `z-index: 0` and is rendered only when the user switches pattern modes. Redrawing layer strokes during active editing does not require clearing or recalculating background lines.
- **Export Inclusivity**: When exporting to PNG, the active background pattern is composited as the bottom-most layer, ensuring the exported image faithfully mirrors the artist's screen.

---

## 5. Eyedropper Sampling Composited Pixels vs. Active Layer Only

### Context
When sampling color via the Eyedropper tool (`I`), the application could sample either exclusively from the currently active layer or from the composited visible canvas.

### Decision
The eyedropper samples **composited pixels** across all visible layers and background paper.

### Rationale
- **WYSIWYG Fidelity**: An artist selecting a color visually identifies what appears on the screen. If an upper layer has semi-transparent colors, overlapping strokes, or paper background tones, sampling only the active layer would either return transparent `rgba(0,0,0,0)` or an unexpected color.
- **High-DPI Accuracy**: The color sampler renders onto an offscreen canvas matching the display's `devicePixelRatio` and samples using `(Math.round(x * dpr), Math.round(y * dpr))`, preventing optical misalignments on Retina displays.

