import { useActor as useCaffeineActor } from "@caffeineai/core-infrastructure";
import { useEffect, useRef } from "react";
import { createActor } from "../backend";

/**
 * Thin wrapper around @caffeineai/core-infrastructure's useActor.
 * Adds `isReady` — a latching boolean that becomes `true` once the actor
 * object is available and never resets, even during background refetches.
 *
 * CRITICAL: Do NOT gate isReady on isFetching. When a canister is stopped
 * or the backend is slow, isFetching can stay true indefinitely, which would
 * keep isReady permanently false and buttons stuck on "Connecting...".
 * The actor object itself is sufficient — if actor is truthy, we can make calls.
 */
export function useActor() {
  const { actor, isFetching } = useCaffeineActor(createActor);
  // Latch: becomes true as soon as actor is available, never resets.
  const isReadyRef = useRef(false);

  // Set synchronously in render so the same render cycle that gets actor
  // also sees isReady = true (no one-render lag).
  if (actor) {
    isReadyRef.current = true;
  }

  // useEffect safety net for React concurrent mode / Strict Mode double-invoke.
  useEffect(() => {
    if (actor) {
      isReadyRef.current = true;
    }
  }, [actor]);

  return {
    actor,
    isFetching,
    isReady: isReadyRef.current,
  };
}
