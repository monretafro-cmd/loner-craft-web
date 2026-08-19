# Plan - Redesign ALPHA WALLET Product Detail Page

Redesign the ALPHA WALLET product page to improve layout, trust, and conversion across all devices, following the provided premium specifications.

## Proposed Changes

### Localization & Content
- Update `src/locales/en/common.json`, `fr/common.json`, and `ar/common.json` with keys for the new Trust Bar, FAQ, and Product Story sections.
- Add specific FAQ content to `src/lib/products.ts` or directly in the locale files.
- Ensure all technical specifications (Capacity, Pockets, Size, Material, Color, Made In) are localized.

### Component Refactoring
#### `ProductGallery.tsx`
- Implement vertical thumbnail strip on desktop (left-side).
- Move thumbnails below main image on tablet.
- Implement horizontal thumbnail carousel on mobile.
- Ensure `object-fit: contain` for all images to avoid cropping.
- Support scrollable thumbnails if > 6.

#### `product.$slug.tsx` (Main Route)
- **Layout**: Implement 55% / 45% two-column layout on desktop (max-width 1400px). Switch to one-column at < 980px.
- **Product Information**: Reorder hierarchy (Brand > Name > Subtitle > Price > Trust Points > Short Description).
- **Purchase Area**: Redesign with Quantity selector + Wishlist icon, followed by a primary full-width "Buy Now" button (60px desktop, 54px mobile).
- **Trust Bar**: Create a new 3-column (desktop/tablet) trust bar with icons and specific copy (COD, Delivery, Handmade).
- **Specifications Grid**: Implement a 2-column compact grid for key details.
- **Product Story**: Add "Built for Everyday Carry" section with image + text layout.
- **Packaging**: Add "Packed with Care" section using real photos.
- **FAQ**: Add a compact accordion with specific product questions.
- **Final CTA**: Add a prominent "Order Now" section before the footer.
- **Mobile Sticky CTA**: Implement a persistent bottom bar on mobile (Price + Buy Now).

### Style & UX Improvements
- Remove all unnecessary whitespace and broken containers.
- Fix image lightbox to support swipe, pinch-zoom, and keyboard navigation.
- Ensure the floating WhatsApp button does not overlap the sticky mobile CTA.
- Full RTL support for Arabic layout.

## Technical Details
- Use TanStack Start's `loader` to ensure data is fetched before rendering.
- Maintain existing `useStore` integration for cart and wishlist functionality.
- Use `framer-motion` (via `Reveal` component) for premium entrance animations.
- Tailwind CSS v4 for all layout and responsive adjustments.
- Responsive testing across all requested breakpoints (320px to 1920px).

## Verification Plan
- **Automated Tests**: Use Playwright to verify navigation, language switching, and the "Buy Now" flow.
- **Manual Review**: Check layout consistency on mobile, tablet, and desktop viewports.
- **Performance**: Verify image lazy loading and WebP usage.
