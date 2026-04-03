# letzclub

## Current State
- Each category (non-custom-slot-only) has a CTA bar at the top: "Can't find what you need in this category?" + "+ Create Custom Slot" button
- Custom-slot-only categories (Real Estate, Gym, Courses, Sports, Medical, Agriculture, Purchase Machinery, Other) show a `CustomSlotOnlyView` with heading like "Create a custom slot for [Category]" and a button
- The `CreateSlotModal` in `CustomSlots.tsx` has a category dropdown (`SLOT_CATEGORIES`) showing all old/stale categories including removed ones (Decor, Home Services, Travel, Food & Catering, Logistics & Transport, etc.)
- The modal title field placeholder is generic: "e.g. Need AC dealers in Chennai"
- There is no per-category example placeholder text in the slot name/title field
- The "Other" category's `CustomSlotOnlyView` shows a generic heading with no create button at the top

## Requested Changes (Diff)

### Add
- Category-specific example placeholder text in the slot name/title `Input` inside `CreateSlotModal` — each category shows hints for products NOT already listed as slots in that category
- A free-text field "What category does your requirement belong to?" in `CreateSlotModal` ONLY when `category === 'Other'` (replacing the dropdown entirely for Other)
- `OTHER_CUSTOM_CATEGORIES` constant: a list of example category hints like "Astrology", "Handicrafts", "Vintage Furniture", "Calligraphy", "Candle Making" shown as placeholder for the Other category field

### Modify
- **CTA message in regular categories** (non-custom-slot-only): Change from `"Can't find what you need in this category?"` to `"Not listed in [Category Name]?"` where category name is dynamic. The button `+ Create Custom Slot` stays.
- **`CreateSlotModal` — remove the category `<select>` dropdown entirely**. Instead:
  - When opened from a specific category (via `categoryId` prop), the category is pre-set and not shown as a dropdown. Replace the dropdown with a read-only badge/label showing the locked category.
  - When opened from "Other" section, show a free-text input: label "What category does your requirement belong to?" with placeholder "e.g. Astrology, Handicrafts, Vintage Furniture"
- **`CreateSlotModal` — slot title/name field**: Change label from "Slot Title" to "What are you looking for?" and update placeholder to be category-specific (see examples below)
- **`CustomSlotOnlyView` for "Other"**: Move the create button ABOVE the heading text. Change heading to `"Not finding your category here?"`. Keep the subheading short.
- **`CustomSlotOnlyView` for named categories** (Real Estate, Gym, etc.): Change heading format from `"Create a custom slot for [Category]"` to `"Not listed in [Category]?"`. Move button above the heading text.
- **`CustomSlotsSection`** — pass `categoryId` prop down to `CreateSlotModal` so it can lock the category
- **`SLOT_CATEGORIES` array in `CustomSlots.tsx`** — remove all stale/removed categories

### Remove
- Category `<select>` dropdown from `CreateSlotModal` (replaced with locked label or free-text field)
- Old stale categories from `SLOT_CATEGORIES`: Decor, Home Services, Travel, Food & Catering, Logistics & Transport, Printing & Stationery (use updated list)

## Implementation Plan

1. **Update `CustomSlots.tsx`**:
   - Add `categoryId?: string` prop to `CreateSlotModal` and `CustomSlotsSection`
   - Remove the category `<select>` dropdown
   - When `categoryId` is provided and not "Other": show a read-only locked category badge, set `category` state to `categoryId` on mount
   - When `categoryId === 'Other'` or not provided: show free-text input "What category does your requirement belong to?" with placeholder "e.g. Astrology, Handicrafts, Vintage Furniture"
   - Change title field label to "What are you looking for?"
   - Add `CATEGORY_SLOT_EXAMPLES` map: for each category, list example product hints (products NOT in the existing slot list)
   - Use `CATEGORY_SLOT_EXAMPLES[categoryId]` to build placeholder string for the title field
   - Clean up `SLOT_CATEGORIES` to only current categories

2. **Update `App.tsx`**:
   - Update CTA message in regular category view from `"Can't find what you need in this category?"` to `"Not listed in [activeCategory]?"`
   - Pass `categoryId={activeCategory}` to `CustomSlotsSection` and thread it down to `CreateSlotModal`
   - In `CustomSlotOnlyView`: change headings to `"Not listed in [Category]?"` for named categories, `"Not finding your category here?"` for Other
   - In `CustomSlotOnlyView`: move the Create button ABOVE the heading and example cards

### Category-specific slot name examples (NOT existing slot products)
| Category | Example hints for placeholder |
|----------|-------------------------------|
| Electronics & Appliances | Fan, Ceiling Fan, Water Heater, Air Cooler |
| Vehicles | Auto Rickshaw, Golf Cart, Electric Scooter |
| Interior Designing | Modular Kitchen, False Ceiling, Wallpaper |
| Furniture | Bean Bag, Recliner, Shoe Rack, Study Table |
| Beauty | Hair Straightener, Nail Art Kit, Keratin Treatment |
| Construction Materials | PVC Pipes, Door Frames, Floor Tiles |
| Business Services | Logo Design, GST Filing, Social Media Management |
| Food | Biryani Catering, Tiffin Service, Birthday Cake Delivery |
| Events & Entertainment | DJ for Wedding, Birthday Decoration, Event Anchor |
| Pets & Animals | Rabbit, Hamster, Parrot, Fish Tank Setup |
| Sports & Recreation | Badminton Court Booking, Yoga Classes, Swimming Coach |
| Marketing | YouTube Channel Promotion, Reel Creator, Brand Ambassador |
| Real Estate | Warehouse Space, Shop on Rent, Agricultural Land |
| Gym | CrossFit Studio, Zumba Classes, Yoga Studio |
| Courses | IELTS Preparation, Graphic Design Course, Digital Marketing |
| Medical | Physiotherapy, Dental Checkup, Eye Test |
| Agriculture | Drip Irrigation Setup, Organic Fertilizer, Crop Insurance |
| Purchase Machinery | Lathe Machine, Hydraulic Press, 3D Printer |
| Other | Astrology, Handicrafts, Vintage Furniture, Calligraphy |
