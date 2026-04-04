# letzclub

## Current State

- Month-based tabs exist (Apr 2026 – Mar 2027) at category level
- Registration form embeds `[Month: YYYY-MM]` tag in requirements string
- `getMemberMonthHome()` parses that tag to assign members to month tabs
- `useActor()` returns `{ actor, isFetching }` — no `isReady` field
- `useRegisterForProduct` and `useCreateCustomSlot` both destructure `isReady` from `useActor()` — this is always `undefined` (falsy), so `isActorReady` is always `false`, causing permanent "Connecting..." / grayed button
- `getMemberMonthHome` has a date parsing bug: the `[Expected by: ...]` branch calls `new Date()` (today) instead of parsing the matched date string
- Custom slot creation calls `createCustomSlot` which atomically adds creator as member #1 in the backend
- After creation, `invalidateQueries(["customSlotMembers"])` is broadcast but the actual cache key is `["customSlotMemberCount", slotId]` — so memberCount stays 0 until the 15s refetch interval
- Custom slot view (member detail page) fetches members via `useCustomSlotMembers(slot.id)` which fires with the authenticated actor, but member count on the card uses `useCustomSlotMemberCount(slot.id)` — both are correct in isolation but the invalidation mismatch means count stays 0 after creation
- The slot member page title shows "0 members" because count query is stale

## Requested Changes (Diff)

### Add
- `isReady` field to `useActor()` return value: `true` once actor query has successfully fetched at least once (not loading, not fetching, data is present)

### Modify
- `useActor`: expose `isReady: !!actorQuery.data && !actorQuery.isLoading`
- `getMemberMonthHome`: fix the `[Expected by: DD MMM YYYY]` branch — parse the matched date string correctly using the captured groups instead of `new Date()`
- `useCreateCustomSlot` `onSuccess`: invalidate `["customSlotMemberCount", slotId.toString()]` specifically (the returned slotId from mutation), plus broadcast invalidate for all customSlotMemberCount queries
- `CreateSlotModal` `handleSubmit`: after `mutateAsync`, call `queryClient.invalidateQueries({ queryKey: ["customSlotMemberCount"] })` to bust all count caches
- `useCustomSlotMemberCount`: remove the `isFetching` guard (actor is always present, anonymous is fine for public counts) so it runs immediately
- `useCustomSlots`: remove `isFetching` guard, same reason
- `getProductCount` in `useProductCounts`: this counts ALL members regardless of month — the month tab count display in the tab buttons should use `publicRegs` filtered by month (already done), but the `counts` used on ProductCard should also reflect the selected month. Fix: pass `activeHomeMonthIdx` / selected month into `useProductCounts` or filter `publicRegs` to derive per-product counts for the selected month

### Remove
- Nothing removed

## Implementation Plan

1. **useActor.ts**: Add `isReady: !!actorQuery.data && !actorQuery.isLoading` to the return object
2. **App.tsx `getMemberMonthHome`**: Fix the dateMatch branch — use the captured groups `dateMatch[1]`, `dateMatch[2]`, `dateMatch[3]` to build the date: `new Date(\`${dateMatch[3]} ${dateMatch[2]} ${dateMatch[1]}\`)` and return its year/month correctly
3. **useQueries.ts `useCreateCustomSlot` onSuccess**: invalidate all `customSlotMemberCount` queries: `queryClient.invalidateQueries({ queryKey: ["customSlotMemberCount"] })`; also refetch custom slot queries
4. **useQueries.ts `useCustomSlotMemberCount`**: remove `isFetching` dependency from `enabled` — use just `!!actor && slotId !== null`
5. **useQueries.ts `useCustomSlots`**: remove `isFetching` dependency — use just `!!actor`
6. **App.tsx month tab counts**: The counts shown on ProductCards should be filtered by the selected month. Derive `monthFilteredCounts` from `publicRegs` filtered by active month tab, and use that for the card count prop instead of the `counts` object from `useProductCounts`
7. **App.tsx location filter**: When filtering `locationFilteredProducts`, also apply month filter so empty-month products still show (show all products even if 0 for that month)
