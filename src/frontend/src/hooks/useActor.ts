import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  // Track if we have ever successfully gotten an authenticated actor
  const hasEverBeenReady = useRef(false);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // Track when we've successfully loaded an authenticated actor
  if (actorQuery.isSuccess && !!actorQuery.data && !!identity) {
    hasEverBeenReady.current = true;
  }
  // Reset if user signs out
  if (!identity) {
    hasEverBeenReady.current = false;
  }

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  // isReady: true once the authenticated actor has been fetched at least once
  // Uses hasEverBeenReady so it doesn't flicker during background refetches
  const isReady =
    hasEverBeenReady.current ||
    (actorQuery.isSuccess && !!actorQuery.data && !!identity);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isReady,
  };
}
