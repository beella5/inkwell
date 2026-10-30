/**
 * Cursor SVG generators for Inkwell.
 * Hotspot = where the actual click registers on screen.
 */

// Fountain-pen style: dark barrel, white outline, nib tinted with the brush color.
// Hotspot: (2, 30) — the very tip.
export function penCursorSvg(accentColor = '#722f43') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path d="M6 22 L17 11 L21 15 L10 26 Z" fill="#252329"/>
    <path d="M2 30 L6 22 L10 26 Z" fill="${accentColor}"/>
    <path d="M2 30 L6 22 L17 11 L21 15 L10 26 Z"
          fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>
  </svg>`
}

// Eraser: translucent ring with a cross, hotspot centered.
export const ERASER_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="13" fill="white" fill-opacity="0.35" stroke="#252329" stroke-width="1.5"/>
  <line x1="11" y1="11" x2="21" y2="21" stroke="#252329" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="21" y1="11" x2="11" y2="21" stroke="#252329" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

/**
 * Builds a valid CSS `cursor` value from an SVG string + hotspot.
 */
export function toCursorValue(svg, hotspotX, hotspotY, fallback = 'crosshair') {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hotspotX} ${hotspotY}, ${fallback}`
}
