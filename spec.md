# letzclub

## Current State

Custom slot creation flow is broken in two ways:
1. When a customer creates a custom slot, the backend `createCustomSlot` only stores the slot record — it does NOT add the creator as a member. The frontend then calls `joinCustomSlot` separately, but this second call often fails silently due to missing auth guards (`useCreateCustomSlot` only checks `!actor`, not `isAuthenticated` or `identity`). The result: slot is created with 0 members and the creator's requirement is never saved.
2. The progress bar on custom slot cards calls `useCustomSlotMembers(slot.id)` which calls `getCustomSlotMembers` — a function that requires authentication. When the actor is anonymous (before sign-in completes) it throws and returns `[]`, so the count stays at 0 even after a successful join.
3. Custom slot cards have NO Messenger-style overlapping member avatars — only the text progress bar. Regular slot cards already have avatars but the same treatment was never applied to custom slot cards.

## Requested Changes (Diff)

### Add
- Messenger-style overlapping member avatar circles on custom slot cards (same pattern as regular slot cards — colored initials circles, overlapping, with +N for overflow)
- `getCustomSlotMemberCount` is already a public query (no auth required) — use it for the member count display so unauthenticated users also see correct counts

### Modify
- **Backend `createCustomSlot`**: Add `name`, `phone`, `requirements` parameters and atomically add the creator as the first `CustomSlotMember` within the same function call. This removes the need for a separate `joinCustomSlot` call from the frontend after creation.
- **Frontend `CreateSlotModal` / `handleSubmit`**: Remove the separate `joinSlot.mutateAsync` call after `createSlot.mutateAsync` — the backend now handles it atomically.
- **`useCreateCustomSlot` hook**: Add `name`, `phone`, `requirements` to the mutation variables. Add `isAuthenticated` + `identity` guards (same as `useRegisterForProduct`). Invalidate `customSlotMembers` and `isCustomSlotMember` query keys on success (not just `customSlots`).
- **`useCustomSlotMembers` / `SlotCardWrapper`**: For public member COUNT (progress bar + avatars), use `getCustomSlotMemberCount` (no auth needed) instead of `getCustomSlotMembers`. Keep `getCustomSlotMembers` only for the authenticated detail view inside the slot.
- **`CustomSlotCard`**: Add overlapping avatar stack above the progress bar using member initials (from names, or colored placeholder circles if names unavailable from count alone).

### Remove
- The two-step create-then-join pattern from `CreateSlotModal.handleSubmit` (replaced by atomic backend call)

## Implementation Plan

1. Update `main.mo`: extend `createCustomSlot` to accept `name`, `phone`, `requirements` and atomically call the join logic within the same function.
2. Update `useQueries.ts`:
   - `useCreateCustomSlot`: add `name`/`phone`/`requirements` to vars, add auth guards, invalidate all custom slot query keys.
   - Add `useCustomSlotMemberCount` hook that calls `getCustomSlotMemberCount(slotId)` — no auth required, works for all users.
3. Update `CustomSlots.tsx`:
   - `CreateSlotModal`: pass `creatorName`, `creatorPhone`, `creatorRequirements` to `createSlot.mutateAsync`; remove `joinSlot.mutateAsync` call.
   - `SlotCardWrapper`: use `useCustomSlotMemberCount` for the count shown in progress bar and avatars.
   - `CustomSlotCard`: render overlapping avatar circles above the progress bar (colored initials, same style as regular slot cards).
