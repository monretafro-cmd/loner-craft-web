# Redesign ALPHA WALLET Product Page

Redesign the ALPHA WALLET product page for better clarity, conversion, and responsiveness. The new layout focuses on a compact information hierarchy, reduced vertical spacing, and essential sections only.

## User Review Required

> [!IMPORTANT]
> - This redesign strictly adheres to the provided visual layout instructions.
> - "Do not change branding, colors, logo, real product images, or database connection."
> - "Use Cormorant Garamond for headings and Inter for body text" (already implemented).

## Proposed Changes

### Product Detail Page (`src/routes/product.$slug.tsx`)
- **Main Section**: Implement 1320px max-width.
  - Desktop: 55% Gallery / 45% Info.
  - Mobile: Gallery -> Title -> Price -> Trust Highlights -> Buy Now.
  - Tablet (< 980px): Single-column layout.
- **Info Hierarchy**: LONER LEATHER -> ALPHA WALLET -> Subtitle -> 300 MAD.
- **Trust Highlights**: Compact grid (Genuine Leather, Handmade, COD, In Stock).
- **Purchase Area**: Quantity selector + full-width "Buy Now" button + compact 3-column trust row.
- **New Sections**:
  - **Why You'll Like It**: 6 concise points in a 3x2 grid (desktop).
  - **Packaging**: Reduced spacing, two side-by-side images (desktop), 4 feature points.
  - **FAQ**: Compact accordion (5 specific questions).
  - **Final Buy CTA**: Dark brown section (~300px height) with Product, Price, and Buy Now button.
- **Mobile Sticky Bar**: Persistent bottom bar with Price + Buy Now button.
- **Cleanup**: Remove "Product Story" and any repeated/empty sections.

### Components
- **ProductGallery**: Ensure it fits the new layout constraints.
- **Footer**: Reduce top padding and overall height while keeping all links.

### Spacing System
- Apply consistent vertical gaps:
  - Desktop: 56px–72px.
  - Tablet: 48px–56px.
  - Mobile: 32px–44px.

### Localization
- Update `en/product.json`, `fr/product.json`, and `ar/product.json` with the new strings:
  - FAQ questions/answers.
  - "Why You'll Like It" points.
  - Packaging features.

## Technical Details
- Using Tailwind CSS for all layout and spacing adjustments.
- Maintaining TanStack Start structure and Supabase data fetching.
- Ensuring RTL support for Arabic locale.
- Implementing the sticky bar with Z-index management to avoid overlap with the WhatsApp button.
