# letzclub

## Current State

- Normal slot month filtering works: selecting a month tab filters slot members by `[Month: YYYY-MM]` tag in `requirements`.
- Custom slots do NOT have month filtering: `useCustomSlotMembers` is called with `isAuthenticated && activeMonth ? slot.id : null`, so if `activeMonth` is missing, members are never fetched. The View Members page for custom slots also lacks month-based filtering.
- Custom slot cards use the same progress bar (total member count), but month-specific filtering is absent.
- Custom slot "Register Interest" (join) button is available but not always visible to non-creators inside the card or view page.
- `deleteRegistration` does NOT exist in the backend. The Remove button in My Registrations is a placeholder (shows a toast only).
- All product slot cards show the **category-level icon** (e.g., every Electronics slot shows `Monitor`). No product-specific icons.
- Month tabs show a member count badge in parentheses (e.g., `Apr 2026 (64)`). This is confusing and should be removed.
- `useActor.ts` does NOT return `isReady` — it returns only `{ actor, isFetching }`. This causes Register and Create Custom Slot buttons to stay on "Connecting..." permanently because `isActorReady` is always `undefined`.
- `CustomSlotMembersPage` (View Members) fetches members using `isAuthenticated ? slot.id : null` — correct, but the member list is not filtered by the selected month tab.

## Requested Changes (Diff)

### Add
- `deleteRegistration(registrationId: Nat)` function in Motoko backend — only the owner can delete their own registration.
- `deleteRegistration` in `backend.d.ts` and `backend.did.d.ts` / `backend.did.js`.
- `useDeleteRegistration` hook in `useQueries.ts` — mutation that calls `actor.deleteRegistration(id)` and invalidates `myRegistrations` and `publicRegistrations` queries.
- Product-specific icons map: each product name maps to a specific Lucide icon in `App.tsx` / `ProductCard`. The icon should match the product (Mobile → Smartphone, AC → Wind, TV → Tv, Car → Car, Bike → Bike, Sofa → Sofa, etc.).
- `isReady` export in `useActor.ts`: `isReady: actorQuery.isSuccess && !!actorQuery.data`.

### Modify
- **`useActor.ts`**: Add `isReady: actorQuery.isSuccess && !!actorQuery.data` to the return object. CRITICAL: do not remove or change any other part of this file.
- **`useCustomSlotMembers` call in `CustomSlots.tsx` (`SlotCardWrapper`)**: Change `isAuthenticated && activeMonth ? slot.id : null` → `isAuthenticated ? slot.id : null` so members always load when authenticated.
- **Custom slot month-filtered count in `SlotCardWrapper`**: Filter `members` from `useCustomSlotMembers` by `activeMonth` using the same `getMemberMonthHome` logic (parse `[Month: YYYY-MM]` tag from `requirements`). The displayed count and progress bar should reflect only the selected month.
- **`CustomSlotMembersPage` (View Members)**: Add month tab selector (same 6-month tabs as normal slots). Filter and display only members whose `requirements` contains the matching `[Month: YYYY-MM]` tag. Pass `activeMonth` into this page when opening it, so it defaults to the correct tab.
- **Custom slot join form (`joinCustomSlot`)**: When submitting, append `[Month: YYYY-MM]` tag to `requirements` using the currently selected `activeMonth`, exactly as done for normal slot registration in `doRegister()`.
- **My Registrations page**: Replace the placeholder Remove button with a real delete that calls `useDeleteRegistration`. Show confirmation before deleting. After deletion, refresh the list.
- **Month tabs in `App.tsx` and `SlotDetailPage.tsx`**: Remove the member count badge `(N)` from tab labels. Tabs should show only `Apr 2026`, `May 2026`, etc.
- **`ProductCard` icon**: Replace the category-level icon lookup with a product-level icon map. Map each product name to a specific Lucide icon.

### Remove
- Placeholder toast-only behavior in the Remove button of My Registrations.
- Member count badge from month tab labels (`(N)` suffix).

## Implementation Plan

1. **Backend (`main.mo`)**: Add `deleteRegistration(id: Nat): async Text` — finds registration by id, checks `caller == userId`, removes it from the list. Update `preupgrade` is not needed since `registrations` is a `List` rebuilt from stable array on each install.

2. **Declarations (`backend.did.js`, `backend.did.d.ts`, `backend.d.ts`)**: Add `deleteRegistration: (id: bigint) => Promise<string>` to all three files.

3. **`useActor.ts`**: Add `isReady: actorQuery.isSuccess && !!actorQuery.data` to the return object.

4. **`useQueries.ts`**: Add `useDeleteRegistration` mutation hook.

5. **`CustomSlots.tsx`**:
   - Fix `useCustomSlotMembers` call: remove `activeMonth` guard so it always runs when authenticated.
   - Fix month-filtered count: apply `getMemberMonthHome` filter on members using `activeMonth`.
   - Fix join form: append `[Month: YYYY-MM]` tag to requirements on submit.
   - Fix `CustomSlotMembersPage`: add 6-month tab selector, filter members by selected month tab.

6. **`App.tsx`**:
   - Remove `(N)` count badge from month tab labels in `HomePage`.
   - Replace `ProductCard` category icon with a product-name-to-icon map.
   - Wire `useDeleteRegistration` in `MyRegistrationsPage` Remove button with confirmation.

7. **`SlotDetailPage.tsx`**: Remove `(N)` count badge from month tab labels.
