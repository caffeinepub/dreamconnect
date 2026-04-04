# letzclub

## Current State
- useActor hook returns `{ actor, isFetching }` but NOT `isReady`
- useQueries.ts destructures `isReady: actorIsReady` from useActor() — gets `undefined` (always falsy)
- Both `useRegisterForProduct` and `useCreateCustomSlot` compute `isActorReady = !!identity && !!actor && actorIsReady` — always `false`
- Both Register and Create Custom Slot buttons are permanently disabled showing "Connecting..."
- getMemberMonthHome() always returns current month for all registrations — no timeline parsing
- Month tabs show all registrations in current month tab regardless of selected timeline
- Registration requirements store timeline as text suffix (e.g. `[Timeline: Within 3 months]`) but month tab filtering doesn't parse this
- Product cards pass `count` (total all-month count) to ProductCard — not filtered by selected month
- No customer vs service provider separation in slot view
- No expired slot nudge feature

## Requested Changes (Diff)

### Add
- `isReady` export from useActor (true once first fetch completes, stays true regardless of background refetch)
- Expired slot nudge: in "My Registrations" page, show registrations where the purchase month has passed with "Move to new month" or "Remove registration" options
- Customer vs service provider separation in SlotDetailPage: two labeled sections
- Always-12-month tabs (current month → 11 months ahead), always shown regardless of registrations
- Month tab filtering: parse timeline from requirements text to determine which month tab a registration belongs to

### Modify
- useActor: export `isReady: !actorQuery.isLoading && actorQuery.isFetched` (true after first fetch, unaffected by background refetches)
- useRegisterForProduct + useCreateCustomSlot: use `isReady` correctly — buttons enabled as soon as actor is fetched and user is authenticated
- getMemberMonthHome: parse `[Timeline: ...]` and `[Expected by: ...]` suffixes from requirements to compute the correct year/month bucket
- Month tab count: filter publicRegs by parsed month for each tab
- Registration form: encode month into requirements string in a parseable format
- ProductCard counts: optionally accept monthFilteredCount when month tab is active

### Remove
- Nothing removed

## Implementation Plan
1. Fix useActor to export `isReady` (computed as `actorQuery.isSuccess || actorQuery.isFetched`)
2. Update useRegisterForProduct and useCreateCustomSlot in useQueries.ts to use isReady properly
3. Update getMemberMonthHome to parse timeline text from requirements string
4. Ensure registration requirements string embeds the purchase month (year+month) in a parseable tag `[Month: YYYY-MM]`
5. Update RegistrationModal doRegister to append `[Month: YYYY-MM]` to requirements based on selected month tab + date/flexible timeline selection
6. Always show 12 month tabs regardless of registration counts
7. Separate customers and service providers in SlotDetailPage
8. Add expired slot nudge in My Registrations page
