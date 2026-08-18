# Product Gallery & Fullscreen Redesign Plan

Redesign the Alpha Wallet product gallery and fullscreen viewer for premium luxury styling, full-image visibility (no cropping), and perfect responsive behavior across all devices.

## User Review Required

> [!IMPORTANT]
> - The gallery will now favor `object-fit: contain` to ensure no part of the leather wallet is ever cropped.
> - Fullscreen view will be a high-performance lightbox that hides the floating WhatsApp button while active.
> - Navigation spacing is already rebalanced from the previous "Our Craft" removal; this update preserves that layout.

## Proposed Changes

### Components & UI
- **ProductGallery.tsx Overhaul**
    - Implement a 55/45 responsive grid for Desktop/Laptop.
    - Set main image area with `object-fit: contain` and a maximum height (760px Large Desktop, 680px Laptop, 620px Tablet).
    - Add a true fullscreen lightbox using `position: fixed` and `z-index: 99999` with a dark premium background (`rgba(20, 15, 12, 0.96)`).
    - Support zoom: mouse-wheel/drag on desktop, pinch/double-tap on mobile.
    - Thumbnails: 80px vertical rail on desktop, 76px horizontal on tablet, 68px on mobile.
- **Product Details Page**
    - Refine typography: Cormorant Garamond headings (56px Desktop → 34px Mobile).
    - Ensure Breadcrumb → Gallery → Purchase flow on mobile.
- **Floating Actions**
    - Add logic to hide the floating WhatsApp button when the lightbox is open using a CSS data-attribute strategy.

### Technical Improvements
- **Performance**
    - Preload the first main image and lazy-load the rest.
    - Use dynamic viewport units (`dvh`) for mobile fullscreen to account for browser toolbars.
- **Accessibility**
    - Add keyboard navigation (Arrows, Escape) for the lightbox.
    - Support swipe gestures on touch devices.

## Technical Details
- **CSS Logical Properties**: Maintain RTL support for Arabic version.
- **Z-Index Strategy**: Lightbox at `99999`, WhatsApp button at `40` (hidden via `[data-lightbox-open]`).
- **Responsive Breakpoints**: Clean switch to one-column layout at `980px`.
