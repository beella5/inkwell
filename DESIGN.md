# Inkwell — Design System & Specification

*Derived from Atelier Canvas Digital Studio (`projects/5248101798404291232`)*

## 1. Brand Philosophy
Inkwell translates the disciplined, tactile warmth of a fine art atelier into a digital studio. It rejects synthetic glassmorphism, aggressive drop shadows, neon accents, and dark mode clutter in favor of physical workshop materials: uncoated studio paper, flaxen beige surfaces, carbon ink, and deep burgundy lacquer.

---

## 2. Color Palette

| Token / Role | Hex Value | Description & Usage |
| :--- | :--- | :--- |
| **App Background** | `#F7F4EF` | Warm ivory foundation representing uncoated studio paper. Frame, viewport margins. |
| **Canvas Surface** | `#FFFFFF` | Pure archival white reserved strictly for the drawing canvas plane. |
| **Secondary Surface** | `#EAE4DC` | Soft flaxen beige for toolbars, floating panels, docked shelves, and popovers. |
| **Primary Accent** | `#722F43` | Deep burgundy lacquer. Active tool states, active layer accent, primary execution buttons. |
| **Text Primary (Ink)** | `#252329` | Dense carbon ink for headings, tool labels, active numeric readouts, and UI icons. |
| **Neutral Subdued** | `#6E6875` | Muted slate-plum for helper text, keyboard hotkey hints, and secondary meta tags. |
| **Neutral Borders** | `#DDD6CE` | Restrained warm hairline boundaries providing subtle optical separation without clutter. |
| **Hover Surface** | `#E2DBD2` | Subtle darkening on flaxen surfaces for interactive hover states. |
| **Canvas Border** | `#DDD6CE` | Crisp 1px boundary enclosing the artboard. |

---

## 3. Typography

- **Headings & Display**: `Playfair Display`, serif  
  - Usage: App wordmark ("Inkwell"), modal titles, panel headings.
  - Weights: 500 (Medium), 600 (Semi-bold).
- **Workspace UI & Controls**: `Plus Jakarta Sans`, sans-serif  
  - Usage: Subtitles, tool labels, coordinate counters, layer listings, button text, tooltips.
  - Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold).
  - Tabular numbers (`font-variant-numeric: tabular-nums`) for brush size and numeric indicators.

---

## 4. Spacing & Border Radius

### Border Radius
- **Inputs & Color Swatches**: `4px`
- **Standard UI Elements (Buttons, Tool items, Chips)**: `8px`
- **Panels, Drawers & Modals**: `12px`
- **Pills / Status Badges**: `9999px`
- **Drawing Canvas**: `0px` (Strictly hard-cornered to preserve true artwork bounds)

### Spacing Scale
- `space-xs`: `4px`
- `space-sm`: `8px`
- `space-md`: `12px`
- `space-lg`: `16px`
- `space-xl`: `24px`
- `space-2xl`: `32px`

### Shadows & Elevation
- **Paper Shadow (Canvas)**: `0 1px 3px rgba(37, 35, 41, 0.06), 0 4px 16px -2px rgba(37, 35, 41, 0.05)`
- **Floating Panels & Popovers**: `0 4px 12px rgba(37, 35, 41, 0.08), 0 1px 3px rgba(37, 35, 41, 0.04)`
- **Modals**: `0 8px 24px -4px rgba(37, 35, 41, 0.12), 0 2px 6px -1px rgba(37, 35, 41, 0.06)`

---

## 5. Layout Architecture

- **TopBar (64px)**:
  - Left: "Inkwell" wordmark in serif with small burgundy dot (`#722F43`), subtitle "Drawing Studio" in muted sans (`#6E6875`).
  - Center: Autosave status indicator with status dot + label ("All changes saved" / "Saving…" / "Couldn't save" / "Not saved").
  - Right: Undo button, Redo button (disabled states when history stack empty), "Export PNG" secondary button, "Clear" ghost button, Help (?) icon button.
- **Left Toolbar (~80px, full viewport height)**:
  - Primary tool buttons: Pen, Eraser, Shapes (popover trigger for Rectangle, Circle, Line, Triangle, Arrow).
  - Subtle horizontal divider.
  - Active color swatch button (trigger for Color Popover).
  - Vertical brush size slider (1–40px) with live numeric readout pill.
- **Center Canvas Stage**:
  - Full remaining space with 32px margins.
  - Multi-layer canvas stack (`#FFFFFF`) with subtle paper shadow and 1px `#DDD6CE` border.
  - Overlay preview canvas for shape click-drag and live drawing feedback.
- **Right LayerPanel (280px, collapsible)**:
  - Header with "Layers" title and helper text: *"Stack drawings independently — only the active layer is edited."*
  - Reorderable layer list with drag handle, thumbnail, name (inline rename on double-click), visibility toggle (eye icon), and context menu / actions (Delete).
  - "+ Add layer" button.
  - Divider and "Canvas Background" segmented control (Blank / Dotted / Graph).
- **Responsive Adaptations (≤768px)**:
  - Layer panel collapses into a slide-up sheet toggled via header/floating button.
  - Left toolbar converts into a bottom floating pill docked horizontally.
  - Full fluid layout with zero horizontal overflow down to 375px mobile viewport.

---

## 6. Components Inventory

1. **Buttons**:
   - *Primary (Burgundy)*: Background `#722F43`, Text `#FFFFFF`, 8px radius.
   - *Secondary (Ivory)*: Background `#F7F4EF`, Border `1px solid #DDD6CE`, Text `#252329`.
   - *Tool Icon Buttons*: 40×40px square, 8px radius. Active state: `#722F43` fill with `#FFFFFF` icon.
   - *Ghost / Danger*: Subtle text button, hover tone `#EAE4DC` or soft red for destructive actions.
2. **Popovers**:
   - *Color Popover*: 16 preset palette swatches, native HTML color picker input, and Eyedropper sampling tool trigger.
   - *Shapes Popover*: Selection list for Rectangle, Circle, Line, Triangle, Arrow.
3. **Modals**:
   - *Keyboard Shortcuts Modal*: Serif title "Keyboard Shortcuts", 2-column keycap + action listing, backdrop blur/tint, close button and Escape key dismiss.
   - *ConfirmModal*: Destructive action confirmation for "Clear Canvas".
4. **Toast**:
   - Discrete bottom-right notification pill for PNG export confirmation and error messages.
5. **Layer Items**:
   - Active layer highlights with 3px solid `#722F43` left border and soft beige `#F7F4EF` background.
   - Inactive / hidden layers visually indicated.

