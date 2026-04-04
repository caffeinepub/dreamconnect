# letzclub

## Current State
- `useActor.ts` returns only `actor` and `isFetching` — never `isReady`. Every hook that reads `isReady` from `useActor()` gets `undefined`, permanently disabling Register and Create Custom Slot buttons.
- Registration form writes `[Month: YYYY-MM]` tag using `selectedMonth` tab correctly, BUT when user picks a specific date, it overrides `purchaseYear`/`purchaseMonth` with the date's month — which can differ from the selected tab.
- `SlotDetailPage` has its own `activeMonthIdx` state for filtering members. However, it is never passed to or synced with the slot count shown on the card — so the slot card count and View Members list show different months.
- `useCustomSlotMembers` in `useQueries.ts` has `enabled: !!actor && actorIsReady && slotId !== null` — gated on `actorIsReady` which is `undefined`, so it never fetches.

## Requested Changes (Diff)

### Add
- Export `isReady` from `useActor.ts` return object as `actorQuery.isSuccess && !!actorQuery.data`

### Modify
- `useActor.ts`: Add `isReady` to return object
- `App.tsx` registration `doRegister`: When `dateMode === 'specific'`, only use date for the `[Expected by: ...]` tag display text — the `[Month: YYYY-MM]` tag must ALWAYS use `selectedMonth` tab values, never the date picker month
- `SlotDetailPage.tsx`: The month tabs inside SlotDetailPage must default to the same month index as the parent's `activeMonth` prop. Add `activeMonth` prop to `SlotDetailPage` and initialize `activeMonthIdx` from that prop.
- `useQueries.ts` `useCustomSlotMembers`: Remove `actorIsReady` from the `enabled` condition — use only `!!actor && slotId !== null`

### Remove
- Nothing removed

## Implementation Plan
1. Fix `useActor.ts` — add `isReady: actorQuery.isSuccess && !!actorQuery.data` to return object
2. Fix `App.tsx` `doRegister` — the `[Month: YYYY-MM]` tag always comes from `selectedMonth` tab, regardless of date picker. Specific date only affects display text.
3. Fix `SlotDetailPage.tsx` — accept `activeMonth` prop and initialize `activeMonthIdx` from it so View Members opens on the same month the user was browsing
4. Fix `useCustomSlotMembers` — remove `actorIsReady` gate so it loads for all authenticated users
5. Pass `activeMonth` from App.tsx `SlotDetailPage` render to keep everything in sync
