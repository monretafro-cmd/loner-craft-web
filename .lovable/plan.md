# Plan: Standardize "LA COLLECTION" Homepage Section CTA

The goal is to replace the "Voir la collection" and "Commander sur WhatsApp" buttons in the "LA COLLECTION" section of the homepage with a single, premium "Order Now" button that matches the hero section's design and links directly to the Alpha Wallet product.

## Proposed Changes

### Localization
- Add `home.collection.eyebrow`, `home.collection.title`, and `home.collection.description` to `src/locales/{en,fr,ar}/home.json` to ensure content is manageable and correctly translated.
- These keys are missing from the current `src/routes/index.tsx` but described in the prompt as "Keep the current dark background image, heading and description exactly as they are." I will check if they are currently hardcoded or using different keys.

### UI Components
- **Homepage (`src/routes/index.tsx`)**:
    - Identify the "LA COLLECTION" section (currently identified as the "Why choose us" section or a similar dark section).
    - Remove the existing two buttons.
    - Add a single `Button` with the following properties:
        - `size="xl"`
        - `className="w-full h-16 min-w-full md:min-w-[240px] md:w-fit transition-transform hover:scale-[1.02] active:scale-[0.98]"`
        - Variant: Primary (Brown/Dark) to match the Hero.
        - Icon: `ForwardArrow` (ArrowRight/ArrowLeft based on RTL).
        - Content: Localized "Order Now" (`actions.orderNow`).
        - Link: `/product/alpha-wallet`.
    - Ensure alignment is left-aligned with the text description.

## Technical Details
- Use the `ForwardArrow` logic already present in `src/routes/index.tsx`.
- Ensure `Link` from `@tanstack/react-router` is used for SPA navigation.
- Verify RTL support via `isRTL` hook.

## Verification Plan
- Use Playwright to check the homepage in English, French, and Arabic.
- Verify only one button exists in that section.
- Verify the button text matches the localization.
- Verify clicking the button navigates to `/product/alpha-wallet`.
- Verify the design (height, color, icon) matches the Hero CTA.
