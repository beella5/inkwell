# Architecture & Engineering Decisions

## 1. AI Tooling Disclosure

- **AI Tool Used:** Google Antigravity (powered by Anthropic Claude 3.7 / Sonnet 4.6).
- **Additional Tool:** Stitch MCP.
- **Role:** AI assistance was used during development for architectural scaffolding, design-token extraction, state-reducer design, unit-test setup, and canvas-compositing logic.

### One Thing Changed From AI Output

**Per-layer offscreen isolation during PNG export**

The initial AI-generated approach drew strokes from all visible layers directly onto one shared export canvas. However, the eraser uses the Canvas API's `destination-out` compositing operation. If eraser strokes from an upper layer were drawn directly onto the shared canvas, they could also erase pixels belonging to lower layers and the background.

The export implementation was changed to render each visible layer onto its own temporary offscreen canvas first. Those completed layer canvases are then composited onto the final export canvas. This keeps erasing confined to the layer on which it was performed.

---

## 2. Stroke Objects Instead of Canvas Snapshots

### Context

Undo and redo can be implemented by saving a raster snapshot of the canvas after each action, or by storing the drawing operations that produced the image.

### Decision

Inkwell stores drawing actions as stroke objects rather than keeping a full pixel snapshot for every history step.

### Rationale

- Stroke objects store drawing parameters and points rather than a full canvas bitmap for each action.
- The objects can be serialized as JSON for browser-local persistence.
- The canvas can be redrawn from the stored objects when necessary.
- This approach supports the application's layer-based editing model.

---

## 3. localStorage for Browser Persistence

### Context

Browser applications can use `localStorage` or a more advanced storage system such as IndexedDB to keep data between visits.

### Decision

Inkwell stores its saved drawing data in browser `localStorage`, using the key `inkwell:v1`.

### Rationale

- It keeps the project simple and does not require a backend database or user account.
- JSON drawing data can be saved and restored directly.
- The application can show the user whether changes have been saved or whether saving failed.

### Trade-off

`localStorage` has limited capacity and is tied to the current browser and origin. Drawings are not automatically synchronized between devices. IndexedDB could be considered if the application needs to support larger documents.

---

## 4. Background Patterns Separate from Drawing History

### Context

The application offers blank, dotted, and graph paper backgrounds. These could be treated as drawing operations or as separate canvas settings.

### Decision

Background patterns are maintained separately from the stroke history.

### Rationale

Changing the paper appearance is a workspace preference rather than a drawing stroke. Keeping it separate means changing the background does not become part of the ordinary stroke undo/redo sequence. The selected background is also included when exporting the canvas.

---

## 5. Eyedropper Samples the Composited Canvas

### Context

A color picker could sample only the active layer or sample the visible result of all layers and the background.

### Decision

The eyedropper samples the composited visible canvas.

### Rationale

The color a user sees may be the result of overlapping strokes on multiple visible layers or the background. Sampling the composited result makes the selected color correspond to the visible pixel rather than only the active layer.

---

## 6. Automated Tests

The repository includes automated tests for:
- Undo/redo history behavior.
- Drawing-data serialization.
- Keyboard shortcut behavior.

These tests cover selected logic in the application; they are not a claim that every interface feature is covered by automated tests. The README also describes the manual feature testing performed for the competition submission.
