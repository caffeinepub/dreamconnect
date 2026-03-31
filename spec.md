# letzclub

## Current State
- 13 categories: Electronics & Appliances, Vehicles, Gym, Courses, Medical, Beauty, Construction Materials, Business Services, Decor, Interior Design, Furniture, Real Estate, Other
- "Other" category shows product cards: Home Services, Travel, Agriculture, Food & Catering, Events & Entertainment, Sports & Recreation, Pets & Animals, Printing & Stationery, Logistics & Transport, Other/Custom
- Custom slot cards (CustomSlotCard) show member count as plain text only (e.g. "7/20"), no progress bar
- Custom slot creation form does NOT collect creator's name, phone, requirements and does NOT auto-join the creator as first member
- No fee display for creating or joining custom slots
- CustomSlotsSection is rendered at the bottom of HomePage for all categories

## Requested Changes (Diff)

### Add
- 9 new categories promoted from "Other" section: Home Services, Travel, Agriculture, Food & Catering, Events & Entertainment, Sports & Recreation, Pets & Animals, Printing & Stationery, Logistics & Transport — each with subcategories, Lucide icons, and OKLCH colors
- Animated progress bar in CustomSlotCard (same style as ProductCard — fills left-to-right, color changes green→amber→red by capacity)
- Fee placeholder labels in create custom slot form ("Free for Testing" banner, ₹0 creation fee) and join custom slot form (₹0 join fee) — easy to update later
- Creator name, phone, location, requirements fields in the create slot form so the creator is auto-joined as first member after slot is created

### Modify
- "Other" category section in HomePage: replace product card grid with a single prompt — "Can't find what you are looking for?" + "Create a custom slot" with a "Create" button that opens the CustomSlot creation modal
- CustomSlots creation form: after createCustomSlot returns the slotId, automatically call joinCustomSlot with the creator's name/phone/location/requirements so they are first member
- SLOT_CATEGORIES dropdown in create form: keep all 13 existing categories (including the newly promoted ones)
- CustomSlotsSection: show below the "Other" section prompt instead of at the bottom of all categories

### Remove
- Product cards under "Other" category (Home Services, Travel etc.) — they become real categories now
- "Other/Custom" as a product entry in FALLBACK_PRODUCTS.Other

## Implementation Plan
1. Add 9 new categories to CATEGORIES array in App.tsx with icons (Lucide) and OKLCH colors
2. Add FALLBACK_PRODUCTS entries for each new category with 8-10 relevant subcategories
3. Add the 9 new categories to backend registration's getCategories (note: backend already accepts any category text, so this is frontend-only)
4. Redesign the "Other" section in HomePage to show: heading text + Create button + CustomSlotsSection below (remove product card grid for Other)
5. Add animated progress bar to CustomSlotCard in CustomSlots.tsx (framer-motion width animation same as ProductCard)
6. Add name, phone, requirements fields to the CreateSlotModal form in CustomSlots.tsx
7. After createCustomSlot succeeds, call joinCustomSlot with creator's info automatically
8. Add fee placeholder display in both modals ("Free for Testing" banner)
