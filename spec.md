# letzclub

## Current State
- 12 product categories displayed as horizontal tab pills
- Vehicles category shows all brands as a flat grid with no subcategory grouping
- City filter input above product grid filters entire product cards (bug: returns results for all cities instead of exact match)
- No Amazon-style search bar exists; only a static city filter input
- No "Other" category
- Search placeholder is static: "Filter by city (e.g. Mumbai)"
- Near Me GPS detection works correctly
- Custom slots section exists below the product grid

## Requested Changes (Diff)

### Add
- **Amazon-style search bar** in the header (above category tabs) that searches live across product names, category names, brands, and city/location as user types
- **Rotating placeholder examples** in the search bar cycling every 2.5s: "Try: AC Bangalore", "Try: Royal Enfield bikes", "Try: JCB equipment Hyderabad", "Try: Interior Design Mumbai", "Try: Gym treadmill Chennai", "Try: Medical equipment Pune", "Try: Maruti Suzuki Car", "Try: Real Estate Hyderabad"
- **"Other" category** (13th category) with a miscellaneous icon, allowing users to register requirements outside the 12 predefined segments. Products: "Electronics", "Home Services", "Travel", "Agriculture", "Food & Catering", "Events", "Sports", "Pets", "Education", "Other / Custom". Show a "Premium" badge on the Other category tab and a note: "Upgrade to Premium to join this slot and connect with serious buyers" inside Other slots (consistent with the rest of the premium messaging, payments disabled for now)

### Modify
- **Location filter bug fix**: Change city filter logic from `.includes(lower)` partial match to `.toLowerCase().trim() === lower` exact match (case-insensitive). This ensures "Bangalore" shows only Bangalore registrations, not Hyderabad.
- **Search bar replaces/extends city filter**: The Amazon-style search bar handles both keyword and city search. The existing small city filter input can remain as a secondary filter but the main search bar at the top is the primary discovery tool.
- **Vehicles subcategory display**: Instead of one flat grid of all 31 vehicle products, group them into subcategory sections displayed vertically: Cars, Bikes & Scooters, Trucks & Commercial, Buses, Heavy Equipment (JCB/CAT), Three Wheelers. Each subcategory has a header label and its own row of brand cards below it — same layout as how the main categories (Electronics, Gym, Medical) are tabs on the home page.

### Remove
- Nothing removed

## Implementation Plan
1. Add `Other` to CATEGORIES array with a generic icon (Sparkles or Grid) and a color
2. Add `Other` products to FALLBACK_PRODUCTS
3. Add rotating placeholder hook using `useEffect` + `useState` cycling through 8 example strings every 2500ms
4. Add Amazon-style search bar component in the header area (above category tabs in HomePage), with rotating placeholder, search icon, and clear button. On input, filter both categories and products simultaneously, showing a results dropdown or inline filtered view
5. Fix city filter: change `.includes(lower)` to `=== lower` for exact city match
6. Refactor Vehicles product grid: group products by prefix ("Car -", "Bike -", "Truck -", "Bus -", "Heavy Equipment -", "Three Wheeler -") and render each group with a section header and sub-grid instead of one flat grid
7. Add "Premium" badge to Other category tab
8. Add single-line premium nudge inside Other category slot view: "Upgrade to Premium to join this slot and connect with serious buyers"
